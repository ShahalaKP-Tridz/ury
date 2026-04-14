import React from 'react';
import { StepIndicator } from './StepIndicator';

export const SetupLayout = ({ 
  children, 
  title, 
  subtitle,

  hideHeader = false,
  activeStep
}: { 
  children: React.ReactNode; 
  title: string; 
  subtitle: string;

  hideHeader?: boolean;
  activeStep?: number;
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-6 italic-none font-inter selection:bg-primary/20">
      <div className="w-full max-w-4xl relative">

        
        {/* Branded Header */}
        {!hideHeader && (
          <div className="text-center mb-10 pt-12 lg:pt-0">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-border rounded-3xl shadow-2xl shadow-primary/5 mb-8 transform transition-transform hover:scale-105 active:scale-95 overflow-hidden">
              <img 
                src="/assets/ury/pos/ury_pos.png" 
                alt="URY Logo" 
                className="w-full h-full object-contain p-3"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto font-medium leading-relaxed mb-10">
              {subtitle}
            </p>

            {/* Integrated Step Progress */}
            {activeStep !== undefined && activeStep > 0 && (
              <div className="max-w-2xl mx-auto mb-4">
                <StepIndicator activeStep={activeStep} />
              </div>
            )}
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className={`relative z-10 ${hideHeader ? 'pt-16 lg:pt-0' : ''}`}>
          {children}
        </div>
        
        {/* Footer info */}
        <div className="mt-16 text-center space-y-4">
          <div className="w-12 h-1 bg-border rounded-full mx-auto opacity-30" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
            URY Enterprise Cloud • Control Panel Refined
          </p>
        </div>
      </div>
    </div>
  );
};
