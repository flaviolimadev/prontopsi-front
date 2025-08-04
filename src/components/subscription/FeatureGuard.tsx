import { ReactNode } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { UpgradeModal } from './UpgradeModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface FeatureGuardProps {
  feature: 'files' | 'reports' | 'whatsapp' | 'priority_support';
  fallback?: ReactNode;
  children: ReactNode;
  featureName?: string;
}

export function FeatureGuard({ feature, fallback, children, featureName }: FeatureGuardProps) {
  const { isFeatureBlocked, subscription } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!isFeatureBlocked(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default blocked UI
  return (
    <>
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-muted/50 rounded-lg border-2 border-dashed border-border">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {featureName || 'Funcionalidade'} Bloqueada
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Esta funcionalidade está disponível nos planos Profissional e Premium. 
          Faça upgrade para desbloquear todos os recursos.
        </p>
        <Button onClick={() => setShowUpgradeModal(true)}>
          Fazer Upgrade
        </Button>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan_type || 'essencial'}
        blockedFeature={featureName}
      />
    </>
  );
}