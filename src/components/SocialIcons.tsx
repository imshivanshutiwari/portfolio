
import { Linkedin, Github, Twitter, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SocialIcons() {
  const icons = [
    { name: "LinkedIn", icon: <Linkedin size={20} />, url: "https://linkedin.com", color: "hover:bg-[#0077B5] hover:text-white" },
    { name: "GitHub", icon: <Github size={20} />, url: "https://github.com", color: "hover:bg-[#333] hover:text-white" },
    { name: "Twitter", icon: <Twitter size={20} />, url: "https://twitter.com", color: "hover:bg-[#1DA1F2] hover:text-white" },
    { name: "Email", icon: <Mail size={20} />, url: "mailto:contact@lovable.ai", color: "hover:bg-[#EA4335] hover:text-white" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { scale: 0 },
    show: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };

  return (
    <motion.div 
      className="flex items-center gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {icons.map((social, index) => (
        <motion.a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className={`w-10 h-10 rounded-full border border-border flex items-center justify-center transition-all duration-300 ${social.color}`}
          variants={item}
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.2 },
          }}
        >
          {social.icon}
        </motion.a>
      ))}
    </motion.div>
  );
}
