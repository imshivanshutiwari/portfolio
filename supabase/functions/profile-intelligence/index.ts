// Profile Intelligence Engine Edge Function
// Merges data from GitHub, LinkedIn, and Resume into a unified profile

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UnifiedProfile {
    professionalSummary: string
    headline: string
    keyThemes: string[]
    expertiseAreas: string[]
    careerHighlights: string[]
    totalYearsExperience: number
}

async function generateUnifiedProfile(
    skills: any[],
    githubRepos: any[],
    linkedinPosts: any[],
    resumeData: any,
    geminiApiKey: string
): Promise<UnifiedProfile> {
    const prompt = `You are a professional profile intelligence engine. Analyze the following data from multiple sources and create a unified professional profile.

SKILLS (${skills.length} total):
${JSON.stringify(skills.slice(0, 30))}

GITHUB REPOSITORIES (${githubRepos.length} total):
${JSON.stringify(githubRepos.slice(0, 10).map(r => ({
        name: r.name,
        category: r.ai_category,
        description: r.ai_description,
        tech: r.ai_tech_stack
    })))}

LINKEDIN ACTIVITY (${linkedinPosts.length} posts):
${JSON.stringify(linkedinPosts.slice(0, 5).map(p => ({
        summary: p.ai_summary,
        themes: p.ai_themes
    })))}

RESUME SUMMARY:
${resumeData?.summary || 'Not available'}

RESUME EXPERIENCE:
${JSON.stringify(resumeData?.experience?.slice(0, 3) || [])}

Return ONLY a valid JSON object:
{
  "professionalSummary": "A compelling 2-3 sentence professional summary that synthesizes all sources, suitable for recruiters and research labs",
  "headline": "A powerful one-line professional headline (like LinkedIn headline)",
  "keyThemes": ["Theme1", "Theme2", "Theme3", "Theme4", "Theme5"],
  "expertiseAreas": ["Area1", "Area2", "Area3", "Area4"],
  "careerHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "totalYearsExperience": estimated_years_as_number
}

Rules:
- Synthesize information across all sources
- Highlight unique differentiators
- Focus on high-impact achievements
- Make it suitable for high-end tech roles and research positions`

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.4,
                        topP: 0.9,
                        maxOutputTokens: 1000,
                    }
                })
            }
        )

        if (!response.ok) {
            console.error('Gemini error:', await response.text())
            throw new Error('AI generation failed')
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as UnifiedProfile
        }

        throw new Error('Failed to parse AI response')
    } catch (error) {
        console.error('Profile generation error:', error)
        // Return default profile
        return {
            professionalSummary: resumeData?.summary || 'AI & Machine Learning Professional',
            headline: 'Technology Professional',
            keyThemes: ['Technology', 'Innovation'],
            expertiseAreas: ['Software Development'],
            careerHighlights: [],
            totalYearsExperience: 0
        }
    }
}

function normalizeSkillName(name: string): string {
    const normalizations: Record<string, string> = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'py': 'Python',
        'ml': 'Machine Learning',
        'ai': 'Artificial Intelligence',
        'dl': 'Deep Learning',
        'cv': 'Computer Vision',
        'nlp': 'Natural Language Processing',
        'react.js': 'React',
        'reactjs': 'React',
        'node.js': 'Node.js',
        'nodejs': 'Node.js',
        'postgres': 'PostgreSQL',
        'k8s': 'Kubernetes',
    }

    const lower = name.toLowerCase().trim()
    return normalizations[lower] || name
}

