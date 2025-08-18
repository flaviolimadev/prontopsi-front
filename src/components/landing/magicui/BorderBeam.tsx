import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const BorderBeam = ({ className, size = 200, duration = 15, delay = 0, colorFrom = "hsl(var(--primary))", colorTo = "transparent", ...props }: BorderBeamProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [background:linear-gradient(var(--direction,0deg),var(--color-from),var(--color-to),var(--color-from))_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]",
        "[mask-composite:xor] [background-size:300%] animate-spin",
        className
      )}
      style={{
        "--color-from": colorFrom,
        "--color-to": colorTo,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      } as React.CSSProperties & { [key: string]: string }}
      {...props}
    >
      <div className="absolute inset-0 rounded-[inherit]" style={{ background: `conic-gradient(from 0deg, transparent, ${colorFrom}, transparent)`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }} />
    </div>
  );
};

export default BorderBeam;


