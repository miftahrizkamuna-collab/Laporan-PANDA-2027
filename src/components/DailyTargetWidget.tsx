import React from 'react';
import { Target, Award, School, Sparkles, Plus, GraduationCap, CheckCircle2 } from 'lucide-react';
import { RegionData } from '../types';

interface DailyTargetWidgetProps {
  region: RegionData;
  onOpenReportModal: () => void;
}

export const DailyTargetWidget: React.FC<DailyTargetWidgetProps> = ({
  region,
  onOpenReportModal,
}) => {
  // Target perolehan total daerah adalah 75 pendaftar
  const targetRegistrants = 75;
  const currentRegistrants = region.currentRegistrants || 0;
  const registrantsPercent = Math.min(100, Math.round((currentRegistrants / targetRegistrants) * 100));
  const remainingRegistrants = Math.max(0, targetRegistrants - currentRegistrants);

  // Target kunjungan sekolah sasaran: minimal 15 SD/MI dan 5 SMP/MTs
  const targetSdMi = 15;
  const currentSdMi = region.currentSchoolsSdMi || 0;
  const sdMiPercent = Math.min(100, Math.round((currentSdMi / targetSdMi) * 100));
  const remainingSdMi = Math.max(0, targetSdMi - currentSdMi);

  const targetSmpMts = 5;
  const currentSmpMts = region.currentSchoolsSmpMts || 0;
  const smpMtsPercent = Math.min(100, Math.round((currentSmpMts / targetSmpMts) * 100));
  const remainingSmpMts = Math.max(0, targetSmpMts - currentSmpMts);

  const totalSchoolsVisited = currentSdMi + currentSmpMts;
  const totalSchoolsTarget = targetSdMi + targetSmpMts; // 20
  const totalSchoolsPercent = Math.min(100, Math.round((totalSchoolsVisited / totalSchoolsTarget) * 100));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-8 relative overflow-hidden">
      {/* Decorative gradient background blur */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Widget */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200/60">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Monitoring Capaian Target Wilayah SENSEI 2027</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Monitoring Perolehan Total — Provinsi {region.name}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Pantau akumulasi perolehan kuota 75 pendaftar dan realisasi kunjungan minimal 15 SD/MI serta 5 SMP/MTs.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Laporkan Aktivitas Baru
          </button>
        </div>

        {/* Progress Bars Section (Target Total Pendaftar + SD/MI + SMP/MTs) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
          {/* Card 1: TARGET PEROLEHAN TOTAL PENDAFTAR (75 PENDAFTAR) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-xl shadow-emerald-900/15 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Target Perolehan Total Pendaftar
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  registrantsPercent >= 100 
                    ? 'bg-amber-400 text-slate-950' 
                    : registrantsPercent >= 70 
                      ? 'bg-emerald-300 text-emerald-950' 
                      : 'bg-white/20 text-white'
                }`}>
                  {registrantsPercent >= 100 ? 'Target Terpenuhi! 🎉' : `${registrantsPercent}% Tercapai`}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-black tracking-tight">{currentRegistrants}</span>
                <span className="text-xl text-emerald-100 font-semibold">/ {targetRegistrants} Pendaftar</span>
              </div>

              {/* High-visibility Progress Bar */}
              <div className="space-y-1.5 mb-2">
                <div className="w-full bg-black/25 rounded-full h-4 p-0.5 overflow-hidden backdrop-blur-xs">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-300 via-emerald-200 to-white shadow-sm"
                    style={{ width: `${registrantsPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-emerald-100 font-medium">
                  <span>0 Berkas</span>
                  <span>{remainingRegistrants > 0 ? `Kurang ${remainingRegistrants} berkas lagi` : 'Target Tuntas'}</span>
                  <span>Target: {targetRegistrants} Berkas</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 text-xs text-emerald-100/95 flex items-center justify-between">
              <span>Status Kuota Provinsi:</span>
              <span className="font-bold text-amber-200">
                {registrantsPercent >= 75 ? 'Zona Hijau (Sangat Baik)' : registrantsPercent >= 50 ? 'Zona Kuning (Aktif Berjalan)' : 'Perlu Ditingkatkan'}
              </span>
            </div>
          </div>

          {/* Card 2: KUNJUNGAN SEKOLAH SASARAN SD/MI (MINIMAL 15 SEKOLAH) */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <School className="w-4 h-4 text-emerald-600" />
                  Target Minimal SD / MI
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  sdMiPercent >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {sdMiPercent}%
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{currentSdMi}</span>
                <span className="text-base text-slate-500 font-medium">/ {targetSdMi} Sekolah SD/MI</span>
              </div>

              {/* Progress Bar SD/MI */}
              <div className="space-y-1.5 mb-2">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-emerald-500 to-teal-600"
                    style={{ width: `${sdMiPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Mulai</span>
                  <span>{remainingSdMi > 0 ? `Sisa: ${remainingSdMi} sekolah lagi` : 'Target SD/MI Tercapai ✓'}</span>
                  <span>Min. {targetSdMi}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Sosialisasi SD/MI:</span>
              <span className={`font-semibold flex items-center gap-1 ${currentSdMi >= targetSdMi ? 'text-emerald-700' : 'text-slate-700'}`}>
                {currentSdMi >= targetSdMi && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {currentSdMi >= targetSdMi ? 'Target Minimal Terpenuhi' : 'Lanjutkan Kunjungan'}
              </span>
            </div>
          </div>

          {/* Card 3: KUNJUNGAN SEKOLAH SASARAN SMP/MTs (MINIMAL 5 SEKOLAH) */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Target Minimal SMP / MTs
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  smpMtsPercent >= 100 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {smpMtsPercent}%
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{currentSmpMts}</span>
                <span className="text-base text-slate-500 font-medium">/ {targetSmpMts} Sekolah SMP/MTs</span>
              </div>

              {/* Progress Bar SMP/MTs */}
              <div className="space-y-1.5 mb-2">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${smpMtsPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Mulai</span>
                  <span>{remainingSmpMts > 0 ? `Sisa: ${remainingSmpMts} sekolah lagi` : 'Target SMP/MTs Tercapai ✓'}</span>
                  <span>Min. {targetSmpMts}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Total Sekolah (SD + SMP):</span>
              <span className="font-bold text-slate-900">
                {totalSchoolsVisited} / {totalSchoolsTarget} Sekolah ({totalSchoolsPercent}%)
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
