import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SharkLogo } from './SharkLogo';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  Boxes, 
  Layers, 
  Scale, 
  Ship, 
  CheckCircle2 
} from 'lucide-react';

interface PrintTerminalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintTerminalReportModal: React.FC<PrintTerminalReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { containers, yardBlocks, vessels, getTerminalStats } = useData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!isOpen) return null;

  const stats = getTerminalStats();

  const filteredContainers = containers.filter(c =>
    selectedCategory === 'ALL' || c.category === selectedCategory
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-4xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-4 bg-gradient-to-r from-sky-700 to-blue-800 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-200" />
            <span className="font-extrabold text-sm">Dokumen Laporan Manifes Terminal Petikemas Resmi</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-sky-900/80 border border-sky-400/40 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="ALL" className="text-slate-800">Semua Arus Petikemas</option>
              <option value="Ekspor" className="text-slate-800">Khusus Ekspor</option>
              <option value="Impor" className="text-slate-800">Khusus Impor</option>
              <option value="Domestik" className="text-slate-800">Khusus Domestik</option>
              <option value="Empty (Kosong)" className="text-slate-800">Peti Kosong (Empty)</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="p-8 bg-white text-slate-800 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar printable-sheet">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <SharkLogo size="md" />
              <div>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  PT NAZLA TERMINAL PETIKEMAS
                </h1>
                <p className="text-xs text-slate-600 font-semibold">
                  Divisi Perencanaan Stowing & Pengendalian Operasional Container Yard
                </p>
                <p className="text-[10px] text-slate-500">
                  Pemilik Perusahaan: NAZLA &bull; Pelabuhan Hub Petikemas Maritim
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 font-mono font-black text-xs">
                FORMULIR LAPORAN: NZL-CY-MFT
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dicetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          {/* Terminal Meta Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block font-medium">Total Petikemas di CY:</span>
              <span className="font-bold text-slate-900">{stats.totalTeusInYard} TEUs ({stats.totalContainers} Box)</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Total Beban Tonase (VGM):</span>
              <span className="font-bold text-slate-900">{stats.totalGrossWeightTon.toLocaleString('id-ID')} Ton</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Reefer Cold Chain Aktif:</span>
              <span className="font-bold text-sky-800">{stats.reeferActiveCount} Box Beroperasi</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Muatan Berbahaya (DG):</span>
              <span className="font-bold text-amber-800">{stats.dgHazardousCount} Box Terisolasi</span>
            </div>
          </div>

          {/* Containers Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Daftar Petikemas Terdaftar ({filteredContainers.length} Box)
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-sky-700 text-white font-bold">
                  <tr>
                    <th className="p-2 border-r border-sky-600 w-8 text-center">No</th>
                    <th className="p-2 border-r border-sky-600">Nomor Petikemas</th>
                    <th className="p-2 border-r border-sky-600">Ukuran / Tipe</th>
                    <th className="p-2 border-r border-sky-600">Shipping Line</th>
                    <th className="p-2 border-r border-sky-600">Lokasi Blok & Slot CY</th>
                    <th className="p-2 border-r border-sky-600 text-right">Berat VGM (Kg)</th>
                    <th className="p-2 border-r border-sky-600">Arus / Kategori</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredContainers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                        Belum ada data petikemas untuk kategori ini.
                      </td>
                    </tr>
                  ) : (
                    filteredContainers.map((c, idx) => (
                      <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 text-center border-r border-slate-200 font-medium">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-sky-800">{c.containerNumber}</td>
                        <td className="p-2 border-r border-slate-200">{c.size} {c.type}</td>
                        <td className="p-2 border-r border-slate-200 font-medium">{c.shippingLine}</td>
                        <td className="p-2 border-r border-slate-200 font-mono font-semibold">{c.yardBlock} ({c.yardSlot})</td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">{c.grossWeightKg.toLocaleString('id-ID')}</td>
                        <td className="p-2 border-r border-slate-200">{c.category}</td>
                        <td className="p-2 text-center font-semibold text-[11px] text-sky-800">{c.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Supervisor Container Yard</p>
              <div>
                <p className="font-bold underline text-slate-900">( Staff Stowing CY Shark )</p>
                <p className="text-[10px] text-slate-400">NIP. 2026.NZL.CY01</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Manager Operasional Gate & Dermaga</p>
              <div>
                <p className="font-bold underline text-slate-900">( Kepala Operasi Terminal )</p>
                <p className="text-[10px] text-slate-400">Master Port Logistics</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Direktur Utama / Pemilik Perusahaan</p>
              <div>
                <p className="font-bold underline text-slate-900">( NAZLA )</p>
                <p className="text-[10px] text-slate-400">PT NAZLA TERMINAL PETIKEMAS</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
