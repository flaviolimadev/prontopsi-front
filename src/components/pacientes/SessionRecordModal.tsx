import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, Loader2, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SessionRecordModalProps {
  session: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sessionId: string, observacao: string) => Promise<void>;
  loading?: boolean;
}

export const SessionRecordModal: React.FC<SessionRecordModalProps> = ({
  session,
  open,
  onOpenChange,
  onSave,
  loading = false
}) => {
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Carregar observação da sessão quando o modal abrir
  useEffect(() => {
    if (session && open) {
      console.log('SessionRecordModal - Dados da sessão:', session);
      setObservacao(session.observacao || session.notes || '');
      setError(null);
    }
  }, [session, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(session.id, observacao);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar registro da sessão:', error);
      setError('Erro ao salvar o registro. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    console.log('formatDate - Valor recebido:', dateString, typeof dateString);
    
    if (!dateString) return 'Data não informada';
    
    try {
      const date = new Date(dateString);
      console.log('formatDate - Data criada:', date, 'isValid:', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Horário não informado';
    return timeString;
  };

  // Se não houver sessão válida, não renderizar o modal
  if (!session) {
    return null;
  }

  // Extrair dados da sessão com fallbacks seguros
  const sessionData = {
    date: session?.data || session?.date || null,
    time: session?.horario || session?.time || null,
    duration: session?.duracao || session?.duration || 0,
    type: session?.tipoDaConsulta || session?.type || 'Consulta',
    modality: session?.modalidade || session?.modality || 'Presencial',
    patientName: session?.paciente?.nome || 'Paciente'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Registro da Sessão
          </DialogTitle>
          <DialogDescription>
            Adicione observações e registros sobre esta sessão
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Sessão */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(sessionData.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(sessionData.time)} - {sessionData.duration} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{sessionData.patientName}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {sessionData.type}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary-foreground">
                {sessionData.modality}
              </span>
            </div>
          </div>

          {/* Campo de Observação */}
          <div className="space-y-2">
            <Label htmlFor="observacao">Registro da Sessão</Label>
            <Textarea
              id="observacao"
              placeholder="Descreva os principais pontos abordados na sessão, observações importantes, evolução do paciente, objetivos alcançados, etc..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={12}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Este registro será salvo de forma segura e poderá ser consultado posteriormente.
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Registro
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
