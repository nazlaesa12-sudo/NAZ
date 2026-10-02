import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Container, ContainerSize, ContainerType, ContainerStatus, ContainerCategory } from '../types';
import { 
  X, 
  Boxes, 
  Layers, 
  Check, 
  AlertTriangle, 
  Scale, 
  Ship, 
  User, 
  Tag, 
  Thermometer, 
  ShieldAlert, 
  DollarSign, 
  MapPin,
  Sparkles
} from 'lucide-react';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerToEdit?: Container | null;
  defaultBlockName?: string;
}

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  containerToEdit,
  defaultBlockName
}) => {
  const { yardBlocks, vessels, addContainer, updateContainer, getBlockStats } = useData();

  const [containerNumber, setContainerNumber] = useState('');
  const [isoCode, setIsoCode] = useState('22G1');
  const [size, setSize] = useState<ContainerSize>('20ft');
  const [type, setType] = useState<string>('Dry Standard (GP)');
  const [status, setStatus] = useState<ContainerStatus>('Di Lapangan (CY)');
  const [category, setCategory] = useState<ContainerCategory>('Ekspor');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(22000);
  const [tareWeightKg, setTareWeightKg] = useState<number>(2300);
  const [sealNumber, setSealNumber] = useState('');
  const [shippingLine, setShippingLine] = useState('NAZLA SHARK LINE');
  const [consignee, setConsignee] = useState('');
  const [yardBlock, setYardBlock] = useState('');
  const [yardSlot, setYardSlot] = useState('R01-T01-B01');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [reeferTemp, setReeferTemp] = useState('-');
  const [isHazardous, setIsHazardous] = useState(false);
  const [dgClass, setDgClass] = useState('Non-DG');
  const [handlingFee, setHandlingFee] = useState<number>(1500000);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Random ISO container number generator helper
  const generateContainerNumber = () => {
    const prefix = 'NZLU';
    const digits = Math.floor(100000 + Math.random() * 900000);
    const checkDigit = Math.floor(Math.random() * 10);
    return `${prefix}-${digits}-${checkDigit}`;
  };

  useEffect(() => {
    if (containerToEdit) {
      setContainerNumber(containerToEdit.containerNumber);
      setIsoCode(containerToEdit.isoCode);
      setSize(containerToEdit.size);
      setType(containerToEdit.type);
      setStatus(containerToEdit.status);
      setCategory(containerToEdit.category);
      setGrossWeightKg(containerToEdit.grossWeightKg);
      setTareWeightKg(containerToEdit.tareWeightKg || 2200);
      setSealNumber(containerToEdit.sealNumber || '');
      setShippingLine(containerToEdit.shippingLine);
      setConsignee(containerToEdit.consignee || '');
      setYardBlock(containerToEdit.yardBlock);
      setYardSlot(containerToEdit.yardSlot || 'R01-T01-B01');
      setVesselName(containerToEdit.vesselName || '');
      setVoyageNumber(containerToEdit.voyageNumber || '');
      setReeferTemp(containerToEdit.reeferTemp || '-');
      setIsHazardous(containerToEdit.isHazardous);
      setDgClass(containerToEdit.dgClass || 'Non-DG');
      setHandlingFee(containerToEdit.handlingFee || 1500000);
    } else {
      const initialBlock = defaultBlockName || (yardBlocks.length > 0 ? yardBlocks[0].name : 'Blok Hiu A (Dry Export)');
      const initialVessel = vessels.length > 0 ? vessels[0].name : 'MV NAZLA SHARK PIONEER';

      setContainerNumber(generateContainerNumber());
      setIsoCode('22G1');
      setSize('20ft');
      setType('Dry Standard (GP)');
      setStatus('Di Lapangan (CY)');
      setCategory('Ekspor');
      setGrossWeightKg(22500);
      setTareWeightKg(2300);
      setSealNumber(`NZL-SEAL-${Math.floor(10000 + Math.random() * 90000)}`);
      setShippingLine('NAZLA SHARK LINE');
      setConsignee('');
      setYardBlock(initialBlock);
      setYardSlot(`R0${Math.floor(1 + Math.random() * 5)}-T0${Math.floor(1 + Math.random() * 4)}-B0${Math.floor(1 + Math.random() * 9)}`);
      setVesselName(initialVessel);
      setVoyageNumber('V.2026-EXP-08');
      setReeferTemp('-');
      setIsHazardous(false);
      setDgClass('Non-DG');
      setHandlingFee(1500000);
    }
    setErrors({});
  }, [containerToEdit, isOpen, defaultBlockName, yardBlocks, vessels]);

  const handleSizeChange = (newSize: ContainerSize) => {
    setSize(newSize);
    if (!containerToEdit) {
      if (newSize === '40ft') {
        setIsoCode('42G1');
        setGrossWeightKg(28000);
        setTareWeightKg(3750);
        setHandlingFee(2200000);
      } else if (newSize === '45ft') {
        setIsoCode('45G1');
        setGrossWeightKg(30500);
        setTareWeightKg(4100);
        setHandlingFee(2600000);
      } else {
        setIsoCode('22G1');
        setGrossWeightKg(21000);
        setTareWeightKg(2300);
        setHandlingFee(1500000);
      }
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType.includes('Reefer')) {
      setReeferTemp('-20.0°C');
      const reeferBlock = yardBlocks.find(b => b.zoneType.toLowerCase().includes('reefer'));
      if (reeferBlock) setYardBlock(reeferBlock.name);
    } else if (newType.includes('Tank') || isHazardous) {
      const dgBlock = yardBlocks.find(b => b.zoneType.toLowerCase().includes('hazard') || b.name.includes('DG'));
      if (dgBlock) setYardBlock(dgBlock.name);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!containerNumber.trim()) {
      newErrors.containerNumber = 'Nomor kontainer wajib diisi.';
    } else if (containerNumber.trim().length < 6) {
      newErrors.containerNumber = 'Nomor kontainer minimal 6 karakter.';
    }

    if (!shippingLine.trim()) {
      newErrors.shippingLine = 'Shipping Line (Operator Pelayaran) wajib diisi.';
    }

    if (!yardBlock) {
      newErrors.yardBlock = 'Blok lapangan penumpukan (CY) wajib dipilih.';
    }

    if (grossWeightKg <= 0) {
      newErrors.grossWeightKg = 'Berat kotor (VGM) harus lebih dari 0 kg.';
    }

    if (handlingFee < 0) {
      newErrors.handlingFee = 'Tarif handling terminal tidak boleh negatif.';
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
        containerNumber: containerNumber.trim().toUpperCase(),
        isoCode: isoCode.trim().toUpperCase(),
        size,
        type,
        status,
        category,
        grossWeightKg: Number(grossWeightKg),
        tareWeightKg: Number(tareWeightKg),
        sealNumber: sealNumber.trim() || 'NO-SEAL',
        shippingLine: shippingLine.trim(),
        consignee: consignee.trim() || 'General Shipper NAZLA',
        yardBlock,
        yardSlot: yardSlot.trim() || 'R01-T01-B01',
        vesselName: vesselName.trim() || '-',
        voyageNumber: voyageNumber.trim() || '-',
        reeferTemp: type.includes('Reefer') ? reeferTemp.trim() : '-',
        isHazardous,
        dgClass: isHazardous ? dgClass.trim() : 'Non-DG',
        handlingFee: Number(handlingFee),
      };

      if (containerToEdit) {
        await updateContainer(containerToEdit.id, payload);
      } else {
        await addContainer(payload);
      }
      onClose();
    } catch (err: any) {
      console.error('Submit container error:', err);
      setErrors({ form: err.message || 'Gagal menyimpan data petikemas ke Firebase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentBlockStats = yardBlock ? getBlockStats(yardBlock) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-3xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Boxes className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                {containerToEdit ? 'Edit Data Petikemas' : 'Registrasi Petikemas / Gate-In Baru'}
              </h3>
              <p className="text-xs text-sky-100">
                PT NAZLA Terminal Petikemas - Manajemen Stowing & Kontrol Alur CY
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

          {/* Container Number, ISO Code & Generator */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                <span>Nomor Petikemas (ISO 6346) *</span>
              </label>
              <input
                type="text"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                placeholder="NZLU-123456-7"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.containerNumber ? 'border-red-400' : 'border-sky-300'
                }`}
                required
              />
              {errors.containerNumber && <p className="text-xs text-red-500 mt-1">{errors.containerNumber}</p>}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ISO Code
              </label>
              <input
                type="text"
                value={isoCode}
                onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
                placeholder="22G1 / 42G1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-300 text-sm font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={() => setContainerNumber(generateContainerNumber())}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Generate No Kontainer Standar ISO"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Generate ID</span>
              </button>
            </div>
          </div>

          {/* Size, Type, Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ukuran Petikemas *
              </label>
              <select
                value={size}
                onChange={(e) => handleSizeChange(e.target.value as ContainerSize)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-sky-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="20ft">20 Feet (1 TEU)</option>
                <option value="40ft">40 Feet (2 TEU)</option>
                <option value="45ft">45 Feet (2.25 TEU)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipe Kontainer *
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Dry Standard (GP)">Dry Standard (GP)</option>
                <option value="High Cube (HC)">High Cube (HC)</option>
                <option value="Reefer Pendingin (RF)">Reefer Pendingin (RF)</option>
                <option value="Open Top (OT)">Open Top (OT)</option>
                <option value="Tank Container (TK)">Tank Container (TK)</option>
                <option value="Flat Rack (FR)">Flat Rack (FR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Arus *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContainerCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Ekspor">Ekspor (Outbound)</option>
                <option value="Impor">Impor (Inbound)</option>
                <option value="Domestik">Domestik Antar Pulau</option>
                <option value="Transshipment">Transshipment</option>
                <option value="Empty (Kosong)">Empty (Peti Kosong)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Operasional *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Di Lapangan (CY)">Di Lapangan (CY)</option>
                <option value="Gate-In Terdaftar">Gate-In Terdaftar</option>
                <option value="Loading ke Kapal">Loading ke Kapal</option>
                <option value="Discharge / Bongkar">Discharge / Bongkar</option>
                <option value="Gate-Out Keluar">Gate-Out Keluar</option>
              </select>
            </div>
          </div>

          {/* Weights & Seal Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                <span>Gross Weight (VGM) Kg *</span>
              </label>
              <input
                type="number"
                min="500"
                step="50"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.grossWeightKg ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
              {errors.grossWeightKg && <p className="text-xs text-red-500 mt-1">{errors.grossWeightKg}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Tare Weight (Berat Kosong) Kg</span>
              </label>
              <input
                type="number"
                min="0"
                value={tareWeightKg}
                onChange={(e) => setTareWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Nomor Segel (Seal No.)</span>
              </label>
              <input
                type="text"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value.toUpperCase())}
                placeholder="NZL-SEAL-8890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Shipping Line & Consignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-sky-600" />
                <span>Shipping Line (Principal) *</span>
              </label>
              <input
                type="text"
                value={shippingLine}
                onChange={(e) => setShippingLine(e.target.value)}
                placeholder="NAZLA SHARK LINE / MAERSK / ONE"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.shippingLine ? 'border-red-400' : 'border-slate-200'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Consignee / Shipper (Pemilik Barang)</span>
              </label>
              <input
                type="text"
                value={consignee}
                onChange={(e) => setConsignee(e.target.value)}
                placeholder="PT Indofood / PT Hasil Bahari"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Stowing Yard Location: Block & Slot */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Lokasi Penumpukan di Container Yard (CY)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Blok Lapangan *
                </label>
                <select
                  value={yardBlock}
                  onChange={(e) => setYardBlock(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="" disabled>-- Pilih Blok CY --</option>
                  {yardBlocks.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.zoneType})
                    </option>
                  ))}
                </select>
                {currentBlockStats && (
                  <p className="text-[11px] text-sky-700 mt-1">
                    Okupansi Blok: {currentBlockStats.totalTeus} TEU ({currentBlockStats.utilizationPercentage}%)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Slot Posisi (Row - Tier - Bay) *
                </label>
                <input
                  type="text"
                  value={yardSlot}
                  onChange={(e) => setYardSlot(e.target.value.toUpperCase())}
                  placeholder="R03-T02-B08"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 bg-white text-sm font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Format: Row (Baris), Tier (Tingkat Max 5), Bay (Kolom)</span>
              </div>
            </div>
          </div>

          {/* Vessel & Voyage Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alokasi Kapal Pengangkut (Vessel)
              </label>
              <select
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="-">-- Bukan untuk Kapal / Belum Ditentukan --</option>
                {vessels.map(v => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.berthLocation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor Voyage (Voyage In/Out)
              </label>
              <input
                type="text"
                value={voyageNumber}
                onChange={(e) => setVoyageNumber(e.target.value.toUpperCase())}
                placeholder="V.2026-EXP-08"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Reefer & Hazardous Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHazardous}
                  onChange={(e) => setIsHazardous(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Petikemas Muatan Berbahaya (Dangerous Goods / DG)</span>
                </span>
              </label>

              {type.includes('Reefer') && (
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-700">Suhu Reefer:</span>
                  <input
                    type="text"
                    value={reeferTemp}
                    onChange={(e) => setReeferTemp(e.target.value)}
                    placeholder="-20°C"
                    className="w-24 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-cyan-700"
                  />
                </div>
              )}
            </div>

            {isHazardous && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Klasifikasi IMO / DG Class *
                </label>
                <select
                  value={dgClass}
                  onChange={(e) => setDgClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Class 3 - Flammable Liquid">Class 3 - Flammable Liquid (Cairan Mudah Terbakar)</option>
                  <option value="Class 2 - Gases (Flammable / Non-flammable)">Class 2 - Gases (Gas Terkompresi)</option>
                  <option value="Class 4 - Flammable Solids">Class 4 - Flammable Solids (Padatan Mudah Terbakar)</option>
                  <option value="Class 5 - Oxidizing Substances">Class 5 - Oxidizing Substances</option>
                  <option value="Class 6 - Toxic & Infectious">Class 6 - Toxic & Bahan Beracun</option>
                  <option value="Class 8 - Corrosives">Class 8 - Corrosives (Bahan Korosif)</option>
                  <option value="Class 9 - Miscellaneous">Class 9 - Miscellaneous Dangerous Substances</option>
                </select>
              </div>
            )}
          </div>

          {/* Terminal Fee */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Biaya Penumpukan & Handling (Lift-On/Off) IDR:</span>
            </span>
            <input
              type="number"
              min="0"
              step="50000"
              value={handlingFee}
              onChange={(e) => setHandlingFee(parseFloat(e.target.value) || 0)}
              className="w-48 px-3 py-1.5 rounded-xl border border-emerald-300 text-sm font-bold text-emerald-800 bg-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                  <span>{containerToEdit ? 'Simpan Perubahan' : 'Daftarkan Petikemas'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
