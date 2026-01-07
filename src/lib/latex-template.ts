// LaTeX Resume Template - Jake Gutierrez Style
// This is the ONLY template used for resume generation

export const LATEX_PREAMBLE = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[colorlinks=true, urlcolor=blue]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\usepackage[utf8]{inputenc}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
    \\item\\small{
        {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}
`;

export const LATEX_END = `
\\end{document}
`;

// Helper to escape LaTeX special characters
export function escapeLatex(text: string): string {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

// Generate header with name and contact info
export function generateHeader(contact: {
    name: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
}): string {
    const lines: string[] = [];

    lines.push('\\begin{center}');
    lines.push(`    {\\Huge \\scshape ${escapeLatex(contact.name)}} \\\\ \\vspace{2pt}`);
    lines.push('    \\small');

    const contactParts: string[] = [];
    if (contact.email) {
        contactParts.push(`\\faEnvelope\\ \\href{mailto:${contact.email}}{${contact.email}}`);
    }
    if (contact.phone) {
        contactParts.push(`\\faPhone\\ ${escapeLatex(contact.phone)}`);
    }
    if (contact.linkedin) {
        const linkedinHandle = contact.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '');
        contactParts.push(`\\faLinkedin\\ \\href{${contact.linkedin}}{linkedin.com/in/${linkedinHandle}}`);
    }
    if (contact.github) {
        const githubHandle = contact.github.replace(/https?:\/\/(www\.)?github\.com\//i, '');
        contactParts.push(`\\faGithub\\ \\href{${contact.github}}{github.com/${githubHandle}}`);
    }
    if (contact.website) {
        contactParts.push(`\\faGlobe\\ \\href{${contact.website}}{${contact.website.replace(/https?:\/\//i, '')}}`);
    }

    lines.push('    ' + contactParts.join(' ~\n    '));
    lines.push('\\end{center}');

    return lines.join('\n');
}

// Generate Professional Summary section
export function generateSummary(summary: string): string {
    if (!summary) return '';

    return `
%-----------PROFESSIONAL SUMMARY-----------
\\section{Professional Summary}
\\vspace{-5pt}
\\small{
${summary}
}
\\vspace{-8pt}
`;
}

// Generate Education section
export function generateEducation(education: Array<{
    institution: string;
    dates: string;
    degree: string;
    details?: string;
}>): string {
    if (!education || education.length === 0) return '';

    let latex = `
%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
`;

    for (const edu of education) {
        latex += `    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.dates)}}
      {${escapeLatex(edu.degree)}}{${edu.details ? escapeLatex(edu.details) : ''}}
`;
    }

    latex += `  \\resumeSubHeadingListEnd
\\vspace{-10pt}
`;

    return latex;
}

// Generate Skills section with categories
export function generateSkills(skills: Array<{
    category: string;
    items: string;
}>): string {
    if (!skills || skills.length === 0) return '';

    let latex = `
%-----------CORE SKILLS-----------
\\section{Core Skills}

\\begin{tabularx}{\\textwidth}{@{} l X @{}}
`;

    for (const skill of skills) {
        latex += `\\textbf{${escapeLatex(skill.category)}:} & ${skill.items} \\\\\n\n`;
    }

    latex += `\\end{tabularx}
\\vspace{-5pt}
`;

    return latex;
}

// Generate Experience section
export function generateExperience(experience: Array<{
    title: string;
    dates: string;
    company: string;
    location: string;
    bullets: string[];
}>): string {
    if (!experience || experience.length === 0) return '';

    let latex = `
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
`;

    for (const exp of experience) {
        latex += `    \\resumeSubheading
      {${escapeLatex(exp.title)}}{${escapeLatex(exp.dates)}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
      \\resumeItemListStart
`;
        for (const bullet of exp.bullets) {
            latex += `        \\resumeItem{${bullet}}\n`;
        }
        latex += `      \\resumeItemListEnd \n`;
    }

    latex += `  \\resumeSubHeadingListEnd
\\vspace{-16pt}
`;

    return latex;
}

// Generate Projects section
export function generateProjects(projects: Array<{
    name: string;
    url?: string;
    year: string;
    bullets: string[];
}>): string {
    if (!projects || projects.length === 0) return '';

    let latex = `
%-----------PROJECTS-----------
\\section{Projects}
    \\vspace{-5pt}
    \\resumeSubHeadingListStart
`;

    for (const proj of projects) {
        const projectTitle = proj.url
            ? `{\\textbf{${escapeLatex(proj.name)}} - \\href{${proj.url}}{\\textbf{Link}}}`
            : `{\\textbf{${escapeLatex(proj.name)}}}`;

        latex += `
      \\resumeProjectHeading
          {${projectTitle}}{${escapeLatex(proj.year)}}
          \\resumeItemListStart
`;
        for (const bullet of proj.bullets) {
            latex += `            \\resumeItem{${bullet}}\n`;
        }
        latex += `          \\resumeItemListEnd
          \\vspace{-12pt}
`;
    }

    latex += `
    \\resumeSubHeadingListEnd
\\vspace{-5pt}
`;

    return latex;
}

// Generate Research section
export function generateResearch(research: Array<{
    title: string;
    dates: string;
    organization: string;
    location: string;
    bullets: string[];
}>): string {
    if (!research || research.length === 0) return '';

    let latex = `
%-----------RESEARCH PROJECT-----------
\\section{M.Tech Research Project}
\\resumeSubHeadingListStart
`;

    for (const res of research) {
        latex += `  \\resumeSubheading
    {${escapeLatex(res.title)}}{${escapeLatex(res.dates)}}
    {${escapeLatex(res.organization)}}{${escapeLatex(res.location)}}
    \\resumeItemListStart
`;
        for (const bullet of res.bullets) {
            latex += `      \\resumeItem{${bullet}}\n`;
        }
        latex += `    \\resumeItemListEnd
`;
    }

    latex += `\\resumeSubHeadingListEnd
\\vspace{-16pt}
`;

    return latex;
}

// Generate Publications section
export function generatePublications(publications: Array<{
    authors: string;
    title: string;
    venue: string;
    note?: string;
}>): string {
    if (!publications || publications.length === 0) return '';

    let latex = `
%-----------PUBLICATIONS-----------
\\section{Publications}
\\vspace{-2pt}
\\resumeItemListStart
`;

    for (const pub of publications) {
        latex += `  \\resumeItem{
    \\textbf{${escapeLatex(pub.authors)}}, 
    \\textit{${escapeLatex(pub.title)}}, 
    \\textbf{${escapeLatex(pub.venue)}}${pub.note ? ` (${escapeLatex(pub.note)})` : ''}.
  }
`;
    }

    latex += `\\resumeItemListEnd
\\vspace{-10pt}
`;

    return latex;
}

// Generate Achievements section
export function generateAchievements(achievements: Array<{
    title: string;
    description?: string;
}>): string {
    if (!achievements || achievements.length === 0) return '';

    let latex = `
%-----------ACHIEVEMENTS---------------
\\section{Achievements}
\\resumeItemListStart
`;

    for (const ach of achievements) {
        if (ach.description) {
            latex += `  \\resumeItem{\\textbf{${escapeLatex(ach.title)}}: ${escapeLatex(ach.description)}}\n`;
        } else {
            latex += `  \\resumeItem{${escapeLatex(ach.title)}}\n`;
        }
    }

    latex += `\\resumeItemListEnd
`;

    return latex;
}

// Main function to generate complete LaTeX document
export function generateFullLatex(data: {
    contact: any;
    summary?: string;
    education?: any[];
    skills?: any[];
    experience?: any[];
    projects?: any[];
    research?: any[];
    publications?: any[];
    achievements?: any[];
}): string {
    const sections: string[] = [
        LATEX_PREAMBLE,
        generateHeader(data.contact),
        generateSummary(data.summary || ''),
        generateEducation(data.education || []),
        generateSkills(data.skills || []),
        generateExperience(data.experience || []),
        generateProjects(data.projects || []),
        generateResearch(data.research || []),
        generatePublications(data.publications || []),
        generateAchievements(data.achievements || []),
        LATEX_END
    ];

    return sections.filter(s => s.trim()).join('\n');
}
