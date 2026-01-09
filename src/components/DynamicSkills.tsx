import { motion } from "framer-motion";
import { useSkillsByCategory, Skill } from "@/hooks/usePortfolioData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Code,
    Database,
    Brain,
    Cloud,
    Terminal,
    Palette,
    Globe,
    Shield,
    Loader2,
    CheckCircle,
    Github,
    FileText
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
    "Programming Languages": <Code className="w-5 h-5" />,
    "AI/ML Frameworks": <Brain className="w-5 h-5" />,
    "Tools & Technologies": <Terminal className="w-5 h-5" />,
    "Cloud Computing": <Cloud className="w-5 h-5" />,
    "Databases": <Database className="w-5 h-5" />,
    "Frontend": <Palette className="w-5 h-5" />,
    "Backend": <Globe className="w-5 h-5" />,
    "DevOps": <Shield className="w-5 h-5" />,
    "Technologies": <Code className="w-5 h-5" />,
    "Other": <Terminal className="w-5 h-5" />,
};

// Proficiency labels
const proficiencyLabels: Record<number, string> = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
};

// Source icons
function SourceIndicator({ sources }: { sources: string[] }) {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                {sources.includes('resume') && (
                    <Tooltip>
                        <TooltipTrigger>
                            <FileText className="w-3 h-3 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>From Resume</TooltipContent>
                    </Tooltip>
                )}
                {sources.includes('github') && (
                    <Tooltip>
                        <TooltipTrigger>
                            <Github className="w-3 h-3 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>Found in GitHub</TooltipContent>
                    </Tooltip>
                )}
                {sources.includes('linkedin') && (
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="w-3 h-3 rounded-full bg-[#0077B5]" />
                        </TooltipTrigger>
                        <TooltipContent>Mentioned on LinkedIn</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}

function SkillCard({ skill }: { skill: Skill }) {
    const proficiency = skill.proficiency_level || 3;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
        >
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{skill.name}</span>
                    <SourceIndicator sources={skill.sources || []} />
                </div>
                <div className="flex items-center gap-2">
                    {skill.source_count > 1 && (
                        <Badge variant="outline" className="text-xs">
                            {skill.source_count} sources
                        </Badge>
                    )}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`w-2 h-2 rounded-full transition-colors ${level <= proficiency
                                                ? 'bg-brand-blue'
                                                : 'bg-muted'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {proficiencyLabels[proficiency]}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </motion.div>
    );
}

function SkillCategoryCard({ category, skills }: { category: string; skills: Skill[] }) {
    const icon = categoryIcons[category] || <Code className="w-5 h-5" />;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    return (
        <Card className="glass-card hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue">
                        {icon}
                    </div>
                    {category}
                    <Badge variant="secondary" className="ml-auto text-xs">
                        {skills.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
                >
                    {skills.slice(0, 16).map((skill) => (
                        <SkillCard key={skill.id} skill={skill} />
                    ))}
                </motion.div>
                {skills.length > 16 && (
                    <p className="text-xs text-muted-foreground text-center pt-3">
                        + {skills.length - 16} more skills
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface DynamicSkillsProps {
    variant?: 'full' | 'compact';
    maxCategories?: number;
}

export default function DynamicSkills({ variant = 'full', maxCategories }: DynamicSkillsProps) {
    const { data: skillsByCategory = {}, isLoading, error } = useSkillsByCategory();

    const categories = Object.entries(skillsByCategory);
    const displayCategories = maxCategories ? categories.slice(0, maxCategories) : categories;

    // Calculate totals
    const totalSkills = Object.values(skillsByCategory).flat().length;
    const multiSourceSkills = Object.values(skillsByCategory)
        .flat()
        .filter(s => s.source_count > 1).length;

    // Animation variants
    const gridVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                <span className="ml-3 text-muted-foreground">Loading skills...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Failed to load skills.</p>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="text-center py-16 glass-card rounded-xl p-8">
                <Code className="w-12 h-12 mx-auto mb-4 text-brand-blue/50" />
                <h3 className="text-xl font-semibold mb-2">Skills & Technologies</h3>
                <p className="text-muted-foreground">
                    Skills will appear here once your resume is synced.
                </p>
            </div>
        );
    }

    if (variant === 'compact') {
        // Compact view - just badges
        const allSkills = Object.values(skillsByCategory).flat();
        const topSkills = allSkills
            .sort((a, b) => (b.source_count || 0) - (a.source_count || 0))
            .slice(0, 20);

        return (
            <div className="flex flex-wrap gap-2">
                {topSkills.map((skill) => (
                    <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Badge
                            variant={skill.source_count > 1 ? "default" : "secondary"}
                            className="px-3 py-1"
                        >
                            {skill.name}
                            {skill.source_count > 1 && (
                                <CheckCircle className="w-3 h-3 ml-1" />
                            )}
                        </Badge>
                    </motion.div>
                ))}
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
                    <div className="p-3 rounded-xl bg-brand-blue/10">
                        <Code className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Skills & Technologies</h2>
                        <p className="text-sm text-muted-foreground">
                            Auto-synced from resume, GitHub, and LinkedIn
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                        {totalSkills} skills
                    </Badge>
                    {multiSourceSkills > 0 && (
                        <Badge variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {multiSourceSkills} verified
                        </Badge>
                    )}
                </div>
            </motion.div>

            {/* Skills Grid */}
            <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {displayCategories.map(([category, skills]) => (
                    <motion.div
                        key={category}
                        variants={fadeIn}
                        className={displayCategories.length === 1 ? "col-span-full" : ""}
                    >
                        <SkillCategoryCard category={category} skills={skills} />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
