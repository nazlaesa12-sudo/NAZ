import React from 'react';
import { Container } from '../types';
import { SharkLogo } from './SharkLogo';
import { 
  X, 
  Printer, 
  QrCode, 
  Boxes, 
  Truck, 
  MapPin, 
  Scale, 
  Ship, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';

interface EIRModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container | null;
}

export const EIRModal: React.FC<EIRModalProps> = ({
  isOpen,
  onClose,
  container
}) => {
  if (!isOpen || !container) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print px-6 py-4 bg-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <QrCode className="w-5 h-5 text-cyan-200" />
            <span>Equipment Interchange Receipt (EIR) / Job Slip Gate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak EIR Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official EIR Slip */}
        <div className="p-6 sm:p-8 bg-white text-slate-800 space-y-5 printable-area">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-sky-200 pb-4">
            <div>
              <SharkLogo size="md" />
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                PT NAZLA TERMINAL PETIKEMAS &bull; GATE & CONTAINER YARD DIVISION
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-black text-xs border border-sky-200">
                EIR-{container.containerNumber.replace(/[^a-zA-Z0-9]/g, '')}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Waktu: {new Date().toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          {/* Prominent Container ID Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-between">
            <div>
              <p className="text-[11px] text-sky-100 font-semibold uppercase">Nomor Petikemas Terverifikasi</p>
              <h2 className="text-2xl font-black font-mono tracking-wider">{container.containerNumber}</h2>
              <p className="text-xs text-cyan-200 mt-0.5">
                {container.size} &bull; {container.type} ({container.isoCode})
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-sky-800 shadow">
                {container.status}
              </span>
              <p className="text-[11px] text-sky-100 mt-1">{container.category}</p>
            </div>
          </div>

          {/* Yard Slot & Stowing Allocation */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-600 text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Alokasi Blok & Slot Penumpukan:</p>
                <h4 className="font-extrabold text-sm text-slate-900">{container.yardBlock}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium block">Row - Tier - Bay</span>
              <span className="font-mono font-black text-base text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-300">
                {container.yardSlot}
              </span>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium">Berat Kotor (VGM):</span>
              <p className="font-mono font-bold text-slate-900">{container.grossWeightKg.toLocaleString('id-ID')} Kg</p>
              <p className="text-slate-400 text-[10px]">Tare: {container.tareWeightKg} Kg</p>
            </div>

            <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium">No. Segel (Seal No):</span>
              <p className="font-mono font-bold text-slate-900">{container.sealNumber || 'NO-SEAL'}</p>
              <p className="text-slate-400 text-[10px]">{container.shippingLine}</p>
            </div>

            <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium">Kapal & Voyage:</span>
              <p className="font-bold text-slate-800 truncate">{container.vesselName || '-'}</p>
              <p className="text-slate-500 text-[10px] font-mono">{container.voyageNumber || '-'}</p>
            </div>

            <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium">Pemilik / Consignee:</span>
              <p className="font-bold text-slate-800 truncate">{container.consignee || 'General Consignee'}</p>
              <p className="text-emerald-700 font-bold text-[10px]">Tarif: Rp {container.handlingFee.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Reefer / DG Warnings */}
          {container.type.includes('Reefer') && (
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-center justify-between">
              <span className="font-bold">Colokan Pendingin (Reefer Plug):</span>
              <span className="font-mono font-bold text-cyan-800">Target Temp: {container.reeferTemp}</span>
            </div>
          )}

          {container.isHazardous && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <span className="font-bold">Bahan Berbahaya (DG):</span>
              <span className="font-semibold text-amber-800">{container.dgClass}</span>
            </div>
          )}

          {/* Barcode & Stamp Footer */}
          <div className="pt-3 border-t-2 border-dashed border-sky-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-0.5 h-9">
                {[3,1,4,2,1,3,2,4,1,2,3,1,4,2,1,3,2,1,4,3,2,1,3,2].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }}></div>
                ))}
              </div>
              <p className="font-mono text-[9px] tracking-widest text-slate-500">{container.containerNumber}</p>
            </div>

            <div className="w-20 h-20 rounded-full border-2 border-sky-600 p-1 flex flex-col items-center justify-center text-center rotate-[-10deg] text-sky-700 select-none opacity-85">
              <span className="text-[6px] font-extrabold uppercase">PT NAZLA SHARK</span>
              <span className="text-[8px] font-black uppercase text-sky-900">GATE PASS</span>
              <span className="text-[6px] font-bold text-sky-600">INSPECTED</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400">
            Perusahaan Terminal Milik NAZLA &bull; Slip EIR ini sah sebagai bukti serah terima petikemas di gate dan alokasi posisi crane CY.
          </div>
        </div>

      </div>
    </div>
  );
};
