// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
}

interface AIAnalysis {
  category: string
  description: string
  techStack: string[]
  isPortfolioWorthy: boolean
  keyFeatures: string[]
  projectType: string
}

// Analyze repository with Gemini AI
async function analyzeRepoWithAI(
  repo: GitHubRepo,
  readme: string,
  languages: Record<string, number>,
  geminiApiKey: string
): Promise<AIAnalysis> {
  const prompt = `You are analyzing a GitHub repository for a professional portfolio. Analyze this repository and return a JSON object.

Repository: ${repo.name}
Description: ${repo.description || 'No description'}
README (first 3000 chars): ${readme.substring(0, 3000)}
Languages: ${JSON.stringify(languages)}
Topics: ${repo.topics?.join(', ') || 'None'}
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "category": "one of: Machine Learning, Computer Vision, NLP, Web Development, Data Engineering, DevOps, Research, Systems, Mobile, Other",
  "description": "2-3 sentence professional description for portfolio (do not start with 'This project')",
  "techStack": ["array", "of", "key", "technologies"],
  "isPortfolioWorthy": true or false (based on completeness, quality, and relevance),
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "projectType": "one of: Personal Project, Research, Open Source, Tool/Utility, Demo, Library, Application"
}`

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      })
    })

    if (!response.ok) {
      console.error('Gemini API error:', await response.text())
      return getDefaultAnalysis(repo, languages)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIAnalysis
    }

    return getDefaultAnalysis(repo, languages)
  } catch (error) {
    console.error('AI analysis error:', error)
    return getDefaultAnalysis(repo, languages)
  }
}

// Fallback analysis without AI
function getDefaultAnalysis(repo: GitHubRepo, languages: Record<string, number>): AIAnalysis {
  const topLanguages = Object.keys(languages).slice(0, 5)

  let category = 'Other'
  const desc = (repo.description || '').toLowerCase()
  const topics = (repo.topics || []).map(t => t.toLowerCase())

  if (topics.includes('machine-learning') || topics.includes('ml') || desc.includes('machine learning')) {
    category = 'Machine Learning'
  } else if (topics.includes('computer-vision') || desc.includes('vision') || desc.includes('image')) {
    category = 'Computer Vision'
  } else if (topics.includes('nlp') || desc.includes('nlp') || desc.includes('language')) {
    category = 'NLP'
  } else if (topics.includes('web') || topLanguages.includes('JavaScript') || topLanguages.includes('TypeScript')) {
    category = 'Web Development'
  } else if (topics.includes('data') || desc.includes('data')) {
    category = 'Data Engineering'
  }

  return {
    category,
    description: repo.description || `A ${category.toLowerCase()} project built with ${topLanguages.join(', ')}`,
    techStack: topLanguages,
    isPortfolioWorthy: repo.stargazers_count > 0 || !repo.fork,
    keyFeatures: [],
    projectType: repo.fork ? 'Open Source' : 'Personal Project'
  }
}

// Fetch README content
async function fetchReadme(owner: string, repo: string, token?: string): Promise<string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.raw',
    'User-Agent': 'Portfolio-Sync'
  }
  if (token) headers['Authorization'] = `token ${token}`

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
    if (response.ok) {
      return await response.text()
    }
  } catch (e) {
    console.log(`No README for ${repo}`)
  }
  return ''
}

