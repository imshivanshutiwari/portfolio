-- ============================================
-- SELF-UPDATING PORTFOLIO SYSTEM - SCHEMA
-- ============================================
-- Created: 2026-01-07
-- Purpose: Tables for GitHub sync, LinkedIn activity, 
--          Resume parsing, and Profile Intelligence Engine
-- ============================================

-- ============================================
-- 1. GITHUB REPOS TABLE
-- ============================================
-- Stores synced GitHub repositories with AI analysis
CREATE TABLE IF NOT EXISTS public.github_repos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  homepage TEXT,
  languages JSONB DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  is_fork BOOLEAN DEFAULT false,
  created_at_github TIMESTAMP WITH TIME ZONE,
  updated_at_github TIMESTAMP WITH TIME ZONE,
  pushed_at TIMESTAMP WITH TIME ZONE,
  readme_content TEXT,
  readme_hash TEXT,
  -- AI-generated fields
  ai_category TEXT,
  ai_description TEXT,
  ai_tech_stack TEXT[] DEFAULT '{}',
  ai_is_portfolio_worthy BOOLEAN DEFAULT true,
  ai_key_features TEXT[] DEFAULT '{}',
  ai_project_type TEXT,
  -- Sync tracking
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_version INTEGER DEFAULT 1,
  -- Portfolio display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  custom_title TEXT,
  custom_description TEXT,
  custom_image TEXT,
  demo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_github_repos_github_id ON public.github_repos(github_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_is_visible ON public.github_repos(is_visible);
CREATE INDEX IF NOT EXISTS idx_github_repos_is_featured ON public.github_repos(is_featured);

-- ============================================
-- 2. LINKEDIN ACTIVITY TABLE  
-- ============================================
-- Stores LinkedIn posts, articles, and professional updates
CREATE TABLE IF NOT EXISTS public.linkedin_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'share', 'experience', 'featured', 'headline')),
  original_content TEXT,
  ai_summary TEXT,
  ai_themes TEXT[] DEFAULT '{}',
  ai_key_points TEXT[] DEFAULT '{}',
  post_date TIMESTAMP WITH TIME ZONE,
  engagement_metrics JSONB DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  external_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_activity_content_type ON public.linkedin_activity(content_type);
CREATE INDEX IF NOT EXISTS idx_linkedin_activity_is_visible ON public.linkedin_activity(is_visible);

-- ============================================
-- 3. RESUME DATA TABLE
-- ============================================
-- Stores parsed resume data with version control
CREATE TABLE IF NOT EXISTS public.resume_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version INTEGER DEFAULT 1,
  file_name TEXT,
  file_hash TEXT UNIQUE,
  file_url TEXT,
  raw_text TEXT,
  parsed_data JSONB NOT NULL DEFAULT '{}',
  -- Extracted sections (denormalized for fast access)
  skills JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  publications JSONB DEFAULT '[]',
  summary TEXT,
  contact_info JSONB DEFAULT '{}',
  -- Metadata
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ai_model_used TEXT,
  parsing_confidence FLOAT DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_data_is_active ON public.resume_data(is_active);
CREATE INDEX IF NOT EXISTS idx_resume_data_file_hash ON public.resume_data(file_hash);

-- ============================================
-- 4. PROFILE INTELLIGENCE TABLE
-- ============================================
-- Unified profile data merged from all sources
CREATE TABLE IF NOT EXISTS public.profile_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Unified data
  unified_skills JSONB DEFAULT '[]',
  unified_experience JSONB DEFAULT '[]',
  unified_education JSONB DEFAULT '[]',
  unified_projects JSONB DEFAULT '[]',
  unified_certifications JSONB DEFAULT '[]',
  -- Generated content
  professional_summary TEXT,
  headline TEXT,
  key_themes TEXT[] DEFAULT '{}',
  expertise_areas TEXT[] DEFAULT '{}',
  career_highlights JSONB DEFAULT '[]',
  -- Source tracking
  data_sources JSONB DEFAULT '{}',
  source_timestamps JSONB DEFAULT '{}',
  conflict_resolutions JSONB DEFAULT '[]',
  -- Metadata
  last_merged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  merge_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 5. SKILLS TABLE
-- ============================================
-- Normalized skills with categorization
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  years_experience FLOAT,
  sources TEXT[] DEFAULT '{}',
  source_count INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon_name TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_is_featured ON public.skills(is_featured);
CREATE INDEX IF NOT EXISTS idx_skills_is_visible ON public.skills(is_visible);

