import React, { useEffect, useState } from 'react';
import { User, Shield, Loader2, Trash2, UserPlus, Pencil, X, Check, ChevronDown } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

interface UserForm { name: string; role: string; }
const emptyForm = (): UserForm => ({ name: '', role: 'Cashier' });

const ROLE_COLORS: Record<string, string> = {
  Administrator: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Cashier: 'bg-emerald-100 text-emerald-700',
  Waiter: 'bg-amber-100 text-amber-700',
};

export const UsersStep: React.FC = () => {
  const { users, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (users.length > 0) return;
    setLoading(true);
    onboardingApi.getUserManagementContext()
      .then(res => { if (res?.users?.length > 0) updateData('users', res.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (i: number) => { setForm({ ...users[i] }); setEditIndex(i); };
  const cancelEdit = () => { setForm(emptyForm()); setEditIndex(null); };

  const save = () => {
    if (!form.name.trim()) { showToast.error('Enter the user name'); return; }
    const next = [...users];
    const entry = { name: form.name.trim(), role: form.role };
    if (editIndex !== null) { next[editIndex] = entry; showToast.success('User updated'); }
    else { next.push(entry); showToast.success('User added'); }
    updateData('users', next);
    cancelEdit();
  };

  const remove = (i: number) => {
    const next = [...users]; next.splice(i, 1); updateData('users', next);
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Fetching team members...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {users.map((u, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:border-primary/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{u.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${ROLE_COLORS[u.role] ?? 'bg-secondary text-muted-foreground'}`}>
                    {u.role}
                  </span>
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
          ))}
        </AnimatePresence>
      </div>

      {/* Add / Edit form */}
      <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="w-full">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm"
            placeholder="e.g. Jane Doe"
          />
        </div>
        <div className="w-full">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Role</label>
          <div className="relative">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold appearance-none shadow-sm"
            >
              <option>Administrator</option>
              <option>Manager</option>
              <option>Cashier</option>
              <option>Waiter</option>
            </select>
            <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2">
          {editIndex !== null && (
            <Button variant="outline" onClick={cancelEdit} className="h-[52px] px-4 rounded-xl font-bold gap-2 flex-1">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
          <Button onClick={save} className="h-[52px] px-6 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg gap-2 flex-1">
            {editIndex !== null
              ? <><Check className="w-4 h-4" /> Update</>
              : <><UserPlus className="w-4 h-4" /> Add</>}
          </Button>
        </div>
      </div>

      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Final Security Step</h4>
          <p className="text-xs text-blue-700 leading-relaxed mt-1">
            Once setup is complete, your organization will be locked and you'll be redirected to the POS dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
