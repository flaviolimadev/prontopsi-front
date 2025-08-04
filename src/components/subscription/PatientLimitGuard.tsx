import { ReactNode, useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { UpgradeModal } from './UpgradeModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientLimitGuardProps {
  children: ReactNode;
  currentPatientCount: number;
  action?: 'add' | 'view';
}

export function PatientLimitGuard({ children, currentPatientCount, action = 'view' }: PatientLimitGuardProps) {
  const { subscription, canAddPatient } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!subscription) return <>{children}</>;

  const canAdd = canAddPatient(currentPatientCount);
  const isAtLimit = subscription.patient_limit !== null && currentPatientCount >= subscription.patient_limit;
  const isNearLimit = subscription.patient_limit !== null && currentPatientCount >= subscription.patient_limit - 2;

  // Show warning when near limit but allow viewing
  if (action === 'view' && isNearLimit && !isAtLimit) {
    return (
      <>
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <Crown className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Você está próximo do limite de {subscription.patient_limit} pacientes ({currentPatientCount}/{subscription.patient_limit}).
            </span>
            <Button
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
              className="ml-2"
            >
              Fazer Upgrade
            </Button>
          </AlertDescription>
        </Alert>
        {children}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={subscription.plan_type}
        />
      </>
    );
  }

  // Block adding new patients if at limit
  if (action === 'add' && !canAdd) {
    return (
      <>
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <Users className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Você atingiu o limite de {subscription.patient_limit} pacientes do plano {subscription.plan_type}.
              Para adicionar mais pacientes, faça upgrade do seu plano.
            </span>
            <Button
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
            >
              Fazer Upgrade
            </Button>
          </AlertDescription>
        </Alert>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={subscription.plan_type}
        />
      </>
    );
  }

  return (
    <>
      {children}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription.plan_type}
      />
    </>
  );
}