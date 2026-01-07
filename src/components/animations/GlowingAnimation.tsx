
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowingAnimationProps {
  children: ReactNode;
}

export default function GlowingAnimation({ children }: GlowingAnimationProps) {
  return (
    <div className="relative">
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-full bg-gradient-to-br from-brand-blue via-brand-neon to-brand-blue opacity-60 blur-lg"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
