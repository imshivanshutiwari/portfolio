-- Add profile_content table for storing all editable content
CREATE TABLE IF NOT EXISTS public.profile_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type TEXT NOT NULL CHECK (section_type IN (
        'about_me', 'vision', 'mission', 'core_competency', 
        'experience', 'education', 'achievement', 'skill', 'technology'
    )),
    title TEXT,
    subtitle TEXT,
    content TEXT,
    icon_name TEXT,
    date_start TEXT,
    date_end TEXT,
    location TEXT,
    organization TEXT,
    url TEXT,
    tags TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_content_section ON public.profile_content(section_type);
CREATE INDEX IF NOT EXISTS idx_profile_content_visible ON public.profile_content(is_visible, section_type);

-- Enable RLS
ALTER TABLE public.profile_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view visible content" ON public.profile_content
    FOR SELECT USING (is_visible = true);

-- Allow authenticated users to manage content
CREATE POLICY "Authenticated can manage content" ON public.profile_content
    FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_profile_content_updated_at
    BEFORE UPDATE ON public.profile_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
