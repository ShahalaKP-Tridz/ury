import { Zap, Settings, CheckCircle2, ArrowRight } from 'lucide-react';
import { SetupCard, PrimaryButton } from './Shared';

export const ModeSelection = ({ onSelect }: { onSelect: (mode: 'minimal' | 'advanced') => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Minimal Card */}
      <div 
        onClick={() => onSelect('minimal')}
        className="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
      >
        <SetupCard className="h-full flex flex-col items-center border-2 border-transparent hover:border-primary hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Recommended
          </div>
          
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <Zap fill="currentColor" size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-2">Minimal Installation</h3>
          <p className="text-muted-foreground text-center mb-8">Quick setup to start using POS immediately</p>
          
          <ul className="space-y-4 mb-10 w-full">
            {[
              "Basic organization setup",
              "Quick menu configuration",
              "Optional modules to configure",
              "Ready in minutes"
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground font-medium">
                <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          
          <div className="mt-auto w-full">
            <PrimaryButton className="w-full">
              Get Started <ArrowRight size={18} />
            </PrimaryButton>
          </div>
        </SetupCard>
      </div>

      {/* Advanced Card */}
      <div 
        onClick={() => onSelect('advanced')}
        className="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
      >
        <SetupCard className="h-full flex flex-col items-center border-2 border-transparent hover:border-primary hover:shadow-2xl hover:shadow-primary/10">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center text-muted-foreground mb-6 group-hover:scale-110 transition-transform">
            <Settings size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-2">Advanced Installation</h3>
          <p className="text-muted-foreground text-center mb-8">Full configuration with detailed setup options</p>
          
          <ul className="space-y-4 mb-10 w-full">
            {[
              "Full module configuration",
              "Multi-branch & restaurant support",
              "Complete control over all settings",
              "Ideal for complex operations"
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground font-medium">
                <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          
          <div className="mt-auto w-full">
            <PrimaryButton variant="secondary" className="w-full">
              Advanced Setup <ArrowRight size={18} />
            </PrimaryButton>
          </div>
        </SetupCard>
      </div>
    </div>
  );
};
