import React from 'react';
import { useDarkMode } from './DarkModeProvider';

export function DarkModeTest() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="fixed top-4 left-4 z-50 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Teste Dark Mode</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Modo: {darkMode ? 'Escuro' : 'Claro'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Classe: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        </p>
        <button
          onClick={toggleDarkMode}
          className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          Alternar
        </button>
      </div>
    </div>
  );
} 