import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { CargoManifest, CargoCategory, CargoStatus, PaymentStatus } from '../types';
import { 
  X, 
  Boxes, 
  Ship, 
  User, 
  FileText, 
  Scale, 
  Box, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  Check, 
  Info,
  Phone,
  CreditCard
} from 'lucide-react';

interface ManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestToEdit?: CargoManifest | null;
  defaultShipId?: string;
}

export const ManifestModal: React.FC<ManifestModalProps> = ({
  isOpen,
  onClose,
  manifestToEdit,
  defaultShipId
}) => {
  const { ships, addManifest, updateManifest, getShipStats } = useData();

  const [shipId, setShipId] = useState('');
  const [senderOrPassenger, setSenderOrPassenger] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [category, setCategory] = useState<CargoCategory>('Bagasi Penumpang');
  const [description, setDescription] = useState('');
  const [itemCount, setItemCount] = useState<number>(1);
  const [weightKg, setWeightKg] = useState<number>(15);
  const [volumeM3, setVolumeM3] = useState<number>(0.1);
  const [deckPosition, setDeckPosition] = useState('Deck 2 - Bagasi Penumpang');
  const [handlingNotes, setHandlingNotes] = useState('');
  const [shippingFee, setShippingFee] = useState<number>(75000);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Lunas');
  const [status, setStatus] = useState<CargoStatus>('Terdaftar');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form values
  useEffect(() => {
    if (manifestToEdit) {
      setShipId(manifestToEdit.shipId);
      setSenderOrPassenger(manifestToEdit.senderOrPassenger);
      setIdentityNumber(manifestToEdit.identityNumber || '');
      setContactPhone(manifestToEdit.contactPhone || '');
      setCategory(manifestToEdit.category);
      setDescription(manifestToEdit.description || '');
      setItemCount(manifestToEdit.itemCount || 1);
      setWeightKg(manifestToEdit.weightKg || 0);
      setVolumeM3(manifestToEdit.volumeM3 || 0);
      setDeckPosition(manifestToEdit.deckPosition || '');
      setHandlingNotes(manifestToEdit.handlingNotes || '');
      setShippingFee(manifestToEdit.shippingFee || 0);
      setPaymentStatus(manifestToEdit.paymentStatus || 'Lunas');
      setStatus(manifestToEdit.status || 'Terdaftar');
    } else {
      const initialShip = defaultShipId || (ships.length > 0 ? ships[0].id : '');
      setShipId(initialShip);
      setSenderOrPassenger('');
      setIdentityNumber('');
      setContactPhone('');
      setCategory('Bagasi Penumpang');
      setDescription('');
      setItemCount(1);
      setWeightKg(20);
      setVolumeM3(0.15);
      setDeckPosition('Deck 2 - Bagasi Kabin');
      setHandlingNotes('');
      setShippingFee(100000);
      setPaymentStatus('Lunas');
      setStatus('Terdaftar');
    }
    setErrors({});
  }, [manifestToEdit, isOpen, defaultShipId, ships]);

  // Auto tariff suggest based on category and weight
  const handleCategoryChange = (newCat: CargoCategory) => {
    setCategory(newCat);
    if (!manifestToEdit) {
      if (newCat === 'Bagasi Penumpang') {
        setWeightKg(20);
        setShippingFee(75000);
        setDeckPosition('Deck 2 - Bagasi Penumpang');
      } else if (newCat === 'Kendaraan Roda 2') {
        setWeightKg(125);
        setVolumeM3(1.5);
        setShippingFee(600000);
        setDeckPosition('Car Deck A - Bay Motor');
      } else if (newCat === 'Kendaraan Roda 4 / Mobil') {
        setWeightKg(1400);
        setVolumeM3(10);
        setShippingFee(2500000);
        setDeckPosition('Main Car Deck B - Slot Mobil');
      } else if (newCat === 'Bahan Makanan / Palka Dingin') {
        setWeightKg(500);
        setVolumeM3(2.5);
        setShippingFee(1200000);
        setDeckPosition('Deck 1 - Palka Dingin Freezer');
      } else if (newCat === 'Kargo Umum / Paket') {
        setWeightKg(100);
        setVolumeM3(0.8);
        setShippingFee(350000);
        setDeckPosition('Deck 1 - Palka Kargo Umum');
      } else {
        setWeightKg(50);
        setShippingFee(500000);
        setDeckPosition('Deck Khusus Dangerous Goods / Terisolasi');
      }
    }
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!shipId) {
      newErrors.shipId = 'Kapal pengangkut wajib dipilih.';
    }

    if (!senderOrPassenger.trim()) {
      newErrors.senderOrPassenger = 'Nama penumpang atau pengirim wajib diisi.';
    } else if (senderOrPassenger.length < 3) {
      newErrors.senderOrPassenger = 'Nama minimal 3 karakter.';
    }

    if (itemCount <= 0) {
      newErrors.itemCount = 'Jumlah koli minimal 1 unit.';
    }

    if (weightKg <= 0) {
      newErrors.weightKg = 'Berat muatan harus lebih dari 0 kg.';
    }

    if (shippingFee < 0) {
      newErrors.shippingFee = 'Tarif muatan tidak boleh negatif.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const selectedShip = ships.find(s => s.id === shipId);
      const shipName = selectedShip ? selectedShip.name : 'KM NAZLA SHARK';

      const payload = {
        shipId,
        shipName,
        senderOrPassenger: senderOrPassenger.trim(),
        identityNumber: identityNumber.trim(),
        contactPhone: contactPhone.trim(),
        category,
        description: description.trim() || `${category} - ${senderOrPassenger.trim()}`,
        itemCount: Number(itemCount),
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3),
        deckPosition: deckPosition.trim() || 'Palka Utama',
        handlingNotes: handlingNotes.trim(),
        shippingFee: Number(shippingFee),
        paymentStatus,
        status,
      };

      if (manifestToEdit) {
        await updateManifest(manifestToEdit.id, payload);
      } else {
        await addManifest(payload);
      }
      onClose();
    } catch (err: any) {
      console.error('Submit manifest error:', err);
      setErrors({ form: err.message || 'Gagal menyimpan data manifes muatan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedShip = ships.find(s => s.id === shipId);
  const shipStats = selectedShip ? getShipStats(selectedShip.id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-3xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Boxes className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                {manifestToEdit ? 'Edit Manifes Muatan' : 'Input Muatan & Manifes Baru'}
              </h3>
              <p className="text-xs text-sky-100">
                PT NAZLA Bahari Marine - Pencatatan Muatan Resmi Terverifikasi
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {errors.form && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Ship Selection & Live Capacity Bar */}
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-sky-600" />
                  <span>Pilih Kapal Pengangkut *</span>
                </label>
                <select
                  value={shipId}
                  onChange={(e) => setShipId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.shipId ? 'border-red-400' : 'border-sky-300'
                  }`}
                  required
                >
                  <option value="" disabled>-- Pilih Kapal Armada NAZLA --</option>
                  {ships.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Rute: {s.originPort.split(' ')[1] || s.originPort} &rarr; {s.destPort.split(' ')[1] || s.destPort}
                    </option>
                  ))}
                </select>
                {errors.shipId && <p className="text-xs text-red-500 mt-1">{errors.shipId}</p>}
              </div>

              {selectedShip && shipStats && (
                <div className="flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span className="text-slate-600">Kapasitas Muat Kapal Terpakai:</span>
                    <span className={shipStats.isOverloadedWeight ? 'text-red-600 font-bold' : 'text-sky-700 font-bold'}>
                      {shipStats.totalWeightKg.toLocaleString('id-ID')} / {selectedShip.maxCargoWeightKg.toLocaleString('id-ID')} Kg ({shipStats.weightPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        shipStats.isOverloadedWeight ? 'bg-red-500 animate-pulse' : shipStats.weightPercentage > 85 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${Math.min(shipStats.weightPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Nahkoda: {selectedShip.captain}</span>
                    <span>Status: {selectedShip.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Passenger / Sender Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Penumpang / Pengirim *</span>
              </label>
              <input
                type="text"
                value={senderOrPassenger}
                onChange={(e) => setSenderOrPassenger(e.target.value)}
                placeholder="Contoh: Budi Santoso / PT Bahari"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.senderOrPassenger ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.senderOrPassenger && <p className="text-xs text-red-500 mt-1">{errors.senderOrPassenger}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>NIK / No. Tiket / Paspor</span>
              </label>
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="3578012345670001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>No. HP / WhatsApp</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Cargo Category & Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Muatan *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CargoCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Bagasi Penumpang">🧳 Bagasi Penumpang (Koper/Tas)</option>
                <option value="Kargo Umum / Paket">📦 Kargo Umum / Paket / Koli</option>
                <option value="Kendaraan Roda 2">🏍️ Kendaraan Roda 2 (Motor)</option>
                <option value="Kendaraan Roda 4 / Mobil">🚗 Kendaraan Roda 4 (Mobil/Truk)</option>
                <option value="Bahan Makanan / Palka Dingin">❄️ Bahan Makanan / Palka Dingin</option>
                <option value="Barang Khusus / DG Class">⚠️ Barang Khusus / Dangerous Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>Berat Total (Kg) *</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.weightKg ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.weightKg && <p className="text-xs text-red-500 mt-1">{errors.weightKg}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-slate-500" />
                <span>Volume Muatan (m³)</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={volumeM3}
                onChange={(e) => setVolumeM3(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Description & Position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rincian / Deskripsi Barang
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: 2 Kardus Pakaian + 1 Tas Jinjing Dokumen"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah Koli / Unit *
              </label>
              <input
                type="number"
                min="1"
                value={itemCount}
                onChange={(e) => setItemCount(parseInt(e.target.value, 10) || 1)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.itemCount ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.itemCount && <p className="text-xs text-red-500 mt-1">{errors.itemCount}</p>}
            </div>
          </div>

          {/* Stowage Deck Position & Handling Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Posisi Penempatan / Bay Deck Palka</span>
              </label>
              <input
                type="text"
                value={deckPosition}
                onChange={(e) => setDeckPosition(e.target.value)}
                placeholder="Contoh: Deck 1 Palka A / Car Deck Bay 03"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Instruksi Khusus / Safety Notes</span>
              </label>
              <input
                type="text"
                value={handlingNotes}
                onChange={(e) => setHandlingNotes(e.target.value)}
                placeholder="Contoh: Fragile / Jauhkan dari panas / Ikat tali ganjal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Tariff Fee, Payment Status & Cargo Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Biaya / Tarif Muatan (IDR) *</span>
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={shippingFee}
                onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.shippingFee ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Status Pembayaran</span>
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Lunas">✅ Lunas (Paid)</option>
                <option value="Belum Lunas">⏳ Belum Lunas</option>
                <option value="Ditagihkan di Tujuan">📦 Ditagihkan di Tujuan (COD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Operasional Muatan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CargoStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Terdaftar">📝 Terdaftar (Check-In)</option>
                <option value="Proses Muat / Stowing">🏗️ Proses Muat / Stowing</option>
                <option value="Di Atas Kapal">🚢 Di Atas Kapal (On Board)</option>
                <option value="Tiba & Siap Ambil">⚓ Tiba & Siap Ambil</option>
                <option value="Telah Diserahkan">✔️ Telah Diserahkan</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
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
                  <span>{manifestToEdit ? 'Simpan Perubahan Manifes' : 'Daftarkan Muatan'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
