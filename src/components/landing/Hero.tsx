import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Safari } from "@/components/landing/magicui/Safari";
import { AvatarCircles } from "@/components/landing/magicui/AvatarCircles";
import { Confetti, type ConfettiRef } from "@/components/landing/magicui/Confetti";
import { AppStoreBadge, PlayStoreBadge } from "@/components/landing/ui/StoreBadges";
import heroDashboard from "@/assets/dashboard-preview.png";

export const Hero = () => {
  const confettiRef = useRef<ConfettiRef>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 100,
        spread: 70,
        startVelocity: 30,
        gravity: 0.5,
        scalar: 1.2,
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const avatars = [
    { imageUrl: "https://avatars.githubusercontent.com/u/16860528", profileUrl: "https://github.com/dillionverma" },
    { imageUrl: "https://avatars.githubusercontent.com/u/20110627", profileUrl: "https://github.com/tomonarifeehan" },
    { imageUrl: "https://avatars.githubusercontent.com/u/106103625", profileUrl: "https://github.com/BankkRoll" },
    { imageUrl: "https://avatars.githubusercontent.com/u/59228569", profileUrl: "https://github.com/safethecode" },
  ];

  return (
    <section className="pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-card border border-primary/20 rounded-full px-3 py-1.5 mb-6">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium">Bem-vindo(a) ProntuPsi</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="bg-gradient-hero bg-clip-text text-transparent">ProntuPsi</span> — A Evolução da
            <br className="hidden lg:block" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">Gestão Psicológica</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            <span className="text-primary font-semibold">Conecte. Organize. Atenda. Cresça.</span>
            <br />Uma plataforma feita sob medida para psicólogos.
          </p>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-6">
            <div className="flex flex-col items-center gap-3 relative" onMouseEnter={() => confettiRef.current?.fire({})}>
              <AvatarCircles numPeople={99} avatarUrls={avatars} />
              <p className="text-xs text-muted-foreground">
                Mais de <span className="font-semibold text-primary">600+</span> psicólogos já utilizam a ProntuPsi
              </p>
              <Confetti ref={confettiRef} className="absolute inset-0 pointer-events-none z-50" />
            </div>

            <div className="flex gap-2">
              <AppStoreBadge />
              <PlayStoreBadge />
            </div>
          </div>

          <div>
            <Button size="default" className="bg-gradient-hero hover:opacity-90 shadow-glow-primary border-0 px-6 py-3 rounded-lg" asChild>
              <a href="#pricing">
                Começar grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-hero rounded-2xl opacity-20 blur-2xl transform scale-110" />
            <Safari url="prontupsi.com" src={heroDashboard} className="relative" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


