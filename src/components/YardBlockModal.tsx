import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { YardBlock } from '../types';
import { 
  X, 
  Layers, 
  Check, 
  AlertTriangle, 
  Boxes, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';

interface YardBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockToEdit?: YardBlock | null;
}

export const YardBlockModal: React.FC<YardBlockModalProps> = ({
  isOpen,
  onClose,
  blockToEdit
}) => {
  const { addYardBlock, updateYardBlock } = useData();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [zoneType, setZoneType] = useState('Dry / General Cargo');
  const [maxTeuCapacity, setMaxTeuCapacity] = useState<number>(450);
  const [maxTiers, setMaxTiers] = useState<number>(5);
  const [equipmentAssigned, setEquipmentAssigned] = useState('RTG Shark-01 & Head Truck H-04');
  const [status, setStatus] = useState<YardBlock['status']>('Operasional Aktif');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (blockToEdit) {
      setCode(blockToEdit.code);
      setName(blockToEdit.name);
      setZoneType(blockToEdit.zoneType);
      setMaxTeuCapacity(blockToEdit.maxTeuCapacity);
      setMaxTiers(blockToEdit.maxTiers);
      setEquipmentAssigned(blockToEdit.equipmentAssigned || '');
      setStatus(blockToEdit.status);
    } else {
      const randomSuffix = String.fromCharCode(65 + Math.floor(Math.random() * 6));
      setCode(`BLK-SHK-${randomSuffix}`);
      setName(`Blok Hiu ${randomSuffix} (Container Yard)`);
      setZoneType('Dry / General Cargo');
      setMaxTeuCapacity(500);
      setMaxTiers(5);
      setEquipmentAssigned(`RTG Shark-0${Math.floor(1 + Math.random() * 5)}`);
      setStatus('Operasional Aktif');
    }
    setErrors({});
  }, [blockToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) newErrors.code = 'Kode blok wajib diisi.';
    if (!name.trim()) newErrors.name = 'Nama blok lapangan wajib diisi.';
    if (maxTeuCapacity <= 0) newErrors.maxTeuCapacity = 'Kapasitas maksimal TEU harus lebih dari 0.';
    if (maxTiers <= 0 || maxTiers > 7) newErrors.maxTiers = 'Tingkat tumpukan (tier) aman antara 1 hingga 6 tingkat.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        zoneType: zoneType.trim(),
        maxTeuCapacity: Number(maxTeuCapacity),
        maxTiers: Number(maxTiers),
        equipmentAssigned: equipmentAssigned.trim() || 'RTG Shark Default',
        status,
      };

      if (blockToEdit) {
        await updateYardBlock(blockToEdit.id, payload);
      } else {
        await addYardBlock(payload);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err.message || 'Gagal menyimpan blok lapangan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Layers className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                {blockToEdit ? 'Edit Blok Lapangan (CY)' : 'Tambah Blok Lapangan Penumpukan'}
              </h3>
              <p className="text-xs text-sky-100">
                PT NAZLA Terminal Petikemas - Master Zona Container Yard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Blok *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="BLK-SHK-A"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Blok Penumpukan *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Blok Hiu A (Dry Export)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Zona Petikemas *</label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500"
              >
                <option value="Dry / General Cargo">Dry / General Cargo</option>
                <option value="Reefer Yard (Colokan Listrik)">Reefer Yard (Colokan Listrik)</option>
                <option value="Empty Depot">Empty Depot (Peti Kosong)</option>
                <option value="Hazardous / Bahan Berbahaya">Hazardous / Dangerous Goods (DG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Blok *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as YardBlock['status'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-sky-500"
              >
                <option value="Operasional Aktif">Operasional Aktif</option>
                <option value="Penuh / Full">Penuh / Full</option>
                <option value="Maintenance / Perbaikan">Maintenance / Perbaikan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas Maksimal (TEU) *</label>
              <input
                type="number"
                min="10"
                value={maxTeuCapacity}
                onChange={(e) => setMaxTeuCapacity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-sky-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batas Tinggi Tier (Tingkat) *</label>
              <input
                type="number"
                min="1"
                max="6"
                value={maxTiers}
                onChange={(e) => setMaxTiers(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Alat Berat / Crane yang Dialokasikan</span>
            </label>
            <input
              type="text"
              value={equipmentAssigned}
              onChange={(e) => setEquipmentAssigned(e.target.value)}
              placeholder="Contoh: RTG Shark-01 & Head Truck H-08"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Blok CY'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
