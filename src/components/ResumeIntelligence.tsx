// Resume Intelligence Component - Admin Panel UI
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
    Download,
    Eye,
    Rocket,
    History,
    Trash2,
    Copy,
    Check
} from "lucide-react";
import {
    useResumeVersions,
    useActiveResume,
    useTriggerResumeIntelligence,
    usePublishResumeVersion,
    useDeleteResumeVersion,
    ResumeVersion
} from "@/hooks/useResumeVersions";

export default function ResumeIntelligence() {
    const { toast } = useToast();
    const [resumeText, setResumeText] = useState("");
    const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
    const [copiedLatex, setCopiedLatex] = useState(false);

    const { data: versions = [], isLoading: versionsLoading } = useResumeVersions();
    const { data: activeResume } = useActiveResume();
    const triggerExtraction = useTriggerResumeIntelligence();
    const publishVersion = usePublishResumeVersion();
    const deleteVersion = useDeleteResumeVersion();

    const handleExtract = async (publishImmediately = false) => {
        if (resumeText.trim().length < 100) {
            toast({
                title: "Text too short",
                description: "Please paste at least 100 characters of resume content.",
                variant: "destructive"
            });
            return;
        }

        try {
            const result = await triggerExtraction.mutateAsync({
                rawText: resumeText,
                publishImmediately
            });

            toast({
                title: publishImmediately ? "Resume Published!" : "Resume Extracted!",
                description: `Version ${result.versionNumber} created. Found: ${result.sectionsFound.join(', ')}`,
            });

            if (!publishImmediately) {
                // Select the new version for preview
                setSelectedVersion(null); // Will be updated on refetch
            }

            setResumeText("");
        } catch (error: any) {
            toast({
                title: "Extraction Failed",
                description: error.message || "Could not process resume",
                variant: "destructive"
            });
        }
    };

    const handlePublish = async (version: ResumeVersion) => {
        try {
            await publishVersion.mutateAsync(version.id);
            toast({
                title: "Published!",
                description: `Version ${version.version_number} is now live on your portfolio.`
            });
        } catch (error: any) {
            toast({
                title: "Publish Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (version: ResumeVersion) => {
        if (version.is_active) {
            toast({
                title: "Cannot Delete",
                description: "Cannot delete the active version. Publish another version first.",
                variant: "destructive"
            });
            return;
        }

        try {
            await deleteVersion.mutateAsync(version.id);
            toast({
                title: "Deleted",
                description: `Version ${version.version_number} has been removed.`
            });
            if (selectedVersion?.id === version.id) {
                setSelectedVersion(null);
            }
        } catch (error: any) {
            toast({
                title: "Delete Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const copyLatex = (latex: string) => {
        navigator.clipboard.writeText(latex);
        setCopiedLatex(true);
        setTimeout(() => setCopiedLatex(false), 2000);
        toast({ title: "Copied!", description: "LaTeX source copied to clipboard." });
    };

    const downloadLatex = (version: ResumeVersion) => {
        const blob = new Blob([version.latex_source], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_v${version.version_number}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="input" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="input" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Input Resume
                    </TabsTrigger>
                    <TabsTrigger value="versions" className="gap-2">
                        <History className="w-4 h-4" />
                        Versions ({versions.length})
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                    </TabsTrigger>
                </TabsList>

                {/* Input Tab */}
                <TabsContent value="input">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Resume Intelligence
                            </CardTitle>
                            <CardDescription>
                                Paste your resume text below. The AI will extract sections and generate a LaTeX resume.
                                <span className="block mt-1 text-xs text-yellow-600">
                                    ⚠️ AI will NOT invent any information. Missing sections will be left empty.
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste your entire resume text here...

Example:
SHIVANSHU TIWARI
Email: example@email.com | Phone: +91 1234567890

EDUCATION
M.Tech in Computer Science, IIT Delhi, 2024

EXPERIENCE
Software Engineer at Google, 2022-Present
- Built scalable systems...

SKILLS
Python, JavaScript, Machine Learning..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="min-h-[300px] font-mono text-sm"
                            />

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {resumeText.length} characters
                                    {resumeText.length < 100 && resumeText.length > 0 && (
                                        <span className="text-red-500 ml-2">
                                            (minimum 100 required)
                                        </span>
                                    )}
                                </span>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setResumeText("")}
                                        disabled={!resumeText}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        onClick={() => handleExtract(false)}
                                        disabled={triggerExtraction.isPending || resumeText.length < 100}
                                        className="gap-2"
                                    >
                                        {triggerExtraction.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                        Extract & Preview
                                    </Button>
                                    <Button
                                        onClick={() => handleExtract(true)}
                                        disabled={triggerExtraction.isPending || resumeText.length < 100}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        {triggerExtraction.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Rocket className="w-4 h-4" />
                                        )}
                                        Extract & Publish
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Versions Tab */}
                <TabsContent value="versions">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Resume Versions
                            </CardTitle>
                            <CardDescription>
                                All extracted resume versions. Only one can be active at a time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {versionsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No resume versions yet. Paste your resume text to get started.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {versions.map((version) => (
                                        <motion.div
                                            key={version.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-lg border ${version.is_active
                                                    ? 'border-green-500 bg-green-500/10'
                                                    : 'border-border'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            Version {version.version_number}
                                                        </span>
                                                        {version.is_active && (
                                                            <Badge className="bg-green-600">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Active
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline">
                                                            {version.status}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {(version.extraction_confidence * 100).toFixed(0)}% confidence
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        Created: {new Date(version.created_at).toLocaleString()}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {version.sections_found.map((section) => (
                                                            <Badge key={section} variant="secondary" className="text-xs">
                                                                ✓ {section}
                                                            </Badge>
                                                        ))}
                                                        {version.sections_empty.map((section) => (
                                                            <Badge key={section} variant="outline" className="text-xs text-muted-foreground">
                                                                ○ {section}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedVersion(version)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => downloadLatex(version)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    {!version.is_active && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handlePublish(version)}
                                                                disabled={publishVersion.isPending}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Rocket className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(version)}
                                                                disabled={deleteVersion.isPending}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Extracted Data Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Extracted Data</CardTitle>
                                <CardDescription>
                                    {selectedVersion
                                        ? `Version ${selectedVersion.version_number}`
                                        : activeResume
                                            ? `Active Version ${activeResume.version_number}`
                                            : 'No version selected'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[500px]">
                                    {(selectedVersion || activeResume) ? (
                                        <pre className="text-xs font-mono whitespace-pre-wrap">
                                            {JSON.stringify(
                                                (selectedVersion || activeResume)?.extracted_data,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            Extract a resume to see the structured data
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* LaTeX Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>LaTeX Source</span>
                                    {(selectedVersion || activeResume) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyLatex((selectedVersion || activeResume)!.latex_source)}
                                        >
                                            {copiedLatex ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[500px]">
                                    {(selectedVersion || activeResume) ? (
                                        <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
                                            {(selectedVersion || activeResume)?.latex_source}
                                        </pre>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            Extract a resume to see the LaTeX output
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Active Resume Status */}
            {activeResume && (
                <Card className="border-green-500/50 bg-green-500/5">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-medium">
                                    Active Resume: Version {activeResume.version_number}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Published {new Date(activeResume.published_at || activeResume.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => downloadLatex(activeResume)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download .tex
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
