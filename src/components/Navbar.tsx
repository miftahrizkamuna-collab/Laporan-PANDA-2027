import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  Layers, 
  Check, 
  Activity,
  UserCheck,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { NotificationItem, RegionData } from '../types';

interface NavbarProps {
  notifications: NotificationItem[];
  regions: RegionData[];
  onSelectReport?: (reportId: string) => void;
  onOpenAdminLogin?: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications,
  regions,
  onSelectReport,
  onOpenAdminLogin,
  onGoHome,
}) => {
  const { profile, signInWithGoogle, signOut, switchSimulatedRole, currentUser, isAdminAuthenticated, logoutAdmin } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Branding */}
        <div 
          onClick={onGoHome}
          className={`flex items-center space-x-3 ${onGoHome ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
          title={onGoHome ? 'Kembali ke Halaman Awal (Portal Pilihan)' : undefined}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-tight text-slate-900">SENSEI</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                2027
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Sistem Penerimaan Nasional Siswa Baru SMART Ekselensia Indonesia • Dompet Dhuafa
            </p>
          </div>
        </div>

        {/* Center/Right: Role Switcher & User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
              title="Kembali ke Halaman Awal Pilihan Akses"
            >
              <Home className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Halaman Awal</span>
            </button>
          )}
          
          {/* Quick Role Simulator (Allows user to test both dashboards instantly) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              <div className="flex items-center space-x-1.5">
                {profile.role === 'admin_pusat' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <MapPin className="w-4 h-4 text-blue-600" />
                )}
                <span className="hidden md:inline text-slate-400 font-normal">Peran Aktif:</span>
                <span className="font-bold text-slate-900">
                  {profile.role === 'admin_pusat' ? 'Admin Pusat SMART' : `Panitia ${profile.regionName}`}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in duration-150">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Simulasi Peran / Switch Role</span>
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                </div>

                {/* Option 1: Admin Pusat SMART (Gated with login user: admin pass: Sensei2027) */}
                <button
                  onClick={() => {
                    setRoleDropdownOpen(false);
                    if (!isAdminAuthenticated && onOpenAdminLogin) {
                      onOpenAdminLogin();
                    } else {
                      switchSimulatedRole('admin_pusat');
                    }
                  }}
                  className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between hover:bg-emerald-50/60 transition ${
                    profile.role === 'admin_pusat' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold">Admin Pusat SMART</p>
                        {isAdminAuthenticated ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-semibold">Aktif</span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-semibold">Terkunci</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {isAdminAuthenticated ? 'Verifikasi laporan & analitik' : 'Perlu login autentikasi admin'}
                      </p>
                    </div>
                  </div>
                  {profile.role === 'admin_pusat' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <div className="border-t border-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Pilih Panitia Provinsi ({regions.length}):</span>
                  <span className="text-[9px] text-emerald-600 font-normal">{regions.length} Wilayah Terdaftar</span>
                </div>

                {/* Regional Options - Full Scrollable list of 14 provinces */}
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {regions.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => {
                        switchSimulatedRole('panitia_wilayah', reg.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        profile.role === 'panitia_wilayah' && profile.regionId === reg.id
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">Provinsi {reg.name}</span>
                      </div>
                      {profile.role === 'panitia_wilayah' && profile.regionId === reg.id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {onGoHome && (
                  <div className="p-1.5 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onGoHome();
                      }}
                      className="w-full py-2 px-3 text-center text-xs text-emerald-800 font-bold bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Home className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kembali ke Halaman Awal (Portal)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Authenticated Badge & Logout button */}
          {isAdminAuthenticated && (
            <button
              onClick={logoutAdmin}
              title="Keluar dari Admin Pusat SMART"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin: Logged In</span>
              <span className="text-[10px] text-amber-700 underline ml-0.5">Keluar</span>
            </button>
          )}

          {/* Real-time Notification Bell */}
          <NotificationBell
            notifications={notifications}
            userRole={profile.role}
            userRegionId={profile.regionId}
            onSelectReport={onSelectReport}
          />

          {/* Google Auth / Profile pill */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
                {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
              </div>
              <button
                onClick={signOut}
                title="Keluar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
