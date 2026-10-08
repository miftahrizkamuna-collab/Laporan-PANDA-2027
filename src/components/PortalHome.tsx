import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  School, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  Users, 
  FileCheck2, 
  GraduationCap, 
  Building2, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { RegionData } from '../types';

interface PortalHomeProps {
  regions: RegionData[];
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  onEnterRegion: (regionId: string) => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onEnterAdmin: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  onEnterRegion,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onEnterAdmin,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState(
    selectedRegionId || (regions[0]?.id || 'jabar')
  );

  const selectedRegion = regions.find((r) => r.id === internalSelectedId) || regions[0];

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setInternalSelectedId(newId);
    onSelectRegion(newId);
  };

  const handleGoToRegion = () => {
    if (selectedRegion) {
      onEnterRegion(selectedRegion.id);
    }
  };

  // Group regions by Island for structured dropdown display
  const islands = Array.from(new Set(regions.map((r) => r.island)));

  return (
    <div className="space-y-10 py-4 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-emerald-900/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Sistem Pelaporan & Monitoring SENSEI 2027</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Sistem Penerimaan Nasional Siswa Baru SMART Ekselensia Indonesia
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Selamat datang di sistem informasi terpadu <strong>SENSEI 2027</strong> oleh <em>SMART Ekselensia Indonesia Dompet Dhuafa</em>. Silakan pilih jalur akses halaman wilayah provinsi sasaran sosialisasi.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              Target 75 Calon Siswa / Daerah
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <School className="w-3.5 h-3.5 text-teal-300" />
              Minimal 15 SD/MI & 5 SMP/MTs
            </span>
          </div>
        </div>
      </div>

      {/* Main Choice Section: Admin Pusat vs Halaman Wilayah Dropdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* CARD 1: LOGIN / MASUK ADMIN PUSAT SMART */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-7 h-7 text-amber-600" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Jalur Pusat SMART
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Login Admin Pusat SMART
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Akses khusus sekretariat dan tim verifikasi pusat SMART Ekselensia Indonesia.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verifikasi dan evaluasi berkas laporan masuk dari seluruh provinsi</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Monitoring agregasi total kuota pendaftar nasional secara real-time</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Manajemen pendaftaran provinsi baru dan ekspor rekapitulasi data</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 mt-6">
            {isAdminAuthenticated ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/70 flex items-center justify-between text-xs text-emerald-800">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sesi Admin Pusat Sedang Aktif
                  </span>
                  <span className="text-[11px] text-emerald-700">Terautentikasi</span>
                </div>
                <button
                  onClick={onEnterAdmin}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-400/20 hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                  <span>Buka Dashboard Admin Pusat SMART</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 hover:from-slate-800 hover:to-teal-900 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group/btn"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Login Admin Pusat SMART</span>
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: PILIH HALAMAN WILAYAH DENGAN DROPDOWN */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-xs">
                <MapPin className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Jalur Panitia Daerah
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lihat Halaman Wilayah
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Pilih provinsi sasaran sosialisasi untuk membuka dasbor dan pelaporan daerah.
              </p>
            </div>

            {/* Dropdown Selection */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Provinsi Panitia Daerah:
              </label>
              <div className="relative">
                <select
                  value={internalSelectedId}
                  onChange={handleDropdownChange}
                  className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border-2 border-emerald-600/40 focus:border-emerald-600 bg-emerald-50/30 text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition cursor-pointer shadow-xs"
                >
                  {islands.map((island) => (
                    <optgroup key={island} label={`Zona ${island}`}>
                      {regions
                        .filter((r) => r.island === island)
                        .map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            Provinsi {reg.name} ({reg.island})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700 font-bold">
                  ▼
                </div>
              </div>
            </div>

            {/* Preview of the Selected Region */}
            {selectedRegion && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Provinsi {selectedRegion.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Zona: {selectedRegion.island}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Target Total Kuota:</span>
                    <strong className="text-emerald-700 text-xs">75 Calon Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Minimal Sekolah:</span>
                    <strong className="text-slate-800">15 SD/MI • 5 SMP/MTs</strong>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Koordinator:</span>
                  <strong className="text-slate-800">
                    {selectedRegion.coordinatorName || '(Belum Diisi — Siap Diinput)'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={handleGoToRegion}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg transition flex items-center justify-center gap-2 group/btn"
            >
              <span>Buka Halaman Provinsi {selectedRegion ? selectedRegion.name : ''}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Summary Grid of Regions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Cepat Provinsi Panitia Daerah SENSEI 2027
            </h3>
            <p className="text-xs text-slate-500">
              Klik salah satu provinsi di bawah untuk langsung menuju halaman kerja wilayah tersebut.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 self-start sm:self-auto">
            {regions.length} Wilayah Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {regions.map((reg, idx) => {
            const isSelected = reg.id === internalSelectedId;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  setInternalSelectedId(reg.id);
                  onSelectRegion(reg.id);
                  onEnterRegion(reg.id);
                }}
                className={`p-3 rounded-2xl text-left transition border flex flex-col justify-between gap-2 group ${
                  isSelected 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs' 
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-400 block">#{idx + 1}</span>
                  <span className="text-xs font-bold line-clamp-1 group-hover:text-emerald-700 transition">
                    {reg.name}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                  Buka Wilayah →
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
