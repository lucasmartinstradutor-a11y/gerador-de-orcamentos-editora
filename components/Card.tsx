import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  isSticky?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, isSticky = false }) => {
  const stickyClass = isSticky ? 'lg:sticky lg:top-8' : '';

  return (
    <div className={`bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 ${stickyClass}`}>
      <h2 className="text-xl font-bold text-primary-900 dark:text-primary-300 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
};
