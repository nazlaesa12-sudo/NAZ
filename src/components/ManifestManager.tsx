import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CargoManifest, CargoCategory, CargoStatus } from '../types';
import { ManifestModal } from './ManifestModal';
import { WaybillModal } from './WaybillModal';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  QrCode, 
  Printer, 
  Scale, 
  DollarSign, 
  MapPin, 
  Ship as ShipIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ManifestManager: React.FC = () => {
  const { manifests, ships, deleteManifest, updateManifestStatus } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipFilter, setSelectedShipFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManifest, setEditingManifest] = useState<CargoManifest | null>(null);
  const [selectedWaybillManifest, setSelectedWaybillManifest] = useState<CargoManifest | null>(null);
  const [manifestToDelete, setManifestToDelete] = useState<CargoManifest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingManifest(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: CargoManifest) => {
    setEditingManifest(m);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!manifestToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteManifest(manifestToDelete.id);
      showToast(`Manifes ${manifestToDelete.manifestNumber} berhasil dihapus.`);
      setManifestToDelete(null);
    } catch (err: any) {
      console.error('Delete manifest error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (m: CargoManifest, nextStatus: CargoStatus) => {
    try {
      await updateManifestStatus(m.id, nextStatus);
      showToast(`Status waybill ${m.manifestNumber} diubah ke "${nextStatus}".`);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered manifests
  const filteredManifests = manifests.filter((m) => {
    const matchSearch =
      m.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderOrPassenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.identityNumber && m.identityNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.deckPosition && m.deckPosition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchShip = selectedShipFilter === 'ALL' || m.shipId === selectedShipFilter;
    const matchCategory = selectedCategoryFilter === 'ALL' || m.category === selectedCategoryFilter;
    const matchStatus = selectedStatusFilter === 'ALL' || m.status === selectedStatusFilter;

    return matchSearch && matchShip && matchCategory && matchStatus;
  });

  // Calculate stats for filtered view
  const totalWeight = filteredManifests.reduce((sum, m) => sum + (Number(m.weightKg) || 0), 0);
  const totalRevenue = filteredManifests.reduce((sum, m) => sum + (Number(m.shippingFee) || 0), 0);
  const totalKoli = filteredManifests.reduce((sum, m) => sum + (Number(m.itemCount) || 0), 0);

  const getStatusBadge = (status: CargoStatus) => {
    switch (status) {
      case 'Terdaftar':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Proses Muat / Stowing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Di Atas Kapal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Tiba & Siap Ambil':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Telah Diserahkan':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Muatan Terdaftar</p>
            <h3 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              {filteredManifests.length} <span className="text-xs font-normal text-slate-400">Waybill</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-sky-100 text-sky-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Berat Tonase</p>
            <h3 className="text-2xl font-black text-sky-700 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              {totalWeight.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Kg</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Koli / Unit</p>
            <h3 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              {totalKoli.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Item</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-600">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Pendapatan Tarif</p>
            <h3 className="text-xl font-black text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no waybill, nama penumpang, NIK, palka..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action: Add Manifest Button */}
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Input Muatan Baru</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Armada Kapal</label>
            <select
              value={selectedShipFilter}
              onChange={(e) => setSelectedShipFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Semua Kapal Penumpang</option>
              {ships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Kategori Muatan</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Bagasi Penumpang">Bagasi Penumpang</option>
              <option value="Kargo Umum / Paket">Kargo Umum / Paket</option>
              <option value="Kendaraan Roda 2">Kendaraan Roda 2</option>
              <option value="Kendaraan Roda 4 / Mobil">Kendaraan Roda 4 / Mobil</option>
              <option value="Bahan Makanan / Palka Dingin">Bahan Makanan / Palka Dingin</option>
              <option value="Barang Khusus / DG Class">Barang Khusus / DG Class</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Status Operasional</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Terdaftar">Terdaftar</option>
              <option value="Proses Muat / Stowing">Proses Muat / Stowing</option>
              <option value="Di Atas Kapal">Di Atas Kapal</option>
              <option value="Tiba & Siap Ambil">Tiba & Siap Ambil</option>
              <option value="Telah Diserahkan">Telah Diserahkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-sky-50/80 border-b border-sky-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-6">No. Manifes / Waybill</th>
                <th className="p-3.5">Penumpang / Pengirim</th>
                <th className="p-3.5">Kapal Pengangkut</th>
                <th className="p-3.5">Kategori & Posisi</th>
                <th className="p-3.5 text-right">Berat (Kg)</th>
                <th className="p-3.5 text-right">Tarif (Rp)</th>
                <th className="p-3.5">Status Muatan</th>
                <th className="p-3.5 pr-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredManifests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-600">Tidak ada data manifes muatan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Input Muatan Baru" untuk menambahkan data manifes ke Firebase.</p>
                  </td>
                </tr>
              ) : (
                filteredManifests.map((m) => {
                  const ship = ships.find(s => s.id === m.shipId);

                  return (
                    <tr key={m.id} className="hover:bg-sky-50/40 transition-colors">
                      {/* Waybill number */}
                      <td className="p-3.5 pl-6 font-mono font-bold text-sky-800">
                        <button
                          onClick={() => setSelectedWaybillManifest(m)}
                          className="hover:underline flex items-center gap-1 text-sky-700 cursor-pointer text-xs"
                        >
                          <span>{m.manifestNumber}</span>
                          <QrCode className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        </button>
                      </td>

                      {/* Passenger */}
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 text-xs">{m.senderOrPassenger}</p>
                        {m.identityNumber && (
                          <p className="text-[10px] text-slate-400 font-mono">ID: {m.identityNumber}</p>
                        )}
                        {m.contactPhone && (
                          <p className="text-[10px] text-slate-500">HP: {m.contactPhone}</p>
                        )}
                      </td>

                      {/* Ship Name */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <ShipIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{m.shipName}</span>
                        </div>
                        {ship && (
                          <p className="text-[10px] text-slate-500">
                            {ship.originPort.split(' ')[1] || ship.originPort} &rarr; {ship.destPort.split(' ')[1] || ship.destPort}
                          </p>
                        )}
                      </td>

                      {/* Category & Deck Position */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">{m.category}</span>
                        <span className="text-[10px] text-sky-600 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" />
                          <span>{m.deckPosition || 'Palka Utama'}</span>
                        </span>
                      </td>

                      {/* Weight & Item count */}
                      <td className="p-3.5 text-right font-mono">
                        <span className="font-bold text-slate-900">{m.weightKg.toLocaleString('id-ID')} Kg</span>
                        <span className="block text-[10px] text-slate-400">{m.itemCount} Koli {m.volumeM3 ? `(${m.volumeM3}m³)` : ''}</span>
                      </td>

                      {/* Fee */}
                      <td className="p-3.5 text-right font-mono">
                        <span className="font-extrabold text-emerald-700">
                          Rp {m.shippingFee.toLocaleString('id-ID')}
                        </span>
                        <span className="block text-[10px] text-slate-500">{m.paymentStatus}</span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5">
                        <select
                          value={m.status}
                          onChange={(e) => handleStatusChange(m, e.target.value as CargoStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(m.status)}`}
                        >
                          <option value="Terdaftar">📝 Terdaftar</option>
                          <option value="Proses Muat / Stowing">🏗️ Proses Muat</option>
                          <option value="Di Atas Kapal">🚢 Di Atas Kapal</option>
                          <option value="Tiba & Siap Ambil">⚓ Tiba & Siap Ambil</option>
                          <option value="Telah Diserahkan">✔️ Diserahkan</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="p-3.5 pr-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedWaybillManifest(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Lihat Tag & Cetak Tiket"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Manifes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setManifestToDelete(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Manifes"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <ManifestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        manifestToEdit={editingManifest}
      />

      {/* Digital Waybill Modal */}
      <WaybillModal
        isOpen={selectedWaybillManifest !== null}
        onClose={() => setSelectedWaybillManifest(null)}
        manifest={selectedWaybillManifest}
        ship={selectedWaybillManifest ? ships.find(s => s.id === selectedWaybillManifest.shipId) : null}
      />

      {/* Delete Confirmation Modal */}
      {manifestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Konfirmasi Hapus Manifes
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus manifes waybill <strong>{manifestToDelete.manifestNumber}</strong> milik <strong>{manifestToDelete.senderOrPassenger}</strong>? Data akan terhapus permanen dari Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setManifestToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Manifes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
