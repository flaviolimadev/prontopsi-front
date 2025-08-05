
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle, Calendar, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { usePagamentos } from '@/hooks/usePagamentos';

export function FinancialSummary() {
  const { pagamentos = [], loading, error } = usePagamentos();





  const financialData = useMemo(() => {
    // Usar APENAS dados reais do backend

    // Verificar se os dados existem antes de processar
    if (!pagamentos || pagamentos.length === 0) {
      return {
        monthlyRevenue: 0,
        projectedRevenue: 0,
        overduePayments: 0,
        overdueAmount: 0,
        averageSession: 0,
        monthlyData: [],
        paidTotal: 0,
        pendingTotal: 0,
        canceledTotal: 0,
        paidCount: 0,
        pendingCount: 0,
        canceledCount: 0,
        projectedFromPending: 0,
        totalForecast: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar pagamentos do mês atual (mesma lógica da página Financeiro)
    const currentMonthPayments = pagamentos.filter(pagamento => {
      const paymentDate = new Date(pagamento.data);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });



    // Receita do mês atual (status 1 = Pago, status 2 = Confirmado)
    const monthlyRevenue = currentMonthPayments
      .filter(p => p.status === 1 || p.status === 2)
      .reduce((sum, p) => sum + Number(p.value || 0), 0);

    // Pagamentos pendentes do mês atual (status 0 = Pendente)
    const monthlyPending = currentMonthPayments
      .filter(p => p.status === 0)
      .reduce((sum, p) => sum + Number(p.value || 0), 0);

    // Pagamentos em atraso (mais de 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const overduePayments = pagamentos.filter(p => 
      p.status === 0 && new Date(p.data) < sevenDaysAgo
    );
    
    const overdueAmount = overduePayments.reduce((sum, p) => sum + Number(p.value || 0), 0);

    // Valor médio por sessão (todos os tempos)
    const averageSession = currentMonthPayments.length > 0 ? 
      currentMonthPayments.reduce((sum, p) => sum + Number(p.value || 0), 0) / currentMonthPayments.length : 0;

    // Cálculos detalhados por status (todos os tempos)
    const paidPayments = pagamentos.filter(p => p.status === 1 || p.status === 2);
    const pendingPayments = pagamentos.filter(p => p.status === 0);
    const canceledPayments = pagamentos.filter(p => p.status === 3); // status 3 = Cancelado

    const paidTotal = paidPayments.reduce((sum, p) => sum + Number(p.value || 0), 0);
    const pendingTotal = pendingPayments.reduce((sum, p) => sum + Number(p.value || 0), 0);
    const canceledTotal = canceledPayments.reduce((sum, p) => sum + Number(p.value || 0), 0);

    const paidCount = paidPayments.length;
    const pendingCount = pendingPayments.length;
    const canceledCount = canceledPayments.length;

    // Projeção baseada nos pendentes (assumindo 70% de conversão)
    const projectedFromPending = pendingTotal * 0.7;
    const totalForecast = paidTotal + projectedFromPending;

    // Projeção do mês (baseada no dia atual)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const projectedRevenue = currentDay > 0 ? (monthlyRevenue / currentDay) * daysInMonth : 0;

    // Últimos 6 meses para gráfico simples
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthRevenue = pagamentos
        .filter(p => {
          const pDate = new Date(p.data);
          return pDate.getMonth() === month && 
                 pDate.getFullYear() === year && 
                 (p.status === 1 || p.status === 2); // Pago ou Confirmado
        })
        .reduce((sum, p) => sum + Number(p.value || 0), 0);
      
      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: monthRevenue
      });
    }

    return {
      monthlyRevenue,
      projectedRevenue,
      overduePayments: overduePayments.length,
      overdueAmount,
      averageSession,
      monthlyData,
      paidTotal,
      pendingTotal,
      canceledTotal,
      paidCount,
      pendingCount,
      canceledCount,
      projectedFromPending,
      totalForecast
    };
  }, [pagamentos]);

  console.log('FinancialSummary - Dados calculados:', financialData);

  const maxMonthlyRevenue = financialData.monthlyData.length > 0 
    ? Math.max(...financialData.monthlyData.map(m => m.revenue))
    : 0;

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>
          </div>
        )}
        
        {!loading && (
          <>
            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 hover:bg-muted/40 transition-colors">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Projeção do Mês</div>
            <div className="font-bold text-lg text-foreground">
              R$ {financialData.projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 hover:bg-muted/40 transition-colors">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Valor Médio/Sessão</div>
            <div className="font-bold text-lg text-foreground">
              R$ {financialData.averageSession.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Alertas */}
        {financialData.overduePayments > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-destructive">Pagamentos em Atraso</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {financialData.overduePayments} pagamento(s) em atraso totalizando{' '}
              <span className="font-semibold text-foreground">
                R$ {financialData.overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        )}

        {/* Gráfico Simples */}
        {financialData.monthlyData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Receita dos Últimos 6 Meses</h4>
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Últimos 6 meses
              </Badge>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {financialData.monthlyData.map((month, index) => {
                const height = maxMonthlyRevenue > 0 
                  ? (month.revenue / maxMonthlyRevenue) * 100 
                  : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm transition-all duration-300 hover:bg-primary/30"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      {month.month}
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      R$ {month.revenue.toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resumo Detalhado do Faturamento */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-foreground">Resumo Detalhado do Faturamento</h4>
          
          {/* Faturado vs Previsão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">Faturado</span>
              </div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">
                R$ {financialData.paidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {financialData.paidCount} pagamento{financialData.paidCount !== 1 ? 's' : ''} recebido{financialData.paidCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Previsão Total</span>
              </div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                R$ {financialData.totalForecast.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Incluindo 70% dos pendentes
              </p>
            </div>
          </div>

          {/* Status dos Pagamentos */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800/30 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Pendentes</span>
              </div>
              <div className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                R$ {financialData.pendingTotal.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {financialData.pendingCount} pag.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-800/30 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-800 dark:text-red-200">Cancelados</span>
              </div>
              <div className="text-sm font-bold text-red-900 dark:text-red-100">
                R$ {financialData.canceledTotal.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-red-700 dark:text-red-300">
                {financialData.canceledCount} pag.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800/30 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CreditCard className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-800 dark:text-purple-200">A Receber</span>
              </div>
              <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                R$ {financialData.projectedFromPending.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Previsão
              </p>
            </div>
          </div>
        </div>

        {/* Resumo Mensal */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Receita do Mês Atual</span>
            <Badge variant="default" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {financialData.monthlyRevenue > 0 ? 'Ativo' : 'Sem dados'}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground">
            R$ {financialData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pagamentos.length === 0 ? 'Nenhum pagamento registrado' : `Baseado em ${pagamentos.length} pagamentos`}
          </p>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
