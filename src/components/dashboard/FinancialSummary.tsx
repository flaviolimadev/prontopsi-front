
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { useFinancials } from '@/hooks/useFinancials';

export function FinancialSummary() {
  const { financialRecords: financials = [] } = useFinancials();

  const financialData = useMemo(() => {
    // Verificar se os dados existem antes de processar
    if (!financials || financials.length === 0) {
      return {
        monthlyRevenue: 0,
        projectedRevenue: 0,
        overduePayments: 0,
        overdueAmount: 0,
        averageSession: 0,
        monthlyData: []
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Receita do mês atual
    const monthlyRevenue = financials
      .filter(f => {
        const date = new Date(f.date);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear && 
               f.status === "pago";
      })
      .reduce((total, f) => total + f.amount, 0);

    // Pagamentos em atraso (mais de 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const overduePayments = financials.filter(f => 
      f.status === "pendente" && new Date(f.date) < sevenDaysAgo
    );
    
    const overdueAmount = overduePayments.reduce((total, f) => total + f.amount, 0);

    // Valor médio por sessão (últimos 3 meses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentPayments = financials.filter(f => 
      new Date(f.date) >= threeMonthsAgo && f.status === "pago"
    );
    
    const averageSession = recentPayments.length > 0 
      ? recentPayments.reduce((total, f) => total + f.amount, 0) / recentPayments.length
      : 0;

    // Projeção do mês (baseada no dia atual)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const projectedRevenue = (monthlyRevenue / currentDay) * daysInMonth;

    // Últimos 6 meses para gráfico simples
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthRevenue = financials
        .filter(f => {
          const fDate = new Date(f.date);
          return fDate.getMonth() === month && 
                 fDate.getFullYear() === year && 
                 f.status === "pago";
        })
        .reduce((total, f) => total + f.amount, 0);
      
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
      monthlyData
    };
  }, [financials]);

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
            Baseado em {financialData.monthlyData.length > 0 ? financialData.monthlyData[financialData.monthlyData.length - 1].revenue : 0} transações
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
