import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

export interface GitHubRepo {
    id: string;
    github_id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    languages: Record<string, number>;
    topics: string[];
    stargazers_count: number;
    forks_count: number;
    is_fork: boolean;
    created_at_github: string;
    updated_at_github: string;
    pushed_at: string;
    readme_content: string | null;
    ai_category: string | null;
    ai_description: string | null;
    ai_tech_stack: string[];
    ai_is_portfolio_worthy: boolean;
    ai_key_features: string[];
    ai_project_type: string | null;
    last_synced_at: string;
    display_order: number;
    is_featured: boolean;
    is_visible: boolean;
    custom_title: string | null;
    custom_description: string | null;
    custom_image: string | null;
    demo_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface LinkedInActivity {
    id: string;
    content_type: 'post' | 'article' | 'share' | 'experience' | 'featured' | 'headline';
    original_content: string | null;
    ai_summary: string | null;
    ai_themes: string[];
    ai_key_points: string[];
    post_date: string | null;
    engagement_metrics: {
        likes?: number;
        comments?: number;
        shares?: number;
    };
    media_urls: string[];
    external_url: string | null;
    is_visible: boolean;
    display_order: number;
    source: string;
    created_at: string;
    updated_at: string;
}

export interface Skill {
    id: string;
    name: string;
    normalized_name: string;
    category: string;
    subcategory: string | null;
    proficiency_level: number | null;
    years_experience: number | null;
    sources: string[];
    source_count: number;
    is_featured: boolean;
    is_visible: boolean;
    display_order: number;
    icon_name: string | null;
    color: string | null;
    created_at: string;
    updated_at: string;
}

export interface ResumeData {
    id: string;
    version: number;
    file_name: string | null;
    file_hash: string | null;
    raw_text: string | null;
    parsed_data: Record<string, any>;
    skills: Array<{
        name: string;
        category: string;
        proficiency?: number;
    }>;
    experience: Array<{
        title: string;
        company: string;
        location?: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        description: string;
        achievements?: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        details?: string;
        gpa?: string;
    }>;
    certifications: Array<{
        name: string;
        issuer: string;
        date?: string;
        url?: string;
    }>;
    projects: Array<{
        name: string;
        description: string;
        technologies?: string[];
        url?: string;
    }>;
    publications: Array<{
        title: string;
        venue?: string;
        date?: string;
        url?: string;
    }>;
    summary: string | null;
    contact_info: {
        name?: string;
        email?: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        website?: string;
        location?: string;
    };
    parsed_at: string;
    ai_model_used: string | null;
    parsing_confidence: number;
    is_active: boolean;
    created_at: string;
}

export interface ProfileIntelligence {
    id: string;
    unified_skills: Skill[];
    unified_experience: ResumeData['experience'];
    unified_education: ResumeData['education'];
    unified_projects: Array<{
        name: string;
        description: string;
        technologies?: string[];
        url?: string;
        demoUrl?: string;
        source: 'github' | 'resume';
        category?: string;
        stars?: number;
    }>;
    unified_certifications: ResumeData['certifications'];
    professional_summary: string | null;
    headline: string | null;
    key_themes: string[];
    expertise_areas: string[];
    career_highlights: string[];
    data_sources: {
        github?: { count: number; lastSync: string };
        linkedin?: { count: number; lastSync: string };
        resume?: { version: number; lastSync: string };
    };
    source_timestamps: Record<string, string>;
    last_merged_at: string;
    merge_version: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SyncLog {
    id: string;
    sync_type: 'github' | 'linkedin' | 'resume' | 'intelligence' | 'full';
    status: 'started' | 'running' | 'success' | 'failed' | 'partial' | 'cancelled';
    trigger_type: 'scheduled' | 'manual' | 'webhook';
    items_found: number;
    items_processed: number;
    items_added: number;
    items_updated: number;
    items_skipped: number;
    items_failed: number;
    error_message: string | null;
    error_details: Record<string, any> | null;
    metadata: Record<string, any>;
    duration_ms: number | null;
    started_at: string;
    completed_at: string | null;
}

// ============================================
// GITHUB REPOS HOOKS
// ============================================

export const useGitHubRepos = () => {
    return useQuery({
        queryKey: ['github-repos'],
        queryFn: async (): Promise<GitHubRepo[]> => {
            const { data, error } = await supabase
                .from('github_repos')
                .select('*')
                .eq('is_visible', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching GitHub repos:', error);
                throw error;
            }

            return (data as any[]) || [];
        },
    });
};

export const useFeaturedGitHubRepos = () => {
    return useQuery({
        queryKey: ['github-repos-featured'],
        queryFn: async (): Promise<GitHubRepo[]> => {
            const { data, error } = await supabase
                .from('github_repos')
                .select('*')
                .eq('is_visible', true)
                .eq('is_featured', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return (data as any[]) || [];
        },
    });
};

export const usePortfolioWorthyRepos = () => {
    return useQuery({
        queryKey: ['github-repos-portfolio'],
        queryFn: async (): Promise<GitHubRepo[]> => {
            const { data, error } = await supabase
                .from('github_repos')
                .select('*')
                .eq('is_visible', true)
                .eq('ai_is_portfolio_worthy', true)
                .order('stargazers_count', { ascending: false });

            if (error) throw error;
            return (data as any[]) || [];
        },
    });
};

// ============================================
// LINKEDIN ACTIVITY HOOKS
// ============================================

export const useLinkedInActivity = () => {
    return useQuery({
        queryKey: ['linkedin-activity'],
        queryFn: async (): Promise<LinkedInActivity[]> => {
            const { data, error } = await supabase
                .from('linkedin_activity')
                .select('*')
                .eq('is_visible', true)
                .order('post_date', { ascending: false });

            if (error) {
                console.error('Error fetching LinkedIn activity:', error);
                throw error;
            }

            return (data as any[]) || [];
        },
    });
};

export const useLinkedInPosts = () => {
    return useQuery({
        queryKey: ['linkedin-posts'],
        queryFn: async (): Promise<LinkedInActivity[]> => {
            const { data, error } = await supabase
                .from('linkedin_activity')
                .select('*')
                .eq('is_visible', true)
                .eq('content_type', 'post')
                .order('post_date', { ascending: false })
                .limit(10);

            if (error) throw error;
            return (data as any[]) || [];
        },
    });
};

// ============================================
// SKILLS HOOKS
// ============================================

export const useSkills = () => {
    return useQuery({
        queryKey: ['skills'],
        queryFn: async (): Promise<Skill[]> => {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('is_visible', true)
                .order('source_count', { ascending: false });

            if (error) {
                console.error('Error fetching skills:', error);
                throw error;
            }

            return (data as any[]) || [];
        },
    });
};

export const useFeaturedSkills = () => {
    return useQuery({
        queryKey: ['skills-featured'],
        queryFn: async (): Promise<Skill[]> => {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('is_visible', true)
                .eq('is_featured', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return (data as any[]) || [];
        },
    });
};

export const useSkillsByCategory = () => {
    return useQuery({
        queryKey: ['skills-by-category'],
        queryFn: async (): Promise<Record<string, Skill[]>> => {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('is_visible', true)
                .order('source_count', { ascending: false });

            if (error) throw error;

            // Group by category
            const grouped: Record<string, Skill[]> = {};
            for (const skill of (data as any[]) || []) {
                const category = skill.category || 'Other';
                if (!grouped[category]) grouped[category] = [];
                grouped[category].push(skill);
            }

            return grouped;
        },
    });
};

// ============================================
// RESUME DATA HOOKS
// ============================================

export const useActiveResume = () => {
    return useQuery({
        queryKey: ['resume-active'],
        queryFn: async (): Promise<ResumeData | null> => {
            const { data, error } = await supabase
                .from('resume_data')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No rows found
                throw error;
            }

            return data as any;
        },
    });
};

// ============================================
// PROFILE INTELLIGENCE HOOKS
// ============================================

export const useProfileIntelligence = () => {
    return useQuery({
        queryKey: ['profile-intelligence'],
        queryFn: async (): Promise<ProfileIntelligence | null> => {
            const { data, error } = await supabase
                .from('profile_intelligence')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return data as any;
        },
    });
};

// ============================================
// SYNC LOGS HOOKS
// ============================================

export const useSyncLogs = (limit: number = 10) => {
    return useQuery({
        queryKey: ['sync-logs', limit],
        queryFn: async (): Promise<SyncLog[]> => {
            const { data, error } = await supabase
                .from('sync_logs')
                .select('*')
                .order('started_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data as any[]) || [];
        },
    });
};

export const useLatestSync = (syncType: SyncLog['sync_type']) => {
    return useQuery({
        queryKey: ['sync-latest', syncType],
        queryFn: async (): Promise<SyncLog | null> => {
            const { data, error } = await supabase
                .from('sync_logs')
                .select('*')
                .eq('sync_type', syncType)
                .eq('status', 'success')
                .order('completed_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return data as any;
        },
    });
};

// ============================================
// SYNC TRIGGER MUTATIONS
// ============================================

export const useTriggerGitHubSync = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (githubUsername?: string) => {
            const { data, error } = await supabase.functions.invoke('github-sync', {
                body: githubUsername ? { github_username: githubUsername } : {}
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['github-repos'] });
            queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
        }
    });
};

export const useTriggerResumeParser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ text, fileName }: { text: string; fileName?: string }) => {
            const { data, error } = await supabase.functions.invoke('resume-parser', {
                body: { text, fileName }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resume-active'] });
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
        }
    });
};

export const useTriggerLinkedInActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (posts: Array<{ content: string; contentType: string; postDate?: string }>) => {
            const { data, error } = await supabase.functions.invoke('linkedin-activity', {
                body: { posts }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linkedin-activity'] });
            queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
        }
    });
};

export const useTriggerProfileIntelligence = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.functions.invoke('profile-intelligence', {});

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile-intelligence'] });
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
        }
    });
};

// ============================================
// SYSTEM CONFIG HOOKS
// ============================================

export const useSystemConfig = () => {
    return useQuery({
        queryKey: ['system-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_config')
                .select('*');

            if (error) throw error;

            // Convert array to object for easier access
            const config: Record<string, string> = {};
            data?.forEach(item => {
                config[item.key] = item.value || '';
            });

            return config;
        }
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ key, value }: { key: string; value: string }) => {
            // Check if exists first
            const { data: existing } = await supabase
                .from('system_config')
                .select('id')
                .eq('key', key)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('system_config')
                    .update({ value, updated_at: new Date().toISOString() })
                    .eq('key', key);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('system_config')
                    .insert({ key, value, description: 'Added via Admin Panel' });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-config'] });
        }
    });
};
