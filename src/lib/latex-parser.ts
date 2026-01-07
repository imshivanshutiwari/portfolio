import { ExtractedResumeData } from "@/hooks/useResumeVersions";

/**
 * Simple LaTeX Parser for Resume Data
 */

// Helper to find matching closing brace
function findMatchingBrace(text: string, start: number): number {
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// Extract all \resumeItem{...} content with proper brace matching
function extractResumeItems(text: string): string[] {
    const items: string[] = [];
    const regex = /\\resumeItem\{/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const start = match.index + match[0].length - 1; // position of '{'
        const end = findMatchingBrace(text, start);
        if (end !== -1) {
            items.push(text.substring(start + 1, end));
        }
    }
    return items;
}

// Simple text cleaner
function clean(text: string): string {
    if (!text) return "";
    let result = text;

    // Handle nested \textbf, \textit, etc. - run multiple times
    for (let i = 0; i < 5; i++) {
        result = result
            .replace(/\\textbf\{([^{}]*)\}/g, "$1")
            .replace(/\\textit\{([^{}]*)\}/g, "$1")
            .replace(/\\small\{([^{}]*)\}/g, "$1")
            .replace(/\\href\{[^{}]*\}\{([^{}]*)\}/g, "$1");
    }

    return result
        .replace(/\\[a-zA-Z]+/g, "")
        .replace(/[{}]/g, "")
        .replace(/~/g, " ")
        .replace(/\\&/g, "&")
        .replace(/\\\%/g, "%")
        .replace(/--/g, "–")
        .replace(/\s+/g, " ")
        .trim();
}

export function parseLatexResume(latex: string): ExtractedResumeData {
    const data: ExtractedResumeData = {
        contact: {
            name: "Shivanshu Tiwari",
            email: "",
            linkedin: "",
            github: "",
            location: "",
            phone: ""
        },
        summary: "",
        education: [],
        skills: [],
        experience: [],
        projects: [],
        research: [],
        publications: [],
        achievements: []
    };

    try {
        // 1. Extract Name
        const nameMatch = latex.match(/\\Huge\s+\\scshape\s+([A-Za-z\s]+)/);
        if (nameMatch) data.contact.name = nameMatch[1].trim();

        // 2. Extract Contact Info
        const emailMatch = latex.match(/\\href\{mailto:([^}]+)\}/);
        if (emailMatch) data.contact.email = emailMatch[1];

        const phoneMatch = latex.match(/\\faPhone\\\s*\+?([0-9\s-]+)/);
        if (phoneMatch) data.contact.phone = "+91 " + phoneMatch[1].trim();

        const linkedinMatch = latex.match(/linkedin\.com\/in\/([^}~\s]+)/);
        if (linkedinMatch) data.contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;

        const githubMatch = latex.match(/github\.com\/([^}~\s]+)/);
        if (githubMatch) data.contact.github = `https://github.com/${githubMatch[1]}`;

        // 3. Extract Summary
        const summaryMatch = latex.match(/\\section\{Professional Summary\}[\s\S]*?\\small\{([\s\S]*?)\}/);
        if (summaryMatch) data.summary = clean(summaryMatch[1]);

        // 4. Extract Education
        const eduSection = latex.match(/\\section\{Education\}([\s\S]*?)\\section\{/);
        if (eduSection) {
            const eduRegex = /\\resumeSubheading\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/g;
            let match;
            while ((match = eduRegex.exec(eduSection[1])) !== null) {
                data.education.push({
                    institution: clean(match[1]),
                    dates: clean(match[2]),
                    degree: clean(match[3]),
                    details: clean(match[4])
                });
            }
        }

        // 5. Extract Skills
        const skillsSection = latex.match(/\\section\{Core Skills\}([\s\S]*?)\\section\{/);
        if (skillsSection) {
            const skillRegex = /\\textbf\{([^}]+)\}:\}\s*&\s*([^\n\\]+)/g;
            let match;
            while ((match = skillRegex.exec(skillsSection[1])) !== null) {
                data.skills.push({
                    category: clean(match[1]),
                    items: clean(match[2])
                });
            }
        }

        // 6. Extract Experience
        const expSection = latex.match(/\\section\{Experience\}([\s\S]*?)\\section\{/);
        if (expSection) {
            const expRegex = /\\resumeSubheading\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}([\s\S]*?)(?=\\resumeSubheading|\\resumeSubHeadingListEnd)/g;
            let match;
            while ((match = expRegex.exec(expSection[1])) !== null) {
                const bullets = extractResumeItems(match[5]).map(clean);
                data.experience.push({
                    title: clean(match[1]),
                    dates: clean(match[2]),
                    company: clean(match[3]),
                    location: clean(match[4]),
                    bullets
                });
            }
        }

        // 7. Extract Projects
        const projSection = latex.match(/\\section\{Projects\}([\s\S]*?)\\section\{/);
        if (projSection) {
            // Find each \resumeProjectHeading using balanced braces
            const projContent = projSection[1];
            const projHeadingRegex = /\\resumeProjectHeading\s*\{/g;
            let projMatch;
            while ((projMatch = projHeadingRegex.exec(projContent)) !== null) {
                const firstBraceStart = projMatch.index + projMatch[0].length - 1;
                const firstBraceEnd = findMatchingBrace(projContent, firstBraceStart);
                if (firstBraceEnd === -1) continue;

                // Get the name/link part (inside first {{}})
                const nameContent = projContent.substring(firstBraceStart + 1, firstBraceEnd);

                // Extract URL from \href{...}
                const urlMatch = nameContent.match(/\\href\{([^}]+)\}/);
                const url = urlMatch ? urlMatch[1] : "";

                // Find the year (next {})
                const yearStart = projContent.indexOf('{', firstBraceEnd + 1);
                if (yearStart === -1) continue;
                const yearEnd = findMatchingBrace(projContent, yearStart);
                if (yearEnd === -1) continue;
                const year = projContent.substring(yearStart + 1, yearEnd);

                // Find bullets until next project or end
                const nextProj = projContent.indexOf('\\resumeProjectHeading', yearEnd);
                const bulletSection = nextProj !== -1
                    ? projContent.substring(yearEnd, nextProj)
                    : projContent.substring(yearEnd);
                const bullets = extractResumeItems(bulletSection).map(clean);

                // Clean the name - extract from {{textbf{...}}}
                const namePart = nameContent.split(" - ")[0];

                data.projects.push({
                    name: clean(namePart),
                    year: clean(year),
                    bullets,
                    url
                });
            }
        }

        // 8. Extract Research
        const resSection = latex.match(/\\section\{M\.Tech Research Project\}([\s\S]*?)\\section\{/);
        if (resSection) {
            const resRegex = /\\resumeSubheading\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}([\s\S]*?)(?=\\resumeSubheading|\\resumeSubHeadingListEnd)/g;
            let match;
            while ((match = resRegex.exec(resSection[1])) !== null) {
                const bullets = extractResumeItems(match[5]).map(clean);
                data.research.push({
                    title: clean(match[1]),
                    dates: clean(match[2]),
                    organization: clean(match[3]),
                    location: clean(match[4]),
                    bullets
                });
            }
        }

        // 9. Extract Publications
        const pubSection = latex.match(/\\section\{Publications\}([\s\S]*?)(?:\\section\{|$)/);
        if (pubSection) {
            const pubRegex = /\\resumeItem\{([\s\S]*?)\}/g;
            let match;
            while ((match = pubRegex.exec(pubSection[1])) !== null) {
                const parts = match[1].split(",");
                if (parts.length >= 3) {
                    data.publications.push({
                        authors: clean(parts[0]),
                        title: clean(parts[1]),
                        venue: clean(parts.slice(2).join(",")),
                        note: undefined
                    });
                }
            }
        }

    } catch (e) {
        console.error("LaTeX parsing error:", e);
    }

    return data;
}
