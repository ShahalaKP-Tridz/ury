import React, { useEffect, useState } from 'react';
import { Table2, Loader2, Plus, Info, Trash2, MapPin, Pencil, X, Check, ChevronDown } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

interface TableForm { name: string; seats: string; room: string; }
const emptyTable = (defaultRoom = ''): TableForm => ({ name: '', seats: '', room: defaultRoom });

export const TablesStep: React.FC = () => {
  const { tables, rooms, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const defaultRoom = rooms[0]?.name ?? '';
  const [form, setForm] = useState<TableForm>(emptyTable(defaultRoom));
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!form.room && defaultRoom) setForm(f => ({ ...f, room: defaultRoom }));
    if (tables.length > 0) return;
    setLoading(true);
    onboardingApi.getTableContext()
      .then(res => { if (res?.tables?.length > 0) updateData('tables', res.tables); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rooms]);

  const openEdit = (i: number) => {
    const t = tables[i];
    setForm({ name: t.name, seats: String(t.seats), room: t.room });
    setEditIndex(i);
  };
  const cancelEdit = () => { setForm(emptyTable(defaultRoom)); setEditIndex(null); };

  const save = () => {
    if (!form.name.trim() || !form.seats || !form.room) {
      showToast.error('Fill in table name, seats, and select a room'); return;
    }
    const next = [...tables];
    const entry = { name: form.name.trim(), seats: parseInt(form.seats), room: form.room };
    if (editIndex !== null) { next[editIndex] = entry; showToast.success('Table updated'); }
    else { next.push(entry); showToast.success('Table added'); }
    updateData('tables', next);
    cancelEdit();
  };

  const remove = (i: number) => {
    const next = [...tables]; next.splice(i, 1); updateData('tables', next);
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Fetching table data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Table cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {tables.map((table, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="p-5 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all text-center group relative"
            >
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors mx-auto">
                <Table2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-foreground">{table.name}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{table.seats} Seats</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-primary/70 font-bold">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate max-w-[80px]">{table.room}</span>
              </div>
              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(i)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add / Edit form */}
      <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Table Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm"
            placeholder="e.g. T-01"
          />
        </div>
        <div className="w-full lg:w-48">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Room / Area</label>
          <div className="relative">
            <select
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm appearance-none"
            >
              {rooms.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
              {rooms.length === 0 && <option value="">No Rooms Created</option>}
            </select>
            <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="w-full lg:w-32">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Capacity</label>
          <input
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            type="number" min="1"
            className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm"
            placeholder="4"
          />
        </div>
        <div className="flex gap-2">
          {editIndex !== null && (
            <Button variant="outline" onClick={cancelEdit} className="h-[52px] px-5 rounded-xl font-bold gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
          <Button onClick={save} className="h-[52px] px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg gap-2">
            {editIndex !== null ? <><Check className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Table</>}
          </Button>
        </div>
      </div>

      {!rooms.length && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            No rooms defined yet. Go back to <span className="font-bold">URY Rooms</span> to create areas before adding tables.
          </p>
        </div>
      )}
    </div>
  );
};