-- ============================================
-- 6. SYNC LOGS TABLE
-- ============================================
-- Track all synchronization activities
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('github', 'linkedin', 'resume', 'intelligence', 'full')),
  status TEXT NOT NULL CHECK (status IN ('started', 'running', 'success', 'failed', 'partial', 'cancelled')),
  trigger_type TEXT DEFAULT 'scheduled' CHECK (trigger_type IN ('scheduled', 'manual', 'webhook')),
  items_found INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  metadata JSONB DEFAULT '{}',
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_sync_type ON public.sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs(started_at DESC);

-- ============================================
-- 7. SYSTEM CONFIG TABLE
-- ============================================
-- Store configuration like GitHub username, API keys reference, etc.
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  value_json JSONB,
  description TEXT,
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================
ALTER TABLE public.github_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- ============================================
-- GitHub repos are publicly viewable
CREATE POLICY "GitHub repos are viewable by everyone" 
ON public.github_repos FOR SELECT 
USING (is_visible = true);

-- LinkedIn activity is publicly viewable
CREATE POLICY "LinkedIn activity is viewable by everyone" 
ON public.linkedin_activity FOR SELECT 
USING (is_visible = true);

-- Skills are publicly viewable
CREATE POLICY "Skills are viewable by everyone" 
ON public.skills FOR SELECT 
USING (is_visible = true);

-- Profile intelligence is publicly viewable
CREATE POLICY "Profile intelligence is viewable by everyone" 
ON public.profile_intelligence FOR SELECT 
USING (is_active = true);

-- Resume data - active version is public
CREATE POLICY "Active resume is viewable by everyone" 
ON public.resume_data FOR SELECT 
USING (is_active = true);

-- Sync logs are public for transparency
CREATE POLICY "Sync logs are viewable by everyone" 
ON public.sync_logs FOR SELECT 
USING (true);

-- System config - only non-secret values are public
CREATE POLICY "Non-secret config is viewable by everyone" 
ON public.system_config FOR SELECT 
USING (is_secret = false);

-- ============================================
-- SERVICE ROLE POLICIES FOR EDGE FUNCTIONS
-- ============================================
-- These allow the service role (Edge Functions) to write data

CREATE POLICY "Service role can insert github repos" 
ON public.github_repos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update github repos" 
ON public.github_repos FOR UPDATE 
USING (true);

CREATE POLICY "Service role can insert linkedin activity" 
ON public.linkedin_activity FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update linkedin activity" 
ON public.linkedin_activity FOR UPDATE 
USING (true);

CREATE POLICY "Service role can insert resume data" 
ON public.resume_data FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update resume data" 
ON public.resume_data FOR UPDATE 
USING (true);

CREATE POLICY "Service role can insert profile intelligence" 
ON public.profile_intelligence FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update profile intelligence" 
ON public.profile_intelligence FOR UPDATE 
USING (true);

CREATE POLICY "Service role can insert skills" 
ON public.skills FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update skills" 
ON public.skills FOR UPDATE 
USING (true);

CREATE POLICY "Service role can insert sync logs" 
ON public.sync_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update sync logs" 
ON public.sync_logs FOR UPDATE 
USING (true);

CREATE POLICY "Service role can manage system config" 
ON public.system_config FOR ALL 
USING (true);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE TRIGGER update_github_repos_updated_at
BEFORE UPDATE ON public.github_repos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linkedin_activity_updated_at
BEFORE UPDATE ON public.linkedin_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_intelligence_updated_at
BEFORE UPDATE ON public.profile_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INSERT DEFAULT SYSTEM CONFIG
-- ============================================
INSERT INTO public.system_config (key, value, description, is_secret) VALUES
  ('github_username', '', 'GitHub username for repository sync', false),
  ('github_sync_enabled', 'true', 'Enable/disable GitHub sync', false),
  ('github_sync_interval_hours', '6', 'Hours between GitHub syncs', false),
  ('linkedin_sync_enabled', 'true', 'Enable/disable LinkedIn section', false),
  ('resume_sync_enabled', 'true', 'Enable/disable Resume parsing', false),
  ('ai_provider', 'gemini', 'AI provider for analysis (gemini/openai)', false),
  ('portfolio_owner_name', 'Shivanshu Tiwari', 'Portfolio owner name', false),
  ('portfolio_owner_title', 'AI & Defense Innovation', 'Portfolio owner professional title', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ENABLE REALTIME FOR KEY TABLES
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.github_repos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_logs;
