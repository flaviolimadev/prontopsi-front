import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/landing/ui/GlowingEffect";

export default function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]" icon={<Box className="h-5 w-5 text-primary" />} title="Agenda inteligente" description="Agende, reagende e receba lembretes automáticos para nunca mais esquecer uma sessão." />
      <GridItem area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]" icon={<Settings className="h-5 w-5 text-primary" />} title="Gestão completa em um só lugar" description="Tenha prontuários, agendamentos, pagamentos e relatórios centralizados e organizados." />
      <GridItem area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]" icon={<Lock className="h-5 w-5 text-primary" />} title="Segurança em primeiro lugar" description="Armazenamento criptografado, com backups automáticos e conformidade com o CFP e LGPD." />
      <GridItem area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]" icon={<Sparkles className="h-5 w-5 text-primary" />} title="Documentos com 1 clique" description="Gere recibos, contratos, termos e relatórios profissionais com poucos cliques." />
      <GridItem area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]" icon={<Search className="h-5 w-5 text-primary" />} title="Prontuário completo e intuitivo" description="Registre sessões, evoluções, objetivos e observações de forma prática e segura." />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-primary/20 bg-background/40 backdrop-blur-xl p-2 md:rounded-3xl md:p-3">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-gradient-to-br from-background/60 to-background/20 backdrop-blur-sm border border-primary/10">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-primary/30 bg-primary/10 backdrop-blur-sm p-3">{icon}</div>
            <div className="space-y-3">
              <h3 className="font-heading text-xl font-bold text-foreground/90 md:text-2xl">{title}</h3>
              <p className="text-sm text-muted-foreground/80 md:text-base leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};


