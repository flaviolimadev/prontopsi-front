import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'essencial' | 'profissional' | 'premium';
  blockedFeature?: string;
}

export function UpgradeModal({ isOpen, onClose, currentPlan, blockedFeature }: UpgradeModalProps) {
  const navigate = useNavigate();

  // Apenas planos pagos - sem o plano gratuito
  const plans = [
    {
      name: 'Profissional',
      price: 'R$ 59',
      period: '/mês',
      popular: true,
      features: [
        'Tudo do Essencial +',
        'Modelos de Documentos',
        'AlertaPsi!',
        'Até 30 pacientes',
        'Suporte via WhatsApp'
      ]
    },
    {
      name: 'Premium',
      price: 'R$ 97',
      period: '/mês',
      features: [
        'Tudo do Profissional +',
        'Pacientes ilimitados',
        'Acesso a novas funções em 1ª mão',
        'Prioridade no suporte'
      ]
    }
  ];

  const handleUpgrade = (planType: string) => {
    navigate(`/checkout?plan=${planType.toLowerCase()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {blockedFeature ? `Funcionalidade ${blockedFeature} não disponível` : 'Faça upgrade do seu plano'}
          </DialogTitle>
          {blockedFeature && (
            <p className="text-center text-muted-foreground">
              Esta funcionalidade está disponível nos planos Profissional e Premium
            </p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border rounded-lg p-6 ${
                plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full mt-6"
                onClick={() => handleUpgrade(plan.name)}
                variant={plan.name.toLowerCase() === currentPlan ? "outline" : "default"}
                disabled={plan.name.toLowerCase() === currentPlan}
              >
                {plan.name.toLowerCase() === currentPlan ? 'Plano Atual' : 'Assinar Agora'}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}