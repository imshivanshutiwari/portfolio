// @ts-nocheck
// Resume Parser Edge Function - Simplified Version
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function parseResumeWithAI(text: string, geminiApiKey: string): Promise<any> {
    const prompt = `Extract skills, experience, and education from this resume. Return JSON only:
${text.substring(0, 5000)}

Return format: {"skills": ["skill1"], "experience": [], "education": [], "summary": "brief summary"}`

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1 }
                })
            }
        )

        if (!response.ok) {
            console.error('Gemini error:', await response.text())
            return { skills: [], experience: [], education: [], summary: 'AI parsing failed' }
        }

        const data = await response.json()
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

        // Clean and parse
        let clean = textContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
        const start = clean.indexOf('{')
        const end = clean.lastIndexOf('}')
        if (start >= 0 && end > start) clean = clean.substring(start, end + 1)

        return JSON.parse(clean)
    } catch (e) {
        console.error('Parse error:', e)
        return { skills: [], experience: [], education: [], summary: 'Parsing error' }
    }
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

        console.log('Env check - SUPABASE_URL:', !!supabaseUrl)
        console.log('Env check - SERVICE_KEY:', !!supabaseServiceKey)
        console.log('Env check - GEMINI_KEY:', !!geminiApiKey)

        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            return new Response(
                JSON.stringify({ error: 'Supabase credentials not configured' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse request body
        let body
        try {
            body = await req.json()
        } catch (e) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON body' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const resumeText = body.text
        if (!resumeText || resumeText.length < 20) {
            return new Response(
                JSON.stringify({ error: 'Resume text too short or missing' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('Parsing resume text of length:', resumeText.length)

        // Parse with AI
        const parsed = await parseResumeWithAI(resumeText, geminiApiKey)
        console.log('Parsed result:', JSON.stringify(parsed).substring(0, 200))

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Try to insert into resume_data
        const { data: resumeData, error: insertError } = await supabase
            .from('resume_data')
            .insert({
                file_name: body.fileName || 'resume.txt',
                raw_text: resumeText.substring(0, 50000),
                skills: parsed.skills || [],
                experience: parsed.experience || [],
                education: parsed.education || [],
                certifications: [],
                projects: [],
                publications: [],
                summary: parsed.summary || null,
                contact_info: {},
                is_active: true
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('Insert error:', insertError)
            return new Response(
                JSON.stringify({
                    error: 'Database insert failed',
                    details: insertError.message,
                    parsed: parsed
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Resume parsed successfully',
                resume_id: resumeData?.id,
                skills_extracted: parsed.skills?.length || 0,
                experience_extracted: parsed.experience?.length || 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error', stack: error.stack }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
