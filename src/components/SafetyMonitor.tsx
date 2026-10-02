import React from 'react';
import { useData } from '../context/DataContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Scale, 
  Ship as ShipIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Activity,
  Anchor,
  Compass,
  Zap
} from 'lucide-react';

export const SafetyMonitor: React.FC = () => {
  const { ships, manifests, getShipStats } = useData();

  const overloadedShips = ships.filter(s => {
    const stats = getShipStats(s.id);
    return stats.isOverloadedWeight || stats.isOverloadedVolume;
  });

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      
      {/* Top Banner Alert */}
      {overloadedShips.length > 0 ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/20 flex items-start gap-4 animate-pulse">
          <div className="p-3 rounded-2xl bg-white/20 shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black font-['Plus_Jakarta_Sans',sans-serif]">
              PERINGATAN KELAIKLAUTAN: {overloadedShips.length} KAPAL MELEBIHI BATAS MUATAN!
            </h3>
            <p className="text-xs text-red-100 mt-1">
              Segera lakukan penyesuaian muatan atau alihkan ke jadwal pelayaran berikutnya sebelum nahkoda menerbitkan Surat Izin Berlayar (SIB).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {overloadedShips.map(s => (
                <span key={s.id} className="px-3 py-1 rounded-lg bg-black/25 text-white font-bold text-xs border border-white/20">
                  {s.name} ({s.code}) - Kelebihan Beban!
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
                SEMUA ARMADA DALAM AMBANG BATAS KELAIKLAUTAN AMAN
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Stabilitas tonase, palka bagasi, dan deck kendaraan memenuhi standar keselamatan pelayaran PT NAZLA Bahari Marine.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Kelaiklautan 100% OK</span>
          </div>
        </div>
      )}

      {/* Ship Safety Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ships.map((ship) => {
          const stats = getShipStats(ship.id);
          const shipManifests = manifests.filter(m => m.shipId === ship.id);

          // Group by deck position
          const deckDistribution = shipManifests.reduce((acc, m) => {
            const pos = m.deckPosition || 'Palka Umum';
            acc[pos] = (acc[pos] || 0) + m.weightKg;
            return acc;
          }, {} as Record<string, number>);

          return (
            <div
              key={ship.id}
              className={`p-6 rounded-3xl bg-white border shadow-sm transition-all ${
                stats.isOverloadedWeight ? 'border-red-300 ring-2 ring-red-400/30' : 'border-sky-100 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShipIcon className="w-5 h-5 text-sky-600" />
                    <h4 className="font-extrabold text-base text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      {ship.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nahkoda: {ship.captain} &bull; Rute: {ship.originPort.split(' ')[1] || ship.originPort} &rarr; {ship.destPort.split(' ')[1] || ship.destPort}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    stats.isOverloadedWeight
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : stats.weightPercentage > 85
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {stats.isOverloadedWeight ? '⚠️ OVERLOAD' : `${stats.weightPercentage}% Terisi`}
                </span>
              </div>

              {/* Progress Bars for Weight & Volume */}
              <div className="space-y-3 p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      <span>Beban Tonase Kargo / Bagasi</span>
                    </span>
                    <span className={stats.isOverloadedWeight ? 'text-red-600' : 'text-slate-900'}>
                      {stats.totalWeightKg.toLocaleString('id-ID')} / {ship.maxCargoWeightKg.toLocaleString('id-ID')} Kg
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.isOverloadedWeight ? 'bg-red-500' : stats.weightPercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-400 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(stats.weightPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Volume Muatan Ruang Palka</span>
                    </span>
                    <span className={stats.isOverloadedVolume ? 'text-red-600' : 'text-slate-900'}>
                      {stats.totalVolumeM3.toFixed(1)} / {ship.maxVolumeM3} m³ ({stats.volumePercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.isOverloadedVolume ? 'bg-red-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(stats.volumePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Deck Stowage Distribution Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  <span>Distribusi Beban per Kompartemen & Palka</span>
                </h5>

                {Object.keys(deckDistribution).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada muatan yang dialokasikan di kompartemen.</p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(deckDistribution).map(([deck, weight]) => (
                      <div key={deck} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-700 truncate max-w-[200px]">{deck}</span>
                        <span className="font-mono font-bold text-sky-800">{weight.toLocaleString('id-ID')} Kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stability status badge */}
              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
                <span>Manifes Terdaftar: <strong>{shipManifests.length} Item</strong></span>
                <span>Kapasitas Pax: <strong>{ship.maxPassengers} Jiwa</strong></span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
