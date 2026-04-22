import React, { useState, useEffect } from 'react';
import {
  Zap, Settings2, ArrowRight,
  Building2, Globe, Clock, DollarSign, User, Mail, Tag,
  ChevronLeft, Loader2
} from 'lucide-react';
import { FormField } from '../shared/FormField';
import { Button } from '../../ui/button';
import { StepIndicator } from '../shared/StepIndicator';
import { ModeCard } from '../shared/ModeCard';
import { showToast } from '../../ui/toast';
import type { OnboardingStepProps } from '../../../pages/onboarding/steps';

type CountryKey =
  | "India"
  | "United States"
  | "United Kingdom"
  | "Canada"
  | "Australia"
  | "UAE"
  | "Singapore"
  | "Germany"
  | "France";

const countryDefaults: Record<
  CountryKey,
  { taxLabel: string; currency: string; timezone: string }
> = {
  India: { taxLabel: "GSTIN", currency: "INR", timezone: "Asia/Kolkata (IST +5:30)" },
  "United States": { taxLabel: "EIN", currency: "USD", timezone: "America/New_York (EST -5:00)" },
  "United Kingdom": { taxLabel: "VAT Number", currency: "GBP", timezone: "Europe/London (GMT +0:00)" },
  Canada: { taxLabel: "Business Number", currency: "CAD", timezone: "America/Toronto (EST -5:00)" },
  Australia: { taxLabel: "ABN", currency: "AUD", timezone: "Australia/Sydney (AEDT +11:00)" },
  UAE: { taxLabel: "TRN", currency: "AED", timezone: "Asia/Dubai (GST +4:00)" },
  Singapore: { taxLabel: "GST Number", currency: "SGD", timezone: "Asia/Singapore (SGT +8:00)" },
  Germany: { taxLabel: "Steuernummer", currency: "EUR", timezone: "Europe/Berlin (CET +1:00)" },
  France: { taxLabel: "VAT", currency: "EUR", timezone: "Europe/Paris (CET +1:00)" },
};

const COUNTRIES = Object.keys(countryDefaults) as CountryKey[];

const LANGUAGES = ["English", "Hindi", "Arabic", "French", "Spanish", "German", "Tamil", "Telugu"];

const TIMEZONES = [
  "Asia/Kolkata (IST +5:30)",
  "America/New_York (EST -5:00)",
  "America/Los_Angeles (PST -8:00)",
  "Europe/London (GMT +0:00)",
  "Europe/Berlin (CET +1:00)",
  "Asia/Dubai (GST +4:00)",
  "Asia/Singapore (SGT +8:00)",
  "Australia/Sydney (AEDT +11:00)",
];

const CURRENCIES = [
  { value: "INR", label: "₹  INR — Indian Rupee" },
  { value: "USD", label: "$  USD — US Dollar" },
  { value: "GBP", label: "£  GBP — British Pound" },
  { value: "EUR", label: "€  EUR — Euro" },
  { value: "AED", label: "د.إ  AED — UAE Dirham" },
  { value: "SGD", label: "S$  SGD — Singapore Dollar" },
  { value: "CAD", label: "CA$  CAD — Canadian Dollar" },
  { value: "AUD", label: "A$  AUD — Australian Dollar" },
];

import { onboardingApi } from '../../../lib/onboarding-api';

