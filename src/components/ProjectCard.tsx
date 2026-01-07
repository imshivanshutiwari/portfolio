
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  reportUrl?: string;
  date: string;
  longDescription?: string;
}

export default function ProjectCard({
  title,
  description,
  tags,
  image,
  demoUrl,
  githubUrl,
  reportUrl,
  date,
  longDescription,
}: ProjectCardProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Card 
        onClick={() => setOpen(true)}
        className={cn(
          "group overflow-hidden border border-border cursor-pointer",
          "transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue/5",
          "hover:border-brand-blue/20 h-full flex flex-col"
        )}
      >
        <div className="overflow-hidden h-48 relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-1/3" />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-foreground">{title}</h3>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4 flex-grow">{description}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="bg-secondary text-secondary-foreground">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-right text-xs">{date}</DialogDescription>
          </DialogHeader>
          
          <div className="overflow-hidden rounded-md mb-4">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-48 object-cover" 
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {longDescription || description}
            </p>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-secondary text-secondary-foreground">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {demoUrl && (
                <Button asChild variant="default" size="sm">
                  <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <ExternalLink size={16} /> View Demo
                  </a>
                </Button>
              )}
              {githubUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github size={16} /> Source Code
                  </a>
                </Button>
              )}
              {reportUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <FileText size={16} /> View Report
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
