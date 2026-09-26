import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/** Aceternity-style 3D tilt card with a cursor-following spotlight glare. */
export function TiltCard({ children, className, intensity = 10, style }: { children: ReactNode; className?: string; intensity?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 220, damping: 20 });
  const sy = useSpring(y, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(sy, [0, 1], [intensity, -intensity]);
  const rotateY = useTransform(sx, [0, 1], [-intensity, intensity]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, color-mix(in oklab, var(--brand) 22%, transparent), transparent 55%)`;

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { x.set(0.5); y.set(0.5); };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.article
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...style }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={cn("group relative h-full transition-shadow hover:shadow-elevated", className)}
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
        <div style={{ transform: "translateZ(30px)" }} className="relative flex h-full flex-col">{children}</div>
      </motion.article>
    </div>
  );
}

/** Spotlight + perspective grid background for heroes. */
export function HeroBackdrop() {
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const bg = useMotionTemplate`radial-gradient(600px circle at ${mx}% ${my}%, color-mix(in oklab, var(--brand) 25%, transparent), transparent 60%)`;
  return (
    <div
      aria-hidden
      className="pointer-events-auto absolute inset-0 -z-10 overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      <motion.div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute inset-x-0 bottom-0 h-[70%] [perspective:600px]">
        <div className="cg-grid absolute inset-0 origin-bottom [transform:rotateX(62deg)]" />
      </div>
      <FloatingGraph />
    </div>
  );
}

const NODES = [
  { x: 8, y: 22, s: 14, d: 0 }, { x: 18, y: 60, s: 10, d: 1.2 }, { x: 86, y: 18, s: 16, d: 0.6 },
  { x: 92, y: 55, s: 11, d: 1.8 }, { x: 76, y: 78, s: 9, d: 0.3 }, { x: 12, y: 85, s: 12, d: 2.1 },
];

function FloatingGraph() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {NODES.slice(1).map((n, i) => (
        <line key={i} x1={NODES[i].x} y1={NODES[i].y} x2={n.x} y2={n.y} stroke="var(--brand)" strokeOpacity={0.18} strokeWidth={0.15} strokeDasharray="1 1" vectorEffect="non-scaling-stroke">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="6s" repeatCount="indefinite" />
        </line>
      ))}
      {NODES.map((n, i) => (
        <motion.circle key={i} cx={n.x} cy={n.y} r={n.s / 14} fill="var(--brand)" fillOpacity={0.55}
          animate={{ cy: [n.y, n.y - 3, n.y] }} transition={{ duration: 5, delay: n.d, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </svg>
  );
}

/** Magnetic hover wrapper for CTAs. */
export function Magnetic({ children }: { children: ReactNode }) {
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  return (
    <motion.span className="inline-block" style={{ x, y }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.3); y.set((e.clientY - r.top - r.height / 2) * 0.3); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.span>
  );
}
