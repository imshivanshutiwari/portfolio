
import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
  type: "education" | "work";
}

interface TimelineSectionProps {
  title: string;
  items: TimelineItem[];
}

export default function TimelineSection({ title, items }: TimelineSectionProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="mb-12"
    >
      <motion.h2 
        className="section-heading mb-8"
        variants={fadeInUp}
      >
        {title}
      </motion.h2>
      
      <div className="space-y-12 relative">
        {/* Vertical line */}
        <div className="absolute left-[24px] top-2 bottom-2 w-[2px] bg-border" />
        
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="relative"
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.5,
                  delay: index * 0.2
                }
              }
            }}
          >
            <div className="flex gap-6">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center"
                  whileHover={{ scale: 1.1, backgroundColor: "var(--brand-blue)" }}
                >
                  {item.type === "education" ? 
                    <GraduationCap className="w-6 h-6" /> : 
                    <Briefcase className="w-6 h-6" />
                  }
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="flex-grow">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                  <span className="inline-block text-sm bg-secondary text-muted-foreground rounded-full px-3 py-1 mb-3">
                    {item.period}
                  </span>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-brand-blue mb-3">{item.subtitle}</p>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
            
            {index < items.length - 1 && <Separator className="my-6 invisible" />}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
