import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={props.id || props.name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
      />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label:string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={props.id || props.name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <textarea
        {...props}
        rows={3}
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, children, ...props }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={props.id || props.name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        {...props}
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {children}
      </select>
    </div>
  );
}

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, valueLabel, ...props }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={props.id || props.name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {valueLabel && <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50 rounded-md px-2 py-1">{valueLabel}</span>}
      </div>
      <input
        type="range"
        {...props}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
    </div>
  );
};
