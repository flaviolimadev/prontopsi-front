import { forwardRef, useImperativeHandle, useRef } from "react";

export interface ConfettiRef {
  fire: (opts?: ConfettiOptions) => void;
}

interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  x?: number;
  y?: number;
  shapes?: string[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
  colors?: string[];
}

interface ConfettiProps {
  className?: string;
  onMouseEnter?: () => void;
}

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(({ className, onMouseEnter }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);
  const particles = useRef<any[]>([]);

  useImperativeHandle(ref, () => ({
    fire: (opts: ConfettiOptions = {}) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.offsetWidth || 400;
      canvas.height = canvas.offsetHeight || 300;

      const { particleCount = 50, angle = 90, spread = 45, startVelocity = 45, decay = 0.9, gravity = 1, colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"] } = opts;

      for (let i = 0; i < particleCount; i++) {
        particles.current.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          angle: angle + (Math.random() - 0.5) * spread,
          velocity: startVelocity * (0.75 + Math.random() * 0.25),
          gravity: gravity,
          decay: decay,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 2,
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.current = particles.current.filter((particle) => {
          particle.x += Math.cos((particle.angle * Math.PI) / 180) * particle.velocity;
          particle.y += Math.sin((particle.angle * Math.PI) / 180) * particle.velocity + particle.gravity;
          particle.velocity *= particle.decay;
          particle.life -= 0.02;

          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
          ctx.restore();

          return particle.life > 0;
        });

        if (particles.current.length > 0) {
          animationId.current = requestAnimationFrame(animate);
        }
      };

      animate();
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseEnter={onMouseEnter}
      style={{ pointerEvents: onMouseEnter ? "auto" : "none", zIndex: 9999, position: "absolute" }}
    />
  );
});

Confetti.displayName = "Confetti";

export default Confetti;


