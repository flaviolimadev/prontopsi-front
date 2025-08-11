
import { useState, useEffect } from "react";
import { ArrowLeft, Check, CreditCard, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { useNavigate, useSearchParams } from "react-router-dom";

const plans = [
  {
    id: "profissional",
    name: "Profissional",
    monthlyPrice: "R$ 59",
    annualPrice: "R$ 47", 
    monthlyValue: 59.00,
    annualValue: 47.00,
    features: [
      "Tudo do Essencial +",
      "Modelos de Documentos",
      "AlertaPsi!",
      "Até 30 pacientes",
      "Suporte via WhatsApp"
    ],
    recommended: true
  },
  {
    id: "premium", 
    name: "Premium",
    monthlyPrice: "R$ 97",
    annualPrice: "R$ 77",
    monthlyValue: 97.00,
    annualValue: 77.00,
    features: [
      "Tudo do Profissional +",
      "Pacientes ilimitados",
      "Acesso a novas funções em 1ª mão", 
      "Prioridade no suporte"
    ],
    recommended: false
  }
];

export default function Checkout() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  
  // Redirect to signup if trying to checkout with essencial plan
  useEffect(() => {
    if (planParam === 'essencial') {
      navigate('/cadastro?plan=essencial');
      return;
    }
  }, [planParam, navigate]);

  const [selectedPlan, setSelectedPlan] = useState(() => {
    // Find plan by URL parameter or default to Profissional (first plan)
    const planFromUrl = plans.find(p => p.id === planParam);
    return planFromUrl || plans[0];
  });
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    email: "",
    cpf: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getCurrentValue = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualValue : plan.monthlyValue;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular processamento de pagamento
    setTimeout(() => {
      toast({
        title: "Pagamento processado!",
        description: `Bem-vindo ao plano ${selectedPlan.name}! Redirecionando...`
      });
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
      
      setIsLoading(false);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleaned;
    }
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D+/g, '');
    const match = cleaned.match(/(\d{0,2})(\d{0,2})/);
    return !match[2] ? match[1] : `${match[1]}/${match[2]}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Logo size="md" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Seleção de Plano */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Escolha seu plano</h1>
              <p className="text-muted-foreground">Selecione o plano ideal para sua prática</p>
            </div>

            {/* Toggle mensal/anual */}
            <div className="flex items-center justify-center gap-4 mb-4 p-4 bg-secondary/30 rounded-2xl border-2 border-primary/20 max-w-md mx-auto">
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

            <div className="space-y-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan.id === plan.id 
                      ? 'ring-2 ring-primary shadow-md' 
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan.id === plan.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedPlan.id === plan.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{plan.name}</h3>
                            {plan.recommended && (
                              <Badge className="text-xs">Recomendado</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {plan.features.slice(0, 2).join(" • ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {getCurrentPrice(plan)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isAnnual ? "/mês (anual)" : "/mês"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recursos do plano selecionado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recursos inclusos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Pagamento */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informações de Pagamento
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Seus dados estão seguros e criptografados
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentForm.email}
                      onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={paymentForm.cpf}
                      onChange={(e) => setPaymentForm({...paymentForm, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({
                        ...paymentForm, 
                        cardNumber: formatCardNumber(e.target.value)
                      })}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value.toUpperCase()})}
                      placeholder="NOME COMO NO CARTÃO"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Validade</Label>
                      <Input
                        id="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={(e) => setPaymentForm({
                          ...paymentForm, 
                          expiryDate: formatExpiryDate(e.target.value)
                        })}
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({
                          ...paymentForm, 
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                        })}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Resumo do pedido */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Plano {selectedPlan.name}</span>
                      <span>{getCurrentPrice(selectedPlan)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        {isAnnual ? 'Cobrança anual recorrente' : 'Cobrança mensal recorrente'}
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="flex justify-between items-center text-sm text-success">
                        <span>Desconto anual (-20%)</span>
                        <span>-R$ {((getCurrentValue(selectedPlan) / 0.8) - getCurrentValue(selectedPlan)).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>
                        {getCurrentPrice(selectedPlan)}{isAnnual ? '/mês (cobrado anualmente)' : '/mês'}
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Finalizar Assinatura
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao finalizar, você concorda com nossos termos de uso e política de privacidade.
                    {isAnnual ? ' Cobrança anual no cartão de crédito.' : ' Cobrança mensal recorrente no cartão de crédito.'}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
