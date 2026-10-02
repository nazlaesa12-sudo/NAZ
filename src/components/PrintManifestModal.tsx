import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SharkLogo } from './SharkLogo';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  Ship as ShipIcon, 
  CheckCircle, 
  AlertTriangle,
  Anchor,
  Scale
} from 'lucide-react';

interface PrintManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShipId?: string;
}

export const PrintManifestModal: React.FC<PrintManifestModalProps> = ({
  isOpen,
  onClose,
  selectedShipId
}) => {
  const { ships, manifests, getShipStats } = useData();
  const [currentShipId, setCurrentShipId] = useState<string>(selectedShipId || (ships[0]?.id || ''));

  if (!isOpen) return null;

  const currentShip = ships.find(s => s.id === (currentShipId || selectedShipId || ships[0]?.id));
  const shipManifests = currentShip ? manifests.filter(m => m.shipId === currentShip.id) : [];
  const stats = currentShip ? getShipStats(currentShip.id) : null;

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
            <span className="font-extrabold text-sm">Dokumen Manifes Muatan Resmi Kapal</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentShip?.id || ''}
              onChange={(e) => setCurrentShipId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-sky-900/80 border border-sky-400/40 text-xs font-semibold text-white focus:outline-none"
            >
              {ships.map(s => (
                <option key={s.id} value={s.id} className="text-slate-800">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Manifes (Print)</span>
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
                  PT NAZLA BAHARI MARINE LOGISTICS
                </h1>
                <p className="text-xs text-slate-600 font-semibold">
                  Divisi Operasional & Manajemen Manifes Muatan Kapal Penumpang
                </p>
                <p className="text-[10px] text-slate-500">
                  Pemilik Perusahaan: NAZLA &bull; Izin Operasional Pelayaran Nasional
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 font-mono font-black text-xs">
                FORMULIR MANIFES RESMI: NZL-MFT-EXP
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dicetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          {/* Voyage & Ship Meta Table */}
          {currentShip && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block font-medium">Nama Kapal & Kode:</span>
                <span className="font-bold text-slate-900">{currentShip.name} ({currentShip.code})</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Nahkoda (Master):</span>
                <span className="font-bold text-slate-900">{currentShip.captain}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Rute Pelayaran:</span>
                <span className="font-bold text-sky-800">{currentShip.originPort} &rarr; {currentShip.destPort}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Kapasitas Muat Maks:</span>
                <span className="font-bold text-slate-900">{currentShip.maxCargoWeightKg.toLocaleString('id-ID')} Kg ({currentShip.maxPassengers} Pax)</span>
              </div>
            </div>
          )}

          {/* Manifest Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Daftar Muatan, Bagasi & Kargo Terdaftar ({shipManifests.length} Item)
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-sky-700 text-white font-bold">
                  <tr>
                    <th className="p-2.5 border-r border-sky-600 w-8 text-center">No</th>
                    <th className="p-2.5 border-r border-sky-600">No. Manifes / Waybill</th>
                    <th className="p-2.5 border-r border-sky-600">Penumpang / Pengirim</th>
                    <th className="p-2.5 border-r border-sky-600">Kategori</th>
                    <th className="p-2.5 border-r border-sky-600">Deskripsi Barang</th>
                    <th className="p-2.5 border-r border-sky-600 text-center">Koli</th>
                    <th className="p-2.5 border-r border-sky-600 text-right">Berat (Kg)</th>
                    <th className="p-2.5 border-r border-sky-600">Posisi Palka</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {shipManifests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 italic">
                        Belum ada data muatan kargo terdaftar untuk kapal ini.
                      </td>
                    </tr>
                  ) : (
                    shipManifests.map((m, idx) => (
                      <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 text-center border-r border-slate-200 font-medium">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-sky-800">{m.manifestNumber}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{m.senderOrPassenger}</td>
                        <td className="p-2 border-r border-slate-200">{m.category}</td>
                        <td className="p-2 border-r border-slate-200 text-slate-600">{m.description}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">{m.itemCount}</td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">{m.weightKg.toLocaleString('id-ID')}</td>
                        <td className="p-2 border-r border-slate-200">{m.deckPosition || '-'}</td>
                        <td className="p-2 text-center font-semibold text-[11px] text-sky-700">{m.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {stats && (
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={5} className="p-2.5 text-right uppercase">Total Tonase Terdaftar:</td>
                      <td className="p-2.5 text-center">{stats.totalItems} Koli</td>
                      <td className="p-2.5 text-right font-mono text-sky-900">{stats.totalWeightKg.toLocaleString('id-ID')} Kg</td>
                      <td colSpan={2} className="p-2.5 text-slate-500 text-[11px]">
                        {stats.isOverloadedWeight ? '⚠️ OVERLOAD' : '✅ Kelaiklautan Aman'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Maritime Signatures Section */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Petugas Palka & Timbangan</p>
              <div>
                <p className="font-bold underline text-slate-900">( Staff Logistik NAZLA )</p>
                <p className="text-[10px] text-slate-400">NIP. 2026.NZL.009</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Nahkoda Kapal (Master)</p>
              <div>
                <p className="font-bold underline text-slate-900">
                  ( {currentShip?.captain || 'Capt. Nazla Bahari'} )
                </p>
                <p className="text-[10px] text-slate-400">Master Mariner</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Direktur / Pemilik Perusahaan</p>
              <div>
                <p className="font-bold underline text-slate-900">( NAZLA )</p>
                <p className="text-[10px] text-slate-400">PT NAZLA BAHARI MARINE</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
