import { Button } from "@/components/ui/button";
import { Sparkles, Check, Star, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Pricing = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      description: "Ideal para começar",
      features: ["Agenda", "Prontuário", "Financeiro", "Até 5 pacientes"],
      popular: false,
      free: true,
      accent: "from-gray-500/10 to-gray-400/10",
    },
    {
      name: "Pro",
      price: "R$ 59",
      description: "Para evoluir na prática",
      features: ["Tudo do Gratuito +", "Modelos de Documentos", "AlertaPsi!", "WhatsApp"],
      popular: true,
      accent: "from-primary/15 to-purple-500/15",
    },
    {
      name: "Advanced",
      price: "R$ 97",
      description: "Para escalar",
      features: ["Tudo do Pro +", "Pacientes ilimitados", "Novas funções primeiro", "Suporte prioritário"],
      popular: false,
      accent: "from-primary/10 to-accent/10",
    },
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 w-[36rem] h-[36rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-card border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Planos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Escolha o plano certo para <span className="bg-gradient-hero bg-clip-text text-transparent">você</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Gift className="w-4 h-4 text-primary" />
            <span>Experimente grátis por 7 dias os planos Pro e Advanced.</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm ${
                plan.popular
                  ? 'border-primary/30 shadow-glow-primary scale-[1.02]'
                  : 'border-primary/10 hover:shadow-glow-card'
              }`}
            >
              {/* soft gradient background */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.accent} opacity-30`} />

              {/* Ribbon */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center space-x-1 bg-gradient-hero px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md">
                    <Sparkles className="w-3 h-3" />
                    <span>Mais Popular</span>
                  </div>
                </div>
              )}

              <div className="relative z-10 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-heading font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground ml-2 text-sm">/mês</span>
                  </div>
                  <p className="text-sm text-foreground/80">{plan.description}</p>
                </div>

                <Button
                  className={`w-full mb-5 text-sm rounded-2xl shadow-md ${
                    plan.popular 
                      ? 'bg-gradient-hero hover:opacity-90 shadow-glow-primary border-0' 
                      : 'bg-primary/85 text-primary-foreground hover:bg-primary'
                  }`}
                  onClick={() => navigate('/planos')}
                >
                  Testar 7 dias
                </Button>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;


