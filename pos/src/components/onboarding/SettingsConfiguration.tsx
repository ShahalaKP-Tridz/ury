import { SetupCard, PrimaryButton } from './Shared';
import { 
  Printer, 
  Bed, 
  Layout, 
  CreditCard, 
  GitBranch, 
  Utensils, 
  Users, 
  ChevronRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const settingsModules = [
  { id: 'printer', title: 'Printer Setup', desc: 'Configure receipt and KOT printers', icon: Printer, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'rooms', title: 'URY Rooms', desc: 'Setup restaurant dining rooms', icon: Bed, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'tables', title: 'URY Tables', desc: 'Define table layout and capacity', icon: Layout, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'payment', title: 'Mode of Payment', desc: 'Cash, Card, UPI and custom methods', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'branch', title: 'Branch', desc: 'Configure branch details and location', icon: GitBranch, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'restaurant', title: 'Restaurant', desc: 'Main restaurant profile settings', icon: Utensils, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'users', title: 'User Management', desc: 'Setup waiters, cashiers and admins', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
];

export const SettingsConfiguration = ({ onFinish, onBack, disabled }: { onFinish: () => void, onBack: () => void, disabled?: boolean }) => {

  return (
    <div className="max-w-3xl mx-auto">
      <SetupCard>
        <div className="space-y-3 mb-10">
          {settingsModules.map((module) => (
            <button 
              key={module.id}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all group text-left"
            >
              <div className={`${module.bg} ${module.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <module.icon size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground">{module.title}</h4>
                <p className="text-sm text-muted-foreground">{module.desc}</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors px-4 py-2 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <PrimaryButton onClick={onFinish} disabled={disabled} className="px-10">
            {disabled ? 'Finishing...' : 'Finish Setup'} <CheckCircle2 size={18} />
          </PrimaryButton>

        </div>
      </SetupCard>
    </div>
  );
};
