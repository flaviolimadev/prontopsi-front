import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

export default function Planos() {
  const navigate = useNavigate();
  const { subscription, startTrial, upgradePlan } = useSubscription();
  const [selected, setSelected] = useState<'pro' | 'advanced'>('pro');

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
    const ok = await startTrial(plan);
    if (ok) navigate('/dashboard');
  };

  const handleSubscribe = async (plan: 'pro' | 'advanced') => {
    const ok = await upgradePlan(plan);
    if (ok) navigate('/dashboard');
  };

  const handleDowngradeFree = async () => {
    const ok = await upgradePlan('gratuito');
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hero/CTA */}
      <div className="relative overflow-hidden rounded-2xl p-8 md:p-10 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Evolua seu atendimento com um plano profissional</h1>
          <p className="text-muted-foreground mb-4">Compare recursos, faça um teste de 7 dias sem compromisso ou assine agora e desbloqueie todo o potencial do sistema.</p>
          <div className="flex gap-2">
            <Button onClick={() => handleStartTrial(selected)} variant="outline">
              <Clock className="h-4 w-4 mr-2" /> Testar 7 dias
            </Button>
            <Button onClick={() => handleSubscribe(selected)}>
              Assinar {selected === 'pro' ? 'Pro' : 'Advanced'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={`transition-all ${selected === plan.key ? 'border-primary shadow-lg' : ''} ${plan.key === 'advanced' ? 'ring-1 ring-primary/50' : ''}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <div className="flex items-center gap-2">
                  {plan.key === 'advanced' && (
                    <Badge className="bg-primary text-primary-foreground">Mais completo</Badge>
                  )}
                  <Badge>{plan.price} {plan.period}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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

              <div className="flex gap-2 pt-2">
                <Button variant={selected === plan.key ? 'default' : 'outline'} className="flex-1" onClick={() => setSelected(plan.key)}>
                  Selecionar
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleStartTrial(plan.key)}>
                  <Clock className="h-4 w-4 mr-2" /> Teste 7 dias
                </Button>
                <Button className="flex-1" onClick={() => handleSubscribe(plan.key)}>Assinar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ação: voltar para o plano gratuito */}
      <div className="text-center">
        <Button variant="outline" onClick={handleDowngradeFree}>
          Voltar para plano Gratuito
        </Button>
      </div>

      {/* Comparativo com o plano atual */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativo com seu plano atual</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg border">
              <div className="font-semibold mb-2">Seu plano atual</div>
              <div className="mb-3"><Badge variant="secondary" className="capitalize">{subscription.plan_type}</Badge></div>
              <ul className="space-y-1">
                {featureDefs.map((f) => {
                  const has = (subscription.features as any)[f.key];
                  const Icon = has ? Check : X;
                  return (
                    <li key={`cur-${f.key}`} className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${has ? 'text-green-500' : 'text-red-500'}`} />
                      <span>{f.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {(['pro','advanced'] as const).map((p) => (
              <div key={`cmp-${p}`} className="p-4 rounded-lg border">
                <div className="font-semibold mb-2">Plano {p === 'pro' ? 'Pro' : 'Advanced'}</div>
                <div className="mb-3"><Badge>{p === 'pro' ? 'R$ 59/mês' : 'R$ 97/mês'}</Badge></div>
                <ul className="space-y-1">
                  {featureDefs.map((f) => {
                    const has = planMatrix[p][f.key];
                    const Icon = has ? Check : X;
                    return (
                      <li key={`plan-${p}-${f.key}`} className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${has ? 'text-green-500' : 'text-red-500'}`} />
                        <span>{f.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" onClick={() => handleStartTrial(p)}>
                    <Clock className="h-4 w-4 mr-2" /> Testar 7 dias
                  </Button>
                  <Button onClick={() => handleSubscribe(p)}>Assinar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


