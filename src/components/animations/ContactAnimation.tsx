
import { useEffect, useRef } from "react";
import Lottie from "lottie-web";
import contactAnimation from "./contact-animation.json";

export default function ContactAnimation() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      const anim = Lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: contactAnimation,
      });

      return () => {
        anim.destroy();
      };
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={container} className="w-full h-full z-10 relative" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-neon/20 z-0 opacity-70 rounded-xl" />
      
      {/* Subtle security indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-20 text-[#00FFDD]/50 text-xs">
        <div className="opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-xs font-mono tracking-tighter">
            SECURE TRANSMISSION PROTOCOL v2.5
          </span>
        </div>
      </div>
      
      {/* Minimal corner markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FFDD]/30 z-20"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00FFDD]/30 z-20"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00FFDD]/30 z-20"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FFDD]/30 z-20"></div>
    </div>
  );
}
