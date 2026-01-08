// Public Resume Page - Renders the active resume version dynamically
import { Loader2, Download, FileText } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import SectionContainer from "@/components/SectionContainer";
import { useActiveResume, ExtractedResumeData } from "@/hooks/useResumeVersions";
import resumeLatexSource from "../../DA_RESUME.TEX?raw";
import { parseLatexResume } from "@/lib/latex-parser";

export default function Resume() {
  const { data: activeResume, isLoading } = useActiveResume();

  // Parse local LaTeX source as primary data
  const localData = parseLatexResume(resumeLatexSource);

  if (isLoading) {
    return (
      <SectionContainer className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </SectionContainer>
    );
  }

  // Use local data as primary, fallback to activeResume
  const data: ExtractedResumeData | null = localData || activeResume;

  if (!data) {
    return (
      <SectionContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Resume Not Found</h2>
          <p className="text-muted-foreground">Please upload a resume through the Admin Panel.</p>
        </div>
      </SectionContainer>
    );
  }

  const downloadResume = () => {
    // Download the LaTeX source file
    const blob = new Blob([resumeLatexSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data?.contact?.name?.replace(/\s+/g, '_') || 'Resume'}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SectionContainer className="min-h-screen py-24">
      <div className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg p-8 md:p-12">

        {/* Header */}
        <header className="border-b border-foreground/20 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data?.contact?.name || "Resume"}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              {data?.contact?.email && (
                <a href={`mailto:${data.contact.email}`} className="hover:text-brand-blue transition-colors">
                  {data.contact.email}
                </a>
              )}
              {data?.contact?.phone && (
                <a href={`tel:${data.contact.phone}`} className="hover:text-brand-blue transition-colors">
                  {data.contact.phone}
                </a>
              )}
              {data?.contact?.linkedin && (
                <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">
                  LinkedIn
                </a>
              )}
              {data?.contact?.github && (
                <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">
                  GitHub
                </a>
              )}
            </div>
          </div>
          <RainbowButton onClick={downloadResume} className="gap-2">
            <Download className="w-4 h-4" />
            Download Resume
          </RainbowButton>
        </header>

        {/* Summary */}
        {data?.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-3 border-b border-foreground/20 pb-1">Professional Summary</h2>
            <p className="text-sm leading-relaxed text-foreground/90">{data.summary}</p>
          </section>
        )}

        {/* Education */}
        {data?.education && data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-3 border-b border-foreground/20 pb-1">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="text-sm">
                  <div className="flex justify-between font-semibold">
                    <span>{edu.institution}</span>
                    <span>{edu.dates}</span>
                  </div>
                  <div className="flex justify-between italic text-foreground/80">
                    <span>{edu.degree}</span>
                    <span>{edu.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills with Progress Bars */}
        {data?.skills && data.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-4 border-b border-foreground/20 pb-1">Core Skills</h2>
            <div className="space-y-4">
              {data.skills.slice(0, 6).map((skill, i) => {
                // Assign skill levels based on category importance
                const skillLevels: Record<string, number> = {
                  'Data Analysis': 95,
                  'Programming': 90,
                  'Data Pipeline': 85,
                  'Visualization': 88,
                  'Statistical Analysis': 82,
                  'Tools': 90,
                  'Additional': 75
                };
                const level = Object.entries(skillLevels).find(([key]) =>
                  skill.category.toLowerCase().includes(key.toLowerCase())
                )?.[1] || 80;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{skill.category}</span>
                      <span className="text-muted-foreground">{level}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-blue to-accent rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${level}%`,
                          animation: `skillFill 1.5s ease-out ${i * 0.1}s both`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{skill.items}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {data?.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-3 border-b border-foreground/20 pb-1">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between font-semibold text-sm">
                    <span>{exp.title}</span>
                    <span>{exp.dates}</span>
                  </div>
                  <div className="flex justify-between italic text-sm text-brand-blue/80 mb-2">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-foreground/90">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data?.projects && data.projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-3 border-b border-foreground/20 pb-1">Projects</h2>
            <div className="space-y-6">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start font-semibold text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span>{proj.name}</span>
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-blue hover:underline text-xs font-normal"
                        >
                          GitHub →
                        </a>
                      )}
                    </div>
                    <span>{proj.year}</span>
                  </div>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-foreground/90">
                    {proj.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research */}
        {data?.research && data.research.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-3 border-b border-foreground/20 pb-1">M.Tech Research Project</h2>
            <div className="space-y-6">
              {data.research.map((res, i) => (
                <div key={i}>
                  <div className="flex justify-between font-semibold text-sm">
                    <span>{res.title}</span>
                    <span>{res.dates}</span>
                  </div>
                  <div className="flex justify-between italic text-sm text-brand-blue/80 mb-2">
                    <span>{res.organization}</span>
                    <span>{res.location}</span>
                  </div>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-foreground/90">
                    {res.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Publications */}
        {data?.publications && data.publications.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-3 border-b border-foreground/20 pb-1">Publications</h2>
            <ul className="list-disc ml-5 space-y-2 text-sm text-foreground/90">
              {data.publications.map((pub, i) => (
                <li key={i}>
                  <span className="font-semibold">{pub.authors}</span>,{' '}
                  <span className="italic">{pub.title}</span>,{' '}
                  <span className="font-medium">{pub.venue}</span>
                  {pub.note && <span> ({pub.note})</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SectionContainer>
  );
}
