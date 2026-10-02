import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SharkLogo } from './SharkLogo';
import { ManifestManager } from './ManifestManager';
import { ShipManager } from './ShipManager';
import { SafetyMonitor } from './SafetyMonitor';
import { PrintManifestModal } from './PrintManifestModal';
import { 
  Boxes, 
  Ship, 
  ShieldAlert, 
  Printer, 
  LogOut, 
  Database, 
  Sparkles, 
  Anchor, 
  Waves,
  RefreshCw,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile, logout, isDbConnected } = useAuth();
  const { ships, manifests, seedSampleData, loadingData } = useData();

  const [activeTab, setActiveTab] = useState<'manifests' | 'ships' | 'safety'>('manifests');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedSampleData();
      showToast('Data armada kapal & manifes berhasil dimuat ke Firebase Firestore!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 flex flex-col justify-between font-['Inter',sans-serif]">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-sky-700 text-white shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-300" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Company branding */}
          <div className="flex items-center justify-between">
            <SharkLogo size="md" />

            {/* Mobile Logout */}
            <button
              onClick={logout}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Center / Right controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Database status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Firebase Firestore:</span>
              <span className="font-bold text-sky-900">Aktif (Live Single Source)</span>
            </div>

            {/* Seeder Button if empty */}
            {ships.length === 0 && (
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer animate-bounce"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                <span>{isSeeding ? 'Memuat Data...' : 'Muat Data Contoh Maritim'}</span>
              </button>
            )}

            {/* User Profile info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'N'}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 leading-tight">
                  {userProfile?.displayName || currentUser?.email || 'Admin NAZLA'}
                </p>
                <p className="text-[10px] text-sky-600 font-semibold uppercase">
                  {userProfile?.role || 'SuperAdmin (Owner)'}
                </p>
              </div>
            </div>

            {/* Print Manifest Action */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Cetak Manifes</span>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-200/80 pb-3">
          
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white border border-sky-100 shadow-2xs">
            <button
              onClick={() => setActiveTab('manifests')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'manifests'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Daftar Muatan & Manifes</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'manifests' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 font-bold'
              }`}>
                {manifests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ships')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ships'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <Ship className="w-4 h-4" />
              <span>Armada Kapal Penumpang</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'ships' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 font-bold'
              }`}>
                {ships.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Kelaiklautan & Batas Muatan</span>
            </button>
          </div>

          {/* Quick Seeder refresh button */}
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Sinkronisasi / Muat Ulang Data Sampel Maritim"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset / Muat Contoh Data</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'manifests' && <ManifestManager />}
        {activeTab === 'ships' && <ShipManager />}
        {activeTab === 'safety' && <SafetyMonitor />}

      </main>

      {/* Official Print Modal */}
      <PrintManifestModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-sky-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <SharkLogo size="sm" withText={false} />
            <span>&copy; {new Date().getFullYear()} <strong>PT NAZLA BAHARI MARINE LOGISTICS</strong>. Sistem Muatan Kapal Penumpang Terintegrasi Firebase Firestore.</span>
          </div>
          <div className="font-semibold text-sky-700 flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-sky-500" />
            <span>Pemilik Perusahaan: <strong>NAZLA</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
};
