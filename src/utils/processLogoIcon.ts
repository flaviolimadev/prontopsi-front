import { removeBackground, loadImage } from './backgroundRemoval';

export const processLogoIcon = async (): Promise<string> => {
  try {
    // Fetch the current logo image
    const response = await fetch('/lovable-uploads/7ba8fc35-ecf8-442d-8922-c1607b1b66dd.png');
    const blob = await response.blob();
    
    // Load the image
    const imageElement = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(imageElement);
    
    // Create a URL for the processed image
    return URL.createObjectURL(processedBlob);
  } catch (error) {
    console.error('Error processing logo icon:', error);
    // Return original image on error
    return '/lovable-uploads/7ba8fc35-ecf8-442d-8922-c1607b1b66dd.png';
  }
};