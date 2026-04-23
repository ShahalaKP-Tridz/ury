import React, { useEffect, useState } from 'react';
import { FormField } from '../../shared/FormField';
import { UtensilsCrossed, Info, Building2, Image, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';

export const RestaurantStep: React.FC = () => {
  const { restaurant, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (Object.keys(restaurant).length > 0) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getRestaurantContext();
        if (response) {
          updateData('restaurant', response);
        }
      } catch (error) {
        console.warn('Could not fetch restaurant context, starting fresh');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  const handleChange = (field: string, value: any) => {
    updateData('restaurant', { [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Fetching restaurant details...</p>
        </div>
      ) : (
        <>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Restaurant Branding</h3>
            </div>

            <div className="space-y-4">
              <FormField
                label="Display Name"
                placeholder="e.g. URY Kitchen"
                icon={<Building2 className="w-4 h-4" />}
                value={restaurant.restaurant_name || ''}
                onChange={(e) => handleChange('restaurant_name', e.target.value)}
                required
              />
              <FormField
                label="Tagline"
                placeholder="e.g. Authentic Taste"
                icon={<Info className="w-4 h-4" />}
                value={restaurant.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
              <FormField
                label="Cuisine Type"
                type="select"
                options={[
                  { value: 'fine_dining', label: 'Fine Dining' },
                  { value: 'casual_dining', label: 'Casual Dining' },
                  { value: 'fast_food', label: 'Quick Service / Fast Food' },
                  { value: 'cafe', label: 'Cafe / Bakery' },
                ]}
                value={restaurant.type || 'casual_dining'}
                onChange={(e) => handleChange('type', e.target.value)}
              />
              <FormField
                label="Base Currency"
                type="select"
                options={[
                  { value: 'INR', label: 'Indian Rupee (₹)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'AED', label: 'UAE Dirham' },
                ]}
                value={restaurant.currency || 'INR'}
                onChange={(e) => handleChange('currency', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Opening Time"
                  type="time"
                  value={restaurant.opening_time || '09:00'}
                  onChange={(e) => handleChange('opening_time', e.target.value)}
                />
                <FormField
                  label="Closing Time"
                  type="time"
                  value={restaurant.closing_time || '23:00'}
                  onChange={(e) => handleChange('closing_time', e.target.value)}
                />
              </div>

              {/* Logo Upload */}
              <div className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Image className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Brand Logo</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 font-bold text-[10px] uppercase">
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex gap-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0 text-muted-foreground border border-border shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Customer-Facing Profile</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Your restaurant name and logo will appear on customer receipts, online menus, and the POS display.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
