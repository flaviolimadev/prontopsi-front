import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FinancialVisibilityContextType {
  isFinancialVisible: boolean;
  toggleFinancialVisibility: () => void;
}

const FinancialVisibilityContext = createContext<FinancialVisibilityContextType | undefined>(undefined);

export function FinancialVisibilityProvider({ children }: { children: ReactNode }) {
  const [isFinancialVisible, setIsFinancialVisible] = useState(false);

  const toggleFinancialVisibility = () => {
    setIsFinancialVisible(prev => !prev);
  };

  return (
    <FinancialVisibilityContext.Provider value={{
      isFinancialVisible,
      toggleFinancialVisibility
    }}>
      {children}
    </FinancialVisibilityContext.Provider>
  );
}

export function useFinancialVisibility() {
  const context = useContext(FinancialVisibilityContext);
  if (context === undefined) {
    throw new Error('useFinancialVisibility must be used within a FinancialVisibilityProvider');
  }
  return context;
}
