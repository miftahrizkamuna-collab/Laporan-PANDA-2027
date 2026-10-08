import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  School, 
  GraduationCap, 
  Camera,
  Share2,
  RefreshCw,
  Images,
  ChevronLeft,
  ChevronRight,
  Phone,
  Table
} from 'lucide-react';
import { ReportItem } from '../types';

interface ReportDetailModalProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVerify?: (report: ReportItem) => void;
  canVerify?: boolean;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenVerify,
  canVerify,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!isOpen || !report) return null;

  const photos = (report.documentationPhotos && report.documentationPhotos.length > 0)
    ? report.documentationPhotos
    : report.documentationImageUrl
      ? [report.documentationImageUrl]
      : [];

  const typeLabel = 
    report.type === 'sosialisasi_sekolah' ? 'Sosialisasi ke Sekolah' :
    report.type === 'sosialisasi_medsos' || report.type === 'publikasi_medsos' ? 'Sosialisasi Medsos' :
    report.type === 'sinkron_pendaftar' || report.type === 'update_pendaftar' ? 'Sinkron Pendaftar Daerah & Web' : 'Laporan Aktivitas';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
              Detail Laporan Aktivitas SENSEI 2027
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5 truncate max-w-md">
              {report.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photos Viewer Carousel / Gallery at top if photos available */}
        {photos.length > 0 && (
          <div className="bg-slate-950 relative overflow-hidden">
            <div className="h-56 sm:h-64 w-full flex items-center justify-center relative">
              <img
                src={photos[activePhotoIdx]}
                alt={`Foto Dokumentasi ${activePhotoIdx + 1}`}
                className="w-full h-full object-contain"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Foto {activePhotoIdx + 1} dari {photos.length}
                  </div>
                </>
              )}

              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold flex items-center gap-1">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>Dokumentasi Lapangan ({photos.length} Foto)</span>
              </div>
            </div>

            {/* Thumbnail mini strip */}
            {photos.length > 1 && (
              <div className="p-2 bg-slate-900/90 flex gap-1.5 overflow-x-auto border-t border-white/10">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-12 h-9 rounded overflow-hidden shrink-0 border transition ${
                      activePhotoIdx === idx ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-white/20 opacity-50'
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Status Badge & Timestamp */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              report.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
              report.status === 'needs_revision' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {report.status === 'verified' ? <CheckCircle className="w-3.5 h-3.5" /> : 
               report.status === 'needs_revision' ? <AlertCircle className="w-3.5 h-3.5" /> : 
               <Clock className="w-3.5 h-3.5" />}
              <span>
                {report.status === 'pending' ? 'Menunggu Verifikasi Pusat SMART' : 
                 report.status === 'verified' ? 'Diverifikasi Pusat SMART' : 'Perlu Revisi'}
              </span>
            </span>

            <span className="text-xs text-slate-400">
              Tanggal Kegiatan: {report.activityDate}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">Provinsi:</span>
                <span className="font-semibold text-slate-800">Provinsi {report.regionName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">Pelapor:</span>
                <span className="font-semibold text-slate-800">{report.reporterName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 block text-[10px]">Waktu Kirim:</span>
                <span className="font-semibold text-slate-800">{report.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">Kategori:</span>
                <span className="font-semibold text-slate-800">{typeLabel}</span>
              </div>
            </div>
          </div>

          {/* Custom Details based on the 3 Categories */}
          {report.type === 'sosialisasi_sekolah' && (
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-700" />
                <span>Rincian Sosialisasi Sekolah Sasaran:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Kunjungan SD/MI</span>
                  <span className="font-bold text-emerald-900 text-sm">{report.schoolsSdMiVisited || 0} Sekolah</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Kunjungan SMP/MTs</span>
                  <span className="font-bold text-blue-900 text-sm">{report.schoolsSmpMtsVisited || 0} Sekolah</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">+ Berkas Calon Siswa</span>
                  <span className="font-bold text-emerald-700 text-sm">+{report.registrantsAdded} Berkas</span>
                </div>
              </div>
              {/* Tabel Rincian Setiap Sekolah & Contact Person */}
              {report.schoolVisits && report.schoolVisits.length > 0 ? (
                <div className="pt-2 space-y-1.5">
                  <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Daftar Sekolah yang Dikunjungi & Contact Person ({report.schoolVisits.length} Sekolah):</span>
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-emerald-200/80 bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-emerald-100/60 border-b border-emerald-200 text-emerald-950 font-bold text-[10px] uppercase">
                          <th className="py-2 px-2 text-center w-7">No</th>
                          <th className="py-2 px-2.5">Nama Sekolah</th>
                          <th className="py-2 px-2 text-center">Jenjang</th>
                          <th className="py-2 px-2.5">Contact Person</th>
                          <th className="py-2 px-2.5">No. HP / WA CP</th>
                          <th className="py-2 px-2 text-center">Audiens</th>
                          <th className="py-2 px-2 text-center">Calon Siswa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.schoolVisits.map((sv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2 px-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-2 px-2.5 font-semibold text-slate-900">{sv.schoolName}</td>
                            <td className="py-2 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sv.category === 'sd_mi' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {sv.category === 'sd_mi' ? 'SD / MI' : 'SMP / MTs'}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-slate-700">{sv.contactPersonName || '-'}</td>
                            <td className="py-2 px-2.5">
                              {sv.contactPersonPhone ? (
                                <a
                                  href={`https://wa.me/${sv.contactPersonPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 hover:underline font-mono text-[11px] flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{sv.contactPersonPhone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-600">{sv.studentsReached || 0}</td>
                            <td className="py-2 px-2 text-center font-bold text-emerald-700">+{sv.registrantsDirect || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : report.schoolNames ? (
                <div className="pt-1">
                  <span className="text-slate-500">Sekolah yang Dikunjungi: </span>
                  <span className="font-semibold text-slate-800">{report.schoolNames}</span>
                </div>
              ) : null}
            </div>
          )}

          {(report.type === 'sosialisasi_medsos' || report.type === 'publikasi_medsos') && (
            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 text-xs space-y-2">
              <div className="font-bold text-teal-950 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-teal-700" />
                <span>Rincian Publikasi Medsos & Digital:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-500 block">Kanal Media</span>
                  <span className="font-bold text-teal-900">{report.mediaPlatform || 'Instagram / WhatsApp'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-500 block">Estimasi Jangkauan</span>
                  <span className="font-bold text-teal-900">{report.audienceReached || 0} Audiens</span>
                </div>
              </div>
              {report.mediaPostUrl && (
                <div className="pt-1 flex items-center gap-1.5 text-teal-800">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <a href={report.mediaPostUrl} target="_blank" rel="noreferrer" className="underline truncate">
                    {report.mediaPostUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {(report.type === 'sinkron_pendaftar' || report.type === 'update_pendaftar') && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2">
              <div className="font-bold text-blue-950 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-blue-700" />
                <span>Komparasi Data Pendaftar:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">(A) Berkas Fisik</span>
                  <span className="font-bold text-slate-900">{report.offlineRegistrantsCount || 0} Berkas</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">(B) Form Web SENSEI</span>
                  <span className="font-bold text-blue-900">{report.onlineWebRegistrantsCount || 0} Akun</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block">(=) Total Masuk Kuota</span>
                  <span className="font-bold text-emerald-800">+{report.registrantsAdded} Calon Siswa</span>
                </div>
              </div>
              {report.documentCompletenessStatus && (
                <div className="pt-1">
                  <span className="text-slate-500">Status Kelengkapan: </span>
                  <span className="font-semibold text-slate-800">{report.documentCompletenessStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h5 className="text-xs font-bold text-slate-800 mb-1">Rincian & Catatan Pelaporan:</h5>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              {report.description}
            </div>
          </div>

          {/* Documentation Notes */}
          {report.documentationNotes && (
            <div>
              <h5 className="text-xs font-bold text-slate-800 mb-1">Keterangan Foto / Lampiran Dokumentasi:</h5>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{report.documentationNotes}</span>
              </div>
            </div>
          )}

          {/* Verification Feedback Banner */}
          {report.verificationNotes && (
            <div className={`p-4 rounded-xl border text-xs ${
              report.status === 'verified'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {report.status === 'verified' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                <span>Catatan Verifikasi ({report.verifiedBy || 'Admin Pusat SMART'}):</span>
              </div>
              <p className="leading-relaxed">{report.verificationNotes}</p>
              {report.verifiedAt && (
                <span className="text-[10px] opacity-75 block mt-1">Diverifikasi pada {report.verifiedAt}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Tutup
          </button>
          {canVerify && report.status === 'pending' && onOpenVerify && (
            <button
              onClick={() => {
                onClose();
                onOpenVerify(report);
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
            >
              Buka Verifikasi Sekarang
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
