import React, { useEffect, useState } from 'react';

export function DarkModeDebug() {
  const [isDark, setIsDark] = useState(false);
  const [hasDarkClass, setHasDarkClass] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const darkClass = document.documentElement.classList.contains('dark');
      setHasDarkClass(darkClass);
      setIsDark(darkClass);
    };

    checkDarkMode();

    // Observar mudanças na classe do documento
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    } else {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px]">
      <div className="space-y-2">
        <h3 className="font-bold text-sm">Dark Mode Debug</h3>
        <div className="text-xs space-y-1">
          <p>Estado: {isDark ? '🌙 Dark' : '☀️ Light'}</p>
          <p>Classe dark: {hasDarkClass ? '✅ Sim' : '❌ Não'}</p>
          <p>localStorage: {localStorage.getItem('darkMode') || 'null'}</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          Toggle Dark Mode
        </button>
      </div>
    </div>
  );
} 