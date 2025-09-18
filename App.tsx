
import React, { useState } from 'react';
import RevisionCalculator from './pages/RevisionCalculator';
import ElivCalculator from './pages/ElivCalculator';
import { BookOpenIcon, BuildingLibraryIcon } from './components/Icons';

interface NavButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ isActive, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-primary-500 ${
      isActive
        ? 'bg-primary-600 text-white shadow-md'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState('revision');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col items-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Calculadoras de Conteúdo</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">Ferramentas para estimar custos de revisão e serviços editoriais.</p>
          <nav className="flex space-x-2 bg-slate-200 dark:bg-slate-900/50 p-2 rounded-xl shadow-inner">
            <NavButton
              isActive={activeCalculator === 'revision'}
              onClick={() => setActiveCalculator('revision')}
              icon={<BookOpenIcon className="w-5 h-5" />}
              label="Calculadora de Revisão"
            />
            <NavButton
              isActive={activeCalculator === 'eliv'}
              onClick={() => setActiveCalculator('eliv')}
              icon={<BuildingLibraryIcon className="w-5 h-5" />}
              label="Orçamentos ELIV"
            />
          </nav>
        </header>

        <main>
          {activeCalculator === 'revision' && <RevisionCalculator />}
          {activeCalculator === 'eliv' && <ElivCalculator />}
        </main>
      </div>
    </div>
  );
};

export default App;
