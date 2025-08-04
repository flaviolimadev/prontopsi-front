import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Essencial",
      price: "0",
      originalPrice: null,
      description: "Ideal para quem está começando",
      features: [
        "Agenda Inteligente",
        "Controle Financeiro",
        "Até 5 pacientes",
        "Suporte por e-mail"
      ],
      highlight: false,
      isFree: true
    },
    {
      name: "Profissional",
      price: isAnnual ? "47" : "59",
      originalPrice: isAnnual ? "59" : null,
      description: "Mais vendido",
      features: [
        "Tudo do Essencial +",
        "Modelos de Documentos",
        "AlertaPsi!",
        "Até 30 pacientes",
        "Suporte via WhatsApp"
      ],
      highlight: true
    },
    {
      name: "Premium",
      price: isAnnual ? "77" : "97",
      originalPrice: isAnnual ? "97" : null,
      description: "Para consultórios em crescimento",
      features: [
        "Tudo do Profissional +",
        "Pacientes ilimitados",
        "Acesso a novas funções em 1ª mão",
        "Prioridade no suporte"
      ],
      highlight: false
    }
  ];

  return (
    <section id="planos" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Planos Flexíveis
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Invista no <span className="text-primary">futuro</span> da sua prática
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            <strong className="text-foreground">Todos os planos incluem:</strong> agendamento, prontuários seguros, controle financeiro, 
            relatórios avançados, suporte humanizado e atualizações gratuitas.
          </p>
          
          {/* Toggle mensal/anual */}
          <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-secondary/30 rounded-2xl border-2 border-primary/20 max-w-md mx-auto">
            <span className={`text-base font-semibold ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
                isAnnual ? 'bg-primary shadow-lg' : 'bg-muted border border-border'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-background shadow-md transition-transform duration-300 ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-base font-semibold ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Anual
              </span>
              <Badge variant="default" className="bg-success text-success-foreground px-3 py-1 text-sm font-bold">
                🎟️ -20%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl rounded-3xl backdrop-blur-sm group ${plan.highlight ? 'ring-2 ring-primary shadow-xl scale-105' : 'hover:border-primary/30'}`}>
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-2xl">
                  <Star className="h-3 w-3 mr-1" />
                  Mais vendido
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm mb-4">{plan.description}</CardDescription>
                <div className="flex items-center justify-center gap-2">
                  {plan.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {plan.originalPrice}
                    </span>
                  )}
                  <div className="text-4xl font-bold text-primary">
                    {plan.isFree ? 'Grátis' : `R$ ${plan.price}`}
                    {!plan.isFree && <span className="text-lg text-muted-foreground">/mês</span>}
                  </div>
                </div>
                {isAnnual && !plan.isFree && plan.originalPrice && (
                  <p className="text-sm text-success">
                    Você economiza R$ {(parseInt(plan.originalPrice!) - parseInt(plan.price)) * 12}/ano
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                 <div className="space-y-3 pt-4">
                  {plan.isFree ? (
                    <Button 
                      className="w-full rounded-2xl transition-all duration-300 hover:scale-105"
                      variant="outline"
                      onClick={() => navigate('/cadastro?plan=essencial')}
                    >
                      Começar Grátis
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        className="w-full rounded-2xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90 shadow-lg"
                        variant="default"
                        onClick={() => navigate(`/cadastro?plan=${plan.name.toLowerCase()}&trial=true`)}
                      >
                        Testar 7 Dias Grátis
                      </Button>
                      <Button 
                        className="w-full rounded-2xl transition-all duration-300 hover:scale-105"
                        variant="outline"
                        onClick={() => navigate(`/checkout?plan=${plan.name.toLowerCase()}`)}
                      >
                        {isAnnual ? 'Assinar Plano Anual' : 'Assinar Agora'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
