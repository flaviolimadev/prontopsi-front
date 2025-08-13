import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SimpleUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SimpleUpgradePrompt({ isOpen, onClose, title, message }: SimpleUpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title || 'Recurso indisponível no seu plano'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {message || 'Você atingiu o limite do seu plano atual. Faça upgrade para desbloquear este recurso.'}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button onClick={() => { onClose(); navigate('/planos'); }}>Fazer upgrade</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


