import { cn } from "@/lib/utils";

interface Avatar {
  imageUrl: string;
  profileUrl: string;
}

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[];
}

export const AvatarCircles = ({ numPeople, className, avatarUrls }: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((avatar, index) => (
        <a key={index} href={avatar.profileUrl} target="_blank" rel="noopener noreferrer" className="relative inline-block">
          <img
            className="h-10 w-10 rounded-full border-2 border-background ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200 hover:scale-110"
            src={avatar.imageUrl}
            alt={`Avatar ${index + 1}`}
          />
        </a>
      ))}
      <a className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-gradient-card ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200 hover:scale-110" href="#">
        <span className="text-xs font-medium text-foreground">+{numPeople}</span>
      </a>
    </div>
  );
};

export default AvatarCircles;


