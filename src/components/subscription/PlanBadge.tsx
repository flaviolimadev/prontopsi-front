
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Crown, Shield, Star } from 'lucide-react';

export function PlanBadge() {
  const { subscription, loading } = useSubscription();

  if (loading || !subscription) return null;

  const getPlanConfig = () => {
    switch (subscription.plan_type) {
      case 'essencial':
        return {
          label: 'Essencial',
          icon: Shield,
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        };
      case 'profissional':
        return {
          label: 'Profissional',
          icon: Star,
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: Crown,
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
        };
      default:
        return {
          label: 'Teste',
          icon: Shield,
          variant: 'outline' as const,
          className: ''
        };
    }
  };

  const config = getPlanConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
      {subscription.status === 'trial' && ' (Teste)'}
    </Badge>
  );
}
