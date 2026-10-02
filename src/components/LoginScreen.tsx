import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SharkLogo } from './SharkLogo';
import { 
  Boxes, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Waves,
  Zap,
  Container as ContainerIcon,
  Anchor
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginQuickDemo, isDbConnected } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan email dan kata sandi lengkap.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setErrorMsg('Nama lengkap wajib diisi untuk registrasi.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, fullName);
        setSuccessMsg('Akun staf terminal berhasil dibuat! Mengalihkan ke sistem...');
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Login berhasil! Selamat datang di Terminal Petikemas NAZLA.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg('Email atau kata sandi tidak cocok. Silakan gunakan fitur "Login Cepat Demo" untuk akses instan.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan gunakan tab Masuk.');
      } else {
        setErrorMsg(err.message || 'Terjadi kendala saat login. Silakan periksa koneksi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'operator') => {
    setErrorMsg(null);
    setDemoLoading(role);
    try {
      await loginQuickDemo(role);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      console.error('Quick demo error:', err);
      setErrorMsg('Gagal melakukan login demo cepat. ' + (err.message || ''));
    } finally {
      setDemoLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Login Google dibatalkan atau terkendala popup browser.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-cyan-100 flex flex-col justify-between relative overflow-hidden font-['Inter',sans-serif]">
      {/* Decorative Ocean Waves Background Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-10">
        <SharkLogo size="lg" />

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 shadow-sm border border-sky-200 text-sky-800 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Firebase Cloud Firestore Terhubung</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Hero Info & Branding PT NAZLA */}
        <div className="lg:col-span-6 space-y-6 text-slate-800">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-700 text-xs font-bold uppercase tracking-wider">
            <Anchor className="w-3.5 h-3.5 text-sky-600" />
            <span>Terminal Petikemas Resmi Milik NAZLA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Sistem Operasional Terminal Petikemas <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Shark Port</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Pusat komando operasional digital PT NAZLA Terminal Petikemas untuk kontrol pergerakan kontainer (20ft/40ft/Reefer), perencanaan Container Yard (CY), penerbitan EIR Gate-In/Out, dan monitoring sandar kapal petikemas.
          </p>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-white/80 rounded-2xl border border-sky-100 shadow-sm flex items-start gap-3 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Container Yard (CY)</h4>
                <p className="text-xs text-slate-500">Stowing blok & slot tier otomatis</p>
              </div>
            </div>

            <div className="p-3.5 bg-white/80 rounded-2xl border border-sky-100 shadow-sm flex items-start gap-3 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600">
                <Zap className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Gate & Vessel Ops</h4>
                <p className="text-xs text-slate-500">Job slip EIR & kapal sandar real-time</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Section on Hero side */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg shadow-sky-600/20">
            <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Akses Cepat Uji Coba (1-Klik Tanpa Ketik)</span>
            </div>
            <p className="text-xs text-sky-100 mb-3">
              Gunakan akun resmi demo yang telah disiapkan pemilik perusahaan NAZLA:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDemo('admin')}
                disabled={demoLoading !== null}
                className="flex-1 min-w-[170px] px-3.5 py-2 rounded-xl bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {demoLoading === 'admin' ? (
                  <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Masuk Admin NAZLA</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleQuickDemo('operator')}
                disabled={demoLoading !== null}
                className="flex-1 min-w-[170px] px-3.5 py-2 rounded-xl bg-sky-500/40 hover:bg-sky-500/60 text-white border border-sky-300/40 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {demoLoading === 'operator' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Anchor className="w-4 h-4 text-cyan-200" />
                    <span>Masuk Operator CY & Gate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: High Fidelity Login Form Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-sky-900/10 border border-sky-100 p-6 sm:p-8">
            
            {/* Form Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  {isRegister ? 'Daftar Akun Baru' : 'Login Admin Terminal'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRegister 
                    ? 'Buat kredensial staf operasional terminal petikemas' 
                    : 'Masuk dengan email admin atau gunakan klik login cepat'}
                </p>
              </div>

              {/* Shark mini mascot avatar */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-300/50">
                <SharkLogo size="sm" withText={false} />
              </div>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1">{successMsg}</div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap / Jabatan Operasional
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Nazla Syafiq (Plannner CY)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email / Username Admin
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin.nazla@nazlacontainer.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegister ? 'Buat Akun & Masuk' : 'Masuk ke Dashboard Terminal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400 font-medium">atau masuk dengan</span>
              </div>
            </div>

            {/* Alternative Logins */}
            <div className="space-y-2.5">
              {/* 1-Click Instant Demo Button */}
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={demoLoading !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Klik Login Cepat: Admin NAZLA Demo</span>
              </button>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Akun Google</span>
              </button>
            </div>

            {/* Toggle Register / Login mode */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
              >
                {isRegister 
                  ? 'Sudah punya akun? Masuk di sini' 
                  : 'Belum punya akun admin? Buat akun baru'}
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer info */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-sky-200/60 z-10">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} <strong>PT NAZLA TERMINAL PETIKEMAS</strong>. Hak Cipta Dilindungi.</span>
        </div>
        <div className="mt-1 sm:mt-0 font-medium text-sky-700 flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-sky-500" />
          <span>Pemilik Perusahaan: <strong>NAZLA</strong></span>
        </div>
      </footer>
    </div>
  );
};
