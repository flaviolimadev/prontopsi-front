
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CreditCard, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { usePagamentos } from '@/hooks/usePagamentos';
import { useFinancialVisibility } from '@/contexts/FinancialVisibilityContext';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: "up" | "down";
  isAlert?: boolean;
}

function StatCard({ title, value, description, icon: Icon, trend, trendDirection, isAlert }: StatCardProps) {
  return (
    <Card className={`group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50 ${isAlert ? 'border-l-4 border-l-destructive' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {title}
          {trend && (
            <Badge 
              variant={trendDirection === "up" ? "default" : "destructive"}
              className="ml-auto text-xs"
            >
              {trendDirection === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trend}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const { patients = [] } = usePatients();
  const { appointments = [] } = useAppointments();
  const { pagamentos = [] } = usePagamentos();
  const { isFinancialVisible } = useFinancialVisibility();



  const stats = useMemo(() => {
    // Usar APENAS dados reais do backend
    
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar se os dados existem antes de filtrar
    if (!appointments || !patients || !pagamentos) {
      return [
        {
          title: "Sessões Hoje",
          value: "0",
          description: "Carregando...",
          icon: Calendar,
        },
        {
          title: "Pacientes Ativos",
          value: "0",
          description: "Carregando...",
          icon: Users,
        },
        {
          title: "Receita Mensal",
          value: "R$ 0,00",
          description: "Carregando...",
          icon: CreditCard,
        },
        {
          title: "Sessões Concluídas",
          value: "0",
          description: "Carregando...",
          icon: CheckCircle,
        },
      ];
    }

    // 1. SESSÕES HOJE - Total de agendas para hoje
    const todayAppointments = appointments.filter(apt => apt.date === today);
    
    // 2. PACIENTES ATIVOS - Já correto
    const activePatients = patients.filter(p => p.status === "ativo").length;
    
    // 3. RECEITA (30 dias) - Faturado dos últimos 30 dias (status 1 ou 2)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent30DaysPayments = pagamentos.filter(p => {
      const paymentDate = new Date(p.data);
      return paymentDate >= thirtyDaysAgo && (p.status === 1 || p.status === 2); // Pago ou Confirmado
    });
    const totalRevenue30Days = recent30DaysPayments.reduce((sum, p) => sum + Number(p.value || 0), 0);
    
    // 4. ATENDIMENTOS CONCLUÍDOS - Total de sessões marcadas como realizadas
    const completedAppointments = appointments.filter(apt => apt.status === "realizado");
    const totalCompleted = completedAppointments.length;

    return [
      {
        title: "Sessões Hoje",
        value: todayAppointments.length.toString(),
        description: todayAppointments.length === 0 
          ? "Nenhuma sessão" 
          : `Agendadas para hoje`,
        icon: Calendar,
      },
      {
        title: "Pacientes Ativos",
        value: activePatients.toString(),
        description: activePatients === 0 
          ? "Nenhum paciente" 
          : `${patients.length - activePatients} inativos`,
        icon: Users,
      },
      {
        title: "Receita Mensal",
        value: isFinancialVisible 
          ? `R$ ${totalRevenue30Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : "••••••••",
        description: recent30DaysPayments.length === 0 
          ? "Nenhum pagamento" 
          : `${recent30DaysPayments.length} pagamentos`,
        icon: CreditCard,
      },
      {
        title: "Sessões Concluídas",
        value: totalCompleted.toString(),
        description: totalCompleted === 0 
          ? "Nenhuma sessão" 
          : `${totalCompleted} realizadas`,
        icon: CheckCircle,
      },
    ];
  }, [patients, appointments, pagamentos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
