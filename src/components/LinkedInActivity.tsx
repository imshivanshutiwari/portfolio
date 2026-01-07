import { motion } from "framer-motion";
import { useLinkedInActivity, LinkedInActivity } from "@/hooks/usePortfolioData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Linkedin,
    MessageSquare,
    FileText,
    Share2,
    Briefcase,
    Star,
    ExternalLink,
    Loader2,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const contentTypeIcons = {
    post: MessageSquare,
    article: FileText,
    share: Share2,
    experience: Briefcase,
    featured: Star,
    headline: TrendingUp,
};

const contentTypeLabels = {
    post: "Post",
    article: "Article",
    share: "Shared",
    experience: "Experience",
    featured: "Featured",
    headline: "Headline",
};

function LinkedInPostCard({ post }: { post: LinkedInActivity }) {
    const Icon = contentTypeIcons[post.content_type] || MessageSquare;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
        >
            <Card className="h-full glass-card hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-[#0077B5]/10">
                                <Icon className="w-4 h-4 text-[#0077B5]" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {contentTypeLabels[post.content_type]}
                            </Badge>
                        </div>
                        {post.post_date && (
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.post_date), { addSuffix: true })}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* AI Summary */}
                    <p className="text-sm text-foreground leading-relaxed">
                        {post.ai_summary || post.original_content?.substring(0, 200)}
                    </p>

                    {/* Themes */}
                    {post.ai_themes && post.ai_themes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.ai_themes.slice(0, 4).map((theme, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {theme}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Key Points */}
                    {post.ai_key_points && post.ai_key_points.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1">
                            {post.ai_key_points.slice(0, 2).map((point, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-brand-blue">•</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Engagement Metrics */}
                    {post.engagement_metrics && Object.keys(post.engagement_metrics).length > 0 && (
                        <div className="flex items-center gap-4 pt-2 border-t border-border">
                            {post.engagement_metrics.likes && (
                                <span className="text-xs text-muted-foreground">
                                    👍 {post.engagement_metrics.likes}
                                </span>
                            )}
                            {post.engagement_metrics.comments && (
                                <span className="text-xs text-muted-foreground">
                                    💬 {post.engagement_metrics.comments}
                                </span>
                            )}
                            {post.engagement_metrics.shares && (
                                <span className="text-xs text-muted-foreground">
                                    🔄 {post.engagement_metrics.shares}
                                </span>
                            )}
                        </div>
                    )}

                    {/* External Link */}
                    {post.external_url && (
                        <a
                            href={post.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                        >
                            View on LinkedIn
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ThemesCloud({ posts }: { posts: LinkedInActivity[] }) {
    // Collect all themes and count occurrences
    const themeCounts: Record<string, number> = {};
    posts.forEach(post => {
        (post.ai_themes || []).forEach(theme => {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
    });

    // Sort by count and take top themes
    const topThemes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (topThemes.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
        >
            <h3 className="text-lg font-semibold mb-4">Key Themes I Discuss</h3>
            <div className="flex flex-wrap gap-3">
                {topThemes.map(([theme, count], index) => (
                    <motion.div
                        key={theme}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                            style={{
                                fontSize: `${Math.max(0.8, Math.min(1.2, 0.8 + count * 0.1))}rem`
                            }}
                        >
                            {theme}
                            <span className="ml-2 text-muted-foreground">({count})</span>
                        </Badge>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

export default function LinkedInActivitySection() {
    const { data: posts = [], isLoading, error } = useLinkedInActivity();

    // Filter posts by type for display
    const regularPosts = posts.filter(p => p.content_type === 'post' || p.content_type === 'article');
    const featuredContent = posts.filter(p => p.content_type === 'featured');
    const headlines = posts.filter(p => p.content_type === 'headline');

    // Animation variants
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#0077B5]" />
                <span className="ml-3 text-muted-foreground">Loading LinkedIn activity...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Failed to load LinkedIn activity.</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 glass-card rounded-xl p-8">
                <Linkedin className="w-12 h-12 mx-auto mb-4 text-[#0077B5]/50" />
                <h3 className="text-xl font-semibold mb-2">LinkedIn Activity</h3>
                <p className="text-muted-foreground mb-4">
                    LinkedIn activity will appear here once synced.
                </p>
                <Button variant="outline" className="gap-2">
                    <Linkedin className="w-4 h-4" />
                    Connect LinkedIn
                </Button>
            </div>
        );
    }

    return (
        <section className="space-y-8">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#0077B5]/10">
                        <Linkedin className="w-6 h-6 text-[#0077B5]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">LinkedIn Activity</h2>
                        <p className="text-sm text-muted-foreground">
                            Recent posts and professional highlights
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {posts.length} items
                </Badge>
            </motion.div>

            {/* Headline if available */}
            {headlines.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-[#0077B5]/10 to-[#0077B5]/5 border border-[#0077B5]/20"
                >
                    <p className="text-lg font-medium text-center">
                        {headlines[0].ai_summary || headlines[0].original_content}
                    </p>
                </motion.div>
            )}

            {/* Themes Cloud */}
            <ThemesCloud posts={posts} />

            {/* Featured Content */}
            {featuredContent.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Featured Content
                    </h3>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {featuredContent.slice(0, 4).map((post) => (
                            <LinkedInPostCard key={post.id} post={post} />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Recent Posts */}
            {regularPosts.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-brand-blue" />
                        Recent Posts
                    </h3>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {regularPosts.slice(0, 6).map((post) => (
                            <LinkedInPostCard key={post.id} post={post} />
                        ))}
                    </motion.div>
                </div>
            )}
        </section>
    );
}
