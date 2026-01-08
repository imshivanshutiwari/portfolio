import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionContainer from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Github, Loader2, Star, GitFork, ExternalLink, Calendar, Code, RefreshCw } from "lucide-react";
import { useGitHubRepos, usePortfolioWorthyRepos, useTriggerGitHubSync, GitHubRepo } from "@/hooks/usePortfolioData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

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

function ProjectRepoCard({ repo }: { repo: GitHubRepo }) {
  const categoryClass = categoryColors[repo.ai_category || "Other"] || categoryColors["Other"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full glass-card hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 flex flex-col">
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
            {repo.is_featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
          </div>
          {repo.ai_category && (
            <Badge variant="outline" className={`text-xs w-fit ${categoryClass}`}>
              {repo.ai_category}
            </Badge>
          )}
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
                  <span className="line-clamp-1">{feature}</span>
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
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <RainbowButton className="w-full gap-2">
                <Github className="w-4 h-4" />
                Code
              </RainbowButton>
            </a>
            {(repo.demo_url || repo.homepage) && (
              <a href={repo.demo_url || repo.homepage || '#'} target="_blank" rel="noopener noreferrer" className="flex-1">
                <RainbowButton className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Demo
                </RainbowButton>
              </a>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function Projects() {
  const { data: repos = [], isLoading, error } = useGitHubRepos();
  const triggerSync = useTriggerGitHubSync();

  const handleSync = () => {
    triggerSync.mutate(undefined, {
      onSuccess: () => {
        // Query invalidation handles refetch
      }
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from repos
  const categories = Array.from(new Set(repos.map(r => r.ai_category).filter(Boolean)));

  // Filter repos
  const filteredRepos = repos.filter(repo => {
    const matchesSearch = !searchTerm ||
      (repo.custom_title || repo.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.custom_description || repo.ai_description || repo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.ai_tech_stack || []).some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || repo.ai_category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <motion.div
        className="relative pt-24 pb-16 md:py-32 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.5 } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-brand-blue/5" />
          <motion.div
            className="absolute top-40 right-40 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </motion.div>

        <motion.div
          className="container mx-auto px-6 md:px-8 relative z-10"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-brand-blue/10">
              <Github className="w-8 h-8 text-brand-blue" />
            </div>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live from GitHub
            </Badge>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div>
              <motion.h1
                variants={fadeIn}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                My Projects
              </motion.h1>
              <motion.p
                variants={fadeIn}
                className="text-lg text-muted-foreground max-w-2xl"
              >
                Explore my GitHub repositories - automatically synced and analyzed with AI.
                {repos.length > 0 && ` Currently showing ${repos.length} portfolio-worthy projects.`}
              </motion.p>
            </div>
            <motion.div variants={fadeIn}>
              <RainbowButton
                onClick={handleSync}
                disabled={triggerSync.isPending}
                className="gap-2 shrink-0"
              >
                {triggerSync.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync with GitHub
              </RainbowButton>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Projects Section */}
      <SectionContainer>
        {/* Search and Filter */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, description, or tech..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <RainbowButton
              className={selectedCategory === null ? "" : "opacity-60"}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </RainbowButton>
            {categories.map(category => (
              <RainbowButton
                key={category}
                className={selectedCategory === category ? "" : "opacity-60"}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              >
                {category}
              </RainbowButton>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <span className="ml-3 text-muted-foreground">Loading GitHub projects...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Failed to load projects. Please try again.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && repos.length === 0 && (
          <div className="text-center py-16 glass-card rounded-xl p-8">
            <Github className="w-16 h-16 mx-auto mb-4 text-brand-blue/50" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Your GitHub projects will appear here once synced.
            </p>
            <p className="text-sm text-muted-foreground">
              Go to <a href="/admin" className="text-brand-blue hover:underline">/admin</a> to sync your GitHub repositories.
            </p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && repos.length > 0 && filteredRepos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No projects match your search criteria.</p>
            <RainbowButton
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </RainbowButton>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && filteredRepos.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredRepos.map((repo) => (
                <ProjectRepoCard key={repo.id} repo={repo} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Stats Footer */}
        {!isLoading && repos.length > 0 && (
          <motion.div
            className="mt-12 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>
              Showing {filteredRepos.length} of {repos.length} projects •
              Featured: {repos.filter(r => r.is_featured).length} •
              Last synced from GitHub
            </p>
          </motion.div>
        )}
      </SectionContainer>
    </>
  );
}
