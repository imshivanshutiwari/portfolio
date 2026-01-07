import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncLogs, useLatestSync, useTriggerGitHubSync, useTriggerProfileIntelligence, SyncLog } from "@/hooks/usePortfolioData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Github,
    FileText,
    Linkedin,
    Brain,
    ChevronDown,
    ChevronUp,
    Loader2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const syncTypeIcons = {
    github: Github,
    linkedin: Linkedin,
    resume: FileText,
    intelligence: Brain,
    full: RefreshCw,
};

const syncTypeLabels = {
    github: "GitHub Sync",
    linkedin: "LinkedIn Activity",
    resume: "Resume Parse",
    intelligence: "Profile Intelligence",
    full: "Full Sync",
};

const statusColors: Record<string, string> = {
    success: "text-green-500",
    failed: "text-red-500",
    partial: "text-yellow-500",
    started: "text-blue-500",
    running: "text-blue-500",
    cancelled: "text-gray-500",
};

const statusIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />,
    partial: <AlertCircle className="w-4 h-4" />,
    started: <Clock className="w-4 h-4 animate-pulse" />,
    running: <Loader2 className="w-4 h-4 animate-spin" />,
    cancelled: <XCircle className="w-4 h-4" />,
};

function SyncLogItem({ log }: { log: SyncLog }) {
    const Icon = syncTypeIcons[log.sync_type] || RefreshCw;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background ${statusColors[log.status]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-medium">{syncTypeLabels[log.sync_type]}</p>
                    <p className="text-xs text-muted-foreground">
                        {log.completed_at
                            ? formatDistanceToNow(new Date(log.completed_at), { addSuffix: true })
                            : "In progress..."}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {log.items_added > 0 && (
                    <Badge variant="outline" className="text-xs">
                        +{log.items_added}
                    </Badge>
                )}
                {log.items_updated > 0 && (
                    <Badge variant="secondary" className="text-xs">
                        ↻{log.items_updated}
                    </Badge>
                )}
                <div className={statusColors[log.status]}>
                    {statusIcons[log.status]}
                </div>
            </div>
        </motion.div>
    );
}

interface SyncStatusProps {
    variant?: 'full' | 'compact' | 'minimal';
    showTriggerButtons?: boolean;
}

export default function SyncStatus({ variant = 'compact', showTriggerButtons = false }: SyncStatusProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: logs = [], isLoading } = useSyncLogs(10);
    const { data: latestGithub } = useLatestSync('github');
    const { data: latestResume } = useLatestSync('resume');
    const { data: latestIntelligence } = useLatestSync('intelligence');

    const triggerGitHub = useTriggerGitHubSync();
    const triggerIntelligence = useTriggerProfileIntelligence();

    const latestSyncs = [
        { type: 'github', data: latestGithub },
        { type: 'resume', data: latestResume },
        { type: 'intelligence', data: latestIntelligence },
    ].filter(s => s.data);

    // Minimal variant - just a status indicator
    if (variant === 'minimal') {
        const lastSync = logs[0];
        if (!lastSync) return null;

        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${lastSync.status === 'success' ? 'bg-green-500' :
                        lastSync.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                <span>
                    Last sync: {lastSync.completed_at
                        ? formatDistanceToNow(new Date(lastSync.completed_at), { addSuffix: true })
                        : 'Never'}
                </span>
            </div>
        );
    }

    // Compact variant - collapsible with summary
    if (variant === 'compact') {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <Card className="glass-card">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="pb-3 cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-brand-blue" />
                                    Sync Status
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {latestGithub && (
                                        <Badge variant="outline" className="text-xs gap-1">
                                            <Github className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(latestGithub.completed_at!), { addSuffix: true })}
                                        </Badge>
                                    )}
                                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                            {/* Latest Syncs Summary */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { type: 'github', label: 'GitHub', icon: Github, sync: latestGithub },
                                    { type: 'resume', label: 'Resume', icon: FileText, sync: latestResume },
                                    { type: 'intelligence', label: 'Profile', icon: Brain, sync: latestIntelligence },
                                ].map(({ type, label, icon: Icon, sync }) => (
                                    <div key={type} className="text-center p-2 rounded-lg bg-secondary/30">
                                        <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                        <p className="text-xs font-medium">{label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {sync?.completed_at
                                                ? formatDistanceToNow(new Date(sync.completed_at), { addSuffix: true })
                                                : 'Never'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Trigger Buttons */}
                            {showTriggerButtons && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-2"
                                        onClick={() => triggerGitHub.mutate()}
                                        disabled={triggerGitHub.isPending}
                                    >
                                        {triggerGitHub.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Github className="w-3 h-3" />
                                        )}
                                        Sync GitHub
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-2"
                                        onClick={() => triggerIntelligence.mutate()}
                                        disabled={triggerIntelligence.isPending}
                                    >
                                        {triggerIntelligence.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Brain className="w-3 h-3" />
                                        )}
                                        Merge Data
                                    </Button>
                                </div>
                            )}

                            {/* Recent Logs */}
                            {logs.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
                                    {logs.slice(0, 5).map((log) => (
                                        <SyncLogItem key={log.id} log={log} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        );
    }

    // Full variant - detailed view
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-brand-blue" />
                    Sync Status & History
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Latest Syncs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { type: 'github', label: 'GitHub Repositories', icon: Github, sync: latestGithub },
                        { type: 'resume', label: 'Resume Data', icon: FileText, sync: latestResume },
                        { type: 'intelligence', label: 'Profile Intelligence', icon: Brain, sync: latestIntelligence },
                    ].map(({ type, label, icon: Icon, sync }) => (
                        <Card key={type} className="bg-secondary/30">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-brand-blue/10">
                                        <Icon className="w-5 h-5 text-brand-blue" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {sync?.completed_at
                                                ? format(new Date(sync.completed_at), 'MMM d, h:mm a')
                                                : 'Never synced'}
                                        </p>
                                    </div>
                                </div>
                                {sync && (
                                    <div className="flex gap-2 mt-3">
                                        <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                                            {sync.status}
                                        </Badge>
                                        {sync.items_added > 0 && (
                                            <Badge variant="outline">+{sync.items_added} new</Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Trigger Buttons */}
                {showTriggerButtons && (
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => triggerGitHub.mutate()}
                            disabled={triggerGitHub.isPending}
                        >
                            {triggerGitHub.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Github className="w-4 h-4" />
                            )}
                            Sync GitHub
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => triggerIntelligence.mutate()}
                            disabled={triggerIntelligence.isPending}
                        >
                            {triggerIntelligence.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Brain className="w-4 h-4" />
                            )}
                            Regenerate Profile
                        </Button>
                    </div>
                )}

                {/* Sync History */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Sync History</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        <AnimatePresence>
                            {logs.map((log) => (
                                <SyncLogItem key={log.id} log={log} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
