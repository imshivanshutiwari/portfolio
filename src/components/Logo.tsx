
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-brand-blue"
      >
        <path
          d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM16 6C18.1217 6 20.1566 6.84285 21.6569 8.34315C23.1571 9.84344 24 11.8783 24 14C24 16.1217 23.1571 18.1566 21.6569 19.6569C20.1566 21.1571 18.1217 22 16 22C13.8783 22 11.8434 21.1571 10.3431 19.6569C8.84285 18.1566 8 16.1217 8 14C8 11.8783 8.84285 9.84344 10.3431 8.34315C11.8434 6.84285 13.8783 6 16 6Z"
          fill="currentColor"
        />
        <circle cx="16" cy="14" r="4" fill="#00FFBB" />
      </svg>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-foreground leading-tight">Shivanshu Tiwari</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline-block">AI Systems & Defense Research</span>
      </div>
    </div>
  );
}
