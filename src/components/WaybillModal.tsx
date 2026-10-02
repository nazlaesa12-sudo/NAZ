import React from 'react';
import { CargoManifest, Ship } from '../types';
import { SharkLogo } from './SharkLogo';
import { 
  X, 
  Printer, 
  QrCode, 
  Ship as ShipIcon, 
  User, 
  Scale, 
  Box, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

interface WaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: CargoManifest | null;
  ship?: Ship | null;
}

export const WaybillModal: React.FC<WaybillModalProps> = ({
  isOpen,
  onClose,
  manifest,
  ship
}) => {
  if (!isOpen || !manifest) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print px-6 py-4 bg-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <QrCode className="w-5 h-5 text-cyan-200" />
            <span>Digital Cargo Waybill & Tag Bagasi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Tiket / Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Waybill Pass */}
        <div className="p-6 sm:p-8 bg-white text-slate-800 space-y-6 printable-area">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-sky-200 pb-5">
            <div>
              <SharkLogo size="md" />
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                PT NAZLA BAHARI LOGISTIK &bull; DIVISI MUATAN PENUMPANG
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-black text-xs border border-sky-200">
                {manifest.manifestNumber}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date(manifest.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Ship & Route Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShipIcon className="w-5 h-5 text-sky-600" />
                <span className="font-extrabold text-sm text-sky-950 font-['Plus_Jakarta_Sans',sans-serif]">
                  {manifest.shipName}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                {manifest.status}
              </span>
            </div>

            {ship && (
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-sky-200/60">
                <span className="font-medium">{ship.originPort.split(' ')[1] || ship.originPort}</span>
                <span className="text-sky-500 font-bold">&rarr;</span>
                <span className="font-medium">{ship.destPort.split(' ')[1] || ship.destPort}</span>
              </div>
            )}
          </div>

          {/* Passenger & Cargo Grid Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Nama Penumpang / Pengirim:</span>
              <p className="font-bold text-slate-900 text-sm">{manifest.senderOrPassenger}</p>
              {manifest.identityNumber && (
                <p className="text-slate-500 font-mono">ID: {manifest.identityNumber}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Kategori & Posisi Palka:</span>
              <p className="font-bold text-sky-800">{manifest.category}</p>
              <p className="text-slate-600 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-500" />
                <span>{manifest.deckPosition || 'Palka Utama'}</span>
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">Spesifikasi Muatan:</span>
              <p className="font-bold text-slate-800">
                {manifest.weightKg} Kg &bull; {manifest.itemCount} Koli {manifest.volumeM3 ? `(${manifest.volumeM3} m³)` : ''}
              </p>
              <p className="text-slate-500 text-[11px] italic line-clamp-1">{manifest.description}</p>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">Biaya & Status Pembayaran:</span>
              <p className="font-extrabold text-emerald-700 text-sm">
                Rp {manifest.shippingFee.toLocaleString('id-ID')}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>{manifest.paymentStatus}</span>
              </span>
            </div>
          </div>

          {/* Handling Instructions note */}
          {manifest.handlingNotes && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <span className="font-bold">Instruksi Khusus:</span>
              <span>{manifest.handlingNotes}</span>
            </div>
          )}

          {/* Barcode & Security Stamp Footer */}
          <div className="pt-4 border-t-2 border-dashed border-sky-200 flex items-center justify-between">
            {/* Simulated Barcode */}
            <div className="space-y-1">
              <div className="flex items-center gap-0.5 h-10">
                {[3,1,4,2,1,3,2,4,1,2,3,1,4,2,1,3,2,1,4,3,2,1,3,2].map((w, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{ width: `${w * 1.5}px` }}
                  ></div>
                ))}
              </div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500">{manifest.manifestNumber}</p>
            </div>

            {/* Stamp */}
            <div className="w-24 h-24 rounded-full border-2 border-sky-600 p-1 flex flex-col items-center justify-center text-center rotate-[-12deg] text-sky-700 select-none opacity-85">
              <span className="text-[7px] font-extrabold uppercase tracking-tight">PT NAZLA BAHARI</span>
              <span className="text-[9px] font-black uppercase text-sky-900">VERIFIED</span>
              <span className="text-[7px] font-bold text-sky-600">PORT STOWAGE</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400">
            Perusahaan Pelayaran Resmi Milik NAZLA &bull; Tiket muatan ini wajib diperlihatkan saat pengambilan bagasi/kargo di pelabuhan tujuan.
          </div>
        </div>

      </div>
    </div>
  );
};
