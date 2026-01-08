import { ArrowRight, DownloadCloud, UserCircle, BrainCircuit, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import SectionContainer from "@/components/SectionContainer";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";
import GlowingAnimation from "@/components/animations/GlowingAnimation";
import SocialIcons from "@/components/SocialIcons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import GitHubProjects from "@/components/GitHubProjects";
import { GlowingEffectDemo } from "@/components/GlowingEffectDemo";

import { useSystemConfig } from "@/hooks/usePortfolioData";

export default function Home() {
  const { data: systemConfig } = useSystemConfig();
  // Fallback to empty or generic if no config
  const profileImage = systemConfig?.profile_image_url || "";

  // Featured projects
  const featuredProjects = [
    {
      title: "ShivanshuSQL – Natural Language to SQL Generator",
      description: "A tool that converts natural language queries into SQL commands using advanced NLP techniques.",
      longDescription: "Developed an intelligent system that translates natural language questions into structured SQL queries. The tool utilizes transformer-based language models to understand user intent and generate accurate, optimized SQL commands for database interaction without requiring technical SQL knowledge.",
      tags: ["NLP", "SQL", "LLMs"],
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      demoUrl: "#",
      githubUrl: "#",
      date: "2023"
    },
    {
      title: "Enhanced Military Intelligence Analysis System using LLMs",
      description: "Multi-modal intelligence analysis platform integrating satellite imagery, signal intelligence, and open-source data for threat assessment.",
      longDescription: "Created an advanced intelligence fusion system that combines multiple data sources including satellite imagery, signal intelligence, and open-source intelligence. Utilized natural language processing for information extraction and multi-modal deep learning models to identify patterns across diverse data types.",
      tags: ["LLMs", "Military Intelligence", "Data Analysis"],
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      githubUrl: "#",
      reportUrl: "#",
      date: "2022"
    },
    {
      title: "Fuzzy Relation Analyzer",
      description: "A tool for analyzing fuzzy relationships in complex datasets with applications in decision support systems.",
      longDescription: "Implemented a system for analyzing and visualizing fuzzy relations in complex datasets. The tool supports various fuzzy composition operations, similarity measures, and inference mechanisms to handle uncertainty and imprecision in data relationships, particularly useful for decision support systems in ambiguous scenarios.",
      tags: ["Fuzzy Logic", "Data Analysis"],
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      demoUrl: "#",
      githubUrl: "#",
      date: "2022"
    }
  ];

  // Core competencies
  const competencies = [
    {
      title: "AI in Defense",
      description: "Developing intelligent systems for threat detection, autonomous defense operations, and strategic decision support",
      icon: <Target className="w-7 h-7 text-brand-blue" />
    },
    {
      title: "Vision Systems",
      description: "Creating computer vision solutions for surveillance, object detection, and real-time analysis in critical scenarios",
      icon: <BrainCircuit className="w-7 h-7 text-brand-blue" />
    },
    {
      title: "Embedded Intelligence",
      description: "Designing compact, efficient AI systems for deployment in resource-constrained and field environments",
      icon: <Zap className="w-7 h-7 text-brand-blue" />
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <motion.div
              className="md:col-span-3"
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6"
                variants={fadeInUp}
              >
                Shivanshu Tiwari
                <motion.span
                  className="block text-brand-blue"
                  variants={fadeInUp}
                >
                  AI & Defense Innovation
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8"
                variants={fadeInUp}
              >
                Engineering Intelligence, Shaping the Future
              </motion.p>

              <motion.p
                className="text-muted-foreground mb-12 max-w-xl"
                variants={fadeInUp}
              >
                Postgraduate researcher and technologist working at the intersection of artificial intelligence,
                defense systems, and futuristic computing. Creating intelligent solutions for tomorrow's challenges.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 mb-8"
                variants={fadeInUp}
              >
                <a href="/projects">
                  <RainbowButton className="gap-2">
                    Explore Portfolio
                    <ArrowRight size={18} />
                  </RainbowButton>
                </a>

                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href="/resume">
                    <DownloadCloud size={18} />
                    Download Resume
                  </a>
                </Button>

                <Button asChild variant="secondary" size="lg" className="gap-2">
                  <a href="/about">
                    <UserCircle size={18} />
                    About Me
                  </a>
                </Button>
              </motion.div>

              {/* Animated Social Icons */}
              <motion.div variants={fadeInUp}>
                <SocialIcons />
              </motion.div>
            </motion.div>

            {/* Glowing Profile Image */}
            <motion.div
              className="md:col-span-2 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.8, delay: 0.6 }
              }}
            >
              <GlowingAnimation>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-brand-blue/30">
                  <img
                    src={profileImage}
                    alt="Shivanshu Tiwari"
                    className="w-full h-full object-cover"
                  />
                </div>
              </GlowingAnimation>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Core Competencies with Glowing Effect */}
      <SectionContainer className="bg-card">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerChildren}
        >
          <motion.h2
            className="section-heading text-center"
            variants={fadeInUp}
          >
            Core Competencies
          </motion.h2>

          <motion.div
            className="mt-12"
            variants={fadeInUp}
          >
            <GlowingEffectDemo />
          </motion.div>
        </motion.div>
      </SectionContainer>

      {/* Featured Projects */}
      <SectionContainer>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerChildren}
        >
          <motion.div
            className="flex justify-between items-center mb-12"
            variants={fadeInUp}
          >
            <h2 className="section-heading mb-0">Featured Projects</h2>
            <Button asChild variant="outline">
              <a href="/projects" className="flex items-center gap-2">
                View All Projects
                <ArrowRight size={16} />
              </a>
            </Button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerChildren}
          >
            {featuredProjects.map((project, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div>
                      <ProjectCard
                        title={project.title}
                        description={project.description}
                        longDescription={project.longDescription}
                        tags={project.tags}
                        image={project.image}
                        demoUrl={project.demoUrl}
                        githubUrl={project.githubUrl}
                        reportUrl={project.reportUrl}
                        date={project.date}
                      />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {getTechStackIcons(project.title)}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </SectionContainer>

      {/* GitHub Projects - Auto-synced */}
      <SectionContainer className="bg-card">
        <GitHubProjects variant="featured" maxItems={3} />
      </SectionContainer>

      {/* CTA Section */}
      <SectionContainer className="bg-card">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerChildren}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            Ready to Collaborate?
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8"
            variants={fadeInUp}
          >
            I'm available for research collaborations, consulting, and innovation partnerships.
            Let's create intelligent solutions together.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Button asChild size="lg">
              <a href="/contact">Get in Touch</a>
            </Button>
          </motion.div>
        </motion.div>
      </SectionContainer>
    </>
  );
}

// Helper function to display tech stack icons based on project
const getTechStackIcons = (projectTitle: string) => {
  const techMap: Record<string, string[]> = {
    "ShivanshuSQL – Natural Language to SQL Generator": ["Python", "NLP", "SQL", "Transformers"],
    "Enhanced Military Intelligence Analysis System using LLMs": ["LLMs", "Computer Vision", "PyTorch", "TensorFlow"],
    "Fuzzy Relation Analyzer": ["Python", "Fuzzy Logic", "Data Analysis", "NumPy"],
    "Defense News Summarizer API using OpenAI GPT and FastAPI": ["OpenAI GPT", "FastAPI", "Python", "Docker"],
    "AI-Powered Resume Screening and Ranking System": ["LLMs", "NLP", "Python", "AWS"],
    "Post-Quantum Cryptography and Qubit-based Security Model": ["Cryptography", "Quantum Computing", "Python", "C++"]
  };

  const techs = techMap[projectTitle] || ["React", "TypeScript", "AI", "ML"];

  return techs.map((tech, index) => (
    <span key={index} className="bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground">
      {tech}
    </span>
  ));
};
