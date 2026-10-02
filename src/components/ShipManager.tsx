import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Ship } from '../types';
import { ShipModal } from './ShipModal';
import { 
  Ship as ShipIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Anchor, 
  Users, 
  Scale, 
  Box, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ShipManager: React.FC = () => {
  const { ships, manifests, deleteShip, updateShip, getShipStats } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [shipToDelete, setShipToDelete] = useState<Ship | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingShip(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ship: Ship) => {
    setEditingShip(ship);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!shipToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteShip(shipToDelete.id);
      showToast(`Kapal ${shipToDelete.name} berhasil dihapus dari armada.`);
      setShipToDelete(null);
    } catch (err: any) {
      console.error('Delete ship error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickStatusChange = async (ship: Ship, newStatus: Ship['status']) => {
    try {
      await updateShip(ship.id, { status: newStatus });
      showToast(`Status operasional ${ship.name} diperbarui ke "${newStatus}".`);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter ships
  const filteredShips = ships.filter(ship => {
    const matchSearch = 
      ship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.captain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.originPort.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.destPort.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || ship.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Control Header & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-sky-100 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kapal, kode, nahkoda, rute..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-sky-50/50 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters and Add button */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">Semua Status Operasional</option>
            <option value="Siap Muat / Sandar">⚓ Siap Muat / Sandar</option>
            <option value="Sedang Berlayar">🌊 Sedang Berlayar</option>
            <option value="Selesai Bongkar">📦 Selesai Bongkar</option>
            <option value="Docking / Perawatan">🛠️ Docking / Perawatan</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Armada Kapal</span>
          </button>
        </div>

      </div>

      {/* Ships Grid Cards */}
      {filteredShips.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-sky-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
            <ShipIcon className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
            Tidak ada kapal yang sesuai filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau daftarkan kapal penumpang baru untuk armada PT NAZLA Bahari.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow hover:bg-sky-700 transition-colors cursor-pointer"
          >
            Registrasi Kapal Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShips.map((ship) => {
            const stats = getShipStats(ship.id);
            const activeManifestCount = manifests.filter(m => m.shipId === ship.id).length;

            return (
              <div
                key={ship.id}
                className="bg-white rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Ship Card Top */}
                <div className="p-5 space-y-4">
                  {/* Status & Code header */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-black text-xs border border-sky-200">
                      {ship.code}
                    </span>

                    <select
                      value={ship.status}
                      onChange={(e) => handleQuickStatusChange(ship, e.target.value as Ship['status'])}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                        ship.status === 'Siap Muat / Sandar'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : ship.status === 'Sedang Berlayar'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ship.status === 'Selesai Bongkar'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="Siap Muat / Sandar">⚓ Siap Muat</option>
                      <option value="Sedang Berlayar">🌊 Berlayar</option>
                      <option value="Selesai Bongkar">📦 Selesai</option>
                      <option value="Docking / Perawatan">🛠️ Docking</option>
                    </select>
                  </div>

                  {/* Ship Name & Type */}
                  <div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-sky-600 transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
                      {ship.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{ship.type}</p>
                    <p className="text-xs text-sky-700 font-semibold mt-1">Nahkoda: {ship.captain}</p>
                  </div>

                  {/* Route Badge */}
                  <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span className="truncate">{ship.originPort.split(' ')[1] || ship.originPort}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-500 shrink-0 mx-1.5" />
                      <span className="truncate">{ship.destPort.split(' ')[1] || ship.destPort}</span>
                    </div>
                    {(ship.departureTime || ship.arrivalTime) && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-sky-200/50">
                        <span>Berangkat: {ship.departureTime || '-'}</span>
                        <span>Tiba: {ship.arrivalTime || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity & Load Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-sky-600" />
                        <span>Beban Muatan Terisi:</span>
                      </span>
                      <span className={stats.isOverloadedWeight ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                        {stats.totalWeightKg.toLocaleString('id-ID')} / {ship.maxCargoWeightKg.toLocaleString('id-ID')} Kg ({stats.weightPercentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.isOverloadedWeight ? 'bg-red-500 animate-pulse' : stats.weightPercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-400 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(stats.weightPercentage, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Pax: {ship.maxPassengers} Jiwa</span>
                      <span>Manifes: {activeManifestCount} Pos</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {ship.id.substring(0, 10)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(ship)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Edit Kapal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setShipToDelete(ship)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 transition-all cursor-pointer"
                      title="Hapus Kapal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ShipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipToEdit={editingShip}
      />

      {/* Delete Confirmation Modal */}
      {shipToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Konfirmasi Hapus Armada Kapal
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus <strong>{shipToDelete.name}</strong> ({shipToDelete.code})? Aksi ini akan menghapus data kapal secara permanen dari Firebase.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShipToDelete(null)}
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
                    <span>Hapus Kapal</span>
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
