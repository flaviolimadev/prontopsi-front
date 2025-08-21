import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X, Zap, Shield, Sparkles } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

export default function Planos() {
  const navigate = useNavigate();
  const { startTrial, upgradePlan } = useSubscription();
  const [selected, setSelected] = useState<'pro' | 'advanced'>('pro');
  const [trialLockedPlan, setTrialLockedPlan] = useState<null | 'pro' | 'advanced'>(null);

  useEffect(() => {
    const locked = localStorage.getItem('trial_locked_plan') as 'pro' | 'advanced' | null;
    if (locked) {
      setTrialLockedPlan(locked);
      setSelected(locked);
    }
  }, []);

  // Matriz de recursos para renderização e destaque do que não está incluído
  const featureDefs = [
    { key: 'patients', label: 'Pacientes ilimitados' },
    { key: 'reports', label: 'Relatórios' },
    { key: 'whatsapp_view', label: 'Relatórios via WhatsApp' },
    { key: 'whatsapp_scheduling', label: 'Agendamento via WhatsApp' },
    { key: 'ai_assistant', label: 'Agente IA (organiza agenda e relatórios)' },
  ] as const;

  const planMatrix: Record<'pro' | 'advanced', Record<(typeof featureDefs)[number]['key'], boolean>> = {
    pro: {
      patients: true,
      reports: true,
      whatsapp_view: true,
      whatsapp_scheduling: false, // destacar em vermelho
      ai_assistant: false, // destacar em vermelho
    },
    advanced: {
      patients: true,
      reports: true,
      whatsapp_view: true,
      whatsapp_scheduling: true,
      ai_assistant: true,
    },
  };

  const plans = [
    { key: 'pro' as const, name: 'Pro', price: 'R$ 59', period: '/mês' },
    { key: 'advanced' as const, name: 'Advanced', price: 'R$ 97', period: '/mês' },
  ];

  const handleStartTrial = async (plan: 'pro' | 'advanced') => {
    if (trialLockedPlan) return; // já está em teste, não permite novo
    const ok = await startTrial(plan);
    if (ok) {
      localStorage.setItem('trial_locked_plan', plan);
      setTrialLockedPlan(plan);
      navigate('/dashboard');
    }
  };

  const handleSubscribe = async (plan: 'pro' | 'advanced') => {
    // Redireciona ao checkout com plano e valor predefinidos
    const priceMap = { pro: 5900, advanced: 9700 } as const; // em centavos
    navigate(`/checkout?plan=${plan}&amount=${priceMap[plan]}`);
  };

  const handleDowngradeFree = async () => {
    const ok = await upgradePlan('gratuito');
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero minimalista */}
      <div className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border shadow-lg">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs tracking-widest uppercase">Planos ProntuPsi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Escolha o plano ideal para sua clínica</h1>
          <p className="text-slate-300 mb-5">Recursos profissionais, segurança e performance para você focar nos pacientes.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleStartTrial(selected)} variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Clock className="h-4 w-4 mr-2" /> Testar 7 dias grátis
            </Button>
            <Button onClick={() => handleSubscribe(selected)} className="bg-primary text-primary-foreground">
              <Zap className="h-4 w-4 mr-2" /> Assinar {selected === 'pro' ? 'Pro' : 'Advanced'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cards dos planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={`transition-all duration-300 hover:shadow-xl ${selected === plan.key ? 'border-primary shadow-lg' : 'border-slate-200 dark:border-slate-800'} ${plan.key === 'advanced' ? 'ring-1 ring-primary/40' : ''}`}
            onMouseEnter={() => {
              if (!trialLockedPlan || trialLockedPlan === plan.key) setSelected(plan.key);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${plan.key === 'advanced' ? 'text-primary' : 'text-slate-500'}`} />
                  <span className="text-lg font-semibold">{plan.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.key === 'advanced' && (
                    <Badge className="bg-primary text-primary-foreground">Mais completo</Badge>
                  )}
                  <Badge variant="secondary">{plan.price} {plan.period}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {featureDefs.map((feat) => {
                  const included = planMatrix[plan.key][feat.key];
                  const Icon = included ? Check : X;
                  return (
                    <li key={feat.key} className="flex items-center gap-2 text-sm">
                      <Icon className={`h-4 w-4 ${included ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={!included && plan.key === 'pro' ? 'text-red-600 dark:text-red-400' : ''}>{feat.label}{(!included && plan.key === 'pro') ? ' (não incluído)' : ''}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleStartTrial(plan.key)}
                  disabled={!!trialLockedPlan}
                >
                  <Clock className="h-4 w-4 mr-2" />Teste
                </Button>
                <Button onClick={() => handleSubscribe(plan.key)}>Assinar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


