import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  User, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  FileText, 
  BookOpen, 
  ChevronRight,
  School,
  GraduationCap,
  Edit3,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';
import { RegionData, ReportItem } from '../types';
import { DailyTargetWidget } from './DailyTargetWidget';
import { DocumentationGallery } from './DocumentationGallery';
import { updateRegionCoordinator } from '../services/dataService';

interface RegionalDashboardProps {
  region: RegionData;
  reports: ReportItem[];
  onOpenReportModal: () => void;
  onOpenDetail: (report: ReportItem) => void;
  onBackToPortal?: () => void;
}

export const RegionalDashboard: React.FC<RegionalDashboardProps> = ({
  region,
  reports,
  onOpenReportModal,
  onOpenDetail,
  onBackToPortal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditCoordModalOpen, setIsEditCoordModalOpen] = useState(false);
  const [coordNameInput, setCoordNameInput] = useState(region.coordinatorName || '');
  const [coordPhoneInput, setCoordPhoneInput] = useState(region.coordinatorPhone || '');
  const [isSavingCoord, setIsSavingCoord] = useState(false);

  const handleSaveCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCoord(true);
    try {
      await updateRegionCoordinator(region.id, coordNameInput, coordPhoneInput);
      setIsEditCoordModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCoord(false);
    }
  };

  // Filter reports submitted by this region
  const regionalReports = reports.filter((r) => r.regionId === region.id);
  const pendingReports = regionalReports.filter((r) => r.status === 'pending');
  const verifiedReports = regionalReports.filter((r) => r.status === 'verified');
  const revisionReports = regionalReports.filter((r) => r.status === 'needs_revision');

  const displayReports = regionalReports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

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
            Sedang melihat: <strong>Provinsi {region.name}</strong>
          </span>
        </div>
      )}

      {/* Regional Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>Zona Wilayah: {region.island}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panitia Daerah SENSEI 2027 — Provinsi {region.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Koordinator: <strong className="text-white">{region.coordinatorName || '(Belum Diisi)'}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Kontak: <strong className="text-white">{region.coordinatorPhone || '-'}</strong></span>
              </span>
              <button
                onClick={() => {
                  setCoordNameInput(region.coordinatorName || '');
                  setCoordPhoneInput(region.coordinatorPhone || '');
                  setIsEditCoordModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-400/30 text-xs font-semibold transition"
                title="Atur Nama Koordinator dan Nomor Kontak"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{region.coordinatorName ? 'Ubah Data Koordinator' : '+ Isi Data Koordinator'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-xl transition transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-5 h-5" />
            + Buat Laporan Baru
          </button>
        </div>
      </div>

      {/* Critical Alert if there are reports needing revision */}
      {revisionReports.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4.5 flex items-start space-x-3 text-amber-900 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-amber-950">
              Terdapat {revisionReports.length} Laporan Memerlukan Perbaikan Berkas!
            </h4>
            <p className="mt-1 text-amber-800 leading-relaxed">
              Admin Pusat SMART telah memberikan catatan evaluasi untuk laporan: <strong>"{revisionReports[0].title}"</strong>. Mohon cek catatan verifikasi dan perbarui berkas yang diminta.
            </p>
            <button
              onClick={() => onOpenDetail(revisionReports[0])}
              className="mt-2 font-bold text-amber-900 underline hover:text-amber-950 inline-flex items-center gap-1"
            >
              Lihat Catatan Revisi Pusat <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED PROGRESS BAR WIDGET: Target Total 75 Pendaftar, 15 SD/MI, 5 SMP/MTs */}
      <DailyTargetWidget
        region={region}
        onOpenReportModal={onOpenReportModal}
      />

      {/* DOKUMENTASI PILIHAN AKTIVITAS SOSIALISASI */}
      <DocumentationGallery
        reports={regionalReports}
        regionName={`Provinsi ${region.name}`}
        onSelectReport={onOpenDetail}
      />

      {/* Status Filter and Reports Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Riwayat Laporan Panitia Provinsi {region.name}</h3>
            <p className="text-xs text-slate-500">Daftar seluruh aktivitas sosialisasi, publikasi, dan verifikasi berkas pendaftar daerah.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'all' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Semua ({regionalReports.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'pending' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending ({pendingReports.length})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'verified' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Terverifikasi ({verifiedReports.length})
            </button>
            <button
              onClick={() => setFilterStatus('needs_revision')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'needs_revision' ? 'bg-white text-amber-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Revisi ({revisionReports.length})
            </button>
          </div>
        </div>

        {/* Reports List */}
        {displayReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
            <h4 className="font-semibold text-slate-700 text-sm">Belum Ada Laporan pada Kategori Ini</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Klik tombol "+ Buat Laporan Baru" di atas untuk melaporkan kunjungan sekolah, publikasi medsos, atau tambahan pendaftar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onOpenDetail(report)}
                className="py-4.5 px-3 rounded-2xl hover:bg-slate-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {/* Photo thumbnail if exists */}
                  {report.documentationImageUrl ? (
                    <img
                      src={report.documentationImageUrl}
                      alt={report.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        report.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        report.status === 'needs_revision' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {report.status === 'verified' ? <CheckCircle className="w-3 h-3" /> :
                         report.status === 'needs_revision' ? <AlertCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        <span>
                          {report.status === 'verified' ? 'Terverifikasi Pusat' :
                           report.status === 'needs_revision' ? 'Butuh Revisi' : 'Menunggu Review'}
                        </span>
                      </span>

                      <span className="text-[11px] font-medium text-slate-400">
                        {report.activityDate} • Oleh {report.reporterName}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                      {report.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {report.description}
                    </p>

                    {/* Breakdown Tag */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      {(report.schoolsSdMiVisited || 0) > 0 && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <School className="w-3 h-3" /> {report.schoolsSdMiVisited} SD/MI
                        </span>
                      )}
                      {(report.schoolsSmpMtsVisited || 0) > 0 && (
                        <span className="flex items-center gap-1 text-blue-700 font-semibold">
                          <GraduationCap className="w-3 h-3" /> {report.schoolsSmpMtsVisited} SMP/MTs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block text-left sm:text-right">Dampak</span>
                    <span className="text-sm font-extrabold text-emerald-700">+{report.registrantsAdded} Calon Siswa</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition mt-1">
                    Lihat Rincian <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info & Guidelines for Region Committee */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-6 border border-emerald-200/70">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h4 className="font-bold text-slate-900 text-sm">
            Panduan & Standar Operasional Sosialisasi SENSEI 2027
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-xs">
            <span className="font-bold text-emerald-900 block mb-1">1. Target Kuota & Sasaran:</span>
            <p className="text-slate-600 leading-relaxed">
              Target perolehan total setiap daerah adalah <strong>75 pendaftar</strong>. Kunjungan sekolah sasaran minimal <strong>15 sekolah SD/MI</strong> dan <strong>5 sekolah SMP/MTs</strong>.
            </p>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-xs">
            <span className="font-bold text-emerald-900 block mb-1">2. Dokumentasi Wajib Lapangan:</span>
            <p className="text-slate-600 leading-relaxed">
              Lampirkan foto kegiatan saat presentasi di kelas, audiensi kepala madrasah, atau link Google Drive bukti pendaftaran agar langsung tampil di galeri dokumentasi.
            </p>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-xs">
            <span className="font-bold text-emerald-900 block mb-1">3. Verifikasi Cepat Pusat:</span>
            <p className="text-slate-600 leading-relaxed">
              Laporan yang diinput sebelum pukul 17.00 WIB akan diprioritaskan untuk diverifikasi oleh Admin Pusat SMART pada hari yang sama.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Edit Koordinator Daerah */}
      {isEditCoordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <User className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Atur Koordinator Wilayah</h3>
                  <p className="text-[11px] text-emerald-200">Provinsi {region.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditCoordModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoordinator} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Koordinator Daerah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd."
                  value={coordNameInput}
                  onChange={(e) => setCoordNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor HP / WhatsApp Aktif *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0812-3456-7890"
                  value={coordPhoneInput}
                  onChange={(e) => setCoordPhoneInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                Nama dan nomor kontak ini akan tampil pada dasbor daerah serta laporan yang diajukan ke Admin Pusat SMART.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditCoordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoord}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingCoord ? 'Menyimpan...' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