// Fetch language breakdown
async function fetchLanguages(owner: string, repo: string, token?: string): Promise<Record<string, number>> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Sync'
  }
  if (token) headers['Authorization'] = `token ${token}`

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers })
    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.log(`No languages for ${repo}`)
  }
  return {}
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const githubToken = Deno.env.get('GITHUB_TOKEN')

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get GitHub username from config or request body
    let githubUsername: string | null = null

    try {
      const body = await req.json()
      githubUsername = body.github_username
    } catch {
      // No body provided
    }

    if (!githubUsername) {
      const { data: config } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'github_username')
        .single()

      githubUsername = config?.value
    }

    // Default fallback if no username configured
    if (!githubUsername) {
      githubUsername = 'imshivanshutiwari'
    }

    // Create sync log entry
    const { data: syncLog, error: logError } = await supabase
      .from('sync_logs')
      .insert({
        sync_type: 'github',
        status: 'started',
        trigger_type: 'manual',
        metadata: { github_username: githubUsername }
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to create sync log:', logError)
    }

    const syncLogId = syncLog?.id
    const startTime = Date.now()

    // Fetch repositories from GitHub
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Sync'
    }
    if (githubToken) headers['Authorization'] = `token ${githubToken}`

    let repos: GitHubRepo[] = []
    let fetchError = null

    // 1. Try Authenticated Fetch if token exists
    if (githubToken) {
      const authUrl = `https://api.github.com/user/repos?per_page=100&sort=updated&type=all&affiliation=owner,collaborator`
      try {
        const authResponse = await fetch(authUrl, { headers })
        if (authResponse.ok) {
          repos = await authResponse.json()
        } else {
          console.warn(`Authenticated fetch failed: ${authResponse.status}. Falling back to public.`)
          if (syncLogId) {
            await supabase.from('sync_logs').update({ metadata: { warning: `Invalid Token (${authResponse.status}) - falling back to public` } }).eq('id', syncLogId)
          }
        }
      } catch (e) {
        console.error('Auth fetch error:', e)
        fetchError = e
      }
    }

    // 2. Fallback to Public Fetch if no repos found yet (either no token or auth failed)
    if (repos.length === 0) {
      const publicUrl = `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`
      const publicHeaders = { ...headers }
      delete publicHeaders['Authorization'] // Remove token to ensure public access works

      const publicResponse = await fetch(publicUrl, { headers: publicHeaders })

      if (!publicResponse.ok) {
        const errorText = await publicResponse.text()
        throw new Error(`GitHub API error: ${publicResponse.status} - ${errorText}. (Auth error: ${fetchError})`)
      }

      repos = await publicResponse.json()
    }

    // Continue to processing loop below...

    let itemsAdded = 0
    let itemsUpdated = 0
    let itemsSkipped = 0
    let itemsFailed = 0

    // Process each repository
    for (const repo of repos) {
      try {
        // Skip archived repos
        if (repo.archived) {
          itemsSkipped++
          continue
        }

        // Include all other repos, even forks (users often fork to contribute or modify)
        // We will let the AI decide if it's portfolio worthy, or let the user hide it later

        // Check if repo already exists
        const { data: existing } = await supabase
          .from('github_repos')
          .select('id, updated_at_github, readme_hash')
          .eq('github_id', repo.id)
          .single()

        // Check if update is needed
        const needsUpdate = !existing ||
          existing.updated_at_github !== repo.updated_at

        if (!needsUpdate) {
          itemsSkipped++
          continue
        }

        // Fetch additional data
        const [readme, languages] = await Promise.all([
          fetchReadme(githubUsername, repo.name, githubToken),
          fetchLanguages(githubUsername, repo.name, githubToken)
        ])

        // Analyze with AI if API key is available
        let analysis: AIAnalysis
        if (geminiApiKey) {
          analysis = await analyzeRepoWithAI(repo, readme, languages, geminiApiKey)
        } else {
          analysis = getDefaultAnalysis(repo, languages)
        }

        // Prepare data for upsert
        const repoData = {
          github_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          homepage: repo.homepage,
          languages,
          topics: repo.topics || [],
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          is_fork: repo.fork,
          created_at_github: repo.created_at,
          updated_at_github: repo.updated_at,
          pushed_at: repo.pushed_at,
          readme_content: readme.substring(0, 10000), // Limit size
          ai_category: analysis.category,
          ai_description: analysis.description,
          ai_tech_stack: analysis.techStack,
          ai_is_portfolio_worthy: analysis.isPortfolioWorthy,
          ai_key_features: analysis.keyFeatures,
          ai_project_type: analysis.projectType,
          last_synced_at: new Date().toISOString(),
          sync_version: (existing?.id ? 2 : 1),
        }

        // Upsert to database
        const { error: upsertError } = await supabase
          .from('github_repos')
          .upsert(repoData, { onConflict: 'github_id' })

        if (upsertError) {
          console.error(`Failed to upsert ${repo.name}:`, upsertError)
          itemsFailed++
        } else if (existing) {
          itemsUpdated++
        } else {
          itemsAdded++
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (repoError) {
        console.error(`Error processing ${repo.name}:`, repoError)
        itemsFailed++
      }
    }

    const duration = Date.now() - startTime

    // Update sync log
    if (syncLogId) {
      await supabase
        .from('sync_logs')
        .update({
          status: itemsFailed > 0 ? 'partial' : 'success',
          items_found: repos.length,
          items_processed: itemsAdded + itemsUpdated + itemsSkipped,
          items_added: itemsAdded,
          items_updated: itemsUpdated,
          items_skipped: itemsSkipped,
          items_failed: itemsFailed,
          duration_ms: duration,
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLogId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        github_username: githubUsername,
        repos_found: repos.length,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        items_skipped: itemsSkipped,
        items_failed: itemsFailed,
        duration_ms: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('GitHub sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
