"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Award } from "lucide-react";

export interface FloatingXPItem {
    id: string;
    amount: number;
    label?: string;
}

// Global tetikleme yardımcısı - uygulamanın herhangi bir yerinden çağrılabilir
export function triggerFloatingXP(amount: number, label?: string) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("quizwise_floating_xp", {
                detail: { amount, label },
            })
        );
    }
}

export default function FloatingXP() {
    const [items, setItems] = useState<FloatingXPItem[]>([]);

    useEffect(() => {
        const handleXpEvent = (e: Event) => {
            const customEvent = e as CustomEvent<{ amount: number; label?: string }>;
            if (!customEvent.detail || !customEvent.detail.amount) return;

            const newItem: FloatingXPItem = {
                id: `${Date.now()}-${Math.random()}`,
                amount: customEvent.detail.amount,
                label: customEvent.detail.label,
            };

            setItems((prev) => [...prev, newItem]);

            // 1.9 saniye sonra listeden temizle
            setTimeout(() => {
                setItems((prev) => prev.filter((item) => item.id !== newItem.id));
            }, 1900);
        };

        window.addEventListener("quizwise_floating_xp", handleXpEvent);
        return () => window.removeEventListener("quizwise_floating_xp", handleXpEvent);
    }, []);

    if (items.length === 0) return null;

    return (
        <aside
            aria-label="Kazanılan XP Bildirimleri"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex flex-col items-center space-y-2.5"
        >
            <style>{`
                @keyframes floatUpFade {
                    0% {
                        opacity: 0;
                        transform: translateY(12px) scale(0.85);
                        filter: brightness(1.2);
                    }
                    15% {
                        opacity: 1;
                        transform: translateY(0) scale(1.12);
                    }
                    70% {
                        opacity: 0.95;
                        transform: translateY(-38px) scale(1.02);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-65px) scale(0.9);
                    }
                }
                .floating-xp-bubble {
                    animation: floatUpFade 1.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {items.map((item) => (
                <div
                    key={item.id}
                    className="floating-xp-bubble select-none flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-amber-400 text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.45)] backdrop-blur-md"
                >
                    <div className="p-1 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight drop-shadow-md">
                            +{item.amount} XP!
                        </span>
                        {item.label && (
                            <span className="text-[10px] font-bold text-amber-200/80 uppercase tracking-wider mt-0.5">
                                {item.label}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </aside>
    );
}
