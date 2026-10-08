import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, School, Share2, Award } from 'lucide-react';
import { RegionData, ReportItem } from '../types';

interface AnalyticsChartsProps {
  regions: RegionData[];
  reports: ReportItem[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  regions,
  reports,
}) => {
  const [activeTab, setActiveTab] = useState<'regions' | 'types' | 'audience'>('regions');

  // Compute metrics from reports matching the 3 main report types
  const typeCounts = {
    sosialisasi_sekolah: reports.filter(r => r.type === 'sosialisasi_sekolah').length,
    sosialisasi_medsos: reports.filter(r => r.type === 'sosialisasi_medsos' || r.type === 'publikasi_medsos').length,
    sinkron_pendaftar: reports.filter(r => r.type === 'sinkron_pendaftar' || r.type === 'update_pendaftar').length,
    audiensi_tokoh: reports.filter(r => r.type === 'audiensi_tokoh' || r.type === 'kendala_lapangan').length,
  };

  const totalReports = reports.length || 1;
  const totalAudience = reports.reduce((acc, r) => acc + (r.audienceReached || 0), 0);
  const totalSchools = regions.reduce((acc, r) => acc + (r.currentSchools || 0), 0);
  const totalRegistrants = regions.reduce((acc, r) => acc + (r.currentRegistrants || 0), 0);
  const targetNational = regions.reduce((acc, r) => acc + (r.targetRegistrants || 0), 0);

  // Top regions sorted by achievement rate
  const sortedRegions = [...regions].sort((a, b) => {
    const rateA = (a.currentRegistrants / a.targetRegistrants) || 0;
    const rateB = (b.currentRegistrants / b.targetRegistrants) || 0;
    return rateB - rateA;
  });

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-8">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Dashboard Analitik Publikasi & Capaian Nasional
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring aktivitas sosialisasi, sebaran publikasi media, dan konversi pendaftar daerah
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'regions' 
                ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Capaian Wilayah
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'types' 
                ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kanal Publikasi
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'audience' 
                ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jangkauan & Dampak
          </button>
        </div>
      </div>

      {/* Tab 1: Capaian Wilayah Bar Charts */}
      {activeTab === 'regions' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Leaderboard Persentase Capaian Kuota Pendaftar per Provinsi (14 Wilayah)
            </span>
            <span className="text-xs text-emerald-700 font-bold">
              Target Nasional: {totalRegistrants.toLocaleString()} / {targetNational.toLocaleString()} ({Math.round((totalRegistrants/targetNational)*100)}%)
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {sortedRegions.map((region, idx) => {
              const percent = Math.min(100, Math.round((region.currentRegistrants / region.targetRegistrants) * 100));
              return (
                <div key={region.id} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-md font-bold text-[11px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                        Provinsi {region.name}
                      </span>
                      <span className="text-[11px] text-slate-400">({region.island})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-medium">
                        {region.currentRegistrants} / {region.targetRegistrants} Berkas
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        percent >= 75 ? 'bg-emerald-100 text-emerald-800' :
                        percent >= 50 ? 'bg-teal-50 text-teal-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        percent >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                        percent >= 50 ? 'bg-gradient-to-r from-teal-500 to-emerald-400' :
                        'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Kanal Publikasi Breakdown */}
      {activeTab === 'types' && (
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Distribusi Tipe Aktivitas Publikasi yang Dilaporkan
            </h4>

            {[
              { label: '1. Sosialisasi Sekolah (MI/SMP Sasaran)', count: typeCounts.sosialisasi_sekolah, color: 'bg-emerald-600' },
              { label: '2. Sosialisasi Medsos & Publikasi Digital', count: typeCounts.sosialisasi_medsos, color: 'bg-teal-500' },
              { label: '3. Sinkron Pendaftar Daerah & Web SENSEI', count: typeCounts.sinkron_pendaftar, color: 'bg-blue-600' },
              { label: 'Aktivitas Kemitraan / Lapangan Lainnya', count: typeCounts.audiensi_tokoh, color: 'bg-amber-500' },
            ].map(item => {
              const percentage = Math.round((item.count / totalReports) * 100);
              return (
                <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.count} Laporan ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-teal-950 p-6 rounded-2xl text-white">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block mb-2">
              Insight Publikasi Panitia Daerah
            </span>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              Aktivitas <strong>Sosialisasi Langsung ke Sekolah (MI/SMP)</strong> dan <strong>Kampanye Media Sosial</strong> menjadi pendorong terbesar peningkatan pendaftar SENSEI 2027.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="p-2.5 rounded-lg bg-white/10">
                <span className="text-slate-300 block text-[11px]">Total Laporan Masuk</span>
                <span className="text-lg font-bold text-white">{reports.length} Laporan</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/10">
                <span className="text-slate-300 block text-[11px]">Tingkat Konversi</span>
                <span className="text-lg font-bold text-emerald-400">Tinggi (88%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Jangkauan & Dampak */}
      {activeTab === 'audience' && (
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
              Estimasi Audiens / Jangkauan
            </span>
            <h4 className="text-2xl font-extrabold text-emerald-950 mt-1 mb-1">
              {totalAudience.toLocaleString()}+
            </h4>
            <p className="text-xs text-emerald-700">
              Siswa, orang tua, & guru yang menerima informasi beasiswa SMART Ekselensia
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200/70">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
              <School className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
              Total Sekolah Dikunjungi
            </span>
            <h4 className="text-2xl font-extrabold text-blue-950 mt-1 mb-1">
              {totalSchools} Sekolah
            </h4>
            <p className="text-xs text-blue-700">
              MI, SD, SMP, & MTs sasaran di seluruh provinsi penugasan
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200/70">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
              Publikasi Multi-Kanal
            </span>
            <h4 className="text-2xl font-extrabold text-purple-950 mt-1 mb-1">
              {typeCounts.sosialisasi_medsos + typeCounts.sosialisasi_sekolah} Titik
            </h4>
            <p className="text-xs text-purple-700">
              Kombinasi siaran media massa, medsos, dan roadshow luring di daerah
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
