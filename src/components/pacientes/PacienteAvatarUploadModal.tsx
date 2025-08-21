import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api.service';
import { DragDropZone } from '../profile/DragDropZone';

interface PacienteAvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (avatarUrl: string) => void;
  pacienteId: string;
  pacienteNome: string;
  currentAvatar?: string | null;
}

export function PacienteAvatarUploadModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  pacienteId, 
  pacienteNome,
  currentAvatar 
}: PacienteAvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Gerar preview com redimensionamento
  const generatePreview = useCallback(() => {
    if (!selectedFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Configurar canvas
      canvas.width = 300;
      canvas.height = 300;

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calcular dimensões para manter proporção
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight;
      if (imgAspectRatio > canvasAspectRatio) {
        // Imagem mais larga
        drawHeight = canvas.height * scale;
        drawWidth = drawHeight * imgAspectRatio;
      } else {
        // Imagem mais alta
        drawWidth = canvas.width * scale;
        drawHeight = drawWidth / imgAspectRatio;
      }

      // Centralizar a imagem
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      
      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Atualizar preview
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = URL.createObjectURL(selectedFile);
  }, [selectedFile, scale]);

  // Atualizar preview quando arquivo ou escala mudarem
  React.useEffect(() => {
    if (selectedFile) {
      generatePreview();
    }
  }, [selectedFile, scale, generatePreview]);

  // Resetar escala
  const resetScale = () => {
    setScale(1);
  };

  // Selecionar arquivo
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    resetScale();
  };

  // Fazer upload
  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    try {
      // Converter preview para arquivo
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], selectedFile.name, { type: 'image/jpeg' });

      const result = await apiService.uploadPacienteAvatar(pacienteId, file);
      
      toast({
        title: "Avatar atualizado!",
        description: `Avatar de ${pacienteNome} foi atualizado com sucesso.`,
      });

      onSuccess(result.avatar_url);
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível atualizar o avatar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fechar modal
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    resetScale();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Redimensionar Avatar - {pacienteNome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Área de Upload e Preview */}
          <Card>
            <CardContent className="p-4">
              {!selectedFile ? (
                <DragDropZone
                  onFileSelect={handleFileSelect}
                  accept="image/*"
                  maxSize={5}
                />
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-64 object-contain border rounded-lg bg-gray-50"
                      style={{ display: 'none' }}
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-contain border rounded-lg bg-gray-50"
                      />
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedFile(null)}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Trocar Imagem
                    </Button>
                    <Button
                      onClick={resetScale}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resetar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controle de Redimensionamento */}
          {selectedFile && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-3">
                    <ZoomIn className="w-4 h-4" />
                    Redimensionar
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Slider
                        value={[scale]}
                        onValueChange={([value]) => setScale(value)}
                        max={2}
                        min={0.5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <Button
                      onClick={() => setScale(Math.min(2, scale + 0.1))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>50%</span>
                    <span className="font-medium">{Math.round(scale * 100)}%</span>
                    <span>200%</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ajuste o tamanho da imagem para que ela se encaixe bem no avatar.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          {selectedFile && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Salvar Avatar
                  </>
                )}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}






