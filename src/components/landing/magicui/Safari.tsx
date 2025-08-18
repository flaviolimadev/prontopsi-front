import { cn } from "@/lib/utils";

interface SafariProps {
  url?: string;
  className?: string;
  children?: React.ReactNode;
  src?: string;
}

export function Safari({ url = "example.com", className, children, src, ...props }: SafariProps) {
  return (
    <div className="relative">
      <div className={cn("relative mx-auto rounded-2xl border border-primary/20 bg-gradient-card shadow-glow-card", className)} {...props}>
        <div className="flex h-11 items-center justify-start space-x-1 rounded-t-2xl border-b border-primary/10 bg-gradient-card px-3">
          <div className="flex space-x-1">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <div className="mx-auto flex h-6 max-w-xs items-center justify-center rounded-md border border-primary/20 bg-background/50 px-2 text-center text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{url}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-4 w-4 rounded border border-primary/20"></div>
            <div className="h-4 w-4 rounded border border-primary/20"></div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-b-2xl">
          {src ? <img src={src} alt="Website preview" className="w-full h-auto object-cover" /> : children}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none rounded-b-2xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)' }}></div>
    </div>
  );
}

export default Safari;


