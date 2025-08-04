import { useState, useEffect } from "react";

const TOUR_COMPLETED_KEY = "psycheflow_tour_completed";

export function useTour() {
  const [shouldShowTour, setShouldShowTour] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já viu o tour
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    
    if (!tourCompleted) {
      // Mostra o tour após um pequeno delay para garantir que a página carregou
      const timer = setTimeout(() => {
        setShouldShowTour(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setShouldShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setShouldShowTour(true);
  };

  return {
    shouldShowTour,
    completeTour,
    resetTour
  };
}