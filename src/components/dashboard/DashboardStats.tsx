
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useFinancials } from '@/hooks/useFinancials';

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
  const { financialRecords: financials = [] } = useFinancials();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar se os dados existem antes de filtrar
    if (!appointments || !patients || !financials) {
      return [
        {
          title: "Sessões Hoje",
          value: "0",
          description: "Carregando dados...",
          icon: Calendar,
        },
        {
          title: "Pacientes Ativos",
          value: "0",
          description: "Carregando dados...",
          icon: Users,
        },
        {
          title: "Receita (30 dias)",
          value: "R$ 0,00",
          description: "Carregando dados...",
          icon: CreditCard,
        },
        {
          title: "Taxa de Comparecimento",
          value: "--",
          description: "Carregando dados...",
          icon: TrendingUp,
        },
      ];
    }

    const todayAppointments = appointments.filter(apt => apt.date === today);
    const confirmedToday = todayAppointments.filter(apt => apt.status === "agendado").length;
    const completedToday = todayAppointments.filter(apt => apt.status === "realizado").length;
    const activePatients = patients.filter(p => p.status === "ativo").length;
    
    // Métricas financeiras dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent30DaysPayments = financials.filter(f => 
      new Date(f.date) >= thirtyDaysAgo && f.status === "pago"
    );
    const totalRevenue30Days = recent30DaysPayments.reduce((total, f) => total + f.amount, 0);
    
    const pending30Days = financials.filter(f => 
      new Date(f.date) >= thirtyDaysAgo && f.status === "pendente"
    );
    const pendingPayments30Days = pending30Days.reduce((total, f) => total + f.amount, 0);
    
    // Taxa de comparecimento dos últimos 30 dias vs. 30 dias anteriores
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    // Consultas dos últimos 30 dias (finalizadas)
    const recentAppointments = appointments.filter(apt => 
      new Date(apt.date) >= thirtyDaysAgo && 
      ['realizado', 'falta'].includes(apt.status)
    );
    
    // Consultas dos 30 dias anteriores (30-60 dias atrás)
    const previousAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= sixtyDaysAgo && 
             aptDate < thirtyDaysAgo && 
             ['realizado', 'falta'].includes(apt.status);
    });
    
    const currentAttendanceRate = recentAppointments.length > 0 
      ? Math.round((recentAppointments.filter(apt => apt.status === 'realizado').length / recentAppointments.length) * 100)
      : 0;
      
    const previousAttendanceRate = previousAppointments.length > 0 
      ? Math.round((previousAppointments.filter(apt => apt.status === 'realizado').length / previousAppointments.length) * 100)
      : 0;
    
    // Calcular trend real
    let attendanceTrend: string | undefined;
    let attendanceTrendDirection: "up" | "down" | undefined;
    
    if (recentAppointments.length >= 2 && previousAppointments.length >= 2) {
      const trendDifference = currentAttendanceRate - previousAttendanceRate;
      if (Math.abs(trendDifference) >= 5) { // Só mostrar se a diferença for significativa
        attendanceTrend = `${trendDifference > 0 ? '+' : ''}${trendDifference}%`;
        attendanceTrendDirection = trendDifference > 0 ? "up" : "down";
      }
    }

    return [
      {
        title: "Sessões Hoje",
        value: todayAppointments.length.toString(),
        description: todayAppointments.length === 0 
          ? "Nenhuma sessão agendada" 
          : `${confirmedToday} agendadas, ${completedToday} realizadas`,
        icon: Calendar,
      },
      {
        title: "Pacientes Ativos",
        value: activePatients.toString(),
        description: activePatients === 0 
          ? "Nenhum paciente cadastrado" 
          : `${patients.length - activePatients} inativos`,
        icon: Users,
      },
      {
        title: "Receita (30 dias)",
        value: `R$ ${totalRevenue30Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        description: pendingPayments30Days > 0 
          ? `R$ ${pendingPayments30Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente nos últimos 30 dias`
          : recent30DaysPayments.length > 0 
          ? `${recent30DaysPayments.length} pagamentos recebidos`
          : "Nenhum pagamento nos últimos 30 dias",
        icon: CreditCard,
      },
      {
        title: "Taxa de Comparecimento",
        value: recentAppointments.length === 0 ? "--" : `${currentAttendanceRate}%`,
        description: recentAppointments.length === 0 
          ? "Nenhuma consulta finalizada nos últimos 30 dias" 
          : recentAppointments.length < 2
          ? "Dados insuficientes para cálculo confiável"
          : `Baseado em ${recentAppointments.length} consultas dos últimos 30 dias`,
        icon: TrendingUp,
        trend: attendanceTrend,
        trendDirection: attendanceTrendDirection,
      },
    ];
  }, [patients, appointments, financials]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
