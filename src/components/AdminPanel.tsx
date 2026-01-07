import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    useTriggerGitHubSync,
    useTriggerResumeParser,
    useTriggerLinkedInActivity,
    useTriggerProfileIntelligence,
    useSyncLogs,
    useGitHubRepos,
    useSystemConfig,
    useUpdateSystemConfig,
    GitHubRepo
} from "@/hooks/usePortfolioData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Github,
    FileText,
    Linkedin,
    Brain,
    RefreshCw,
    Upload,
    Plus,
    Loader2,
    CheckCircle,
    AlertCircle,
    Settings,
    Activity,
    Star,
    Image,
    Save,
    Eye,
    EyeOff,
    User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SyncStatus from "./SyncStatus";
import ProfileContentManager from "./ProfileContentManager";
import ResumeIntelligence from "./ResumeIntelligence";

interface LinkedInPost {
    content: string;
    contentType: 'post' | 'article' | 'share' | 'experience' | 'featured' | 'headline';
    postDate?: string;
}

export default function AdminPanel() {
    const { toast } = useToast();

    // Mutations
    const triggerGitHub = useTriggerGitHubSync();
    const triggerResume = useTriggerResumeParser();
    const triggerLinkedIn = useTriggerLinkedInActivity();
    const triggerIntelligence = useTriggerProfileIntelligence();

    // GitHub repos for featured projects management
    const { data: githubRepos = [], refetch: refetchRepos } = useGitHubRepos();
    const queryClient = useQueryClient();

    // Image Upload Handler
    const handleProjectImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        toast({ title: "Uploading...", description: "Please wait while we upload your image." });

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `project-${projectId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`; // Upload to root of bucket or folder

            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('github_repos')
                .update({ custom_image: publicUrl })
                .eq('id', projectId);

            if (dbError) throw dbError;

            toast({ title: "Success", description: "Project image updated!" });
            queryClient.invalidateQueries({ queryKey: ['github-repos'] });

        } catch (error: any) {
            console.error('Upload failed:', error);
            toast({ title: "Upload Failed", description: error.message || "Could not upload image", variant: "destructive" });
        }
    };


    // Profile Image Upload Handler
    const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        toast({ title: "Uploading...", description: "Please wait while we upload your profile image." });

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `profile-${Date.now()}.${fileExt}`;
            const filePath = `profile/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath);

            setProfileImageUrl(publicUrl);

            // Auto-save
            updateSystemConfig.mutate({ key: 'profile_image_url', value: publicUrl }, {
                onSuccess: () => toast({ title: "Success", description: "Profile image updated!" })
            });

        } catch (error: any) {
            console.error('Upload failed:', error);
            toast({ title: "Upload Failed", description: error.message || "Could not upload image", variant: "destructive" });
        }
    };

    // Form states
    const [githubUsername, setGithubUsername] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [linkedInPosts, setLinkedInPosts] = useState<LinkedInPost[]>([
        { content: "", contentType: "post", postDate: new Date().toISOString().split('T')[0] }
    ]);

    // Featured projects editing state
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [projectEdits, setProjectEdits] = useState<Record<string, {
        custom_title?: string;
        custom_description?: string;
        custom_image?: string;
        is_featured?: boolean;
        is_visible?: boolean;
    }>>({});
    const [savingProject, setSavingProject] = useState<string | null>(null);

    // PDF upload state
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    // Settings state
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const { data: systemConfig } = useSystemConfig();
    const updateSystemConfig = useUpdateSystemConfig();

    useEffect(() => {
        if (systemConfig?.profile_image_url) {
            setProfileImageUrl(systemConfig.profile_image_url);
        }
    }, [systemConfig]);

    const handleSaveSettings = () => {
        updateSystemConfig.mutate({ key: 'profile_image_url', value: profileImageUrl }, {
            onSuccess: () => {
                toast({
                    title: "Settings Saved",
                    description: "Profile image updated successfully",
                });
            }
        });
    };

    // Handle PDF Upload - extract text from PDF
    const handlePdfUpload = async (file: File) => {
        setUploadedFileName(file.name);
        toast({
            title: "PDF Uploaded",
            description: "Extracting text from PDF...",
        });

        try {
            // Read PDF as text - for now, use FileReader to get the raw content
            // Note: For proper PDF parsing, the Edge Function handles it server-side
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;

                // Convert to base64 and send to Edge Function for parsing
                const base64 = btoa(
                    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );

                try {
                    const { data, error } = await supabase.functions.invoke('resume-parser', {
                        body: {
                            pdfBase64: base64,
                            fileName: file.name
                        }
                    });

                    if (error) throw error;

                    toast({
                        title: "Resume Parsed Successfully",
                        description: `Extracted ${data.skills_extracted || 0} skills, ${data.experience_extracted || 0} experiences.`,
                    });
                    setUploadedFileName(null);
                } catch (parseError: any) {
                    toast({
                        title: "Parse Failed",
                        description: parseError.message || "Failed to parse PDF",
                        variant: "destructive",
                    });
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error: any) {
            toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive",
            });
            setUploadedFileName(null);
        }
    };

    // GitHub Sync Handler
    const handleGitHubSync = async () => {
        try {
            const result = await triggerGitHub.mutateAsync(githubUsername || undefined);
            toast({
                title: "GitHub Sync Complete",
                description: `Found ${result.repos_found} repos. Added ${result.items_added}, updated ${result.items_updated}.`,
            });
            refetchRepos();
        } catch (error: any) {
            toast({
                title: "GitHub Sync Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // Resume Parse Handler
    const handleResumeParse = async () => {
        if (!resumeText.trim()) {
            toast({
                title: "No Resume Text",
                description: "Please paste your resume content first.",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await triggerResume.mutateAsync({ text: resumeText, fileName: "resume-paste.txt" });
            toast({
                title: "Resume Parsed Successfully",
                description: `Extracted ${result.skills_extracted} skills, ${result.experience_extracted} experiences.`,
            });
            setResumeText("");
        } catch (error: any) {
            toast({
                title: "Resume Parse Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // LinkedIn Activity Handler
    const handleLinkedInActivity = async () => {
        const validPosts = linkedInPosts.filter(p => p.content.trim());
        if (validPosts.length === 0) {
            toast({
                title: "No Content",
                description: "Please add at least one LinkedIn post.",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await triggerLinkedIn.mutateAsync(validPosts);
            toast({
                title: "LinkedIn Activity Added",
                description: `Processed ${result.posts_processed} posts. Themes: ${result.themes_extracted?.join(', ') || 'None'}`,
            });
            setLinkedInPosts([{ content: "", contentType: "post", postDate: new Date().toISOString().split('T')[0] }]);
        } catch (error: any) {
            toast({
                title: "LinkedIn Activity Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // Profile Intelligence Handler
    const handleMergeProfile = async () => {
        try {
            const result = await triggerIntelligence.mutateAsync();
            toast({
                title: "Profile Merged",
                description: `Unified ${result.skills_unified} skills, ${result.projects_unified} projects, ${result.themes_identified} themes.`,
            });
        } catch (error: any) {
            toast({
                title: "Profile Merge Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // Add LinkedIn Post
    const addLinkedInPost = () => {
        setLinkedInPosts([...linkedInPosts, { content: "", contentType: "post", postDate: new Date().toISOString().split('T')[0] }]);
    };

    // Update LinkedIn Post
    const updateLinkedInPost = (index: number, field: keyof LinkedInPost, value: string) => {
        const updated = [...linkedInPosts];
        updated[index] = { ...updated[index], [field]: value };
        setLinkedInPosts(updated);
    };

    // Remove LinkedIn Post
    const removeLinkedInPost = (index: number) => {
        if (linkedInPosts.length > 1) {
            setLinkedInPosts(linkedInPosts.filter((_, i) => i !== index));
        }
    };

    // Update project edit state
    const updateProjectEdit = (projectId: string, field: string, value: any) => {
        setProjectEdits(prev => ({
            ...prev,
            [projectId]: {
                ...prev[projectId],
                [field]: value
            }
        }));
    };

    // Save project changes
    const saveProjectChanges = async (project: GitHubRepo) => {
        const edits = projectEdits[project.id];
        if (!edits) return;

        setSavingProject(project.id);
        try {
            const { error } = await supabase
                .from('github_repos')
                .update({
                    custom_title: edits.custom_title ?? project.custom_title,
                    custom_description: edits.custom_description ?? project.custom_description,
                    custom_image: edits.custom_image ?? project.custom_image,
                    is_featured: edits.is_featured ?? project.is_featured,
                    is_visible: edits.is_visible ?? project.is_visible,
                })
                .eq('id', project.id);

            if (error) throw error;

            toast({
                title: "Project Updated",
                description: `${project.name} has been updated successfully.`,
            });

            setEditingProject(null);
            setProjectEdits(prev => {
                const copy = { ...prev };
                delete copy[project.id];
                return copy;
            });
            refetchRepos();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSavingProject(null);
        }
    };

    // Toggle featured status quickly
    const toggleFeatured = async (project: GitHubRepo) => {
        try {
            const { error } = await supabase
                .from('github_repos')
                .update({ is_featured: !project.is_featured })
                .eq('id', project.id);

            if (error) throw error;
            refetchRepos();
            toast({
                title: project.is_featured ? "Removed from Featured" : "Added to Featured",
                description: `${project.name} has been ${project.is_featured ? 'removed from' : 'added to'} featured projects.`,
            });
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // Toggle visibility
    const toggleVisibility = async (project: GitHubRepo) => {
        try {
            const { error } = await supabase
                .from('github_repos')
                .update({ is_visible: !project.is_visible })
                .eq('id', project.id);

            if (error) throw error;
            refetchRepos();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const featuredProjects = githubRepos.filter(r => r.is_featured);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-brand-blue" />
                        Portfolio Admin
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your auto-updating portfolio data sources
                    </p>
                </div>
                <Button
                    onClick={handleMergeProfile}
                    disabled={triggerIntelligence.isPending}
                    className="gap-2"
                >
                    {triggerIntelligence.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Brain className="w-4 h-4" />
                    )}
                    Merge All Data
                </Button>
            </div>

            {/* Sync Status Overview */}
            <SyncStatus variant="compact" showTriggerButtons />

            {/* Main Tabs */}
            <Tabs defaultValue="github" className="space-y-4">
                <TabsList className="w-full justify-start flex-wrap">
                    <TabsTrigger value="github" className="gap-2">
                        <Github className="w-4 h-4" />
                        GitHub
                    </TabsTrigger>
                    <TabsTrigger value="featured" className="gap-2">
                        <Star className="w-4 h-4" />
                        Featured Projects
                    </TabsTrigger>
                    <TabsTrigger value="resume" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Resume
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-2">
                        <Activity className="w-4 h-4" />
                        Activity
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-2">
                        <User className="w-4 h-4" />
                        Profile Content
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* GitHub Tab */}
                <TabsContent value="github">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Github className="w-5 h-5" />
                                GitHub Repository Sync
                            </CardTitle>
                            <CardDescription>
                                Automatically fetch and analyze your GitHub repositories using AI
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="github-username">GitHub Username</Label>
                                <Input
                                    id="github-username"
                                    placeholder="e.g., octocat"
                                    value={githubUsername}
                                    onChange={(e) => setGithubUsername(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to use configured username from system settings
                                </p>
                            </div>
                            <Button
                                onClick={handleGitHubSync}
                                disabled={triggerGitHub.isPending}
                                className="gap-2"
                            >
                                {triggerGitHub.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                Sync Repositories
                            </Button>

                            {/* Quick stats */}
                            <div className="pt-4 border-t">
                                <div className="flex gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                        Total repos: <strong>{githubRepos.length}</strong>
                                    </span>
                                    <span className="text-muted-foreground">
                                        Featured: <strong>{featuredProjects.length}</strong>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Featured Projects Tab */}
                <TabsContent value="featured">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Featured Projects Manager
                            </CardTitle>
                            <CardDescription>
                                Select which projects to feature on your homepage and customize their display
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Currently Featured */}
                            {featuredProjects.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        Currently Featured ({featuredProjects.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {featuredProjects.map(p => (
                                            <Badge key={p.id} variant="default" className="gap-1">
                                                {p.custom_title || p.name}
                                                <button
                                                    onClick={() => toggleFeatured(p)}
                                                    className="ml-1 hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Projects List */}
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {githubRepos.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-4 rounded-lg border ${project.is_featured ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border'} ${!project.is_visible ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium truncate">
                                                        {project.custom_title || project.name}
                                                    </h4>
                                                    {project.ai_category && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {project.ai_category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {project.custom_description || project.ai_description || project.description}
                                                </p>
                                                {project.custom_image && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                                                        <Image className="w-3 h-3" />
                                                        Custom image set
                                                    </div>
                                                )}
                                                <div className="mt-2">
                                                    <Label htmlFor={`upload-${project.id}`} className="text-xs cursor-pointer flex items-center gap-1 text-blue-500 hover:underline">
                                                        <Upload className="w-3 h-3" />
                                                        {project.custom_image ? 'Change Image' : 'Upload Image'}
                                                    </Label>
                                                    <Input
                                                        id={`upload-${project.id}`}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleProjectImageUpload(e, project.id)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    variant={project.is_featured ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleFeatured(project)}
                                                    className="gap-1"
                                                >
                                                    <Star className={`w-3 h-3 ${project.is_featured ? 'fill-current' : ''}`} />
                                                    {project.is_featured ? 'Featured' : 'Feature'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleVisibility(project)}
                                                >
                                                    {project.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingProject(editingProject === project.id ? null : project.id)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Edit Form */}
                                        {editingProject === project.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="mt-4 pt-4 border-t space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Custom Title</Label>
                                                        <Input
                                                            placeholder={project.name}
                                                            value={projectEdits[project.id]?.custom_title ?? project.custom_title ?? ''}
                                                            onChange={(e) => updateProjectEdit(project.id, 'custom_title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Custom Image URL</Label>
                                                        <Input
                                                            placeholder="https://example.com/image.jpg"
                                                            value={projectEdits[project.id]?.custom_image ?? project.custom_image ?? ''}
                                                            onChange={(e) => updateProjectEdit(project.id, 'custom_image', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Custom Description</Label>
                                                    <Textarea
                                                        placeholder={project.ai_description || project.description || ''}
                                                        value={projectEdits[project.id]?.custom_description ?? project.custom_description ?? ''}
                                                        onChange={(e) => updateProjectEdit(project.id, 'custom_description', e.target.value)}
                                                        className="min-h-[80px]"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveProjectChanges(project)}
                                                        disabled={savingProject === project.id}
                                                        className="gap-2"
                                                    >
                                                        {savingProject === project.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4" />
                                                        )}
                                                        Save Changes
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingProject(null);
                                                            setProjectEdits(prev => {
                                                                const copy = { ...prev };
                                                                delete copy[project.id];
                                                                return copy;
                                                            });
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}

                                {githubRepos.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Github className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No repositories synced yet.</p>
                                        <p className="text-sm">Go to the GitHub tab to sync your repositories.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Resume Tab */}
                <TabsContent value="resume">
                    <ResumeIntelligence />
                </TabsContent>

                {/* LinkedIn Tab */}
                <TabsContent value="linkedin">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Linkedin className="w-5 h-5" />
                                LinkedIn Activity
                            </CardTitle>
                            <CardDescription>
                                Paste your LinkedIn post content below for AI analysis.
                                <span className="block mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                    ⚠️ Note: Auto-scraping is not supported due to LinkedIn security. Please manually copy/paste post text.
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {linkedInPosts.map((post, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 p-4 rounded-lg border border-border"
                                >
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline">Post {index + 1}</Badge>
                                        {linkedInPosts.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLinkedInPost(index)}
                                                className="text-destructive"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Content Type</Label>
                                            <Select
                                                value={post.contentType}
                                                onValueChange={(value) => updateLinkedInPost(index, 'contentType', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="post">Post</SelectItem>
                                                    <SelectItem value="article">Article</SelectItem>
                                                    <SelectItem value="share">Share</SelectItem>
                                                    <SelectItem value="featured">Featured</SelectItem>
                                                    <SelectItem value="headline">Headline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                value={post.postDate || ''}
                                                onChange={(e) => updateLinkedInPost(index, 'postDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <Textarea
                                            placeholder="Paste your LinkedIn post content here..."
                                            value={post.content}
                                            onChange={(e) => updateLinkedInPost(index, 'content', e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </motion.div>
                            ))}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={addLinkedInPost}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Another Post
                                </Button>
                                <Button
                                    onClick={handleLinkedInActivity}
                                    disabled={triggerLinkedIn.isPending}
                                    className="gap-2"
                                >
                                    {triggerLinkedIn.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    Process Posts
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Logs Tab */}
                <TabsContent value="logs">
                    <SyncStatus variant="full" showTriggerButtons />
                </TabsContent>

                {/* Profile Content Tab */}
                <TabsContent value="content">
                    <ProfileContentManager />
                </TabsContent>

                <TabsContent value="settings">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Global Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage global configuration for your portfolio
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-image">Profile Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="profile-image"
                                            placeholder="https://example.com/my-photo.jpg"
                                            value={profileImageUrl}
                                            onChange={(e) => setProfileImageUrl(e.target.value)}
                                        />
                                        <Button onClick={handleSaveSettings} disabled={updateSystemConfig.isPending}>
                                            {updateSystemConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Enter a direct URL to your profile image (e.g. from GitHub, LinkedIn, or Unsplash).
                                    </p>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px bg-border flex-1" />
                                            <span className="text-xs text-muted-foreground uppercase">OR</span>
                                            <div className="h-px bg-border flex-1" />
                                        </div>
                                        <div className="mt-2 text-center">
                                            <Label htmlFor="upload-profile-image" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
                                                <Upload className="w-4 h-4" />
                                                Upload Image from System
                                            </Label>
                                            <Input
                                                id="upload-profile-image"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleProfileImageUpload}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {profileImageUrl && (
                                    <div className="mt-4">
                                        <Label className="mb-2 block">Preview</Label>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border relative">
                                            <img src={profileImageUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

