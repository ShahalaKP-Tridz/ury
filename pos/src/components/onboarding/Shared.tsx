import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '../ui/button';
import { Input as BaseInput } from '../ui/input';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SetupCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-card text-card-foreground shadow-xl shadow-primary-900/5 rounded-2xl p-8 border border-border", className)}>
    {children}
  </div>
);

export const PrimaryButton = ({ 
  children, 
  onClick, 
  className, 
  disabled,
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string; 
  disabled?: boolean;
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled}
      variant={variant as any}
      size="lg"
      className={cn("rounded-xl px-8", className)}
    >
      {children}
    </Button>
  );
};

export const FormField = ({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) => (
  <div className="space-y-1.5 w-full text-left">
    <label className="text-sm font-semibold text-foreground ml-1">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <BaseInput 
    {...props}
    className={cn(
      "bg-muted/50 border-input focus:ring-primary/20 rounded-xl px-4 py-3 h-auto transition-all",
      props.className
    )}
  />
);

export const Select = ({ options, value, onChange, placeholder, disabled }: { options: { label: string; value: string }[], value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean }) => (
  <select 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full px-4 py-3 rounded-xl border border-input focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-muted/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);
