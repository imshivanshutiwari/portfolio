"use client";

import { Box, Lock, Search, Settings, Sparkles, Brain, Shield, Cpu, Target, Zap, Eye, Code, Rocket, Database, Bot, BrainCircuit, Globe, Server, Cloud, Fingerprint, LucideIcon } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { useProfileContent, ProfileContentItem } from "@/hooks/usePortfolioData";

// Icon mapping from string names to components
const iconMap: Record<string, LucideIcon> = {
    Brain, Shield, Lock, Cpu, Sparkles, Target, Zap, Eye, Code, Rocket,
    Database, Bot, BrainCircuit, Globe, Server, Cloud, Box, Search, Settings, Fingerprint
};

// Default competencies if database is empty
const defaultCompetencies = [
    { title: "Artificial Intelligence", description: "Building intelligent systems that learn and adapt to complex defense scenarios.", icon_name: "Brain" },
    { title: "Defense Innovation", description: "Pioneering secure solutions for national defense and critical infrastructure.", icon_name: "Shield" },
    { title: "Secure Systems", description: "Developing robust, encrypted systems that protect sensitive data and operations.", icon_name: "Lock" },
    { title: "Embedded AI", description: "Creating AI solutions that run efficiently on edge devices and embedded systems.", icon_name: "Cpu" },
    { title: "Future Technologies", description: "Researching next-generation technologies for autonomous and intelligent systems.", icon_name: "Sparkles" },
];

// Grid areas for different number of items
const getGridArea = (index: number, total: number): string => {
    // For 5 items - original layout
    if (total === 5) {
        const areas = [
            "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
            "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
            "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
            "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
            "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
        ];
        return areas[index] || areas[0];
    }
    // For 6 items
    if (total === 6) {
        const areas = [
            "md:[grid-area:1/1/2/5] xl:[grid-area:1/1/2/5]",
            "md:[grid-area:1/5/2/9] xl:[grid-area:1/5/2/9]",
            "md:[grid-area:1/9/2/13] xl:[grid-area:1/9/2/13]",
            "md:[grid-area:2/1/3/5] xl:[grid-area:2/1/3/5]",
            "md:[grid-area:2/5/3/9] xl:[grid-area:2/5/3/9]",
            "md:[grid-area:2/9/3/13] xl:[grid-area:2/9/3/13]",
        ];
        return areas[index] || areas[0];
    }
    // For 4 items
    if (total === 4) {
        const areas = [
            "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/7]",
            "md:[grid-area:1/7/2/13] xl:[grid-area:1/7/2/13]",
            "md:[grid-area:2/1/3/7] xl:[grid-area:2/1/3/7]",
            "md:[grid-area:2/7/3/13] xl:[grid-area:2/7/3/13]",
        ];
        return areas[index] || areas[0];
    }
    // For 3 items
    if (total === 3) {
        const areas = [
            "md:[grid-area:1/1/2/5] xl:[grid-area:1/1/2/5]",
            "md:[grid-area:1/5/2/9] xl:[grid-area:1/5/2/9]",
            "md:[grid-area:1/9/2/13] xl:[grid-area:1/9/2/13]",
        ];
        return areas[index] || areas[0];
    }
    // Default fallback - equal columns
    return `md:[grid-area:auto] xl:[grid-area:auto]`;
};

export function GlowingEffectDemo() {
    const { data: competencies = [], isLoading } = useProfileContent('core_competency');

    // Use database items or fallback to defaults
    const items = competencies.length > 0 ? competencies : defaultCompetencies.map((c, i) => ({
        ...c,
        id: `default-${i}`,
        section_type: 'core_competency',
        subtitle: null,
        content: c.description,
        date_start: null,
        date_end: null,
        location: null,
        organization: null,
        url: null,
        tags: [],
        display_order: i,
        is_visible: true,
        metadata: {}
    } as ProfileContentItem));

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="min-h-[14rem] rounded-xl bg-muted/50 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            {items.map((item, index) => {
                const IconComponent = iconMap[item.icon_name || 'Sparkles'] || Sparkles;
                return (
                    <GridItem
                        key={item.id}
                        area={getGridArea(index, items.length)}
                        icon={<IconComponent className="h-4 w-4" />}
                        title={item.title}
                        description={item.content || item.subtitle || ''}
                    />
                );
            })}
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                                {title}
                            </h3>
                            <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

export { GridItem };
