import React, { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'cyan';
}

const glowColorMap = {
    blue: { base: 220, spread: 200 },
    purple: { base: 280, spread: 300 },
    green: { base: 120, spread: 200 },
    red: { base: 0, spread: 200 },
    orange: { base: 30, spread: 200 },
    cyan: { base: 180, spread: 200 }
};

const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
    glowColor = 'blue'
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const syncPointer = (e: PointerEvent) => {
            const { clientX: x, clientY: y } = e;

            if (cardRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                const relX = x - rect.left;
                const relY = y - rect.top;
                cardRef.current.style.setProperty('--spotlight-x', `${relX}px`);
                cardRef.current.style.setProperty('--spotlight-y', `${relY}px`);
            }
        };

        document.addEventListener('pointermove', syncPointer);
        return () => document.removeEventListener('pointermove', syncPointer);
    }, []);

    const { base, spread } = glowColorMap[glowColor];

    return (
        <div
            ref={cardRef}
            className={cn(
                "relative overflow-hidden rounded-xl transition-all duration-300",
                "before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity before:duration-500",
                "before:bg-[radial-gradient(600px_circle_at_var(--spotlight-x)_var(--spotlight-y),rgba(var(--spotlight-color),0.15),transparent_40%)]",
                "hover:before:opacity-100",
                "after:absolute after:inset-0 after:z-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-500",
                "after:bg-[radial-gradient(400px_circle_at_var(--spotlight-x)_var(--spotlight-y),rgba(var(--spotlight-color),0.3),transparent_40%)]",
                "after:blur-xl hover:after:opacity-60",
                className
            )}
            style={{
                '--spotlight-color': glowColor === 'blue' ? '59, 130, 246' :
                    glowColor === 'purple' ? '168, 85, 247' :
                        glowColor === 'green' ? '34, 197, 94' :
                            glowColor === 'red' ? '239, 68, 68' :
                                glowColor === 'cyan' ? '6, 182, 212' :
                                    '249, 115, 22', // orange
            } as React.CSSProperties}
        >
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

// Also export GlowCard as alias for compatibility
const GlowCard = SpotlightCard;

export { SpotlightCard, GlowCard };
