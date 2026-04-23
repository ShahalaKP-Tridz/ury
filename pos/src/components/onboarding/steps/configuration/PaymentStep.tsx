import React, { useEffect, useState } from 'react';
import { CreditCard, Wallet, Banknote, Loader2, Plus, Trash2, CheckCircle2, ShieldCheck, Pencil, X, Check, ChevronDown } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'card': return CreditCard;
    case 'wallet': return Wallet;
    default: return Banknote;
  }
};

interface PaymentForm { name: string; type: string; }
const emptyForm = (): PaymentForm => ({ name: '', type: 'Cash' });

export const PaymentStep: React.FC = () => {
  const { payments, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PaymentForm>(emptyForm());
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (payments.length > 0) return;
    setLoading(true);
    onboardingApi.getMopContext()
      .then(res => { if (res?.payment_methods?.length > 0) updateData('payments', res.payment_methods); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (i: number) => { setForm({ ...payments[i] }); setEditIndex(i); };
  const cancelEdit = () => { setForm(emptyForm()); setEditIndex(null); };

  const save = () => {
    if (!form.name.trim()) { showToast.error('Enter a method name'); return; }
    const next = [...payments];
    const entry = { name: form.name.trim(), type: form.type };
    if (editIndex !== null) { next[editIndex] = entry; showToast.success('Payment method updated'); }
    else { next.push(entry); showToast.success('Payment method added'); }
    updateData('payments', next);
    cancelEdit();
  };

  const remove = (i: number) => {
    const next = [...payments]; next.splice(i, 1); updateData('payments', next);
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Fetching payment methods...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Payment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {payments.map((payment, i) => {
            const Icon = getIcon(payment.type);
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="p-5 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{payment.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{payment.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(i)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(i)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add / Edit form */}
      <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Method Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm"
            placeholder="e.g. UPI / QR"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Type</label>
          <div className="relative">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold appearance-none shadow-sm"
            >
              <option>Cash</option>
              <option>Card</option>
              <option>Wallet</option>
            </select>
            <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2">
          {editIndex !== null && (
            <Button variant="outline" onClick={cancelEdit} className="h-[52px] px-5 rounded-xl font-bold gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
          <Button onClick={save} className="h-[52px] px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg gap-2">
            {editIndex !== null ? <><Check className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Method</>}
          </Button>
        </div>
      </div>

      <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Secure Payments</h4>
          <p className="text-xs text-emerald-700 leading-relaxed mt-1">
            Configure the payment methods supported at your POS. Advanced integrations can be added later from settings.
          </p>
        </div>
      </div>
    </div>
  );
};
