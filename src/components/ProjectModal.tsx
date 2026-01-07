
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Github, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    description: string;
    longDescription: string;
    tags: string[];
    image: string;
    demoUrl?: string;
    githubUrl?: string;
    reportUrl?: string;
    date: string;
  };
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{project.date}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Project Image */}
          <div className="rounded-lg overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* Tech Stack */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {getTechStack(project.title).map((tech, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
            <p className="text-muted-foreground">{project.longDescription}</p>
          </div>
          
          {/* Key Features */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {getKeyFeatures(project.title).map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      delay: index * 0.1,
                      duration: 0.3
                    }
                  }}
                >
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <Button asChild variant="default" size="sm">
                <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <ExternalLink size={16} />
                  View Demo
                </a>
              </Button>
            )}
            
            {project.githubUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <Github size={16} />
                  Source Code
                </a>
              </Button>
            )}
            
            {project.reportUrl && (
              <Button asChild variant="secondary" size="sm">
                <a href={project.reportUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <FileText size={16} />
                  View Report
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
const getTechStack = (projectTitle: string): string[] => {
  const techMap: Record<string, string[]> = {
    "ShivanshuSQL – Natural Language to SQL Generator": ["Python", "NLP", "SQL", "Transformers", "PyTorch", "FastAPI"],
    "Enhanced Military Intelligence Analysis System using LLMs": ["TensorFlow", "PyTorch", "LLMs", "Computer Vision", "CUDA", "Kubernetes"],
    "Fuzzy Relation Analyzer": ["Python", "Fuzzy Logic", "NumPy", "SciPy", "Matplotlib", "Pandas"],
    "Defense News Summarizer API using OpenAI GPT and FastAPI": ["OpenAI API", "FastAPI", "Python", "Docker", "Redis", "AWS Lambda"],
    "AI-Powered Resume Screening and Ranking System": ["LangChain", "LLMs", "Python", "AWS", "MongoDB", "React"],
    "Post-Quantum Cryptography and Qubit-based Security Model": ["Cryptography", "Quantum Computing", "Python", "C++", "Qiskit", "Q#"]
  };
  
  return techMap[projectTitle] || ["React", "TypeScript", "AI", "ML"];
};

const getKeyFeatures = (projectTitle: string): string[] => {
  const featuresMap: Record<string, string[]> = {
    "ShivanshuSQL – Natural Language to SQL Generator": [
      "Natural language understanding for complex database queries",
      "Support for multiple SQL dialects (MySQL, PostgreSQL, SQLite)",
      "Context-aware query generation with history tracking",
      "Zero-shot adaptation to custom database schemas",
      "Performance optimization for generated queries"
    ],
    "Enhanced Military Intelligence Analysis System using LLMs": [
      "Multi-modal data fusion from satellite imagery and signals",
      "Real-time threat assessment with confidence scoring",
      "Explainable AI for analytical transparency",
      "Secure compartmentalized information processing",
      "Adversarial defense mechanisms against data poisoning"
    ],
    "Fuzzy Relation Analyzer": [
      "Support for various fuzzy composition operations",
      "Interactive visualization of fuzzy relations",
      "Customizable similarity measures and thresholds",
      "Export capabilities for integration with decision support systems",
      "Batch processing for large datasets"
    ],
    "Defense News Summarizer API using OpenAI GPT and FastAPI": [
      "Automated monitoring of 50+ defense news sources",
      "Customizable summarization length and focus areas",
      "Entity recognition for defense-specific terminology",
      "API integration with security information systems",
      "Real-time classification of emerging threats"
    ],
    "AI-Powered Resume Screening and Ranking System": [
      "Semantic understanding of job descriptions",
      "Skill-matching with configurable weighting",
      "Bias detection and mitigation in candidate selection",
      "Explainable ranking with highlighted matching factors",
      "Integration with ATS platforms"
    ],
    "Post-Quantum Cryptography and Qubit-based Security Model": [
      "Implementation of lattice-based cryptographic primitives",
      "Quantum key distribution protocol simulation",
      "Security analysis against quantum computing attacks",
      "Performance benchmarking on constrained devices",
      "Hybrid classical-quantum security architecture"
    ]
  };
  
  return featuresMap[projectTitle] || [
    "Feature 1: Lorem ipsum dolor sit amet",
    "Feature 2: Consectetur adipiscing elit",
    "Feature 3: Sed do eiusmod tempor incididunt"
  ];
};
