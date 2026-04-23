import React from 'react';

interface FormFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled,
  options,
  icon,
  required
}) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 opacity-70 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
          {icon}
        </div>
      )}
      {type === 'select' ? (
        <div className="relative w-full">
          <select
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 bg-secondary/30 border border-border rounded-xl outline-none focus:border-primary focus:bg-card transition-all duration-300 disabled:bg-muted/50 text-sm font-semibold text-foreground appearance-none cursor-pointer`}
          >
            {options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 bg-secondary/30 border border-border rounded-xl outline-none focus:border-primary focus:bg-card transition-all duration-300 disabled:bg-muted/50 text-sm font-semibold text-foreground placeholder:text-muted-foreground/30`}
        />
      )}
    </div>
  </div>
);
