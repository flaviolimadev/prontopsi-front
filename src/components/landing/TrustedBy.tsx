import { BeforeAfterSlider } from "@/components/landing/BeforeAfterSlider";
import beforeDashboard from "@/assets/dashboard-preview.png";
import afterDashboard from "@/assets/dashboard-preview.png";

export const TrustedBy = () => {
  return (
    <section className="py-12 border-b border-border/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Por que escolher o ProntuPsi</p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mt-2 mb-4">
            Antes vs <span className="bg-gradient-hero bg-clip-text text-transparent">Depois da ProntuPsi</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">De planilhas confusas a uma gestão 100% inteligente.</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <BeforeAfterSlider beforeImage={beforeDashboard} afterImage={afterDashboard} />
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;


