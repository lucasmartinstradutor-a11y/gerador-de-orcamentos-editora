import React from 'react';

interface MetricProps {
  label: string;
  value: string;
  variant?: 'default' | 'highlight';
}

export const Metric: React.FC<MetricProps> = ({ label, value, variant = 'default' }) => {
  const valueClasses = variant === 'highlight'
    ? 'text-3xl font-bold text-primary-700 dark:text-primary-400'
    : 'text-2xl font-semibold text-slate-800 dark:text-slate-200';

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center">
      <span className="text-base font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className={valueClasses}>{value}</span>
    </div>
  );
};
