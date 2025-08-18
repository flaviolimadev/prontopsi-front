import GlowingEffectDemo from "@/components/landing/GlowingEffectDemo";

export const Features = () => {
  return (
    <section id="features" className="py-16 bg-gradient-to-b from-transparent to-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            Conecte. Organize. Atenda. <span className="bg-gradient-hero bg-clip-text text-transparent">Cresça.</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">Uma plataforma feita sob medida para psicólogos que querem mais tempo para cuidar de pessoas e menos tempo com burocracias.</p>
        </div>
        <GlowingEffectDemo />
      </div>
    </section>
  );
};

export default Features;


