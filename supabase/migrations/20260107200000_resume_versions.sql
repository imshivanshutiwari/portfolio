-- Resume Intelligence Module: Version Control Schema
-- Created: 2026-01-07

-- ============================================
-- RESUME VERSIONS TABLE
-- ============================================
-- Stores all resume versions with LaTeX source and compiled output

CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version_number SERIAL,
    
    -- Raw Input
    raw_text TEXT NOT NULL,
    
    -- Extracted Structured Data (JSON)
    extracted_data JSONB NOT NULL DEFAULT '{}',
    
    -- LaTeX Output
    latex_source TEXT NOT NULL,
    latex_hash TEXT,  -- For deduplication
    
    -- Compiled Output
    html_output TEXT,
    pdf_url TEXT,
    
    -- Extraction Metadata
    extraction_confidence FLOAT DEFAULT 0.0,
    sections_found TEXT[] DEFAULT '{}',
    sections_empty TEXT[] DEFAULT '{}',
    ai_model_used TEXT DEFAULT 'gemini-2.0-flash',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'compiled', 'published', 'archived')),
    is_active BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    
    -- Audit
    change_summary TEXT
);

-- Ensure only one active version at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_resume_versions_single_active 
ON public.resume_versions (is_active) WHERE is_active = true;

-- Index for queries
CREATE INDEX IF NOT EXISTS idx_resume_versions_status ON public.resume_versions(status);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created ON public.resume_versions(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

-- Public can read active/published versions
CREATE POLICY "Public can view active resume" ON public.resume_versions
    FOR SELECT USING (is_active = true OR status = 'published');

-- Authenticated can manage all versions
CREATE POLICY "Authenticated can manage resume versions" ON public.resume_versions
    FOR ALL USING (true);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_resume_version_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resume_version_updated
    BEFORE UPDATE ON public.resume_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_version_timestamp();

-- ============================================
-- TRIGGER: Deactivate others when one is activated
-- ============================================
CREATE OR REPLACE FUNCTION deactivate_other_resume_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE public.resume_versions 
        SET is_active = false, status = 'archived'
        WHERE id != NEW.id AND is_active = true;
        
        NEW.status = 'published';
        NEW.published_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deactivate_other_versions
    BEFORE UPDATE ON public.resume_versions
    FOR EACH ROW
    WHEN (NEW.is_active = true AND OLD.is_active = false)
    EXECUTE FUNCTION deactivate_other_resume_versions();
