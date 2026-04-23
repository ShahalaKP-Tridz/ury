import React from 'react';
import { FormField } from '../../shared/FormField';
import { UtensilsCrossed, Info } from 'lucide-react';

interface RestaurantStepProps {
  data: any;
  onChange: (data: any) => void;
  loading: boolean;
}

export const RestaurantStep: React.FC<RestaurantStepProps> = ({ data, onChange, loading }) => {
  return (
    <div className="space-y-8 font-inter w-full">
      <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Restaurant Profile</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">Define your restaurant type and currency. This helps us optimize the interface for your specific needs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Cuisine Type" 
          type="select"
          options={[
            { value: 'fine_dining', label: 'Fine Dining' },
            { value: 'casual_dining', label: 'Casual Dining' },
            { value: 'fast_food', label: 'Quick Service / Fast Food' },
            { value: 'cafe', label: 'Cafe / Bakery' }
          ]}
          value={data.type || 'casual_dining'} 
          onChange={(e) => onChange({...data, type: e.target.value})}
          disabled={loading}
        />
        <FormField 
          label="Base Currency" 
          type="select"
          options={[
            { value: 'INR', label: 'Indian Rupee (₹)' },
            { value: 'USD', label: 'US Dollar ($)' },
            { value: 'AED', label: 'UAE Dirham' }
          ]}
          value={data.currency || 'INR'} 
          onChange={(e) => onChange({...data, currency: e.target.value})}
          disabled={loading}
        />
        <FormField 
          label="Opening Time" 
          type="time"
          value={data.opening_time || '09:00'} 
          onChange={(e) => onChange({...data, opening_time: e.target.value})}
          disabled={loading}
        />
        <FormField 
          label="Closing Time" 
          type="time"
          value={data.closing_time || '23:00'} 
          onChange={(e) => onChange({...data, closing_time: e.target.value})}
          disabled={loading}
        />
      </div>

      <div className="pt-4 flex items-center gap-2 text-muted-foreground opacity-60">
        <Info className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Time zones are automatically detected</span>
      </div>
    </div>
  );
};
