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
    <div className="flex items-center justify-center gap-4 mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-300 text-sm",
                activeStep >= step.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {step.id}
            </div>
            <span className={cn(
              "text-xs font-black uppercase tracking-widest transition-colors duration-300",
              activeStep >= step.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.name}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn(
              "w-16 h-0.5 rounded-full transition-colors duration-300 mx-2",
              activeStep > step.id ? "bg-primary" : "bg-border"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
