import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarUrl } from "@/utils/avatarUtils";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export const UserAvatar = ({ size = "md", showName = false, className }: UserAvatarProps) => {
  const { profile, loading } = useProfile();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };



  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-muted rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={getAvatarUrl(profile?.avatar || profile?.avatar_url)} 
          className="object-cover"
        />
        <AvatarFallback>
          <User className="w-1/2 h-1/2" />
        </AvatarFallback>
      </Avatar>
      {showName && profile?.full_name && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {(() => {
              const nameParts = profile.full_name.split(' ');
              return nameParts.length > 1 
                ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
                : nameParts[0];
            })()}
          </span>
          {profile.bio && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {profile.bio}
            </span>
          )}
        </div>
      )}
    </div>
  );
};