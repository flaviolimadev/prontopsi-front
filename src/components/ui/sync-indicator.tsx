
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncIndicatorProps {
  status: "idle" | "syncing" | "success" | "error";
  message?: string;
  className?: string;
}

export function SyncIndicator({ status, message, className }: SyncIndicatorProps) {
  if (status === "idle") return null;

  const getIcon = () => {
    switch (status) {
      case "syncing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (status) {
      case "syncing":
        return "Sincronizando dados...";
      case "success":
        return "Dados atualizados";
      case "error":
        return "Erro na sincronização";
      default:
        return "";
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-muted-foreground",
      status === "success" && "text-green-600",
      status === "error" && "text-red-600",
      className
    )}>
      {getIcon()}
      <span>{getMessage()}</span>
    </div>
  );
}
