import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Building2, Globe, Clock, DollarSign, User, Mail, Tag,
  ChevronLeft, Loader2
} from 'lucide-react';
import { FormField } from '../shared/FormField';
import { Button } from '../../ui/button';
import { StepIndicator } from '../shared/StepIndicator';
import { showToast } from '../../ui/toast';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { onboardingApi } from '../../../lib/onboarding-api';

type CountryKey =
  | "India" | "United States" | "United Kingdom" | "Canada"
  | "Australia" | "UAE" | "Singapore" | "Germany" | "France";

const countryDefaults: Record<CountryKey, { taxLabel: string; currency: string; timezone: string }> = {
  India: { taxLabel: "GSTIN", currency: "INR", timezone: "Asia/Kolkata (IST +5:30)" },
  "United States": { taxLabel: "EIN", currency: "USD", timezone: "America/New_York (EST -5:00)" },
  "United Kingdom": { taxLabel: "VAT", currency: "GBP", timezone: "Europe/London (GMT +0:00)" },
  Canada: { taxLabel: "Business Number", currency: "CAD", timezone: "America/Toronto (EST -5:00)" },
  Australia: { taxLabel: "ABN", currency: "AUD", timezone: "Australia/Sydney (AEDT +11:00)" },
  UAE: { taxLabel: "TRN", currency: "AED", timezone: "Asia/Dubai (GST +4:00)" },
  Singapore: { taxLabel: "UEN", currency: "SGD", timezone: "Asia/Singapore (SGT +8:00)" },
  Germany: { taxLabel: "VAT ID", currency: "EUR", timezone: "Europe/Berlin (CET +1:00)" },
  France: { taxLabel: "TVA", currency: "EUR", timezone: "Europe/Paris (CET +1:00)" },
};

const COUNTRIES = Object.keys(countryDefaults) as CountryKey[];
const TIMEZONES = ["Asia/Kolkata (IST +5:30)", "America/New_York (EST -5:00)", "Europe/London (GMT +0:00)", "Asia/Dubai (GST +4:00)", "Asia/Singapore (SGT +8:00)"];
const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AED", "SGD"];
const TAX_SYSTEMS = ["GST", "VAT", "Sales Tax", "None"];

export const OrganizationStep: React.FC<{ onNext: (data: any) => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { organization, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: organization.company_name || "",
    abbr: organization.abbr || "",
    country: organization.country || "India",
    timezone: organization.timezone || "Asia/Kolkata (IST +5:30)",
    currency: organization.currency || "INR",
    user_name: organization.user_name || "",
    email: organization.email || "",
    tax_system: organization.tax_system || "GST",
  });

  useEffect(() => {
    const defaults = countryDefaults[formData.country as CountryKey];
    if (defaults) {
      setFormData(prev => ({
        ...prev,
        currency: defaults.currency,
        timezone: defaults.timezone,
      }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.company_name && !formData.abbr) {
      const generatedAbbr = formData.company_name
        .split(/\s+/)
        .map((w: string) => w[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 5);
      setFormData(prev => ({ ...prev, abbr: generatedAbbr }));
    }
  }, [formData.company_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await onboardingApi.setupOrganization(formData);
      if (response.success) {
        updateData('organization', formData);
        onNext(formData);
      } else {
        showToast.error(response.message || 'Setup failed');
      }
    } catch (error: any) {
      showToast.error(error.message || 'A connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl font-inter animate-in fade-in duration-700">
      <StepIndicator steps={[{ id: 1, label: 'Organization' }, { id: 2, label: 'Configuration' }, { id: 3, label: 'Finalize' }]} currentStep={1} />

      <div className="w-full bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-primary p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Setup Your Workspace</h1>
            <p className="text-primary-foreground/70 text-base font-medium">Let's start with the basic identities of your organization.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField 
              label="Company Name" 
              placeholder="e.g. The Grand Kitchen"
              icon={<Building2 className="w-4 h-4" />}
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              required
            />
            <FormField 
              label="Abbreviation" 
              placeholder="e.g. TGK"
              icon={<Tag className="w-4 h-4" />}
              value={formData.abbr}
              onChange={(e) => setFormData({...formData, abbr: e.target.value.toUpperCase()})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField 
              label="Country" 
              type="select" 
              icon={<Globe className="w-4 h-4" />}
              options={COUNTRIES.map(c => ({ value: c, label: c }))}
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            />
            <FormField 
              label="Timezone" 
              type="select" 
              icon={<Clock className="w-4 h-4" />}
              options={TIMEZONES.map(t => ({ value: t, label: t }))}
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
            />
            <FormField 
              label="Currency" 
              type="select" 
              icon={<DollarSign className="w-4 h-4" />}
              options={CURRENCIES.map(c => ({ value: c, label: c }))}
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
            />
          </div>

          <div className="h-px bg-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField 
              label="Admin Full Name" 
              placeholder="Jane Doe"
              icon={<User className="w-4 h-4" />}
              value={formData.user_name}
              onChange={(e) => setFormData({...formData, user_name: e.target.value})}
              required
            />
            <FormField 
              label="Admin Email" 
              type="email"
              placeholder="admin@restaurant.com"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Tax System</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TAX_SYSTEMS.map(tax => (
                <button
                  key={tax}
                  type="button"
                  onClick={() => setFormData({...formData, tax_system: tax})}
                  className={`p-4 rounded-2xl border font-bold text-sm transition-all ${
                    formData.tax_system === tax 
                      ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {tax}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="px-8 h-14 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Start Organization Setup</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
