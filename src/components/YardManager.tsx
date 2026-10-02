import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { YardBlock } from '../types';
import { YardBlockModal } from './YardBlockModal';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Boxes, 
  Scale, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const YardManager: React.FC = () => {
  const { yardBlocks, containers, deleteYardBlock, getBlockStats } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<YardBlock | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<YardBlock | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingBlock(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: YardBlock) => {
    setEditingBlock(b);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!blockToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteYardBlock(blockToDelete.id);
      showToast(`Blok lapangan ${blockToDelete.name} berhasil dihapus.`);
      setBlockToDelete(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBlocks = yardBlocks.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.zoneType.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Cari blok penumpukan, kode, zona..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Blok Lapangan (CY)</span>
        </button>
      </div>

      {/* Yard Blocks Grid */}
      {filteredBlocks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-sky-100 space-y-3">
          <Layers className="w-8 h-8 text-sky-400 mx-auto" />
          <p className="font-bold text-slate-700">Belum ada blok lapangan penumpukan</p>
          <p className="text-xs text-slate-400">Daftarkan blok baru untuk mulai menata slot petikemas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlocks.map((block) => {
            const stats = getBlockStats(block.name);
            const blockContainers = containers.filter(
              c => (c.yardBlock === block.name || c.yardBlock === block.code) && c.status === 'Di Lapangan (CY)'
            );

            return (
              <div
                key={block.id}
                className="bg-white rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Code & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-black text-xs border border-sky-200">
                      {block.code}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        stats.isFull
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : stats.utilizationPercentage > 80
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {stats.isFull ? 'Penuh (Full)' : `${stats.utilizationPercentage}% Terisi`}
                    </span>
                  </div>

                  {/* Block Name & Zone */}
                  <div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-sky-600 transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
                      {block.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{block.zoneType}</p>
                    <p className="text-[11px] text-sky-700 mt-1 flex items-center gap-1 font-semibold">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{block.equipmentAssigned || 'RTG Crane'}</span>
                    </p>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Okupansi Slot TEU:</span>
                      <span className={stats.isFull ? 'text-red-600' : 'text-sky-900'}>
                        {stats.totalTeus} / {block.maxTeuCapacity} TEU
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.isFull ? 'bg-red-500' : stats.utilizationPercentage > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-400 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(stats.utilizationPercentage, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Maksimal Tier: <strong>{block.maxTiers} Tingkat</strong></span>
                      <span>Total Beban: <strong>{stats.totalGrossWeightTon} Ton</strong></span>
                    </div>
                  </div>

                  {/* Stowed Containers Preview */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                      <span>Petikemas di Blok ({blockContainers.length} Box):</span>
                    </p>
                    {blockContainers.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Slot kosong, siap menerima penumpukan kontainer.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                        {blockContainers.slice(0, 6).map(c => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-sky-800"
                          >
                            {c.containerNumber} ({c.yardSlot})
                          </span>
                        ))}
                        {blockContainers.length > 6 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{blockContainers.length - 6} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {block.id.substring(0, 10)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(block)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Edit Blok"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setBlockToDelete(block)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 transition-all cursor-pointer"
                      title="Hapus Blok"
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
      <YardBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        blockToEdit={editingBlock}
      />

      {/* Delete Confirmation Modal */}
      {blockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Konfirmasi Hapus Blok CY
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus blok <strong>{blockToDelete.name}</strong> ({blockToDelete.code})? Data blok akan dihapus dari Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBlockToDelete(null)}
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
                    <span>Hapus Blok</span>
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
