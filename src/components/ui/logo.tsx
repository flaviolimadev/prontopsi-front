import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };
  const sizeClasses = {
    sm: "h-7",
    md: "h-9", 
    lg: "h-11",
    xl: "h-14 md:h-16"
  };

  return (
    <div 
      className={cn("flex items-center font-loretto font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity", className)}
      onClick={handleClick}
    >
      <img 
        src="/lovable-uploads/22f02146-b67a-40cb-be21-3a583e79a68e.png" 
        alt="ProntuPsi Logo" 
        className={cn("object-contain", sizeClasses[size])}
      />
    </div>
  );
}