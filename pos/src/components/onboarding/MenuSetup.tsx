import { useState, useRef, useCallback } from 'react';
import { SetupCard, PrimaryButton, Input } from './Shared';
import { Plus, Trash2, ArrowRight, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadMenuCSV, setupMenu } from '../../lib/onboarding-api';

interface MenuItemRow {
  item_name: string;
  price: string;
}

const MAX_ITEMS = 500;

function isHeaderRow(name: string, price: string): boolean {
  const headerNames = ['item_name', 'item name', 'name', 'product', 'menu item'];
  const headerPrices = ['price', 'rate', 'amount', 'cost'];
  return (
    headerNames.includes(name.toLowerCase()) ||
    headerPrices.includes(price.toLowerCase())
  );
}

export const MenuSetup = ({ onNext, onBack, companyName }: {
  onNext: (data: any) => void;
  onBack: () => void;
  companyName?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MenuItemRow[]>([
    { item_name: '', price: '' },
    { item_name: '', price: '' },
    { item_name: '', price: '' },
  ]);
  const [taxType, setTaxType] = useState<'Inclusive' | 'Exclusive'>('Inclusive');
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addItem = useCallback(() => {
    setItems(prev => {
      if (prev.length >= MAX_ITEMS) {
        toast.warning(`Maximum ${MAX_ITEMS} items allowed`);
        return prev;
      }
      return [...prev, { item_name: '', price: '' }];
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, field: keyof MenuItemRow, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMenuCSV(file);

      if (result.items && result.items.length > 0) {
        const parsed: MenuItemRow[] = result.items
          .slice(0, MAX_ITEMS)
          .map(item => ({
            item_name: item.item_name.trim(),
            price: String(item.price),
          }));
        setItems(parsed);
        setTouched(false);
        toast.success(`Loaded ${parsed.length} items from CSV`);
      } else {
        toast.warning('No valid items found in the CSV file');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse CSV file.');
      fallbackClientParse(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fallbackClientParse = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = text.split('\n');
        const parsed: MenuItemRow[] = [];

        for (const row of rows) {
          if (parsed.length >= MAX_ITEMS) break;

          const [name, price] = row.split(',').map(s => s.trim());
          if (!name) continue;

          // Skip header rows
          if (isHeaderRow(name, price || '')) continue;

          parsed.push({ item_name: name, price: price || '0' });
        }

        if (parsed.length > 0) {
          setItems(parsed);
          setTouched(false);
          toast.info(`Loaded ${parsed.length} items (client-side parse)`);
        } else {
          toast.warning('No valid items found in the CSV file');
        }
      } catch {
        toast.error('Failed to parse CSV file. Ensure format is: Name, Price');
      }
    };
    reader.readAsText(file);
  };

  const getValidationErrors = useCallback((): string[] => {
    const errs: string[] = [];
    const seenNames = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const hasName = item.item_name.trim().length > 0;
      const hasPrice = item.price.trim().length > 0;

      // Partially filled row
      if (hasName && !hasPrice) {
        errs.push(`Row ${i + 1}: Price is missing`);
      } else if (!hasName && hasPrice) {
        errs.push(`Row ${i + 1}: Item name is missing`);
      }

      if (hasName && hasPrice) {
        const price = parseFloat(item.price);
        if (isNaN(price) || price < 0) {
          errs.push(`Row ${i + 1}: Invalid price`);
        }

        // Duplicate check
        const normalized = item.item_name.trim().toLowerCase();
        if (seenNames.has(normalized)) {
          errs.push(`Row ${i + 1}: Duplicate item "${item.item_name.trim()}"`);
        }
        seenNames.add(normalized);
      }
    }

    return errs;
  }, [items]);

  const handleNext = async () => {
    setTouched(true);

    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    const filteredItems = items
      .filter(item => item.item_name.trim() && item.price.trim())
      .map(item => ({
        item_name: item.item_name.trim(),
        price: parseFloat(item.price) || 0,
      }));

    if (filteredItems.length === 0) {
      toast.warning('Add at least one item or click Skip');
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const result = await setupMenu({
        items: filteredItems,
        tax_calculation: taxType,
        ...(companyName ? { company_name: companyName } : {}),
      });

      toast.success(result.message);
      onNext({
        items: filteredItems,
        tax_calculation: taxType,
        created_items: result.created_items,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create menu items');
    } finally {
      setSubmitting(false);
    }
  };

  const isWorking = uploading || submitting;
  const filledItemCount = items.filter(i => i.item_name.trim() && i.price.trim()).length;

  return (
    <div className="max-w-3xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileUpload}
      />
      <SetupCard>
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isWorking}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-muted/30 hover:bg-muted/50 text-foreground font-semibold rounded-2xl border border-border transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <Upload size={20} className="text-primary group-hover:scale-110 transition-transform" />
            )}
            {uploading ? 'Parsing CSV…' : 'Upload Menu (CSV)'}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="font-bold text-foreground">Menu Items</h4>
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              {filledItemCount} / {items.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const hasName = item.item_name.trim().length > 0;
              const hasPrice = item.price.trim().length > 0;
              const nameError = touched && !hasName && hasPrice;
              const priceError = touched && hasName && !hasPrice;

              return (
                <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex-1">
                    <Input
                      placeholder="Item Name (e.g. Cheese Pizza)"
                      value={item.item_name}
                      className={nameError ? 'border-destructive focus:ring-destructive/20' : ''}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      disabled={isWorking}
                      maxLength={140}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      className={priceError ? 'border-destructive focus:ring-destructive/20' : ''}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      disabled={isWorking}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    disabled={isWorking}
                    className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={addItem}
            disabled={isWorking || items.length >= MAX_ITEMS}
            className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline px-2 py-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        <div className="p-6 bg-muted/20 rounded-2xl border border-border mb-10">
          <h4 className="text-sm font-bold text-foreground mb-4">Tax Configuration</h4>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="tax"
                className="w-4 h-4 text-primary focus:ring-primary/20"
                checked={taxType === 'Inclusive'}
                onChange={() => setTaxType('Inclusive')}
                disabled={isWorking}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Inclusive Tax
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="tax"
                className="w-4 h-4 text-primary focus:ring-primary/20"
                checked={taxType === 'Exclusive'}
                onChange={() => setTaxType('Exclusive')}
                disabled={isWorking}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Exclusive Tax
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isWorking}
            className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors px-4 py-2 text-sm disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => onNext({ items: [], tax_calculation: taxType })}
              disabled={isWorking}
              className="text-muted-foreground hover:text-foreground font-medium px-4 py-2 text-sm disabled:opacity-50"
            >
              Skip
            </button>
            <PrimaryButton onClick={handleNext} disabled={isWorking}>
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Menu…</>
              ) : (
                <>Next <ArrowRight size={18} /></>
              )}
            </PrimaryButton>
          </div>
        </div>
      </SetupCard>
    </div>
  );
};
