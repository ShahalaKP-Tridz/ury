import React, { useState, useRef } from 'react';
import { Loader2, Upload, Trash2, Check, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { showToast } from '../../../ui/toast';

interface RowItem {
  item_name: string;
  standard_rate: string;
}

const emptyRow = (): RowItem => ({ item_name: '', standard_rate: '' });
const DEFAULT_ROWS = 3;

export const MenuStep: React.FC = () => {
  const { menu, updateData } = useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable rows — initialise from store or show 3 empty rows
  const [rows, setRows] = useState<RowItem[]>(() => {
    if (menu.items && menu.items.length > 0) {
      return menu.items.map((it: any) => ({
        item_name: it.item_name || it.name || '',
        standard_rate: String(it.standard_rate || it.price || ''),
      }));
    }
    return Array.from({ length: DEFAULT_ROWS }, emptyRow);
  });

  /* ── helpers ── */
  const updateRow = (i: number, field: keyof RowItem, value: string) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (i: number) => {
    setRows((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length === 0 ? [emptyRow()] : next;
    });
  };

  /* ── Upload: parse CSV client-side, populate rows directly ── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { showToast.error('File must have a header row and at least one item'); return; }

        // Parse header — support flexible column names
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const nameIdx   = headers.findIndex(h => h === 'item_name' || h === 'name');
        const priceIdx  = headers.findIndex(h => h === 'standard_rate' || h === 'price' || h === 'rate');

        if (nameIdx === -1) { showToast.error('CSV must have an "item_name" or "name" column'); return; }

        const imported: RowItem[] = lines.slice(1)
          .map(line => {
            const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            return {
              item_name: cols[nameIdx] ?? '',
              standard_rate: priceIdx !== -1 ? (cols[priceIdx] ?? '') : '',
            };
          })
          .filter(r => r.item_name);

        if (imported.length === 0) { showToast.error('No valid items found in file'); return; }

        const existing = rows.filter(r => r.item_name.trim() || r.standard_rate.trim());
        const merged = [...existing, ...imported];
        setRows(merged);
        showToast.success(`${imported.length} item${imported.length !== 1 ? 's' : ''} imported`);
      } catch {
        showToast.error('Failed to parse file — check the format');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showToast.error('Could not read file');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  /* ── Save valid rows to store ── */
  const handleSave = () => {
    const valid = rows.filter(r => r.item_name.trim() && Number(r.standard_rate) > 0);
    if (valid.length === 0) { showToast.error('Add at least one item with a valid price'); return; }
    updateData('menu', { items: valid });
    showToast.success(`${valid.length} items saved`);
  };

  const filledCount = rows.filter(r => r.item_name.trim()).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">

      {/* ── Top action bar ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-xl h-10 px-5 font-bold gap-2 text-sm"
        >
          {isUploading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />}
          {isUploading ? 'Importing...' : 'Upload CSV'}
        </Button>
        <input type="file" accept=".csv,.xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

      </div>

      {/* ── Tax Configuration ── */}
      <div className="p-5 bg-card border border-border rounded-2xl">
        <p className="font-bold text-sm text-foreground mb-4">Tax Configuration</p>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Tax Rate input */}
          <div className="flex-shrink-0">
            <label className="block text-xs text-muted-foreground mb-1.5">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="5"
              value={menu.tax_rate ?? ''}
              onChange={(e) => updateData('menu', { tax_rate: e.target.value })}
              className="w-28 h-11 px-4 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* Radio-style option cards */}
          <div className="flex gap-3">
            {[
              { value: 'Inclusive', subtitle: 'Tax within price' },
              { value: 'Exclusive', subtitle: 'Tax added on top' },
            ].map(({ value, subtitle }) => {
              const selected = menu.tax_calculation === value;
              return (
                <button
                  key={value}
                  onClick={() => updateData('menu', { tax_calculation: value })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  {/* Radio dot */}
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected ? 'border-primary' : 'border-muted-foreground/40'
                  }`}>
                    {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <span>
                    <span className={`block text-sm font-bold ${ selected ? 'text-primary' : 'text-foreground' }`}>{value}</span>
                    <span className="block text-[10px] text-muted-foreground">{subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Editable rows table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.8fr_1fr_40px] gap-3 px-5 py-3 bg-muted/30 border-b border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Item Name</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price (₹)</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50 max-h-[480px] overflow-y-auto custom-scrollbar">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1.8fr_1fr_40px] gap-3 items-center px-4 py-2.5">
              <input
                type="text"
                placeholder={`Item ${i + 1}`}
                value={row.item_name}
                onChange={(e) => updateRow(i, 'item_name', e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-transparent bg-secondary/40 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:bg-background transition"
              />
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={row.standard_rate}
                onChange={(e) => updateRow(i, 'standard_rate', e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-transparent bg-secondary/40 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:bg-background transition"
              />
              <button
                onClick={() => removeRow(i)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer: Add row + Save */}
        <div className="px-4 py-3 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add row
          </button>

          <div className="flex items-center gap-3">
            {filledCount > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground">
                {filledCount} item{filledCount !== 1 ? 's' : ''} filled
              </span>
            )}
            <Button onClick={handleSave} size="sm" className="rounded-xl h-8 px-5 font-bold gap-1.5 text-xs">
              <Check className="w-3.5 h-3.5" />
              Save Items
            </Button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground opacity-50 text-center">
        Upload a CSV or type items directly. Empty rows are ignored on save.
      </p>
    </div>
  );
};
