"use client";

import { useEffect, useRef, useState } from "react";

type HeroLogoLiveProps = {
  src: string;
  alt: string;
};

type HammerId = "h1" | "h2" | "h3" | "h4" | "h5";

const HAMMER_SEQUENCE: Array<{ at: number; hammers: HammerId[] }> = [
  { at: 700, hammers: ["h1", "h2"] },
  { at: 1900, hammers: ["h1", "h3", "h4"] },
  { at: 3400, hammers: ["h1", "h2", "h3", "h4", "h5"] },
];

const HAMMER_PARTICLE_ORIGIN: Record<HammerId, { x: number; y: number }> = {
  h1: { x: 18, y: 35 },
  h2: { x: 82, y: 35 },
  h3: { x: 20, y: 71 },
  h4: { x: 80, y: 71 },
  h5: { x: 50, y: 20 },
};

export function HeroLogoLive({ src, alt }: HeroLogoLiveProps) {
  const tiltRef = useRef<HTMLButtonElement>(null);
  const particleLayerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [impactActive, setImpactActive] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;

      if (tiltRef.current) {
        const rx = -current.current.y * 7;
        const ry = current.current.x * 9;
        tiltRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const LOOP_MS = 5600;
    const timeoutIds: number[] = [];
    let loopInterval: number | null = null;
    let impactOffTimeout: number | null = null;

    const emitParticlesForHammers = (hammers: HammerId[]) => {
      const layer = particleLayerRef.current;
      if (!layer) return;

      hammers.forEach((hammer) => {
        const origin = HAMMER_PARTICLE_ORIGIN[hammer];
        const count = 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < count; i++) {
          const particle = document.createElement("i");
          particle.className = "hero-impact-particle";

          const originX = origin.x + (Math.random() - 0.5) * 6;
          const originY = origin.y + (Math.random() - 0.5) * 4;
          const driftX = (Math.random() - 0.5) * 30;
          const driftY = -(12 + Math.random() * 20);
          const life = 360 + Math.random() * 260;
          const width = 2 + Math.random() * 4;
          const height = 1.5 + Math.random() * 2;
          const alpha = 0.2 + Math.random() * 0.22;
          const rotate = -36 + Math.random() * 72;
          const spin = -68 + Math.random() * 136;

          particle.style.setProperty("--x", `${originX.toFixed(2)}%`);
          particle.style.setProperty("--y", `${originY.toFixed(2)}%`);
          particle.style.setProperty("--dx", `${driftX.toFixed(2)}px`);
          particle.style.setProperty("--dy", `${driftY.toFixed(2)}px`);
          particle.style.setProperty("--life", `${life.toFixed(0)}ms`);
          particle.style.setProperty("--w", `${width.toFixed(2)}px`);
          particle.style.setProperty("--h", `${height.toFixed(2)}px`);
          particle.style.setProperty("--alpha", `${alpha.toFixed(2)}`);
          particle.style.setProperty("--r", `${rotate.toFixed(2)}deg`);
          particle.style.setProperty("--spin", `${spin.toFixed(2)}deg`);
          particle.style.setProperty("--tone", i % 2 === 0 ? "218,172,104" : "172,182,194");

          layer.appendChild(particle);
          particle.addEventListener("animationend", () => particle.remove(), { once: true });
        }
      });
    };

    const triggerImpact = (hammers: HammerId[]) => {
      setImpactActive(true);
      emitParticlesForHammers(hammers);

      if (impactOffTimeout) window.clearTimeout(impactOffTimeout);
      impactOffTimeout = window.setTimeout(() => setImpactActive(false), 260);
    };

    const runCycle = () => {
      HAMMER_SEQUENCE.forEach((stage) => {
        const timeout = window.setTimeout(() => triggerImpact(stage.hammers), stage.at);
        timeoutIds.push(timeout);
      });

      const cleanupTimeout = window.setTimeout(() => {
        setImpactActive(false);
      }, LOOP_MS - 280);
      timeoutIds.push(cleanupTimeout);
    };

    runCycle();
    loopInterval = window.setInterval(runCycle, LOOP_MS);

    return () => {
      timeoutIds.forEach((timeout) => window.clearTimeout(timeout));
      if (loopInterval) window.clearInterval(loopInterval);
      if (impactOffTimeout) window.clearTimeout(impactOffTimeout);
      setImpactActive(false);
    };
  }, []);

  return (
    <>
      <button
        ref={tiltRef}
        type="button"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          target.current = { x, y };
        }}
        onPointerLeave={() => {
          target.current = { x: 0, y: 0 };
        }}
        onClick={() => setOpen(true)}
        className={`hero-logo-live relative z-[2] w-full max-w-[360px] cursor-zoom-in bg-transparent ${
          impactActive ? "hero-logo-impact" : ""
        }`}
        aria-label="Preview logo"
      >
        <span ref={particleLayerRef} className="hero-impact-particles" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="hero-logo-float h-auto w-full object-contain" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-5xl rounded-2xl border border-white/10 bg-brand-navy/70 p-4 shadow-soft backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-h-[82vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