export const OrganizationStep: React.FC<OnboardingStepProps> = ({ onNext, onBack, data }) => {
  const [formData, setFormData] = useState({
    language: data.language || "English",
    country: data.country || "India" as CountryKey,
    timezone: data.timezone || "Asia/Kolkata (IST +5:30)",
    currency: data.currency || "INR",
    userName: data.userName || "",
    email: data.email || "",
    companyName: data.companyName || "",
    taxNumber: data.taxNumber || "",
    abbreviation: data.abbreviation || "",
    installationType: data.installationType || "minimal" as "minimal" | "advanced",
    generateDemo: data.generateDemo !== undefined ? data.generateDemo : true,
  });

  const [loading, setLoading] = useState(false);

  // Smart defaults when country changes (only if it's a fresh selection or explicit change)
  useEffect(() => {
    const prevCountry = data.country as CountryKey;
    if (!prevCountry || formData.country !== prevCountry) {
      const defaults = countryDefaults[formData.country as CountryKey];
      if (defaults) {
        setFormData((prev) => ({
          ...prev,
          currency: defaults.currency,
          timezone: defaults.timezone,
        }));
      }
    }
  }, [formData.country, data.country]);

  // Auto-generate abbreviation from company name in real-time
  useEffect(() => {
    if (formData.companyName) {
      const words = formData.companyName.trim().split(/\s+/);
      const generatedAbbr = words
        .map((w: string) => w[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 5);

      // Only update if current abbreviation is empty OR was likely auto-generated (matches pattern of previous name)
      setFormData((prev) => {
        if (!prev.abbreviation || prev.abbreviation.length <= 1 || /^[A-Z0-9]+$/.test(prev.abbreviation)) {
          // If the user hasn't manually diverged significantly, keep syncing
          return { ...prev, abbreviation: generatedAbbr };
        }
        return prev;
      });
    } else {
      // Clear abbreviation if company name is cleared
      setFormData(prev => ({ ...prev, abbreviation: '' }));
    }
  }, [formData.companyName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Guard against double clicks
    
    setLoading(true);
    try {
      const result = await onboardingApi.setupOrganization(formData);
      if (result.success) {
        onNext({ ...formData, ...result.data });
      } else {
        showToast.error(result.message || 'Failed to setup organization');
      }
    } catch (error) {
      console.error('Setup error:', error);
      showToast.error('A connection error occurred. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Setup' },
    { id: 2, label: 'Configure' },
    { id: 3, label: 'Done' }
  ];

  const taxLabel = countryDefaults[formData.country as CountryKey]?.taxLabel || "Tax Number";

  return (
    <div className="flex flex-col items-center w-full max-w-2xl font-inter">
      <StepIndicator steps={steps} currentStep={1} />

      <div className="w-full bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-10 py-8 text-white">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Setup Your Workspace</h1>
          <p className="text-primary-foreground/80 text-sm font-medium">Configure basic details to personalize your URY experience</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">

          {/* Row 1: Language + Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Language" 
              type="select" 
              icon={<Globe className="w-4 h-4 text-slate-400" />}
              options={LANGUAGES.map(l => ({ value: l, label: l }))}
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              disabled={loading}
            />
            <FormField 
              label="Country" 
              type="select" 
              icon={<Globe className="w-4 h-4 text-slate-400" />}
              options={COUNTRIES.map(c => ({ value: c, label: c }))}
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value as CountryKey})}
              disabled={loading}
            />
          </div>

          {/* Row 2: Timezone + Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Timezone" 
              type="select" 
              icon={<Clock className="w-4 h-4 text-slate-400" />}
              options={TIMEZONES.map(t => ({ value: t, label: t }))}
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              disabled={loading}
            />
            <FormField 
              label="Currency" 
              type="select" 
              icon={<DollarSign className="w-4 h-4 text-slate-400" />}
              options={CURRENCIES.map(c => ({ value: c.value, label: c.label }))}
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              disabled={loading}
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Admin Name" 
              placeholder="Your full name"
              icon={<User className="w-4 h-4 text-slate-400" />}
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              required
              disabled={loading}
            />
            <FormField 
              label="Email Address" 
              type="email"
              placeholder="admin@restaurant.com"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FormField 
                label="Company Name" 
                placeholder="e.g. The Grand Cafe"
                icon={<Building2 className="w-4 h-4 text-slate-400" />}
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <FormField 
              label="Abbr" 
              placeholder="TGC"
              value={formData.abbreviation}
              onChange={(e) => setFormData({...formData, abbreviation: e.target.value.toUpperCase()})}
              disabled={loading}
            />
          </div>

          <FormField 
            label={`${taxLabel} (Optional)`} 
            placeholder={`Enter ${taxLabel}`}
            icon={<Tag className="w-4 h-4 text-slate-400" />}
            value={formData.taxNumber}
            onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
            disabled={loading}
          />

          {/* Installation Type */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Installation Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModeCard 
                id="minimal"
                title="Minimal Installation"
                description="Quick setup with guided configuration. Ideal for most restaurants."
                icon={<Zap className="w-6 h-6" />}
                recommended
                selected={formData.installationType === 'minimal'}
                onSelect={() => setFormData({...formData, installationType: 'minimal'})}
              />
              <ModeCard 
                id="advanced"
                title="Advanced Installation"
                description="Skip setup wizard, go directly to the full dashboard."
                icon={<Settings2 className="w-6 h-6" />}
                selected={formData.installationType === 'advanced'}
                onSelect={() => setFormData({...formData, installationType: 'advanced'})}
              />
            </div>
          </div>

          {/* Demo Data Checkbox */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-5">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.generateDemo}
                onChange={(e) => setFormData({...formData, generateDemo: e.target.checked})}
                className="mt-1 w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
              />
              <div>
                <span className="text-sm font-bold text-slate-800">Generate Demo Data for Exploration</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  If checked, we will create sample menu, tables, and orders to help you explore the system. This can be erased later.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-8 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="flex-1 font-bold text-base rounded-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Start Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
