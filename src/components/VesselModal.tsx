import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Vessel } from '../types';
import { 
  X, 
  Ship, 
  Anchor, 
  Check, 
  AlertTriangle, 
  Clock, 
  Tag 
} from 'lucide-react';

interface VesselModalProps {
  isOpen: boolean;
  onClose: () => void;
  vesselToEdit?: Vessel | null;
}

export const VesselModal: React.FC<VesselModalProps> = ({
  isOpen,
  onClose,
  vesselToEdit
}) => {
  const { addVessel, updateVessel } = useData();

  const [name, setName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [berthLocation, setBerthLocation] = useState('Dermaga Petikemas 01 (Quay 1)');
  const [eta, setEta] = useState('Hari ini, 08:00 WIB');
  const [etd, setEtd] = useState('Besok, 20:00 WIB');
  const [targetTeus, setTargetTeus] = useState<number>(850);
  const [status, setStatus] = useState<Vessel['status']>('Bongkar Muat (Working)');
  const [shippingLine, setShippingLine] = useState('NAZLA SHARK LINE');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vesselToEdit) {
      setName(vesselToEdit.name);
      setCallsign(vesselToEdit.callsign);
      setBerthLocation(vesselToEdit.berthLocation);
      setEta(vesselToEdit.eta);
      setEtd(vesselToEdit.etd);
      setTargetTeus(vesselToEdit.targetTeus);
      setStatus(vesselToEdit.status);
      setShippingLine(vesselToEdit.shippingLine);
    } else {
      setName('MV NAZLA SHARK VOYAGER');
      setCallsign(`NZL-V0${Math.floor(1 + Math.random() * 9)}`);
      setBerthLocation('Dermaga Petikemas 01 (Quay 1)');
      setEta('Hari ini, 07:00 WIB');
      setEtd('Besok, 18:00 WIB');
      setTargetTeus(800);
      setStatus('Sandar / Berthed');
      setShippingLine('NAZLA SHARK LINE');
    }
    setErrors({});
  }, [vesselToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nama kapal petikemas wajib diisi.';
    if (!callsign.trim()) newErrors.callsign = 'Callsign kapal wajib diisi.';
    if (targetTeus <= 0) newErrors.targetTeus = 'Target TEUs harus lebih dari 0.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        callsign: callsign.trim().toUpperCase(),
        berthLocation: berthLocation.trim(),
        eta: eta.trim(),
        etd: etd.trim(),
        targetTeus: Number(targetTeus),
        status,
        shippingLine: shippingLine.trim(),
      };

      if (vesselToEdit) {
        await updateVessel(vesselToEdit.id, payload);
      } else {
        await addVessel(payload);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err.message || 'Gagal menyimpan kapal petikemas.' });
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
              <Ship className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                {vesselToEdit ? 'Edit Kapal Petikemas' : 'Jadwal Kapal Sandar (Vessel) Baru'}
              </h3>
              <p className="text-xs text-sky-100">
                PT NAZLA Terminal Petikemas - Manajemen Dermaga & Alokasi Bongkar Muat
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kapal Petikemas *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="MV NAZLA SHARK PIONEER"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Callsign *</label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                placeholder="NZL-V01"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Line / Operator *</label>
              <input
                type="text"
                value={shippingLine}
                onChange={(e) => setShippingLine(e.target.value)}
                placeholder="NAZLA SHARK LINE"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Posisi Dermaga (Berth) *</label>
              <input
                type="text"
                value={berthLocation}
                onChange={(e) => setBerthLocation(e.target.value)}
                placeholder="Dermaga Petikemas 01 (Quay 1)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Waktu Tiba (ETA)</span>
              </label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="Hari ini, 06:00 WIB"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimasi Berlayar (ETD)</span>
              </label>
              <input
                type="text"
                value={etd}
                onChange={(e) => setEtd(e.target.value)}
                placeholder="Besok, 18:00 WIB"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Bongkar/Muat (TEUs) *</label>
              <input
                type="number"
                min="10"
                value={targetTeus}
                onChange={(e) => setTargetTeus(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-sky-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Kapal *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Vessel['status'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="Sandar / Berthed">Sandar / Berthed</option>
                <option value="Bongkar Muat (Working)">Bongkar Muat (Working)</option>
                <option value="Menunggu Pandu">Menunggu Pandu (Anchorage)</option>
                <option value="Berlayar (Departed)">Berlayar (Departed)</option>
              </select>
            </div>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data Kapal'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
