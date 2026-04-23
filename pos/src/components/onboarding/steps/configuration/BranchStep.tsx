import React, { useEffect, useState } from 'react';
import { FormField } from '../../shared/FormField';
import { MapPin, Info, Building2, Phone, Mail, Navigation, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';

export const BranchStep: React.FC = () => {
  const { branch, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (Object.keys(branch).length > 0) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getBranchContext();
        if (response) {
          updateData('branch', response);
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
    updateData('branch', { [field]: value });
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
          <div className="max-w-2xl mx-auto space-y-6">
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
                value={branch.branch_name || ''} 
                onChange={(e) => handleChange('branch_name', e.target.value)}
                required
              />
              <FormField 
                label="Phone Number" 
                placeholder="+91 98765 43210" 
                icon={<Phone className="w-4 h-4" />}
                value={branch.branch_phone || ''} 
                onChange={(e) => handleChange('branch_phone', e.target.value)}
              />
              <FormField 
                label="Branch Email" 
                placeholder="downtown@restaurant.com" 
                icon={<Mail className="w-4 h-4" />}
                value={branch.branch_email || ''} 
                onChange={(e) => handleChange('branch_email', e.target.value)}
              />
              <FormField 
                label="Full Address" 
                placeholder="Street name, City, Pincode" 
                icon={<Navigation className="w-4 h-4" />}
                value={branch.branch_address || ''} 
                onChange={(e) => handleChange('branch_address', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex gap-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0 text-muted-foreground border border-border shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Branch Information</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                This information will be used for your legal entity and billing address on invoices.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

