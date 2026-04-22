import {
  ArrowRight, UtensilsCrossed, BarChart3, Users, Package,
  Zap, Globe, ShieldCheck, Star,
} from "lucide-react";
import { Button } from '../../ui/button';
import type { OnboardingStepProps } from '../../../pages/onboarding/steps';

const features = [
  { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Menu & Orders" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Sales Analytics" },
  { icon: <Users className="w-4 h-4" />, label: "Staff Management" },
  { icon: <Package className="w-4 h-4" />, label: "Inventory" },
];

const highlights = [
  { icon: <Zap className="w-4 h-4" />, text: "Quick setup in under 5 minutes" },
  { icon: <Globe className="w-4 h-4" />, text: "Multi-branch & multi-language support" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Secure, cloud-based ERP platform" },
];

export const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-white z-[100] font-inter">
      {/* ─── Left Panel (primary gradient) ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-primary-900 relative overflow-hidden flex-col justify-between p-14">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary-800/30 blur-3xl" />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white rounded-lg p-2 shadow-lg flex items-center justify-center">
            <img 
              src="/assets/ury/pos/ury_pos.png" 
              alt="URY POS" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="ml-1 text-xs bg-white/15 text-white/90 px-2 py-0.5 rounded-full border border-white/20">
            Restaurant ERP
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <p className="text-primary-300 mb-3 text-[0.8125rem] font-medium tracking-widest uppercase">
            All-in-one platform
          </p>
          <h2 className="text-white mb-5 text-4xl font-bold leading-tight">
            The smarter way to<br />run your restaurant
          </h2>
          <p className="text-primary-100 mb-10 text-lg leading-relaxed max-w-md">
            From POS to kitchen management, billing to inventory — every tool your restaurant needs, unified in one place.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="text-primary-300">{f.icon}</div>
                <span className="text-white/90 text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: social proof */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 bg-primary-700 flex items-center justify-center text-[0.625rem] font-bold text-white">
                {["AM", "BR", "CN", "DX"][i - 1]}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              <span className="text-white/80 ml-1 text-xs font-bold">4.9</span>
            </div>
            <p className="text-primary-300 text-xs">Trusted by 500+ restaurants</p>
          </div>
        </div>
      </div>

      {/* ─── Right Panel (light) ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img 
              src="/assets/ury/pos/ury_pos.png" 
              alt="URY POS" 
              className="h-10 w-auto object-contain"
            />
          </div>

          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full border border-primary-100 mb-5 font-medium">
              <Zap className="w-3 h-3" />
              Setup takes less than 5 minutes
            </div>

            <h1 className="text-slate-900 mb-3 text-4xl font-bold leading-tight">
              Welcome to URY
            </h1>
            <p className="text-slate-500 mb-9 text-base leading-relaxed">
              A complete Restaurant ERP platform — set up your workspace, configure your menu, and start taking orders today.
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-10">
              {highlights.map((h) => (
                <div key={h.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                    {h.icon}
                  </div>
                  <span className="text-slate-600 text-sm">{h.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={() => onNext()}
              size="lg"
              className="w-full flex items-center justify-center gap-2.5 bg-primary text-white rounded-lg shadow-md font-bold text-base"
            >
              Go to Setup
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-center text-slate-400 mt-4 text-xs">
              No credit card required · Free to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
