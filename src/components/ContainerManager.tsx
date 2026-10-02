import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Container, ContainerStatus, ContainerSize } from '../types';
import { ContainerModal } from './ContainerModal';
import { EIRModal } from './EIRModal';
import { 
  Boxes, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Printer, 
  QrCode, 
  Scale, 
  MapPin, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Ship,
  DollarSign
} from 'lucide-react';

export const ContainerManager: React.FC = () => {
  const { containers, yardBlocks, deleteContainer, updateContainerStatus } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('ALL');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [selectedEIRContainer, setSelectedEIRContainer] = useState<Container | null>(null);
  const [containerToDelete, setContainerToDelete] = useState<Container | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingContainer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Container) => {
    setEditingContainer(c);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!containerToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteContainer(containerToDelete.id);
      showToast(`Kontainer ${containerToDelete.containerNumber} berhasil dihapus dari sistem.`);
      setContainerToDelete(null);
    } catch (err: any) {
      console.error('Delete container error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (c: Container, nextStatus: ContainerStatus) => {
    try {
      await updateContainerStatus(c.id, nextStatus);
      showToast(`Status petikemas ${c.containerNumber} diubah ke "${nextStatus}".`);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered containers
  const filteredContainers = containers.filter((c) => {
    const matchSearch =
      c.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sealNumber && c.sealNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.consignee && c.consignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.shippingLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.yardSlot && c.yardSlot.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.vesselName && c.vesselName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchBlock = selectedBlockFilter === 'ALL' || c.yardBlock === selectedBlockFilter;
    const matchSize = selectedSizeFilter === 'ALL' || c.size === selectedSizeFilter;
    const matchStatus = selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;

    return matchSearch && matchBlock && matchSize && matchStatus;
  });

  // Calculate TEU for display
  const getTeu = (size: string) => {
    if (size === '40ft') return 2;
    if (size === '45ft') return 2.25;
    return 1;
  };

  const totalFilteredTeus = filteredContainers.reduce((sum, c) => sum + getTeu(c.size), 0);
  const totalFilteredWeightTon = Math.round(filteredContainers.reduce((sum, c) => sum + (c.grossWeightKg || 0), 0) / 1000);
  const totalFilteredRevenue = filteredContainers.reduce((sum, c) => sum + (c.handlingFee || 0), 0);

  const getStatusBadge = (status: ContainerStatus) => {
    switch (status) {
      case 'Di Lapangan (CY)':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Gate-In Terdaftar':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Loading ke Kapal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Discharge / Bongkar':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gate-Out Keluar':
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Petikemas Terdata</p>
            <h3 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              {filteredContainers.length} <span className="text-xs font-normal text-slate-400">Box</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-sky-100 text-sky-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Volume Muatan Terminal</p>
            <h3 className="text-2xl font-black text-sky-700 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              {totalFilteredTeus} <span className="text-xs font-normal text-slate-400">TEUs</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Berat Tonase (VGM)</p>
            <h3 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              {totalFilteredWeightTon.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Ton</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-600">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Pendapatan Handling</p>
            <h3 className="text-xl font-black text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              Rp {totalFilteredRevenue.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no kontainer, segel, pemilik, slot, kapal..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Gate-In / Tambah Petikemas</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Blok Lapangan (CY)</label>
            <select
              value={selectedBlockFilter}
              onChange={(e) => setSelectedBlockFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Semua Blok CY</option>
              {yardBlocks.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Ukuran Petikemas</label>
            <select
              value={selectedSizeFilter}
              onChange={(e) => setSelectedSizeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Semua Ukuran (20ft, 40ft, 45ft)</option>
              <option value="20ft">20 Feet (1 TEU)</option>
              <option value="40ft">40 Feet (2 TEU)</option>
              <option value="45ft">45 Feet (2.25 TEU)</option>
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
              <option value="Di Lapangan (CY)">Di Lapangan (CY)</option>
              <option value="Gate-In Terdaftar">Gate-In Terdaftar</option>
              <option value="Loading ke Kapal">Loading ke Kapal</option>
              <option value="Discharge / Bongkar">Discharge / Bongkar</option>
              <option value="Gate-Out Keluar">Gate-Out Keluar</option>
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
                <th className="p-3.5 pl-6">No. Petikemas & Ukuran</th>
                <th className="p-3.5">Shipping Line & Pemilik</th>
                <th className="p-3.5">Lokasi Blok & Slot CY</th>
                <th className="p-3.5 text-right">Berat VGM (Kg)</th>
                <th className="p-3.5">Alokasi Kapal & Voyage</th>
                <th className="p-3.5">Status & Spesifikasi</th>
                <th className="p-3.5 pr-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContainers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-600">Tidak ada data petikemas</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Gate-In / Tambah Petikemas" untuk mendaftarkan kontainer ke Firebase.</p>
                  </td>
                </tr>
              ) : (
                filteredContainers.map((c) => (
                  <tr key={c.id} className="hover:bg-sky-50/40 transition-colors">
                    {/* Container Number & Size */}
                    <td className="p-3.5 pl-6">
                      <button
                        onClick={() => setSelectedEIRContainer(c)}
                        className="hover:underline flex items-center gap-1.5 text-sky-800 font-mono font-black text-xs cursor-pointer"
                        title="Klik untuk cetak EIR Slip"
                      >
                        <span>{c.containerNumber}</span>
                        <QrCode className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      </button>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                          {c.size}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {c.type}
                        </span>
                      </div>
                    </td>

                    {/* Shipping Line & Consignee */}
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-xs">{c.shippingLine}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                        {c.consignee || 'General Consignee'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Segel: {c.sealNumber || '-'}</p>
                    </td>

                    {/* Yard Block & Slot */}
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 block text-xs">{c.yardBlock}</span>
                      <span className="text-[11px] text-sky-700 font-mono font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span>{c.yardSlot || 'R01-T01-B01'}</span>
                      </span>
                    </td>

                    {/* VGM Gross Weight */}
                    <td className="p-3.5 text-right font-mono">
                      <span className="font-bold text-slate-900 block">{c.grossWeightKg.toLocaleString('id-ID')} Kg</span>
                      <span className="text-[10px] text-slate-400">{getTeu(c.size)} TEU</span>
                    </td>

                    {/* Vessel */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <Ship className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="font-medium text-slate-800 text-xs truncate max-w-[150px]">{c.vesselName || '-'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{c.voyageNumber || '-'}</p>
                    </td>

                    {/* Status & Alerts */}
                    <td className="p-3.5 space-y-1">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c, e.target.value as ContainerStatus)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(c.status)}`}
                      >
                        <option value="Di Lapangan (CY)">Di Lapangan (CY)</option>
                        <option value="Gate-In Terdaftar">Gate-In Terdaftar</option>
                        <option value="Loading ke Kapal">Loading ke Kapal</option>
                        <option value="Discharge / Bongkar">Discharge / Bongkar</option>
                        <option value="Gate-Out Keluar">Gate-Out Keluar</option>
                      </select>

                      <div className="flex items-center gap-1">
                        {c.type.includes('Reefer') && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800 flex items-center gap-0.5">
                            <Thermometer className="w-2.5 h-2.5" />
                            <span>{c.reeferTemp}</span>
                          </span>
                        )}
                        {c.isHazardous && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            <span>DG</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedEIRContainer(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                          title="Cetak Slip EIR / Gate Pass"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Petikemas"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setContainerToDelete(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Petikemas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <ContainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        containerToEdit={editingContainer}
      />

      {/* EIR Modal */}
      <EIRModal
        isOpen={selectedEIRContainer !== null}
        onClose={() => setSelectedEIRContainer(null)}
        container={selectedEIRContainer}
      />

      {/* Delete Confirmation Modal */}
      {containerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Konfirmasi Hapus Petikemas
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus petikemas <strong>{containerToDelete.containerNumber}</strong> ({containerToDelete.size}) dari terminal? Data akan terhapus permanen dari Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContainerToDelete(null)}
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
                    <span>Hapus Petikemas</span>
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
