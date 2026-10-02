import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Ship } from '../types';
import { 
  X, 
  Ship as ShipIcon, 
  User, 
  Anchor, 
  Scale, 
  Box, 
  MapPin, 
  Users, 
  Check, 
  AlertTriangle,
  Clock,
  Layers
} from 'lucide-react';

interface ShipModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipToEdit?: Ship | null;
}

export const ShipModal: React.FC<ShipModalProps> = ({
  isOpen,
  onClose,
  shipToEdit
}) => {
  const { addShip, updateShip } = useData();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('Kapal Feri Cepat Penumpang & Kargo');
  const [captain, setCaptain] = useState('');
  const [maxPassengers, setMaxPassengers] = useState<number>(500);
  const [maxCargoWeightKg, setMaxCargoWeightKg] = useState<number>(50000);
  const [maxVolumeM3, setMaxVolumeM3] = useState<number>(750);
  const [originPort, setOriginPort] = useState('Pelabuhan Tanjung Perak (Surabaya)');
  const [destPort, setDestPort] = useState('Pelabuhan Soekarno-Hatta (Makassar)');
  const [status, setStatus] = useState<Ship['status']>('Siap Muat / Sandar');
  const [departureTime, setDepartureTime] = useState('20:00 WIB');
  const [arrivalTime, setArrivalTime] = useState('Besok, 17:00 WITA');
  const [deckLayout, setDeckLayout] = useState('Deck 1 (Palka Kargo), Deck 2 (Bagasi Kabin), Car Deck A (Kendaraan)');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shipToEdit) {
      setName(shipToEdit.name);
      setCode(shipToEdit.code);
      setType(shipToEdit.type);
      setCaptain(shipToEdit.captain);
      setMaxPassengers(shipToEdit.maxPassengers);
      setMaxCargoWeightKg(shipToEdit.maxCargoWeightKg);
      setMaxVolumeM3(shipToEdit.maxVolumeM3);
      setOriginPort(shipToEdit.originPort);
      setDestPort(shipToEdit.destPort);
      setStatus(shipToEdit.status);
      setDepartureTime(shipToEdit.departureTime || '');
      setArrivalTime(shipToEdit.arrivalTime || '');
      setDeckLayout(shipToEdit.deckLayout || '');
    } else {
      setName('');
      setCode(`NZL-SHK-0${Math.floor(Math.random() * 90 + 10)}`);
      setType('Kapal Feri Cepat Penumpang & Kargo');
      setCaptain('Capt. Nazla Bahari, M.Mar');
      setMaxPassengers(450);
      setMaxCargoWeightKg(50000);
      setMaxVolumeM3(700);
      setOriginPort('Pelabuhan Tanjung Perak (Surabaya)');
      setDestPort('Pelabuhan Soekarno-Hatta (Makassar)');
      setStatus('Siap Muat / Sandar');
      setDepartureTime('21:00 WIB');
      setArrivalTime('Besok, 18:00 WITA');
      setDeckLayout('Deck 1 (Palka Kargo), Deck 2 (Bagasi Penumpang), Car Deck A');
    }
    setErrors({});
  }, [shipToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama kapal wajib diisi (Contoh: KM NAZLA SHARK 01).';
    }
    if (!code.trim()) {
      newErrors.code = 'Kode/Callsign kapal wajib diisi.';
    }
    if (!captain.trim()) {
      newErrors.captain = 'Nama nahkoda wajib diisi.';
    }
    if (maxPassengers <= 0) {
      newErrors.maxPassengers = 'Kapasitas penumpang minimal 1 orang.';
    }
    if (maxCargoWeightKg <= 0) {
      newErrors.maxCargoWeightKg = 'Kapasitas muatan kargo harus lebih dari 0 kg.';
    }
    if (!originPort.trim() || !destPort.trim()) {
      newErrors.route = 'Pelabuhan asal dan tujuan wajib diisi.';
    }

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
        code: code.trim().toUpperCase(),
        type: type.trim(),
        captain: captain.trim(),
        maxPassengers: Number(maxPassengers),
        maxCargoWeightKg: Number(maxCargoWeightKg),
        maxVolumeM3: Number(maxVolumeM3),
        originPort: originPort.trim(),
        destPort: destPort.trim(),
        status,
        departureTime: departureTime.trim(),
        arrivalTime: arrivalTime.trim(),
        deckLayout: deckLayout.trim(),
      };

      if (shipToEdit) {
        await updateShip(shipToEdit.id, payload);
      } else {
        await addShip(payload);
      }
      onClose();
    } catch (err: any) {
      console.error('Submit ship error:', err);
      setErrors({ form: err.message || 'Gagal menyimpan data armada kapal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-2xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <ShipIcon className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                {shipToEdit ? 'Edit Data Armada Kapal' : 'Registrasi Armada Kapal Baru'}
              </h3>
              <p className="text-xs text-sky-100">
                PT NAZLA Bahari Marine - Manajemen Armada & Batas Beban Muat
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {errors.form && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShipIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Nama Kapal Penumpang *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: KM NAZLA SHARK 01"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.name ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-slate-500" />
                <span>Kode / Callsign *</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="NZL-SHK-01"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.code ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
          </div>

          {/* Type & Captain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipe & Kelas Kapal *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Kapal Feri Cepat Penumpang & Kargo">Kapal Feri Cepat (Fast Ferry)</option>
                <option value="Kapal Ro-Ro Penumpang & Kendaraan">Kapal Ro-Ro Penumpang & Kendaraan</option>
                <option value="Kapal Motor Penumpang (KMP) Nusantara">Kapal Motor Penumpang (KMP)</option>
                <option value="Kapal Pesiar Wisata Bahari Nazla">Kapal Wisata & Eksekutif Bahari</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Nahkoda (Master Captain) *</span>
              </label>
              <input
                type="text"
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                placeholder="Capt. Rian Nazla, M.Mar"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.captain ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.captain && <p className="text-xs text-red-500 mt-1">{errors.captain}</p>}
            </div>
          </div>

          {/* Capacity Specs: Pax, Weight, Volume */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Kapasitas Pax (Orang) *</span>
              </label>
              <input
                type="number"
                min="1"
                value={maxPassengers}
                onChange={(e) => setMaxPassengers(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                <span>Batas Muatan (Kg) *</span>
              </label>
              <input
                type="number"
                min="100"
                step="1000"
                value={maxCargoWeightKg}
                onChange={(e) => setMaxCargoWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-600" />
                <span>Batas Volume (m³) *</span>
              </label>
              <input
                type="number"
                min="1"
                value={maxVolumeM3}
                onChange={(e) => setMaxVolumeM3(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Pelabuhan Asal Keberangkatan *</span>
              </label>
              <input
                type="text"
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                placeholder="Pelabuhan Tanjung Perak (Surabaya)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Pelabuhan Tujuan Kedatangan *</span>
              </label>
              <input
                type="text"
                value={destPort}
                onChange={(e) => setDestPort(e.target.value)}
                placeholder="Pelabuhan Soekarno-Hatta (Makassar)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* Status & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Operasional *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Ship['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Siap Muat / Sandar">⚓ Siap Muat / Sandar</option>
                <option value="Sedang Berlayar">🌊 Sedang Berlayar</option>
                <option value="Selesai Bongkar">📦 Selesai Bongkar</option>
                <option value="Docking / Perawatan">🛠️ Docking / Perawatan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Waktu Berangkat</span>
              </label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="21:00 WIB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimasi Tiba</span>
              </label>
              <input
                type="text"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                placeholder="Besok, 18:00 WITA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Deck Layout */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Konfigurasi Palka / Deck Layout</span>
            </label>
            <input
              type="text"
              value={deckLayout}
              onChange={(e) => setDeckLayout(e.target.value)}
              placeholder="Deck 1 (Palka Kargo), Deck 2 (Bagasi Penumpang), Car Deck A (Kendaraan)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{shipToEdit ? 'Simpan Perubahan Kapal' : 'Daftarkan Armada Kapal'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
