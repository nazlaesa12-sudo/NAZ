import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Vessel } from '../types';
import { VesselModal } from './VesselModal';
import { 
  Ship, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Anchor, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  Tag 
} from 'lucide-react';

export const VesselManager: React.FC = () => {
  const { vessels, containers, deleteVessel, updateVessel } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [vesselToDelete, setVesselToDelete] = useState<Vessel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingVessel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vessel) => {
    setEditingVessel(v);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vesselToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteVessel(vesselToDelete.id);
      showToast(`Kapal ${vesselToDelete.name} berhasil dihapus dari jadwal dermaga.`);
      setVesselToDelete(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickStatusChange = async (v: Vessel, nextStatus: Vessel['status']) => {
    try {
      await updateVessel(v.id, { status: nextStatus });
      showToast(`Status kapal ${v.name} diubah ke "${nextStatus}".`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVessels = vessels.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.berthLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.shippingLine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-sky-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kapal petikemas, callsign, dermaga..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Kapal (Vessel)</span>
        </button>
      </div>

      {/* Vessels Grid */}
      {filteredVessels.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-sky-100 space-y-3">
          <Ship className="w-8 h-8 text-sky-400 mx-auto" />
          <p className="font-bold text-slate-700">Belum ada jadwal kapal petikemas</p>
          <p className="text-xs text-slate-400">Daftarkan jadwal sandar kapal petikemas untuk terminal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVessels.map((vessel) => {
            const assignedContainers = containers.filter(c => c.vesselName === vessel.name);
            const loadedTeus = assignedContainers.reduce((sum, c) => sum + (c.size === '40ft' ? 2 : 1), 0);

            return (
              <div
                key={vessel.id}
                className="bg-white rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Callsign & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-black text-xs border border-sky-200">
                      {vessel.callsign}
                    </span>

                    <select
                      value={vessel.status}
                      onChange={(e) => handleQuickStatusChange(vessel, e.target.value as Vessel['status'])}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                        vessel.status === 'Sandar / Berthed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : vessel.status === 'Bongkar Muat (Working)'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : vessel.status === 'Menunggu Pandu'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="Sandar / Berthed">⚓ Sandar</option>
                      <option value="Bongkar Muat (Working)">🏗️ Working</option>
                      <option value="Menunggu Pandu">⏳ Menunggu Pandu</option>
                      <option value="Berlayar (Departed)">🌊 Berlayar</option>
                    </select>
                  </div>

                  {/* Vessel Name & Line */}
                  <div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-sky-600 transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
                      {vessel.name}
                    </h3>
                    <p className="text-xs text-sky-700 font-semibold">{vessel.shippingLine}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <Anchor className="w-3.5 h-3.5 text-sky-600" />
                      <span>{vessel.berthLocation}</span>
                    </p>
                  </div>

                  {/* Schedule */}
                  <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-500" />
                        <span>ETA (Tiba):</span>
                      </span>
                      <span className="font-semibold text-slate-800">{vessel.eta || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span>ETD (Berangkat):</span>
                      </span>
                      <span className="font-semibold text-slate-800">{vessel.etd || '-'}</span>
                    </div>
                  </div>

                  {/* Target TEUs */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Target Bongkar/Muat:</span>
                    <span className="font-bold text-sky-900">{vessel.targetTeus} TEUs</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Petikemas Terdata:</span>
                    <span className="font-semibold text-slate-800">{assignedContainers.length} Box ({loadedTeus} TEU)</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {vessel.id.substring(0, 10)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(vessel)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Edit Kapal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setVesselToDelete(vessel)}
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

      {/* Modal */}
      <VesselModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vesselToEdit={editingVessel}
      />

      {/* Delete Confirmation Modal */}
      {vesselToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Konfirmasi Hapus Kapal Petikemas
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus jadwal kapal <strong>{vesselToDelete.name}</strong> ({vesselToDelete.callsign})? Data akan dihapus dari Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVesselToDelete(null)}
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