function mergeSkills(resumeSkills: any[], githubTechStacks: string[][]): Map<string, any> {
    const skillMap = new Map<string, any>()

    // Add resume skills
    for (const skill of resumeSkills || []) {
        const normalized = normalizeSkillName(skill.name)
        skillMap.set(normalized.toLowerCase(), {
            name: normalized,
            category: skill.category || 'Other',
            proficiency: skill.proficiency || 3,
            sources: ['resume'],
            sourceCount: 1
        })
    }

    // Add GitHub tech stacks
    for (const techStack of githubTechStacks) {
        for (const tech of techStack || []) {
            const normalized = normalizeSkillName(tech)
            const key = normalized.toLowerCase()

            if (skillMap.has(key)) {
                const existing = skillMap.get(key)!
                if (!existing.sources.includes('github')) {
                    existing.sources.push('github')
                    existing.sourceCount++
                }
            } else {
                skillMap.set(key, {
                    name: normalized,
                    category: 'Technologies',
                    proficiency: 3,
                    sources: ['github'],
                    sourceCount: 1
                })
            }
        }
    }

    return skillMap
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Create sync log
        const { data: syncLog } = await supabase
            .from('sync_logs')
            .insert({
                sync_type: 'intelligence',
                status: 'started',
                trigger_type: 'manual'
            })
            .select()
            .single()

        const syncLogId = syncLog?.id
        const startTime = Date.now()

        // Fetch all data sources
        const [githubResult, linkedinResult, resumeResult, skillsResult] = await Promise.all([
            supabase.from('github_repos').select('*').eq('is_visible', true),
            supabase.from('linkedin_activity').select('*').eq('is_visible', true),
            supabase.from('resume_data').select('*').eq('is_active', true).single(),
            supabase.from('skills').select('*')
        ])

        const githubRepos = githubResult.data || []
        const linkedinPosts = linkedinResult.data || []
        const resumeData = resumeResult.data
        const existingSkills = skillsResult.data || []

        // Merge skills from all sources
        const githubTechStacks = githubRepos.map(r => r.ai_tech_stack || [])
        const mergedSkills = mergeSkills(resumeData?.skills || [], githubTechStacks)

        // Update skills table
        let skillsUpdated = 0
        for (const [_, skill] of mergedSkills) {
            const { error } = await supabase
                .from('skills')
                .upsert({
                    name: skill.name,
                    normalized_name: skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    category: skill.category,
                    proficiency_level: skill.proficiency,
                    sources: skill.sources,
                    source_count: skill.sourceCount,
                    is_visible: true
                }, { onConflict: 'normalized_name' })

            if (!error) skillsUpdated++
        }

        // Generate unified profile with AI
        let unifiedProfile: UnifiedProfile | null = null

        if (geminiApiKey) {
            unifiedProfile = await generateUnifiedProfile(
                Array.from(mergedSkills.values()),
                githubRepos,
                linkedinPosts,
                resumeData,
                geminiApiKey
            )
        }

        // Prepare unified data
        const unifiedExperience = resumeData?.experience || []
        const unifiedEducation = resumeData?.education || []

        // Merge projects from resume and GitHub
        const resumeProjects = (resumeData?.projects || []).map((p: any) => ({
            ...p,
            source: 'resume'
        }))

        const githubProjects = githubRepos
            .filter(r => r.ai_is_portfolio_worthy)
            .map(r => ({
                name: r.custom_title || r.name,
                description: r.custom_description || r.ai_description || r.description,
                technologies: r.ai_tech_stack || [],
                url: r.html_url,
                demoUrl: r.demo_url || r.homepage,
                source: 'github',
                category: r.ai_category,
                stars: r.stargazers_count
            }))

        const unifiedProjects = [...resumeProjects, ...githubProjects]

        // Collect all themes
        const allThemes = [
            ...(unifiedProfile?.keyThemes || []),
            ...linkedinPosts.flatMap(p => p.ai_themes || [])
        ]
        const uniqueThemes = [...new Set(allThemes)]

        // Get version number
        const { data: latestProfile } = await supabase
            .from('profile_intelligence')
            .select('merge_version')
            .order('merge_version', { ascending: false })
            .limit(1)
            .single()

        const newVersion = (latestProfile?.merge_version || 0) + 1

        // Deactivate old profiles
        await supabase
            .from('profile_intelligence')
            .update({ is_active: false })
            .eq('is_active', true)

        // Insert unified profile
        const { data: newProfile, error: profileError } = await supabase
            .from('profile_intelligence')
            .insert({
                unified_skills: Array.from(mergedSkills.values()),
                unified_experience: unifiedExperience,
                unified_education: unifiedEducation,
                unified_projects: unifiedProjects,
                unified_certifications: resumeData?.certifications || [],
                professional_summary: unifiedProfile?.professionalSummary || resumeData?.summary,
                headline: unifiedProfile?.headline || 'Technology Professional',
                key_themes: uniqueThemes,
                expertise_areas: unifiedProfile?.expertiseAreas || [],
                career_highlights: unifiedProfile?.careerHighlights || [],
                data_sources: {
                    github: { count: githubRepos.length, lastSync: new Date().toISOString() },
                    linkedin: { count: linkedinPosts.length, lastSync: new Date().toISOString() },
                    resume: { version: resumeData?.version || 0, lastSync: new Date().toISOString() }
                },
                source_timestamps: {
                    github: githubRepos[0]?.last_synced_at,
                    linkedin: linkedinPosts[0]?.created_at,
                    resume: resumeData?.parsed_at
                },
                merge_version: newVersion,
                is_active: true
            })
            .select()
            .single()

        if (profileError) {
            throw profileError
        }

        const duration = Date.now() - startTime

        // Update sync log
        if (syncLogId) {
            await supabase
                .from('sync_logs')
                .update({
                    status: 'success',
                    items_found: githubRepos.length + linkedinPosts.length + (resumeData ? 1 : 0),
                    items_processed: 1,
                    items_updated: skillsUpdated,
                    duration_ms: duration,
                    completed_at: new Date().toISOString(),
                    metadata: {
                        skills_merged: mergedSkills.size,
                        projects_unified: unifiedProjects.length,
                        themes_identified: uniqueThemes.length
                    }
                })
                .eq('id', syncLogId)
        }

        return new Response(
            JSON.stringify({
                success: true,
                profile_id: newProfile.id,
                version: newVersion,
                skills_unified: mergedSkills.size,
                projects_unified: unifiedProjects.length,
                themes_identified: uniqueThemes.length,
                sources: {
                    github: githubRepos.length,
                    linkedin: linkedinPosts.length,
                    resume: resumeData ? 1 : 0
                },
                duration_ms: duration
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Intelligence engine error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
