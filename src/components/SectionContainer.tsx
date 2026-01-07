
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function SectionContainer({ 
  children, 
  className,
  id
}: SectionContainerProps) {
  return (
    <section 
      id={id} 
      className={cn(
        "py-16 md:py-24 px-6 md:px-8",
        className
      )}
    >
      <div className="container mx-auto">
        {children}
      </div>
    </section>
  );
}
