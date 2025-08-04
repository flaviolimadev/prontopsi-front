import { AppLayout } from "./AppLayout";
import { useDarkMode } from "@/components/theme/DarkModeProvider";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {children}
    </AppLayout>
  );
}