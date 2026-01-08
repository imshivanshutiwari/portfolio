import { Book, Award, Briefcase, GanttChart } from "lucide-react";
import { motion } from "framer-motion";
import SectionContainer from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Separator } from "@/components/ui/separator";
import TimelineSection from "@/components/TimelineSection";
import GlowingAnimation from "@/components/animations/GlowingAnimation";
import LinkedInActivitySection from "@/components/LinkedInActivity";
import DynamicSkills from "@/components/DynamicSkills";

import { useSystemConfig, useAllProfileContent } from "@/hooks/usePortfolioData";

export default function About() {
  const { data: systemConfig } = useSystemConfig();
  const { data: profileContent = {} } = useAllProfileContent();
  const profileImage = systemConfig?.profile_image_url || "";

  // Transform profile_content data to timeline format
  const education = (profileContent['education'] || []).map(item => ({
    title: item.title,
    subtitle: item.organization || item.subtitle || '',
    period: item.date_start && item.date_end ? `${item.date_start} - ${item.date_end}` : '',
    description: item.content || '',
    type: 'education' as const
  }));

  const experience = (profileContent['experience'] || []).map(item => ({
    title: item.title,
    subtitle: item.organization || item.subtitle || '',
    period: item.date_start ? `${item.date_start} - ${item.date_end || 'Present'}` : '',
    description: item.content || '',
    type: 'work' as const
  }));

  const achievements = (profileContent['achievement'] || []).map(item => ({
    title: item.title,
    year: item.date_start || '',
    description: item.content || ''
  }));

  // Get about me, vision, mission content
  const aboutMe = profileContent['about_me']?.[0];
  const vision = profileContent['vision']?.[0];
  const mission = profileContent['mission']?.[0];

  // Fallback hardcoded data if no content exists yet
  const fallbackEducation = [
    {
      title: "M.Tech in Modelling & Simulation",
      subtitle: "Defence Institute of Advanced Technology (DIAT), Pune",
      period: "2021 - 2023",
      description: "Specialized in AI-driven defense simulations and intelligent systems.",
      type: "education" as const
    },
    {
      title: "B.Tech in Computer Science",
      subtitle: "College of Engineering",
      period: "2017 - 2021",
      description: "Focused on artificial intelligence, computer vision, and secure systems.",
      type: "education" as const
    }
  ];

  const fallbackExperience = [
    {
      title: "AI Research Lead",
      subtitle: "Defense Innovation Lab",
      period: "2023 - Present",
      description: "Leading research initiatives in AI applications for defense systems, focusing on computer vision and autonomous decision-making models.",
      type: "work" as const
    },
    {
      title: "ML Engineer Intern",
      subtitle: "Tech Innovations Inc.",
      period: "2020 - 2021",
      description: "Developed machine learning models for pattern recognition and anomaly detection in security applications.",
      type: "work" as const
    }
  ];

  const fallbackAchievements = [
    {
      title: "Reliance Foundation Scholar",
      year: "2022",
      description: "Awarded for innovative research in applied AI for defense applications."
    },
    {
      title: "AGNIRVA Internship",
      year: "2021",
      description: "Selected for prestigious defense innovation program focusing on autonomous systems."
    },
    {
      title: "Best Paper Award",
      year: "2021",
      description: "For research on 'Multi-modal Intelligence Fusion Systems for Defense Applications'"
    }
  ];

  // Use database data if available, otherwise fallback
  const displayEducation = education.length > 0 ? education : fallbackEducation;
  const displayExperience = experience.length > 0 ? experience : fallbackExperience;
  const displayAchievements = achievements.length > 0 ? achievements : fallbackAchievements;

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
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
      {/* Hero Section with Animations */}
      <div className="relative pt-24 pb-16 md:py-32 overflow-hidden">
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
          <motion.div
            className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-brand-neon/5 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </motion.div>

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-6"
                variants={fadeInUp}
              >
                About Me
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8"
                variants={fadeInUp}
              >
                {aboutMe?.subtitle || "AI researcher, defense technologist, and visionary engineer"}
              </motion.p>
              <motion.p
                className="text-muted-foreground mb-6"
                variants={fadeInUp}
              >
                {aboutMe?.content || "I am Shivanshu Tiwari, a postgraduate researcher and technologist working at the intersection of artificial intelligence, defense innovation, and futuristic computing systems. My mission is to develop intelligent solutions that enhance defense capabilities, drive technological advancement, and contribute to a more secure future."}
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-4 mt-8"
                variants={fadeInUp}
              >
                <a href="/contact">
                  <RainbowButton>Get in Touch</RainbowButton>
                </a>
                <Button asChild variant="outline">
                  <a href="/projects">View My Work</a>
                </Button>
                <Button asChild variant="secondary" className="gap-2">
                  <a href="https://linkedin.com/in/imshivanshutiwari" target="_blank" rel="noopener noreferrer">
                    <Briefcase className="w-4 h-4" />
                    LinkedIn
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, delay: 0.3 }
              }}
            >
              <GlowingAnimation>
                <div className="aspect-square rounded-2xl overflow-hidden border border-border">
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

      {/* Vision & Mission with Animations */}
      <SectionContainer className="bg-card">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div
            className="glass-card rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
            variants={fadeInUp}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                whileHover={{ rotate: 360, transition: { duration: 0.7 } }}
              >
                <GanttChart className="w-6 h-6 text-brand-blue mr-3" />
              </motion.div>
              <h2 className="text-2xl font-bold">My Vision</h2>
            </div>
            <p className="text-muted-foreground">
              {vision?.content || "To pioneer the development of intelligent systems that revolutionize defense capabilities while maintaining ethical considerations and human oversight. I envision a future where AI enhances security without compromising human values."}
            </p>
          </motion.div>

          <motion.div
            className="glass-card rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
            variants={fadeInUp}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                whileHover={{ rotate: 360, transition: { duration: 0.7 } }}
              >
                <Book className="w-6 h-6 text-brand-blue mr-3" />
              </motion.div>
              <h2 className="text-2xl font-bold">My Mission</h2>
            </div>
            <p className="text-muted-foreground">
              {mission?.content || "To bridge theoretical AI research with practical applications in defense and security domains. I'm committed to creating solutions that are robust, reliable, and responsive to real-world challenges, while fostering knowledge sharing and collaboration."}
            </p>
          </motion.div>
        </motion.div>
      </SectionContainer>

      {/* Timeline Sections */}
      <SectionContainer>
        <TimelineSection title="Experience" items={displayExperience} />
        <TimelineSection title="Education" items={displayEducation} />
      </SectionContainer>

      {/* Achievements with Animations */}
      <SectionContainer className="bg-card">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="section-heading"
            variants={fadeInUp}
          >
            Achievements
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8"
            variants={staggerContainer}
          >
            {displayAchievements.map((item, index) => (
              <motion.div
                key={index}
                className="glass-card rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                variants={fadeInUp}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(0, 85, 255, 0.1)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-start mb-4">
                  <motion.div
                    whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
                    className="flex-shrink-0"
                  >
                    <Award className="w-6 h-6 text-brand-blue mr-3" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.year}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </SectionContainer>

      {/* LinkedIn Activity Section - NEW */}
      <SectionContainer>
        <LinkedInActivitySection />
      </SectionContainer>

      {/* Dynamic Skills - Auto-synced */}
      <SectionContainer className="bg-card">
        <DynamicSkills />
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button asChild>
            <a href="/projects">Explore My Projects</a>
          </Button>
        </motion.div>
      </SectionContainer>
    </>
  );
}
