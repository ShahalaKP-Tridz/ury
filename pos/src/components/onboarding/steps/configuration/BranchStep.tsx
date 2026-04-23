import React, { useEffect, useState } from 'react';
import { FormField } from '../../shared/FormField';
import { MapPin, Info, Building2, Phone, Mail, Navigation, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';

export const BranchStep: React.FC = () => {
  const { branchRestaurant, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (Object.keys(branchRestaurant).length > 0) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getBranchRestaurantContext();
        if (response) {
          updateData('branchRestaurant', response);
        }
      } catch (error) {
        console.warn('Could not fetch branch context, starting fresh');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  const handleChange = (field: string, value: any) => {
    updateData('branchRestaurant', { [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Fetching branch details...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Branch Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Branch Details</h3>
              </div>
              
              <div className="space-y-4">
                <FormField 
                  label="Branch Name" 
                  placeholder="e.g. Downtown Outlet" 
                  icon={<Building2 className="w-4 h-4" />}
                  value={branchRestaurant.branch_name || ''} 
                  onChange={(e) => handleChange('branch_name', e.target.value)}
                  required
                />
                <FormField 
                  label="Phone Number" 
                  placeholder="+91 98765 43210" 
                  icon={<Phone className="w-4 h-4" />}
                  value={branchRestaurant.branch_phone || ''} 
                  onChange={(e) => handleChange('branch_phone', e.target.value)}
                />
                <FormField 
                  label="Branch Email" 
                  placeholder="downtown@restaurant.com" 
                  icon={<Mail className="w-4 h-4" />}
                  value={branchRestaurant.branch_email || ''} 
                  onChange={(e) => handleChange('branch_email', e.target.value)}
                />
                <FormField 
                  label="Full Address" 
                  placeholder="Street name, City, Pincode" 
                  icon={<Navigation className="w-4 h-4" />}
                  value={branchRestaurant.branch_address || ''} 
                  onChange={(e) => handleChange('branch_address', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Restaurant Branding */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Restaurant Branding</h3>
              </div>
              
              <div className="space-y-4">
                <FormField 
                  label="Display Name" 
                  placeholder="e.g. URY Kitchen" 
                  icon={<Building2 className="w-4 h-4" />}
                  value={branchRestaurant.restaurant_name || ''} 
                  onChange={(e) => handleChange('restaurant_name', e.target.value)}
                  required
                />
                <FormField 
                  label="Tagline" 
                  placeholder="e.g. Authentic Taste" 
                  icon={<Info className="w-4 h-4" />}
                  value={branchRestaurant.tagline || ''} 
                  onChange={(e) => handleChange('tagline', e.target.value)}
                />
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
                  <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 font-bold text-[10px] uppercase">Upload</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0 text-muted-foreground border border-border shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Unified Profile</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Your branch details are used for billing location, while restaurant branding appears on your customer receipts and online menus.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Internal imports needed for the icon components
import { Utensils, Image } from 'lucide-react';
