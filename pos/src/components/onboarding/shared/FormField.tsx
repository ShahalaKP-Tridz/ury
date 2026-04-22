import React from 'react';
import { cn } from '../../../lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  type?: string;
  options?: { value: string; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  icon, 
  className, 
  type = "text", 
  options,
  ...props 
}) => {

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      <div className="relative group">
        {type === 'select' ? (
          <select
            className={cn(
              "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-200 text-gray-800 placeholder:text-gray-400",
              className
            )}
            {...props as any}
          >
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-200 text-gray-800 placeholder:text-gray-400",
              className
            )}
            {...props as any}
          />
        )}
      </div>
    </div>
  );
};
