import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  UserCheck, 
  UserPlus, 
  AlertCircle, 
  Repeat, 
  CreditCard, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';
import { usePacientes } from '@/hooks/usePacientes';
import { useAgendaSessoes } from '@/hooks/useAgendaSessoes';
import { usePacotes } from '@/hooks/usePacotes';
import { usePagamentos } from '@/hooks/usePagamentos';
import { format } from 'date-fns';

interface AppointmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  selectedPacienteId?: string;
  onSave: (appointmentData: any) => Promise<void>;
}

interface AppointmentFormData {
  pacienteId: string;
  data: string;
  horario: string;
  duracao: number;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  status: number;
  observacao?: string;
  value?: number;
  pacoteId?: string | null;
  valorAvulso?: number;
  tipoPagamento?: 'pacote' | 'avulso';
}

interface RecurringAppointmentData {
  isRecurring: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  daysOfWeek: number[];
  quantity: number;
  daySchedules: { [key: number]: string };
}

export function AppointmentEditModal({ isOpen, onClose, submission, selectedPacienteId, onSave }: AppointmentEditModalProps) {
  const { pacientes } = usePacientes();
  const { createAgendaSessao } = useAgendaSessoes();
  const { pacotes, loading: pacotesLoading } = usePacotes();
  const { createPagamento } = usePagamentos();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    pacienteId: '',
    data: new Date().toISOString().split('T')[0],
    horario: '09:00',
    duracao: 50,
    tipoDaConsulta: 'Consulta',
    modalidade: 'Presencial',
    tipoAtendimento: 'Individual',
    status: 1,
    observacao: '',
    value: 0,
    pacoteId: null,
    valorAvulso: 0,
    tipoPagamento: 'avulso'
  });

  const [recurringData, setRecurringData] = useState<RecurringAppointmentData>({
    isRecurring: false,
    frequency: 'weekly',
    daysOfWeek: [new Date().getDay()],
    quantity: 1,
    daySchedules: {}
  });

  // Inicializar com os dados da submissão
  useEffect(() => {
    if (submission) {
      if (submission.pacienteData.dataConsulta) {
        setFormData(prev => ({
          ...prev,
          data: submission.pacienteData.dataConsulta
        }));
      }
      if (submission.pacienteData.horaConsulta) {
        setFormData(prev => ({
          ...prev,
          horario: submission.pacienteData.horaConsulta
        }));
      }
    }
  }, [submission]);

  // Definir o paciente selecionado quando o modal abrir
  useEffect(() => {
    if (isOpen && selectedPacienteId) {
      setFormData(prev => ({
        ...prev,
        pacienteId: selectedPacienteId
      }));
    }
  }, [isOpen, selectedPacienteId]);

  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers === '') return '';
    
    const integerPart = numbers.slice(0, -2) || '0';
    const decimalPart = numbers.slice(-2).padStart(2, '0');
    
    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`;
  };

  const parseCurrencyInput = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return numbers ? parseInt(numbers) / 100 : 0;
  };

  const calculateRecurringDates = (startDate: Date, frequency: string, daysOfWeek: number[], quantity: number, daySchedules: { [key: number]: string }): Array<{date: Date, time: string}> => {
    const appointments: Array<{date: Date, time: string}> = [];
    const currentDate = new Date(startDate);
    
    let weeksAdded = 0;
    const maxWeeks = 52; // Limite máximo de semanas
    
    while (appointments.length < quantity && weeksAdded < maxWeeks) {
      for (const dayOfWeek of daysOfWeek) {
        if (appointments.length >= quantity) break;
        
        const appointmentDate = new Date(currentDate);
        appointmentDate.setDate(currentDate.getDate() + (dayOfWeek - currentDate.getDay() + 7) % 7 + (weeksAdded * 7));
        
        if (appointmentDate >= startDate) {
          const time = daySchedules[dayOfWeek] || '09:00';
          appointments.push({ date: appointmentDate, time });
        }
      }
      weeksAdded++;
    }
    
    return appointments.slice(0, quantity);
  };

  const handleSave = async () => {
    if (!formData.pacienteId || !formData.data) {
      return;
    }

    // Validação específica para agendamento único
    if (!recurringData.isRecurring && !formData.horario) {
      return;
    }

    // Validar pagamento
    if (formData.tipoPagamento === 'avulso' && (!formData.valorAvulso || formData.valorAvulso <= 0)) {
      return;
    }

    if (formData.tipoPagamento === 'pacote' && !formData.pacoteId) {
      return;
    }

    if (recurringData.isRecurring && (recurringData.daysOfWeek.length === 0 || recurringData.quantity < 1)) {
      return;
    }

    if (recurringData.isRecurring && recurringData.quantity > 52) {
      return;
    }

    try {
      setLoading(true);
      
      if (recurringData.isRecurring) {
        // Criar múltiplas consultas recorrentes
        const startDate = new Date(formData.data + 'T00:00:00');
        const recurringAppointments = calculateRecurringDates(
          startDate,
          recurringData.frequency,
          recurringData.daysOfWeek,
          recurringData.quantity,
          recurringData.daySchedules
        );

        const promises = recurringAppointments.map(async appointment => {
          const appointmentData = {
            ...formData,
            data: format(appointment.date, 'yyyy-MM-dd'),
            horario: appointment.time
          };
          
          // Criar a sessão
          const session = await createAgendaSessao(appointmentData);
          
          // Criar o pagamento correspondente
          const pagamentoData = {
            pacienteId: formData.pacienteId,
            pacoteId: formData.tipoPagamento === 'pacote' ? formData.pacoteId : null,
            agendaSessaoId: session.id,
            data: format(appointment.date, 'yyyy-MM-dd'),
            vencimento: format(appointment.date, 'yyyy-MM-dd'),
            value: formData.tipoPagamento === 'pacote' 
              ? Number(pacotes?.find(p => p.id === formData.pacoteId)?.value || 0)
              : Number(formData.valorAvulso || 0),
            descricao: `Pagamento para consulta em ${appointment.date.toLocaleDateString('pt-BR')} - ${formData.tipoDaConsulta}`,
            type: null,
            txid: null
          };
          
          await createPagamento(pagamentoData);
          
          return session;
        });

        await Promise.all(promises);
      } else {
        // Criar agendamento único
        const appointmentData = {
          ...formData,
          data: formData.data,
          horario: formData.horario
        };

        const session = await createAgendaSessao(appointmentData);
        
        // Criar o pagamento correspondente
        const pagamentoData = {
          pacienteId: formData.pacienteId,
          pacoteId: formData.tipoPagamento === 'pacote' ? formData.pacoteId : null,
          agendaSessaoId: session.id,
          data: formData.data,
          vencimento: formData.data,
          value: formData.tipoPagamento === 'pacote' 
            ? Number(pacotes?.find(p => p.id === formData.pacoteId)?.value || 0)
            : Number(formData.valorAvulso || 0),
          descricao: `Pagamento para consulta em ${new Date(formData.data).toLocaleDateString('pt-BR')} - ${formData.tipoDaConsulta}`,
          type: null,
          txid: null
        };
        
        await createPagamento(pagamentoData);
      }
      
      // Chamar o callback do componente pai
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const activePatients = pacientes?.filter(p => p.status === 1) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Configure o agendamento para o paciente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select value={formData.pacienteId} onValueChange={(value) => setFormData({...formData, pacienteId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {activePatients.map((paciente) => (
                  <SelectItem key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!recurringData.isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Input
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={formData.modalidade} onValueChange={(value: any) => setFormData({...formData, modalidade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Atendimento</Label>
              <Select value={formData.tipoAtendimento} onValueChange={(value: any) => setFormData({...formData, tipoAtendimento: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Casal">Casal</SelectItem>
                  <SelectItem value="Grupo">Grupo</SelectItem>
                  <SelectItem value="Família">Família</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agendamento Recorrente e Pagamento - Layout Compacto */}
          <div className="space-y-4 border-t pt-4">
            {/* Agendamento Recorrente */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={recurringData.isRecurring}
                  onChange={(e) => setRecurringData({
                    ...recurringData,
                    isRecurring: e.target.checked
                  })}
                  className="rounded"
                />
                <Label htmlFor="recurring" className="font-medium flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Agendamento Recorrente
                </Label>
              </div>
              
              {recurringData.isRecurring && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  {/* Frequência */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Frequência</Label>
                    <Select 
                      value={recurringData.frequency} 
                      onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => setRecurringData({
                        ...recurringData,
                        frequency: value
                      })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Toda semana</SelectItem>
                        <SelectItem value="biweekly">A cada 15 dias</SelectItem>
                        <SelectItem value="monthly">Todo mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Dias da Semana</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { value: 0, label: 'Dom', short: 'D' },
                        { value: 1, label: 'Seg', short: 'S' },
                        { value: 2, label: 'Ter', short: 'T' },
                        { value: 3, label: 'Qua', short: 'Q' },
                        { value: 4, label: 'Qui', short: 'Q' },
                        { value: 5, label: 'Sex', short: 'S' },
                        { value: 6, label: 'Sáb', short: 'S' }
                      ].map((day) => (
                        <div key={day.value} className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => {
                              const currentDays = recurringData.daysOfWeek || [];
                              const newDays = currentDays.includes(day.value)
                                ? currentDays.filter(d => d !== day.value)
                                : [...currentDays, day.value];
                              setRecurringData({
                                ...recurringData,
                                daysOfWeek: newDays
                              });
                            }}
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                              (recurringData.daysOfWeek || []).includes(day.value)
                                ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                            }`}
                          >
                            {day.short}
                          </button>
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {day.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {(recurringData.daysOfWeek || []).length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Selecione pelo menos um dia da semana
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Quantidade de Sessões</Label>
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        Criar automaticamente
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={recurringData.quantity}
                        onChange={(e) => setRecurringData({
                          ...recurringData,
                          quantity: parseInt(e.target.value) || 1
                        })}
                        placeholder="Ex: 10"
                        className="h-9 flex-1"
                      />
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {recurringData.quantity > 0 && (recurringData.daysOfWeek || []).length > 0 && (
                          <span>
                            = {recurringData.quantity * (recurringData.daysOfWeek || []).length} agendamentos
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Serão criados automaticamente {recurringData.quantity} sessões para cada dia selecionado
                    </p>
                  </div>

                  {/* Horários Específicos por Dia */}
                  {(recurringData.daysOfWeek || []).length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Horários por Dia</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(recurringData.daysOfWeek || []).map((dayValue) => {
                          const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                          const dayName = dayNames[dayValue];
                          const currentTime = recurringData.daySchedules[dayValue] || formData.horario || '09:00';
                          
                          return (
                            <div key={dayValue} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {dayName}
                                </span>
                              </div>
                              <Input
                                type="time"
                                value={currentTime}
                                onChange={(e) => setRecurringData({
                                  ...recurringData,
                                  daySchedules: {
                                    ...recurringData.daySchedules,
                                    [dayValue]: e.target.value
                                  }
                                })}
                                className="w-24 h-9 text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seção de Pagamento - Design Moderno */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Forma de Pagamento
                </Label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Opção Valor Avulso */}
                <div 
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.tipoPagamento === 'avulso' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setFormData({
                    ...formData, 
                    tipoPagamento: 'avulso',
                    pacoteId: null
                  })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipoPagamento === 'avulso' 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {formData.tipoPagamento === 'avulso' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">Valor Avulso</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Definir valor individual</p>
                    </div>
                  </div>
                  
                  {formData.tipoPagamento === 'avulso' && (
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                      <Input
                        type="text"
                        placeholder="R$ 0,00"
                        value={formData.valorAvulso ? formatCurrencyInput((formData.valorAvulso * 100).toString()) : ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          if (rawValue === '') {
                            setFormData({
                              ...formData, 
                              valorAvulso: 0
                            });
                          } else {
                            const numericValue = parseInt(rawValue) / 100;
                            setFormData({
                              ...formData, 
                              valorAvulso: numericValue
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          if (rawValue !== '') {
                            const numericValue = parseInt(rawValue) / 100;
                            e.target.value = formatCurrencyInput((numericValue * 100).toString());
                          }
                        }}
                        className="h-9 text-sm border-green-300 focus:border-green-500 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Opção Pacote */}
                <div 
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.tipoPagamento === 'pacote' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setFormData({
                    ...formData, 
                    tipoPagamento: 'pacote',
                    valorAvulso: 0
                  })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipoPagamento === 'pacote' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {formData.tipoPagamento === 'pacote' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">Pacote</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Usar pacote existente</p>
                    </div>
                  </div>
                  
                  {formData.tipoPagamento === 'pacote' && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      {pacotesLoading ? (
                        <div className="h-9 w-full bg-muted animate-pulse rounded" />
                      ) : pacotes?.filter(pacote => pacote.ativo).length === 0 ? (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                              Nenhum pacote ativo
                            </span>
                          </div>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Crie pacotes no Financeiro
                          </p>
                        </div>
                      ) : (
                        <Select 
                          value={formData.pacoteId || ''} 
                          onValueChange={(value) => setFormData({...formData, pacoteId: value})}
                        >
                          <SelectTrigger className="h-9 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Escolher pacote" />
                          </SelectTrigger>
                          <SelectContent>
                            {pacotes?.filter(pacote => pacote.ativo).map((pacote) => (
                              <SelectItem key={pacote.id} value={pacote.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{pacote.title}</span>
                                  <span className="text-green-600 font-medium">
                                    R$ {Number(pacote.value || 0).toFixed(2)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !formData.pacienteId || (!recurringData.isRecurring && !formData.horario)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Agendamento'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
