import React from 'react';
import { ChevronLeft } from 'lucide-react';

export const SetupLayout = ({ 
  children, 
  title, 
  subtitle,
  onExit,
  hideHeader = false
}: { 
  children: React.ReactNode; 
  title: string; 
  subtitle: string;
  onExit?: () => void;
  hideHeader?: boolean;
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-6 selection:bg-primary/10 italic-none font-inter">
      <div className="w-full max-w-4xl relative">
        {onExit && (
          <button 
            onClick={onExit}
            className="group absolute -left-4 xl:-left-24 top-0 flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300"
          >
            <div className="w-10 h-10 bg-card shadow-sm border border-border rounded-xl flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-primary/5 transition-all">
              <ChevronLeft size={20} />
            </div>
            <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] leading-none">
              Exit Setup
            </span>
          </button>
        )}
        
        {!hideHeader && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-border rounded-[28px] shadow-2xl shadow-primary/5 mb-8 transform transition-transform hover:scale-105 overflow-hidden">
              <img 
                src="/assets/ury/pos/ury_pos.png" 
                alt="URY Logo" 
                className="w-full h-full object-contain p-3"
              />
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tight mb-4">
              {title}
            </h1>

            <p className="text-muted-foreground text-xl max-w-md mx-auto font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
        )}

        <div className="relative z-10 transition-all duration-500">
          {children}
        </div>
        
        <p className="text-center text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] mt-16 opacity-50">
          Settings can be refined anytime in the Control Panel
        </p>
      </div>
    </div>
  );
};
