// @ts-nocheck
// Resume Intelligence Edge Function - Simplified
// Extracts structured data from plain text and generates LaTeX resume

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// STRICT extraction prompt
const EXTRACTION_PROMPT = `You are a STRICT resume section extractor. Extract ONLY information that EXISTS in the text.

RULES:
1. NEVER invent or assume information
2. If a section is missing, return empty array []
3. Preserve original wording exactly

Return this EXACT JSON structure (no markdown, no explanation):
{
  "contact": {"name": "Full Name", "email": null, "phone": null, "linkedin": null, "github": null},
  "summary": null,
  "education": [{"institution": "...", "dates": "...", "degree": "...", "details": null}],
  "skills": [{"category": "Programming", "items": "Python, Java"}],
  "experience": [{"title": "...", "dates": "...", "company": "...", "location": "...", "bullets": ["..."]}],
  "projects": [],
  "research": [],
  "publications": [],
  "achievements": []
}

RESUME TEXT:
`;

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const startTime = Date.now();
    let step = 'init';

    try {
        step = 'env';
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        if (!geminiApiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        step = 'parse_body';
        const body = await req.json();
        const rawText = body.rawText || body.text;
        const publishImmediately = body.publishImmediately || false;

        if (!rawText || rawText.trim().length < 100) {
            return new Response(JSON.stringify({ error: 'Resume text too short (min 100 chars)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log('Processing resume of length:', rawText.length);

        step = 'gemini_call';

        // Retry logic for rate limiting
        let geminiResponse: Response | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: EXTRACTION_PROMPT + rawText }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                }
            );

            if (geminiResponse.status === 429) {
                retryCount++;
                console.log(`Rate limited, retry ${retryCount}/${maxRetries}...`);
                if (retryCount < maxRetries) {
                    // Wait with exponential backoff: 2s, 4s, 8s
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                }
            } else {
                break;
            }
        }

        if (!geminiResponse || !geminiResponse.ok) {
            const errorText = geminiResponse ? await geminiResponse.text() : 'No response';
            console.error('Gemini error:', errorText);
            return new Response(JSON.stringify({
                error: 'AI extraction failed',
                status: geminiResponse?.status || 0,
                details: geminiResponse?.status === 429 ? 'Rate limited. Please wait a minute and try again.' : errorText
            }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        step = 'parse_gemini';
        const geminiData = await geminiResponse.json();
        const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        // Parse JSON
        let extractedData: any;
        try {
            let cleanJson = textContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
            const start = cleanJson.indexOf('{');
            const end = cleanJson.lastIndexOf('}');
            if (start !== -1 && end !== -1) cleanJson = cleanJson.substring(start, end + 1);
            extractedData = JSON.parse(cleanJson);
        } catch (e) {
            console.error('JSON parse error:', e);
            return new Response(JSON.stringify({ error: 'Failed to parse AI response', raw: textContent.substring(0, 300) }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (!extractedData.contact?.name) {
            return new Response(JSON.stringify({ error: 'Could not extract name from resume' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        step = 'generate_latex';
        // Simple LaTeX generation
        const latexSource = `% Resume - ${extractedData.contact.name}
\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\begin{document}
\\begin{center}
{\\Large \\textbf{${extractedData.contact.name}}}
\\end{center}
\\section*{Summary}
${extractedData.summary || 'No summary provided.'}
\\section*{Skills}
${(extractedData.skills || []).map((s: any) => `\\textbf{${s.category}}: ${s.items}`).join('\\\\\\n') || 'Not specified'}
\\section*{Experience}
${(extractedData.experience || []).map((e: any) => `\\textbf{${e.title}} at ${e.company} (${e.dates})`).join('\\\\\\n') || 'Not specified'}
\\section*{Education}
${(extractedData.education || []).map((e: any) => `\\textbf{${e.degree}} - ${e.institution} (${e.dates})`).join('\\\\\\n') || 'Not specified'}
\\end{document}`;

        step = 'supabase_init';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Count sections
        const sectionsFound: string[] = ['contact'];
        const sectionsEmpty: string[] = [];
        if (extractedData.summary) sectionsFound.push('summary'); else sectionsEmpty.push('summary');
        if (extractedData.education?.length) sectionsFound.push(`education(${extractedData.education.length})`); else sectionsEmpty.push('education');
        if (extractedData.skills?.length) sectionsFound.push(`skills(${extractedData.skills.length})`); else sectionsEmpty.push('skills');
        if (extractedData.experience?.length) sectionsFound.push(`experience(${extractedData.experience.length})`); else sectionsEmpty.push('experience');
        if (extractedData.projects?.length) sectionsFound.push(`projects(${extractedData.projects.length})`); else sectionsEmpty.push('projects');

        step = 'db_insert';
        console.log('Inserting into database...');

        const { data: newVersion, error: insertError } = await supabase
            .from('resume_versions')
            .insert({
                raw_text: rawText,
                extracted_data: extractedData,
                latex_source: latexSource,
                sections_found: sectionsFound,
                sections_empty: sectionsEmpty,
                extraction_confidence: sectionsFound.length / (sectionsFound.length + sectionsEmpty.length),
                status: publishImmediately ? 'published' : 'draft',
                is_active: publishImmediately
            })
            .select('id, version_number')
            .single();

        if (insertError) {
            console.error('DB insert error:', insertError);
            return new Response(JSON.stringify({ error: 'Database insert failed', details: insertError.message, code: insertError.code }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log('Success! Version:', newVersion?.version_number);

        return new Response(JSON.stringify({
            success: true,
            message: publishImmediately ? 'Resume published!' : 'Resume saved as draft',
            versionId: newVersion?.id,
            versionNumber: newVersion?.version_number,
            sectionsFound,
            sectionsEmpty,
            durationMs: Date.now() - startTime
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error(`Error at step [${step}]:`, error);
        return new Response(JSON.stringify({ error: error.message, step, stack: error.stack?.substring(0, 200) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
