import React from 'react';
import { cn } from './Shared';

const steps = [
  { id: 1, name: 'Organization' },
  { id: 2, name: 'Mode' },
  { id: 3, name: 'Menu' },
  { id: 4, name: 'Settings' }
];

export const StepIndicator = ({ activeStep }: { activeStep: number }) => {
  return (
    <div className="w-full flex items-center justify-between gap-2 px-2 py-4">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          {/* Step Item */}
          <div className="flex items-center gap-2.5 group shrink-0">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all duration-500 text-xs shrink-0",
                activeStep >= step.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {step.id}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors duration-500 whitespace-nowrap",
              activeStep >= step.id ? "text-foreground opacity-100" : "text-muted-foreground opacity-60"
            )}>
              {step.name}
            </span>
          </div>

          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div className="flex-1 min-w-[1.5rem] h-px relative mx-2">
              <div className="absolute inset-0 bg-border rounded-full" />
              <div 
                className={cn(
                  "absolute inset-0 bg-primary rounded-full transition-all duration-700 ease-in-out",
                  activeStep > step.id ? "w-full opacity-100" : "w-0 opacity-0"
                )} 
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
