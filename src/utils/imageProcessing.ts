/**
 * Processa e redimensiona imagens mantendo alta qualidade
 */
export const processImageFile = (file: File, maxSize: number = 512): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      // Configurar canvas para alta qualidade
      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        // Configurações para melhor qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob com alta qualidade
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              reject(new Error('Erro ao processar imagem'));
            }
          },
          'image/jpeg',
          0.9 // Alta qualidade (90%)
        );
      }
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Valida se o arquivo é uma imagem válida
 */
export const validateImageFile = (file: File): string | null => {
  // Verificar tipo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WebP.';
  }

  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo 5MB.';
  }

  return null;
};