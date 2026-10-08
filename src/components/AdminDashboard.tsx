import React, { useState } from 'react';
import { 
  Users, 
  School, 
  FileCheck2, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Filter, 
  Search, 
  CheckCircle, 
  Download, 
  Sparkles, 
  MapPin, 
  Eye, 
  ShieldCheck,
  Megaphone,
  Plus,
  Phone,
  Building2,
  X,
  RotateCcw,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { RegionData, ReportItem } from '../types';
import { AnalyticsCharts } from './AnalyticsCharts';
import { addNewRegion, clearAllDatabaseData, deleteRegion } from '../services/dataService';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  regions: RegionData[];
  reports: ReportItem[];
  onOpenVerify: (report: ReportItem) => void;
  onOpenDetail: (report: ReportItem) => void;
  onBackToPortal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  regions,
  reports,
  onOpenVerify,
  onOpenDetail,
  onBackToPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'analytics' | 'all_reports' | 'regions_list'>('verification');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastNote, setBroadcastNote] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Add new region modal state
  const [isAddRegionModalOpen, setIsAddRegionModalOpen] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvIsland, setNewProvIsland] = useState('Sumatera');
  const [newProvTarget, setNewProvTarget] = useState(75);
  const [newProvTargetSchools, setNewProvTargetSchools] = useState(20);
  const [newProvCoord, setNewProvCoord] = useState('');
  const [newProvPhone, setNewProvPhone] = useState('');
  const [isSavingRegion, setIsSavingRegion] = useState(false);

  // Totals calculations
  const totalRegistrants = regions.reduce((sum, r) => sum + (r.currentRegistrants || 0), 0);
  const targetRegistrants = regions.reduce((sum, r) => sum + (r.targetRegistrants || 0), 0);
  const totalSchools = regions.reduce((sum, r) => sum + (r.currentSchools || 0), 0);
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const verifiedReports = reports.filter((r) => r.status === 'verified');

  const nationalPercent = Math.min(100, Math.round((totalRegistrants / (targetRegistrants || 1)) * 100));

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (regionFilter !== 'all' && r.regionId !== regionFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.regionName.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Wilayah', 'Pelapor', 'Tipe', 'Judul', 'Tanggal', 'Pendaftar Baru', 'Sekolah', 'Audiens', 'Status'];
    const rows = filteredReports.map(r => [
      r.id,
      `"${r.regionName}"`,
      `"${r.reporterName}"`,
      r.type,
      `"${r.title.replace(/"/g, '""')}"`,
      r.activityDate,
      r.registrantsAdded,
      r.schoolsVisited,
      r.audienceReached,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_laporan_sensei2027_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNote.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastNote('');
    }, 3000);
  };

  const handleSaveNewRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim() || !newProvCoord.trim()) return;

    try {
      setIsSavingRegion(true);
      const cleanId = newProvName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
      await addNewRegion({
        id: cleanId,
        name: newProvName.trim(),
        island: newProvIsland,
        targetRegistrants: Number(newProvTarget) || 75,
        coordinatorName: newProvCoord.trim(),
        coordinatorPhone: newProvPhone.trim() || '0812-0000-0000',
      });

      confetti({ particleCount: 50, spread: 60 });
      setIsSavingRegion(false);
      setIsAddRegionModalOpen(false);
      setNewProvName('');
      setNewProvCoord('');
      setNewProvPhone('');
    } catch (err) {
      console.error('Failed to add new region:', err);
      setIsSavingRegion(false);
    }
  };

  const [isClearingData, setIsClearingData] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<RegionData | null>(null);
  const [isDeletingRegion, setIsDeletingRegion] = useState(false);

  const handleConfirmDeleteRegion = async () => {
    if (!regionToDelete) return;
    setIsDeletingRegion(true);
    try {
      await deleteRegion(regionToDelete.id, regionToDelete.name);
      setRegionToDelete(null);
    } catch (err) {
      console.error('Failed to delete region:', err);
    } finally {
      setIsDeletingRegion(false);
    }
  };

  const handleClearAllData = async () => {
    const ok = window.confirm(
      'Apakah Anda yakin ingin mengosongkan SELURUH data uji coba?\n\n- Seluruh laporan aktivitas akan dihapus.\n- Seluruh notifikasi akan dibersihkan.\n- Angka capaian pendaftar & sekolah di-reset ke 0.\n- Nama koordinator daerah dikosongkan untuk uji coba input baru.'
    );
    if (!ok) return;

    setIsClearingData(true);
    try {
      await clearAllDatabaseData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Navigation Back to Portal */}
      {onBackToPortal && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToPortal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
            <span>← Kembali ke Halaman Awal (Portal Pilihan)</span>
          </button>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Status: <strong>Dashboard Eksekutif Pusat SMART</strong>
          </span>
        </div>
      )}

      {/* Top Banner: Admin Pusat SMART Mode */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sekretariat & Verifikasi Pusat SMART Ekselensia Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Eksekutif Admin Pusat SMART
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Pantau laporan aktivitas masuk dari <strong>{regions.length} Panitia Provinsi</strong> se-Indonesia, percepat proses verifikasi berkas secara real-time, dan pantau capaian kuota pendaftar beasiswa SMART Ekselensia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('verification')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Clock className="w-4 h-4 text-slate-900" />
              Verifikasi Masuk ({pendingReports.length})
            </button>
            <button
              onClick={() => setIsAddRegionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              + Daftarkan Provinsi Baru
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-xs border border-white/10 transition"
            >
              <Download className="w-4 h-4" />
              Ekspor CSV
            </button>
            <button
              onClick={handleClearAllData}
              disabled={isClearingData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-400/30 font-semibold text-xs transition"
              title="Kosongkan seluruh data untuk uji coba"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isClearingData ? 'animate-spin' : ''}`} />
              <span>{isClearingData ? 'Mengosongkan...' : 'Kosongkan Data Uji Coba'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Pendaftar Nasional */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pendaftar Nasional
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalRegistrants.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">/ {targetRegistrants.toLocaleString()}</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${nationalPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
              <span>{nationalPercent}% Tercapai</span>
              <span className="text-emerald-700">Target 2027</span>
            </div>
          </div>
        </div>

        {/* Card 2: Laporan Menunggu Verifikasi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Menunggu Verifikasi
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              pendingReports.length > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-600'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{pendingReports.length}</span>
              <span className="text-xs text-amber-700 font-semibold">Laporan Butuh Tindakan</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Notifikasi otomatis dikirim saat di-review
            </p>
          </div>
        </div>

        {/* Card 3: Sekolah Sasaran Terjangkau */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sekolah Sasaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalSchools}</span>
              <span className="text-xs text-slate-500 font-medium">MI, SMP, MTs</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Tersebar di {regions.length} provinsi aktif
            </p>
          </div>
        </div>

        {/* Card 4: Wilayah Provinsi Terdaftar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Panitia Daerah Terdaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{regions.length}</span>
              <span className="text-xs text-purple-700 font-medium">Provinsi Aktif</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
              Siap bertambah sesuai kebutuhan seleksi
            </p>
          </div>
        </div>

      </div>

      {/* Broadcast Announcement Bar */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/70 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Instruksi Cepat dari Admin Pusat SMART ke Seluruh Panitia Daerah</h4>
            <p className="text-xs text-slate-600">Instruksi ini akan tersinkronisasi langsung ke koordinator panitia daerah di seluruh provinsi sasaran.</p>
          </div>
        </div>
        <form onSubmit={handleSendBroadcast} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Tulis pesan pengumuman..."
            value={broadcastNote}
            onChange={(e) => setBroadcastNote(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-xs text-slate-800 w-full md:w-72 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            {broadcastSent ? 'Terkirim! ✓' : 'Broadcast'}
          </button>
        </form>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 flex space-x-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 relative transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'verification'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Antrean Verifikasi Masuk</span>
          {pendingReports.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 relative transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analitik Publikasi & Capaian</span>
        </button>

        <button
          onClick={() => setActiveTab('regions_list')}
          className={`pb-3 relative transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'regions_list'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Panitia Provinsi ({regions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_reports')}
          className={`pb-3 relative transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all_reports'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Semua Laporan Masuk ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: Antrean Verifikasi Cepat */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Laporan Masuk yang Belum Diverifikasi</h3>
              <p className="text-xs text-slate-500">Tinjau aktivitas sosialisasi panitia provinsi dan berikan verifikasi atau arahan revisi.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
              {pendingReports.length} Menunggu Tindakan
            </span>
          </div>

          {pendingReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-base">Semua Laporan Telah Selesai Diverifikasi!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Tidak ada laporan pending saat ini. Setiap laporan baru yang dikirim oleh panitia daerah akan otomatis memicu notifikasi dan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold">
                        <MapPin className="w-3 h-3" />
                        Provinsi {report.regionName}
                      </span>
                      <span className="text-[11px] text-slate-400">{report.activityDate}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1 hover:text-emerald-700 transition">
                      {report.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 p-2.5 bg-slate-50 rounded-xl flex-wrap">
                      <div>
                        <span className="text-[10px] text-slate-400 block">+ Pendaftar</span>
                        <span className="font-extrabold text-emerald-700">+{report.registrantsAdded}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Kategori</span>
                        <span className="font-bold text-slate-800">
                          {report.type === 'sosialisasi_sekolah' ? 'Sekolah' :
                           report.type === 'sosialisasi_medsos' || report.type === 'publikasi_medsos' ? 'Medsos' : 'Sinkron Web'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Pelapor</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[110px] block">{report.reporterName}</span>
                      </div>
                      {((report.documentationPhotos && report.documentationPhotos.length > 0) || report.documentationImageUrl) && (
                        <div>
                          <span className="text-[10px] text-slate-400 block">Foto Bukti</span>
                          <span className="font-bold text-teal-700 flex items-center gap-0.5">
                            📷 {report.documentationPhotos?.length || 1} Foto
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => onOpenDetail(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                    <button
                      onClick={() => onOpenVerify(report)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verifikasi Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Analitik Publikasi Panitia Daerah */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <AnalyticsCharts regions={regions} reports={reports} />
        </div>
      )}

      {/* TAB 3: Daftar Wilayah Provinsi & Tambah Wilayah */}
      {activeTab === 'regions_list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daftar Panitia Daerah per Provinsi ({regions.length} Wilayah)</h3>
              <p className="text-xs text-slate-500">Daftar provinsi yang telah dibentuk panitia daerahnya untuk Sistem Penerimaan Nasional Siswa Baru SENSEI 2027.</p>
            </div>
            <button
              onClick={() => setIsAddRegionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Daftarkan Provinsi Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((reg, idx) => {
              const pct = Math.min(100, Math.round((reg.currentRegistrants / reg.targetRegistrants) * 100));
              const regReportsCount = reports.filter(r => r.regionId === reg.id).length;
              return (
                <div key={reg.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400">#{idx + 1} • {reg.island}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pct >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pct}% Kuota
                        </span>
                        <button
                          type="button"
                          onClick={() => setRegionToDelete(reg)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title={`Hapus wilayah Provinsi ${reg.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">
                      Provinsi {reg.name}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Koordinator: <strong className="text-slate-800">{reg.coordinatorName || <em className="text-slate-400 font-normal">Belum diisi</em>}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kontak: <strong className="text-slate-800">{reg.coordinatorPhone || <em className="text-slate-400 font-normal">-</em>}</strong></span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="p-3 bg-slate-50 rounded-xl mb-2">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-600">Pendaftar Terkumpul:</span>
                        <span className="text-emerald-700">{reg.currentRegistrants} / {reg.targetRegistrants}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Sekolah: <strong>{reg.currentSchoolsSdMi || 0} SD/MI • {reg.currentSchoolsSmpMts || 0} SMP/MTs</strong></span>
                      <span className="text-slate-400">{regReportsCount} Laporan</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-emerald-700 font-semibold text-[11px]">Target: 75 Calon Siswa</span>
                      <button
                        type="button"
                        onClick={() => setRegionToDelete(reg)}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg border border-rose-200/60 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Wilayah</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Semua Riwayat Laporan */}
      {activeTab === 'all_reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari judul, wilayah, atau pelapor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Semua Provinsi ({regions.length})</option>
                {regions.map((reg) => (
                  <option key={reg.id} value={reg.id}>{reg.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="verified">Terverifikasi</option>
                <option value="needs_revision">Perlu Revisi</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Provinsi & Tanggal</th>
                  <th className="py-3 px-4">Judul & Kategori</th>
                  <th className="py-3 px-4">Pelapor</th>
                  <th className="py-3 px-4 text-center">Dampak (+Pendaftar)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada laporan yang cocok dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Provinsi {report.regionName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{report.activityDate}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">{report.title}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{report.type.replace('_', ' ')}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {report.reporterName}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-emerald-700">+{report.registrantsAdded}</span>
                        <span className="text-[10px] text-slate-400 block">{report.schoolsVisited} sekolah</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          report.status === 'needs_revision' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {report.status === 'verified' ? 'Terverifikasi' :
                           report.status === 'needs_revision' ? 'Perlu Revisi' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenDetail(report)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white text-[11px] font-medium transition"
                        >
                          Detail
                        </button>
                        {report.status === 'pending' && (
                          <button
                            onClick={() => onOpenVerify(report)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold transition"
                          >
                            Verifikasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Daftarkan Provinsi Baru (Untuk potensi pertambahan wilayah baru) */}
      {isAddRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-teal-900 to-emerald-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                  Ekspansi Wilayah SENSEI 2027
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Daftarkan Panitia Provinsi Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddRegionModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRegion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Provinsi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aceh, Maluku, Papua Tengah, dll."
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zona Pulau *
                  </label>
                  <select
                    value={newProvIsland}
                    onChange={(e) => setNewProvIsland(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sumatera">Sumatera</option>
                    <option value="Jawa">Jawa</option>
                    <option value="Kalimantan">Kalimantan</option>
                    <option value="Sulawesi">Sulawesi</option>
                    <option value="Bali & Nusa Tenggara">Bali & Nusa Tenggara</option>
                    <option value="Maluku">Maluku</option>
                    <option value="Papua">Papua</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Kuota Pendaftar (Standar: 75) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newProvTarget}
                    onChange={(e) => setNewProvTarget(Number(e.target.value) || 75)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Koordinator Daerah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ridwan Kamil, S.Pd"
                    value={newProvCoord}
                    onChange={(e) => setNewProvCoord(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-XXXX-XXXX"
                    value={newProvPhone}
                    onChange={(e) => setNewProvPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRegionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingRegion}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                >
                  {isSavingRegion ? 'Menyimpan...' : 'Simpan & Daftarkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Wilayah Panitia Daerah */}
      {regionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-950 to-rose-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-white border border-rose-400/30">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">
                    Konfirmasi Hapus Wilayah
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Hapus Provinsi {regionToDelete.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setRegionToDelete(null)}
                disabled={isDeletingRegion}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data panitia daerah <strong>Provinsi {regionToDelete.name}</strong> dari sistem SENSEI 2027?
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Zona Wilayah:</span>
                  <span className="font-semibold text-slate-800">Pulau {regionToDelete.island}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Koordinator:</span>
                  <span className="font-semibold text-slate-800">{regionToDelete.coordinatorName || 'Belum diisi'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capaian Calon Siswa:</span>
                  <span className="font-semibold text-emerald-700">{regionToDelete.currentRegistrants} / {regionToDelete.targetRegistrants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Laporan Aktivitas Terkait:</span>
                  <span className="font-semibold text-slate-800">
                    {reports.filter(r => r.regionId === regionToDelete.id).length} Laporan
                  </span>
                </div>
              </div>

              {reports.some(r => r.regionId === regionToDelete.id) && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Perhatian: Terdapat <strong>{reports.filter(r => r.regionId === regionToDelete.id).length} laporan</strong> terkait provinsi ini. Menghapus wilayah akan menghilangkan wilayah ini dari daftar monitoring panitia daerah.
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegionToDelete(null)}
                  disabled={isDeletingRegion}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteRegion}
                  disabled={isDeletingRegion}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingRegion ? 'Menghapus...' : 'Ya, Hapus Wilayah'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
