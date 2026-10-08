import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, FileText, Calendar, MapPin, User, Send, Camera, School, Phone, Table } from 'lucide-react';
import { ReportItem } from '../types';
import { verifyReport } from '../services/dataService';
import { playNotificationTone } from '../utils/sound';
import confetti from 'canvas-confetti';

interface VerificationModalProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  report,
  isOpen,
  onClose,
  adminName,
}) => {
  const [actionType, setActionType] = useState<'verify' | 'revise'>('verify');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !report) return null;

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      const status = actionType === 'verify' ? 'verified' : 'needs_revision';
      await verifyReport(
        report.id,
        status,
        adminName,
        notes.trim() || (actionType === 'verify' ? 'Laporan diverifikasi & valid.' : 'Mohon perbaiki berkas.'),
        {
          title: report.title,
          regionId: report.regionId,
          regionName: report.regionName,
        }
      );

      if (actionType === 'verify') {
        playNotificationTone('success');
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        playNotificationTone('alert');
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Verification failed:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
              Verifikasi Laporan Masuk
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Review Laporan Panitia Wilayah
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Report Metadata Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                report.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                report.status === 'needs_revision' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {report.status === 'pending' ? 'Menunggu Verifikasi' : 
                 report.status === 'verified' ? 'Sudah Diverifikasi' : 'Perlu Revisi'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{report.regionName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{report.reporterName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Kegiatan: {report.activityDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Kategori: {report.type.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="block text-[10px] text-slate-400 font-medium">+ Pendaftar</span>
                <span className="text-sm font-extrabold text-emerald-700">{report.registrantsAdded}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="block text-[10px] text-slate-400 font-medium">Sekolah</span>
                <span className="text-sm font-extrabold text-blue-700">{report.schoolsVisited}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="block text-[10px] text-slate-400 font-medium">Audiens</span>
                <span className="text-sm font-extrabold text-slate-800">{report.audienceReached}</span>
              </div>
            </div>

            {/* Tabel Sekolah & Contact Person yang diverifikasi */}
            {report.schoolVisits && report.schoolVisits.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Daftar Sekolah & Contact Person ({report.schoolVisits.length} Sekolah):</span>
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                        <th className="py-2 px-2.5">No</th>
                        <th className="py-2 px-2.5">Sekolah</th>
                        <th className="py-2 px-2 text-center">Jenjang</th>
                        <th className="py-2 px-2.5">Contact Person</th>
                        <th className="py-2 px-2.5">No. HP / WA CP</th>
                        <th className="py-2 px-2 text-center">Calon Siswa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.schoolVisits.map((sv, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2.5 text-slate-400 font-bold">{i + 1}</td>
                          <td className="py-2 px-2.5 font-semibold text-slate-800">{sv.schoolName}</td>
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
                          <td className="py-2 px-2 text-center font-bold text-emerald-700">+{sv.registrantsDirect || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-700 pt-1">
              <p className="font-semibold text-slate-800 mb-0.5">Deskripsi Kegiatan:</p>
              <p className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-slate-600 leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Uploaded Photos Preview for Admin Verification */}
            {((report.documentationPhotos && report.documentationPhotos.length > 0) || report.documentationImageUrl) && (
              <div className="pt-2">
                <p className="font-semibold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Foto Dokumentasi Terlampir ({report.documentationPhotos?.length || 1} Foto):</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(report.documentationPhotos && report.documentationPhotos.length > 0 
                    ? report.documentationPhotos 
                    : [report.documentationImageUrl!]
                  ).map((imgUrl, i) => (
                    <a
                      key={i}
                      href={imgUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video block bg-slate-900"
                    >
                      <img
                        src={imgUrl}
                        alt={`Bukti ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        Foto {i + 1}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {report.documentationNotes && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Catatan Bukti/Dokumentasi: </span>
                <span className="text-slate-700">{report.documentationNotes}</span>
              </div>
            )}
          </div>

          {/* Action Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Keputusan Verifikasi Pusat *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType('verify')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  actionType === 'verify'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className={`w-5 h-5 ${actionType === 'verify' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs">Setujui & Verifikasi</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('revise')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  actionType === 'revise'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className={`w-5 h-5 ${actionType === 'revise' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-xs">Minta Revisi / Catatan</span>
              </button>
            </div>
          </div>

          {/* Feedback/Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan / Arahan Verifikator Pusat (Otomatis Dikirim ke Panitia Daerah)
            </label>
            <textarea
              rows={3}
              placeholder={
                actionType === 'verify'
                  ? 'Contoh: Laporan terverifikasi. Teruskan koordinasi dengan kepala madrasah sasaran!'
                  : 'Contoh: Mohon lampirkan scan bukti tanda terima berkas raport dan SKTM pendaftar...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition ${
                actionType === 'verify'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Memproses...' : actionType === 'verify' ? 'Simpan Verifikasi' : 'Kirim Arahan Revisi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
