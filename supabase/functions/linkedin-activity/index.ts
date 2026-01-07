// LinkedIn Activity Edge Function
// Accepts manual paste of LinkedIn content and processes with Gemini AI

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInPost {
    content: string
    contentType: 'post' | 'article' | 'share' | 'experience' | 'featured' | 'headline'
    postDate?: string
    engagementMetrics?: {
        likes?: number
        comments?: number
        shares?: number
    }
    mediaUrls?: string[]
    externalUrl?: string
}

interface ProcessedPost {
    summary: string
    themes: string[]
    keyPoints: string[]
}

async function processWithAI(posts: LinkedInPost[], geminiApiKey: string): Promise<ProcessedPost[]> {
    const results: ProcessedPost[] = []

    for (const post of posts) {
        const prompt = `Analyze this LinkedIn ${post.contentType} and extract key information.

CONTENT:
${post.content.substring(0, 3000)}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "summary": "A clean, professional 1-2 sentence summary of the content",
  "themes": ["Theme1", "Theme2", "Theme3"],
  "keyPoints": ["Key insight 1", "Key insight 2"]
}

Rules:
- Summary should be professional and suitable for a portfolio
- Themes should be high-level topics (e.g., "AI/ML", "Career Growth", "Research")
- Key points should be actionable insights or notable achievements
- If it's a headline or experience, extract the professional positioning`

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.3,
                            topP: 0.8,
                            maxOutputTokens: 500,
                        }
                    })
                }
            )

            if (!response.ok) {
                console.error('Gemini API error:', await response.text())
                results.push({
                    summary: post.content.substring(0, 200),
                    themes: [],
                    keyPoints: []
                })
                continue
            }

            const data = await response.json()
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

            const jsonMatch = responseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                results.push(JSON.parse(jsonMatch[0]) as ProcessedPost)
            } else {
                results.push({
                    summary: post.content.substring(0, 200),
                    themes: [],
                    keyPoints: []
                })
            }
        } catch (error) {
            console.error('AI processing error:', error)
            results.push({
                summary: post.content.substring(0, 200),
                themes: [],
                keyPoints: []
            })
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200))
    }

    return results
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const body = await req.json()

        // Accept either a single post or an array of posts
        const posts: LinkedInPost[] = Array.isArray(body.posts) ? body.posts : [body]

        if (posts.length === 0 || !posts[0].content) {
            return new Response(
                JSON.stringify({ error: 'No content provided' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create sync log
        const { data: syncLog } = await supabase
            .from('sync_logs')
            .insert({
                sync_type: 'linkedin',
                status: 'started',
                trigger_type: 'manual',
                items_found: posts.length
            })
            .select()
            .single()

        const syncLogId = syncLog?.id
        const startTime = Date.now()

        // Process posts with AI
        const processedPosts = await processWithAI(posts, geminiApiKey)

        let itemsAdded = 0
        let itemsFailed = 0

        // Insert processed posts
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            const processed = processedPosts[i]

            const { error } = await supabase
                .from('linkedin_activity')
                .insert({
                    content_type: post.contentType || 'post',
                    original_content: post.content,
                    ai_summary: processed.summary,
                    ai_themes: processed.themes,
                    ai_key_points: processed.keyPoints,
                    post_date: post.postDate ? new Date(post.postDate).toISOString() : null,
                    engagement_metrics: post.engagementMetrics || {},
                    media_urls: post.mediaUrls || [],
                    external_url: post.externalUrl,
                    source: 'manual',
                    is_visible: true
                })

            if (error) {
                console.error('Insert error:', error)
                itemsFailed++
            } else {
                itemsAdded++
            }
        }

        const duration = Date.now() - startTime

        // Update sync log
        if (syncLogId) {
            await supabase
                .from('sync_logs')
                .update({
                    status: itemsFailed > 0 ? 'partial' : 'success',
                    items_processed: posts.length,
                    items_added: itemsAdded,
                    items_failed: itemsFailed,
                    duration_ms: duration,
                    completed_at: new Date().toISOString()
                })
                .eq('id', syncLogId)
        }

        // Collect all unique themes
        const allThemes = processedPosts.flatMap(p => p.themes)
        const uniqueThemes = [...new Set(allThemes)]

        return new Response(
            JSON.stringify({
                success: true,
                posts_processed: posts.length,
                items_added: itemsAdded,
                items_failed: itemsFailed,
                themes_extracted: uniqueThemes,
                duration_ms: duration
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('LinkedIn activity error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
