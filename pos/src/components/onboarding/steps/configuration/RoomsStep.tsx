import React, { useEffect, useState } from 'react';
import { Check, Loader2, DoorOpen, Plus, Trash2, Info, Pencil, X } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

interface RoomForm { name: string; seats: string; }
const emptyRoom = (): RoomForm => ({ name: '', seats: '' });

export const RoomsStep: React.FC = () => {
  const { rooms, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RoomForm>(emptyRoom());
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (rooms.length > 0) return;
    setLoading(true);
    onboardingApi.getRoomContext()
      .then(res => { if (res?.rooms?.length > 0) updateData('rooms', res.rooms); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (i: number) => {
    setForm({ name: rooms[i].name, seats: String(rooms[i].seats) });
    setEditIndex(i);
  };
  const cancelEdit = () => { setForm(emptyRoom()); setEditIndex(null); };

  const save = () => {
    if (!form.name.trim() || !form.seats) { showToast.error('Fill in both name and capacity'); return; }
    const next = [...rooms];
    const entry = { name: form.name.trim(), seats: parseInt(form.seats) };
    if (editIndex !== null) { next[editIndex] = entry; showToast.success('Room updated'); }
    else { next.push(entry); showToast.success('Room added'); }
    updateData('rooms', next);
    cancelEdit();
  };

  const remove = (i: number) => {
    const next = [...rooms]; next.splice(i, 1); updateData('rooms', next);
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Fetching room data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Room cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {rooms.map((room, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-5 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{room.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{room.seats} Seats</p>
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
      <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">
            Room Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm"
            placeholder="e.g. Main Hall"
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Seats</label>
          <input
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            type="number" min="1"
            className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm"
            placeholder="40"
          />
        </div>
        <div className="flex gap-2">
          {editIndex !== null && (
            <Button variant="outline" onClick={cancelEdit} className="h-[52px] px-5 rounded-xl font-bold gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
          <Button onClick={save} className="h-[52px] px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg gap-2">
            {editIndex !== null ? <><Check className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Room</>}
          </Button>
        </div>
      </div>

      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Define Areas</h4>
          <p className="text-xs text-blue-700 leading-relaxed mt-1">
            Rooms categorize your service zones (e.g. Indoor, Rooftop, Terrace). Each area can have its own table layout.
          </p>
        </div>
      </div>
    </div>
  );
};
