import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // em MB
  className?: string;
}

export function DragDropZone({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5,
  className 
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos';
    }

    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      return `O arquivo deve ter menos de ${maxSize}MB`;
    }

    return null;
  }, [maxSize]);

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setDragError(error);
      setTimeout(() => setDragError(null), 3000);
      return;
    }

    setDragError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Limpar input para permitir re-upload do mesmo arquivo
    e.target.value = '';
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 dark:border-gray-600",
          dragError && "border-destructive bg-destructive/5",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          {dragError ? (
            <>
              <X className="w-12 h-12 text-destructive" />
              <div>
                <p className="text-destructive font-medium">Erro no upload</p>
                <p className="text-sm text-destructive/80">{dragError}</p>
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "p-4 rounded-full",
                isDragOver 
                  ? "bg-primary/10 text-primary" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              )}>
                {isDragOver ? (
                  <Upload className="w-8 h-8" />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isDragOver ? "Solte a imagem aqui" : "Arraste uma imagem aqui"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Máximo {maxSize}MB • JPG, PNG, GIF, WebP
                </p>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            isDragOver || dragError
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
          disabled={!!dragError}
        >
          Selecionar Imagem
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {dragError && (
        <div className="text-center">
          <button
            onClick={() => setDragError(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}




