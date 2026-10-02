import React from 'react';
import { useData } from '../context/DataContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Thermometer, 
  Layers, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  Activity,
  Flame,
  Zap
} from 'lucide-react';

export const TerminalSafetyMonitor: React.FC = () => {
  const { yardBlocks, containers, getBlockStats, getTerminalStats } = useData();

  const terminalStats = getTerminalStats();

  // Find blocks nearing or exceeding capacity (> 85%)
  const highDensityBlocks = yardBlocks.filter(b => {
    const stats = getBlockStats(b.name);
    return stats.utilizationPercentage > 85;
  });

  const reeferContainers = containers.filter(c => c.type.includes('Reefer'));
  const dgContainers = containers.filter(c => c.isHazardous);

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      
      {/* Top Banner Alert */}
      {highDensityBlocks.length > 0 ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-600/20 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/20 shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black font-['Plus_Jakarta_Sans',sans-serif]">
              PERINGATAN KAPASITAS YARD: {highDensityBlocks.length} BLOK PENUMPUKAN MENDEKATI BATAS MAKSIMAL!
            </h3>
            <p className="text-xs text-amber-100 mt-1">
              Segera alihkan alur stowing truk gate-in ke blok alternatif atau percepat pemuatan kontainer ekspor ke atas kapal untuk mencegah kemacetan alat RTG.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {highDensityBlocks.map(b => (
                <span key={b.id} className="px-3 py-1 rounded-lg bg-black/25 text-white font-bold text-xs border border-white/20">
                  {b.name} ({getBlockStats(b.name).utilizationPercentage}% Terisi)
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/15 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black font-['Plus_Jakarta_Sans',sans-serif]">
                SEMUA ZONA PENUMPUKAN DALAM AMBANG BATAS KESELAMATAN STOWING AMAN
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Stabilitas beban ground pressure, batas tiering maksimal 5 tingkat, dan pasokan listrik colokan reefer 100% normal.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>K3 Maritim Terverifikasi</span>
          </div>
        </div>
      )}

      {/* Safety Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Stacking Ground Safety */}
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                Keamanan Penumpukan (Tiering)
              </h4>
            </div>
            <span className="text-xs font-bold text-sky-700">Maks 5 Tiers</span>
          </div>

          <p className="text-xs text-slate-500">
            Pemantauan tinggi tumpukan peti untuk stabilitas angin pesisir pelabuhan dan keselamatan operator RTG crane.
          </p>

          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Total Beban di Lapangan:</span>
              <span className="font-bold text-sky-900">{terminalStats.totalGrossWeightTon.toLocaleString('id-ID')} Ton</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Utilisasi Rata-Rata CY:</span>
              <span className="font-bold text-sky-900">{terminalStats.yardCapacityPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Reefer Cold-Chain Plugs */}
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-600">
                <Thermometer className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                Monitoring Reefer Container
              </h4>
            </div>
            <span className="text-xs font-bold text-cyan-700">{reeferContainers.length} Unit Aktif</span>
          </div>

          <p className="text-xs text-slate-500">
            Pengecekan kontinuitas daya listrik colokan reefer yard untuk kargo beku hasil laut, daging, dan farmasi.
          </p>

          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
            {reeferContainers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tidak ada petikemas reefer aktif di lapangan.</p>
            ) : (
              reeferContainers.map(r => (
                <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-cyan-50/60 border border-cyan-100">
                  <span className="font-mono font-bold text-slate-800">{r.containerNumber}</span>
                  <span className="font-bold text-cyan-800 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{r.reeferTemp}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Hazardous (DG) Segregation */}
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                Zonasi Dangerous Goods (DG)
              </h4>
            </div>
            <span className="text-xs font-bold text-amber-700">{dgContainers.length} Box</span>
          </div>

          <p className="text-xs text-slate-500">
            Pemisahan wajib muatan berbahaya (B3) di Blok DG terisolasi sesuai ketentuan IMDG Code internasional.
          </p>

          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
            {dgContainers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nol muatan berbahaya di area CY.</p>
            ) : (
              dgContainers.map(d => (
                <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div>
                    <p className="font-mono font-bold text-slate-800">{d.containerNumber}</p>
                    <p className="text-[10px] text-amber-800 font-medium truncate max-w-[140px]">{d.dgClass}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {d.yardSlot}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
