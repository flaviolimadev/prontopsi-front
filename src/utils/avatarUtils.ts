/**
 * Constrói a URL completa para um avatar
 * @param avatarPath - Caminho do avatar (pode ser relativo ou absoluto)
 * @returns URL completa do avatar
 */
export const getAvatarUrl = (avatarPath?: string): string => {
  console.log('getAvatarUrl - Input:', avatarPath);
  console.log('getAvatarUrl - VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  if (!avatarPath) {
    console.log('getAvatarUrl - Retornando string vazia');
    return "";
  }
  
  // Se já é uma URL completa, codificar para lidar com espaços
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    // Separar a base URL do caminho do arquivo
    const urlParts = avatarPath.split('/uploads/');
    if (urlParts.length === 2) {
      const baseUrl = urlParts[0];
      const filePath = urlParts[1];
      // Codificar apenas o caminho do arquivo
      const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
      const encodedUrl = `${baseUrl}/uploads/${encodedPath}`;
      console.log('getAvatarUrl - URL codificada:', encodedUrl);
      return encodedUrl;
    }
    console.log('getAvatarUrl - URL completa, retornando:', avatarPath);
    return avatarPath;
  }
  
  // Se é uma URL relativa, adiciona o backend URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const backendUrl = apiUrl.replace('/api', ''); // Remove /api para pegar só o base URL
  const fullUrl = `${backendUrl}${avatarPath}`;
  console.log('getAvatarUrl - Backend URL:', backendUrl);
  console.log('getAvatarUrl - URL construída:', fullUrl);
  return fullUrl;
}; 