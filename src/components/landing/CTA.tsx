import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">
            Pare de perder tempo com <span className="bg-gradient-hero bg-clip-text text-transparent">planilhas e papelada</span>.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Comece agora com o plano gratuito. Sem cartão de crédito, sem burocracia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button size="default" className="bg-gradient-hero hover:opacity-90 shadow-glow-primary border-0 px-6 py-3 rounded-lg" asChild>
              <a href="#pricing">
                Testar ProntuPsi grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="default" variant="outline" className="border-primary/30 px-6 py-3 rounded-lg">
              Ver demonstração ao vivo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;


