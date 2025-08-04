
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown, X } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

export function TrialBanner() {
  const { subscription, isOnTrial } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isOnTrial() || !subscription || isDismissed) {
    return null;
  }

  const daysRemaining = subscription.trial_days_remaining;
  const isLastDay = daysRemaining <= 1;
  const isUrgent = daysRemaining <= 3;

  return (
    <>
      <Card className={`p-4 mb-6 border-l-4 ${
        isUrgent ? 'border-l-destructive bg-destructive/5' : 'border-l-primary bg-primary/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              isUrgent ? 'bg-destructive/10' : 'bg-primary/10'
            }`}>
              {isUrgent ? (
                <Clock className={`h-5 w-5 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
              ) : (
                <Crown className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">
                  {isLastDay ? 'Último dia do seu teste!' : `${daysRemaining} dias restantes`}
                </h3>
                <Badge variant={subscription.plan_type === 'premium' ? 'default' : 'secondary'}>
                  Teste {subscription.plan_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isLastDay 
                  ? 'Seu teste expira hoje. Assine agora para continuar com todos os recursos!'
                  : `Aproveite todos os recursos do plano ${subscription.plan_type} por mais ${daysRemaining} dias.`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              variant={isUrgent ? 'default' : 'outline'}
              size="sm"
            >
              {isLastDay ? 'Assinar Agora' : 'Converter Teste'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription.plan_type}
        blockedFeature="Teste expirado"
      />
    </>
  );
}
