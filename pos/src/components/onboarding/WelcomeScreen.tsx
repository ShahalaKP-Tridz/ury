import { ArrowRight, LayoutDashboard, Shield, Zap } from 'lucide-react';
import { Button } from '../ui/button';

export const WelcomeScreen = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="bg-card text-card-foreground rounded-3xl border border-border p-8 md:p-14 max-w-3xl mx-auto shadow-2xl shadow-primary/5 relative overflow-hidden group">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full opacity-50 transition-transform group-hover:scale-110 duration-700" />

      <div className="flex flex-col items-center text-center relative z-10">
        {/* Logo Icon */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-primary/10 transform transition-transform group-hover:rotate-3 overflow-hidden border border-border">
          <img
            src="/assets/ury/pos/ury_pos.png"
            alt="URY Logo"
            className="w-full h-full object-contain p-3"
          />
        </div>


        <h2 className="text-4xl font-black text-foreground mb-5 tracking-tight">
          Welcome to <span className="text-primary">URY</span>
        </h2>

        <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-md font-medium">
          The next generation of restaurant management.
          Streamline your service, manage inventory, and grow your business with ease.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-14">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border border-border transition-all hover:bg-card hover:border-primary/30 group/item">
            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm group-hover/item:text-primary transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground text-sm">Intuitive POS</h3>
              <p className="text-muted-foreground text-xs leading-tight text-balance">Modern interface for fast ordering.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border border-border transition-all hover:bg-card hover:border-primary/30 group/item">
            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm group-hover/item:text-green-600 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground text-sm">Secure Data</h3>
              <p className="text-muted-foreground text-xs leading-tight text-balance">Enterprise-grade security and backups.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm mx-auto">
          <Button
            onClick={onNext}
            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl text-lg font-black hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
            <span className="flex items-center gap-1.5 text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest">
              <Zap className="w-3 h-3 text-yellow-500" />
              Fast Setup
            </span>
            <div className="w-1 h-1 bg-border rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
