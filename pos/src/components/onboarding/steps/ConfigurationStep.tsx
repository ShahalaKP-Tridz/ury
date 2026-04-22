import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Building2,
  UtensilsCrossed,
  Layout,
  Table2,
  Menu,
  CreditCard,
  Users2,
  SkipForward,
  Loader2
} from 'lucide-react';
import { FormField } from '../shared/FormField';
import { Button } from '../../ui/button';
import { StepIndicator } from '../shared/StepIndicator';
import { cn } from '../../../lib/utils';
import { showToast } from '../../ui/toast';
import type { OnboardingStepProps } from '../../../pages/onboarding/steps';

const CONFIG_STEPS = [
  { id: 'branch', label: 'Branch', icon: <Building2 className="w-5 h-5" /> },
  { id: 'restaurant', label: 'Restaurant', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { id: 'rooms', label: 'URY Rooms', icon: <Layout className="w-5 h-5" /> },
  { id: 'tables', label: 'URY Tables', icon: <Table2 className="w-5 h-5" /> },
  { id: 'menu', label: 'URY Menu', icon: <Menu className="w-5 h-5" /> },
  { id: 'payment', label: 'Mode of Payment', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'users', label: 'User Management', icon: <Users2 className="w-5 h-5" /> },
];

import { onboardingApi } from '../../../lib/onboarding-api';

export const ConfigurationStep: React.FC<OnboardingStepProps> = ({ onNext, onBack, data }) => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const activeStep = CONFIG_STEPS[activeStepIdx];

  // Config data state
  const [branchData, setBranchData] = useState({ 
    name: data.branchName || '', 
    address: data.branchAddress || '', 
    phone: data.branchPhone || '' 
  });
  const [restaurantData, setRestaurantData] = useState({ 
    name: data.restaurantName || '', 
    address: data.restaurantAddress || '', 
    phone: data.restaurantPhone || '' 
  });
  
  // Lists
  const [rooms, setRooms] = useState(data.rooms || [
    { name: 'Main Hall', seats: 40 },
    { name: 'Private Dining', seats: 12 }
  ]);
  const [tables, setTables] = useState(data.tables || [
    { name: 'Table 1', seats: 4 },
    { name: 'Table 2', seats: 4 },
    { name: 'Table 3', seats: 4 },
    { name: 'Table 4', seats: 4 },
    { name: 'Table 5', seats: 4 },
    { name: 'Table 6', seats: 4 },
  ]);
  const [menuItems, setMenuItems] = useState(data.menuItems || [
    { name: 'Butter Chicken', category: 'Main Course', price: 320 },
    { name: 'Paneer Tikka', category: 'Starters', price: 280 },
    { name: 'Garlic Naan', category: 'Breads', price: 60 },
  ]);
  const [payments, setPayments] = useState(data.payments || [
    { name: 'Cash', isDefault: true },
    { name: 'Credit / Debit Card', isDefault: false },
    { name: 'UPI', isDefault: false },
  ]);
  const [users, setUsers] = useState(data.users || [
    { name: 'Administrator', role: 'Admin' },
    { name: 'URY Cashier 01', role: 'Cashier' },
  ]);

  const handleSaveAndNext = async () => {
    if (loading) return; // Guard

    if (!completedSteps.includes(activeStep.id)) {
      setCompletedSteps([...completedSteps, activeStep.id]);
    }
    
    if (activeStepIdx < CONFIG_STEPS.length - 1) {
      setActiveStepIdx(activeStepIdx + 1);
    } else {
      // Final step: Finish Setup
      setLoading(true);
      try {
        const workspaceData = {
          ...data, // Keep org data
          branchName: branchData.name || "Main Branch",
          restaurantName: restaurantData.name || "Main Restaurant",
          rooms,
          tables,
          menuItems,
          payments,
          users,
          generateDemo: data.generateDemo ?? true
        };
        const result = await onboardingApi.setupWorkspace(workspaceData);
        if (result.success) {
          onNext(workspaceData);
        } else {
          showToast.error(result.message || 'Failed to finalize setup');
        }
      } catch (error) {
        console.error('Workspace setup error:', error);
        showToast.error('A connection error occurred. Please check your backend and try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    handleSaveAndNext();
  };

  const handlePrev = () => {
    if (activeStepIdx > 0) {
      setActiveStepIdx(activeStepIdx - 1);
    } else {
      onBack();
    }
  };

  const renderStepContent = () => {
    switch (activeStep.id) {
      case 'branch':
      case 'restaurant':
        const currentData = activeStep.id === 'branch' ? branchData : restaurantData;
        const setter = activeStep.id === 'branch' ? setBranchData : setRestaurantData;
        return (
          <div className="space-y-6 font-inter">
            <FormField 
              label={`${activeStep.label} Name`} 
              placeholder={activeStepIdx === 0 ? "The Grand Cafe" : "The Grand Restaurant"} 
              value={currentData.name}
              onChange={(e) => setter({...currentData, name: e.target.value})}
              disabled={loading}
            />
            <FormField 
              label="Address" 
              placeholder="Street, City, State" 
              value={currentData.address}
              onChange={(e) => setter({...currentData, address: e.target.value})}
              disabled={loading}
            />
            <FormField 
              label="Phone Number" 
              placeholder="+91 98765 43210" 
              value={currentData.phone}
              onChange={(e) => setter({...currentData, phone: e.target.value})}
              disabled={loading}
            />
          </div>
        );
      
      case 'rooms':
        return (
          <div className="space-y-6 font-inter">
            <div className="space-y-3">
              {rooms.map((room: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group">
                  <div>
                    <p className="font-bold text-gray-900">{room.name}</p>
                    <p className="text-xs text-gray-400">Capacity: {room.seats} seats</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-primary" disabled={loading}><Menu className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-red-600" disabled={loading} onClick={() => setRooms(rooms.filter((_: any, idx: number) => idx !== i))}>
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="Room name (e.g. Rooftop)" disabled={loading} />
              <input className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="Seats" type="number" disabled={loading} />
              <Button onClick={() => {}} size="sm" className="w-auto rounded-lg" disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "+ Add Room"}
              </Button>
            </div>
          </div>
        );

      case 'tables':
        return (
          <div className="space-y-6 font-inter">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table: any, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3 text-primary">
                    <Table2 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-gray-900">{table.name}</p>
                  <p className="text-xs text-gray-400">{table.seats} seats</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="Table name (e.g. T-07)" disabled={loading} />
              <input className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="4" type="number" disabled={loading} />
              <Button onClick={() => {}} size="sm" className="w-auto rounded-lg" disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "+ Add Table"}
              </Button>
            </div>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-8 font-inter">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700">Tax Configuration</label>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-lg border-2 border-primary bg-primary-50 flex items-center gap-3 cursor-pointer">
                  <div className="w-4 h-4 rounded-full border-4 border-primary" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Inclusive</p>
                    <p className="text-[10px] text-gray-500">Tax within price</p>
                  </div>
                </div>
                <div className="flex-1 p-4 rounded-lg border border-gray-200 flex items-center gap-3 cursor-pointer hover:bg-gray-50">
                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Exclusive</p>
                    <p className="text-[10px] text-gray-500">Tax added on top</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">Menu Items ({menuItems.length})</h4>
                <button className="text-xs font-bold text-primary hover:underline">↑ Upload Menu</button>
              </div>
              {menuItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-gray-900">₹{item.price}</p>
                    <button className="text-gray-300 hover:text-red-600" disabled={loading}><Check className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              <input className="flex-1 min-w-[200px] px-6 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="Item name" disabled={loading} />
              <select className="px-6 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" disabled={loading}>
                <option>Main Course</option>
                <option>Starters</option>
              </select>
              <input className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="Price" type="number" disabled={loading} />
              <Button onClick={() => {}} size="sm" className="w-auto rounded-lg" disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "+ Add"}
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6 font-inter">
            <div className="space-y-3">
              {payments.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      {p.isDefault && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-red-600" disabled={loading}><Check className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors disabled:bg-gray-50 text-sm" placeholder="e.g. Paytm, Wallet, NEFT..." disabled={loading} />
              <Button onClick={() => {}} size="sm" className="w-auto rounded-lg" disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "+ Add Method"}
              </Button>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-8 font-inter">
            <div className="space-y-3">
              {users.map((u: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary font-bold">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">Role: {u.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-primary-50 text-primary px-3 py-1 rounded-full font-bold uppercase">{u.role}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Create New User</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Username" placeholder="URY Cashier 02" disabled={loading} />
                <FormField label="Password" type="password" placeholder="••••••••••••" disabled={loading} />
                <FormField label="Role" type="select" options={[{ value: 'Cashier', label: 'Cashier' }, { value: 'Admin', label: 'Admin' }]} disabled={loading} />
                <div className="flex items-end">
                  <Button onClick={() => {}} size="lg" className="w-full font-bold text-base rounded-lg" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "+ Create User"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 1, label: 'Setup' },
    { id: 2, label: 'Configure' },
    { id: 3, label: 'Done' }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-7xl font-inter">
      <StepIndicator steps={steps} currentStep={2} />

      <div className="w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Left Sidebar */}
        <div className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 px-2">Configuration Steps</h3>
          
          <nav className="space-y-2 flex-1">
            {CONFIG_STEPS.map((step, idx) => {
              const isActive = activeStep.id === step.id;
              const isDone = completedSteps.includes(step.id);
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIdx(idx)}
                  disabled={loading}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-300 text-left relative overflow-hidden group",
                    isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <div className={cn(
                    "relative z-10 p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    {step.icon}
                  </div>
                  <span className="relative z-10 font-bold text-sm tracking-tight">{step.label}</span>
                  {isDone && !isActive && (
                    <div className="absolute right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Progress</span>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-900">Step {activeStepIdx + 1} of {CONFIG_STEPS.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((activeStepIdx + 1) / CONFIG_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 md:p-16">
            <div className="flex items-start justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tighter">{activeStep.label}</h2>
                <p className="text-gray-500 font-medium text-base">Configure your main {activeStep.label.toLowerCase()} location and contact details</p>
              </div>
              <button 
                onClick={handleSkip}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-primary font-bold text-sm transition-all group disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Skip
              </button>
            </div>

            <div className="max-w-3xl">
              {renderStepContent()}
              
              <div className="pt-10">
                <Button 
                  onClick={handleSaveAndNext}
                  disabled={loading}
                  size="lg"
                  className="w-auto px-12 font-bold text-base rounded-lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    `Save ${activeStep.label}`
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Nav */}
          <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between px-16">
            <button
              onClick={handlePrev}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 font-bold text-gray-400 hover:text-gray-700 transition-all duration-300 group disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Previous
            </button>
            <Button 
              onClick={handleSaveAndNext}
              disabled={loading}
              size="lg"
              className={cn(
                "w-auto px-12 font-bold text-base rounded-lg",
                activeStepIdx === CONFIG_STEPS.length - 1 && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {activeStepIdx === CONFIG_STEPS.length - 1 ? "Finish Setup" : "Next"}
                  {activeStepIdx === CONFIG_STEPS.length - 1 ? <Check className="w-5 h-5 ml-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
