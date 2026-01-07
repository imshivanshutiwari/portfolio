import { motion } from "framer-motion";
import { usePortfolioWorthyRepos, GitHubRepo } from "@/hooks/usePortfolioData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Github,
    Star,
    GitFork,
    ExternalLink,
    Calendar,
    Code,
    Loader2,
    ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ProjectCard from "./ProjectCard";

// Category color mapping for badges
const categoryColors: Record<string, string> = {
    "Machine Learning": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Computer Vision": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "NLP": "bg-green-500/10 text-green-500 border-green-500/20",
    "Web Development": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Data Engineering": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    "DevOps": "bg-red-500/10 text-red-500 border-red-500/20",
    "Research": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "Systems": "bg-gray-500/10 text-gray-500 border-gray-500/20",
    "Other": "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const getGradientCategory = (category: string | null) => {
    const map: Record<string, string> = {
        "Machine Learning": "from-purple-600 to-blue-600",
        "Computer Vision": "from-blue-600 to-cyan-600",
        "NLP": "from-emerald-600 to-teal-600",
        "Web Development": "from-orange-500 to-pink-500",
        "Data Engineering": "from-cyan-500 to-blue-500",
        "DevOps": "from-red-500 to-orange-500",
        "Research": "from-indigo-600 to-purple-600",
        "Systems": "from-gray-600 to-slate-600",
    };
    return map[category || ""] || "from-indigo-600 to-purple-600"; // Vibrant default
};

function GitHubRepoCard({ repo }: { repo: GitHubRepo }) {
    const categoryClass = categoryColors[repo.ai_category || "Other"] || categoryColors["Other"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card className="h-full bg-card glass-card hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 flex flex-col">
                {/* Project Image or Gradient Placeholder */}
                <div className="aspect-video overflow-hidden rounded-t-lg relative group">
                    {repo.custom_image ? (
                        <img
                            src={repo.custom_image}
                            alt={repo.custom_title || repo.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getGradientCategory(repo.ai_category)} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                            <Code className="w-12 h-12 text-white/30" />
                        </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                </div>

                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Github className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <CardTitle className="text-lg line-clamp-1">
                                {repo.custom_title || repo.name}
                            </CardTitle>
                        </div>
                        {repo.ai_category && (
                            <Badge variant="outline" className={`text-xs ${categoryClass}`}>
                                {repo.ai_category}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-grow space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {repo.custom_description || repo.ai_description || repo.description || "No description available"}
                    </p>

                    {/* Tech Stack */}
                    {repo.ai_tech_stack && repo.ai_tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {repo.ai_tech_stack.slice(0, 5).map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {tech}
                                </Badge>
                            ))}
                            {repo.ai_tech_stack.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{repo.ai_tech_stack.length - 5}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Key Features */}
                    {repo.ai_key_features && repo.ai_key_features.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1">
                            {repo.ai_key_features.slice(0, 2).map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-brand-blue">•</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {repo.stargazers_count}
                            </span>
                        )}
                        {repo.forks_count > 0 && (
                            <span className="flex items-center gap-1">
                                <GitFork className="w-3 h-3" />
                                {repo.forks_count}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })}
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border">
                    <div className="flex gap-2 w-full">
                        <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4" />
                                Code
                            </a>
                        </Button>
                        {(repo.demo_url || repo.homepage) && (
                            <Button asChild variant="default" size="sm" className="flex-1 gap-2">
                                <a href={repo.demo_url || repo.homepage || '#'} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                    Demo
                                </a>
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

interface GitHubProjectsProps {
    variant?: 'grid' | 'featured' | 'list';
    maxItems?: number;
    showViewAll?: boolean;
}

export default function GitHubProjects({
    variant = 'grid',
    maxItems,
    showViewAll = true
}: GitHubProjectsProps) {
    const { data: repos = [], isLoading, error } = usePortfolioWorthyRepos();

    const displayRepos = maxItems ? repos.slice(0, maxItems) : repos;

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
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                <span className="ml-3 text-muted-foreground">Loading GitHub projects...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Failed to load GitHub projects.</p>
            </div>
        );
    }

    if (repos.length === 0) {
        return (
            <div className="text-center py-16 glass-card rounded-xl p-8">
                <Github className="w-12 h-12 mx-auto mb-4 text-brand-blue/50" />
                <h3 className="text-xl font-semibold mb-2">GitHub Projects</h3>
                <p className="text-muted-foreground mb-4">
                    Projects will appear here once your GitHub is synced.
                </p>
                <Badge variant="outline" className="gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Awaiting sync
                </Badge>
            </div>
        );
    }

    // Featured variant - larger cards
    if (variant === 'featured') {
        const featuredRepos = repos.filter(r => r.is_featured).slice(0, 3);
        const displayFeatured = featuredRepos.length > 0 ? featuredRepos : repos.slice(0, 3);

        return (
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-brand-blue/10">
                            <Github className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Featured Projects</h2>
                            <p className="text-sm text-muted-foreground">
                                Auto-synced from GitHub
                            </p>
                        </div>
                    </div>
                    {showViewAll && (
                        <Button variant="outline" asChild className="gap-2">
                            <a href="/projects">
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {displayFeatured.map((repo) => (
                        <GitHubRepoCard key={repo.id} repo={repo} />
                    ))}
                </motion.div>
            </section>
        );
    }

    // Grid variant - standard display
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-brand-blue/10">
                        <Github className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">GitHub Projects</h2>
                        <p className="text-sm text-muted-foreground">
                            {repos.length} portfolio-worthy repositories
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live from GitHub
                </Badge>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {displayRepos.map((repo) => (
                    <GitHubRepoCard key={repo.id} repo={repo} />
                ))}
            </motion.div>

            {showViewAll && repos.length > (maxItems || 0) && (
                <div className="text-center">
                    <Button variant="outline" asChild className="gap-2">
                        <a href="/projects">
                            View All {repos.length} Projects
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            )}
        </section>
    );
}
