// React hooks for Resume Intelligence Module
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface ResumeVersion {
    id: string;
    version_number: number;
    raw_text: string;
    extracted_data: ExtractedResumeData;
    latex_source: string;
    latex_hash: string | null;
    html_output: string | null;
    pdf_url: string | null;
    extraction_confidence: number;
    sections_found: string[];
    sections_empty: string[];
    ai_model_used: string;
    status: 'draft' | 'compiled' | 'published' | 'archived';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    change_summary: string | null;
}

export interface ExtractedResumeData {
    contact: {
        name: string;
        email?: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        website?: string;
        location?: string;
    };
    summary?: string;
    education: Array<{
        institution: string;
        dates: string;
        degree: string;
        details?: string;
    }>;
    skills: Array<{
        category: string;
        items: string;
    }>;
    experience: Array<{
        title: string;
        dates: string;
        company: string;
        location: string;
        bullets: string[];
    }>;
    projects: Array<{
        name: string;
        url?: string;
        year: string;
        bullets: string[];
    }>;
    research: Array<{
        title: string;
        dates: string;
        organization: string;
        location: string;
        bullets: string[];
    }>;
    publications: Array<{
        authors: string;
        title: string;
        venue: string;
        note?: string;
    }>;
    achievements: Array<{
        title: string;
        description?: string;
    }>;
}

// Hook: Get all resume versions
export const useResumeVersions = () => {
    return useQuery({
        queryKey: ['resume-versions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('resume_versions')
                .select('*')
                .order('version_number', { ascending: false });

            if (error) throw error;
            return data as ResumeVersion[];
        }
    });
};

// Hook: Get active/published resume
export const useActiveResume = () => {
    return useQuery({
        queryKey: ['resume-active'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('resume_versions')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
            return data as ResumeVersion | null;
        }
    });
};

// Hook: Get specific resume version
export const useResumeVersion = (versionId: string | null) => {
    return useQuery({
        queryKey: ['resume-version', versionId],
        queryFn: async () => {
            if (!versionId) return null;

            const { data, error } = await supabase
                .from('resume_versions')
                .select('*')
                .eq('id', versionId)
                .single();

            if (error) throw error;
            return data as ResumeVersion;
        },
        enabled: !!versionId
    });
};

// Hook: Trigger resume intelligence extraction
export const useTriggerResumeIntelligence = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ rawText, publishImmediately = false }: {
            rawText: string;
            publishImmediately?: boolean;
        }) => {
            const { data, error } = await supabase.functions.invoke('resume-intelligence', {
                body: { rawText, publishImmediately }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resume-versions'] });
            queryClient.invalidateQueries({ queryKey: ['resume-active'] });
        }
    });
};

// Hook: Publish a specific version (make it active)
export const usePublishResumeVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (versionId: string) => {
            const { data, error } = await supabase
                .from('resume_versions')
                .update({
                    is_active: true,
                    status: 'published',
                    published_at: new Date().toISOString()
                })
                .eq('id', versionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resume-versions'] });
            queryClient.invalidateQueries({ queryKey: ['resume-active'] });
        }
    });
};

// Hook: Delete a resume version (only drafts/archived)
export const useDeleteResumeVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (versionId: string) => {
            const { error } = await supabase
                .from('resume_versions')
                .delete()
                .eq('id', versionId)
                .neq('is_active', true); // Can't delete active version

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resume-versions'] });
        }
    });
};

// Hook: Update resume version status
export const useUpdateResumeStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ versionId, status }: {
            versionId: string;
            status: 'draft' | 'archived';
        }) => {
            const { data, error } = await supabase
                .from('resume_versions')
                .update({ status })
                .eq('id', versionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resume-versions'] });
        }
    });
};
