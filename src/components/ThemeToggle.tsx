
import { Moon, Sun, Monitor, Laptop, Zap, Globe, Sparkles, Code2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "dark" | "cyberpunk" | "matrix" | "ocean" | "sunset" | "aurora";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme && savedTheme !== "light") {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all old theme classes
    root.classList.remove("light", "dark", "cyberpunk", "matrix", "ocean", "sunset", "aurora");

    // Add new theme class
    root.classList.add(theme);

    // Save preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="group rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border/50 backdrop-blur-xl">
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer focus:bg-accent/50">
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("cyberpunk")} className="gap-2 cursor-pointer focus:bg-accent/50 text-pink-500 font-bold">
          <Zap className="h-4 w-4" /> Cyberpunk
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("matrix")} className="gap-2 cursor-pointer focus:bg-accent/50 text-green-500 font-mono">
          <Code2 className="h-4 w-4" /> Matrix
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("ocean")} className="gap-2 cursor-pointer focus:bg-accent/50 text-cyan-500">
          <Globe className="h-4 w-4" /> Ocean
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunset")} className="gap-2 cursor-pointer focus:bg-accent/50 text-orange-500">
          <Sparkles className="h-4 w-4" /> Sunset
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("aurora")} className="gap-2 cursor-pointer focus:bg-accent/50 text-purple-400">
          <Monitor className="h-4 w-4" /> Aurora
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
