import React, { useState } from 'react';
import { 
  Camera, 
  Calendar, 
  User, 
  School, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  RefreshCw,
  Images
} from 'lucide-react';
import { ReportItem } from '../types';

interface DocumentationGalleryProps {
  reports: ReportItem[];
  regionName: string;
  onOpenReportModal?: () => void;
  onSelectReport?: (report: ReportItem) => void;
}

export const DocumentationGallery: React.FC<DocumentationGalleryProps> = ({
  reports,
  regionName,
  onSelectReport,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'sekolah' | 'medsos' | 'sinkron'>('all');
  const [selectedPhotoReport, setSelectedPhotoReport] = useState<ReportItem | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Filter reports that have documentation (photos, single image, or notes)
  const docReports = reports.filter(r => 
    (r.documentationPhotos && r.documentationPhotos.length > 0) || 
    r.documentationImageUrl || 
    r.documentationNotes
  );

  const filteredDocs = docReports.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sekolah') {
      return r.type === 'sosialisasi_sekolah' || (r.schoolsVisited || 0) > 0;
    }
    if (activeFilter === 'medsos') {
      return r.type === 'sosialisasi_medsos' || r.type === 'publikasi_medsos';
    }
    if (activeFilter === 'sinkron') {
      return r.type === 'sinkron_pendaftar' || r.type === 'update_pendaftar';
    }
    return true;
  });

  const getReportPhotos = (report: ReportItem): string[] => {
    if (report.documentationPhotos && report.documentationPhotos.length > 0) {
      return report.documentationPhotos;
    }
    if (report.documentationImageUrl) {
      return [report.documentationImageUrl];
    }
    return [];
  };

  const handleOpenPhotoModal = (report: ReportItem, index: number = 0) => {
    setSelectedPhotoReport(report);
    setActivePhotoIndex(index);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-1.5 border border-teal-200/60">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Dokumentasi Lapangan Terverifikasi</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Dokumentasi Pilihan Aktivitas Sosialisasi — {regionName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kumpulan bukti foto sosialisasi sekolah, publikasi medsos, dan rekap berkas calon siswa yang telah dilampirkan panitia pada menu Buat Laporan Baru.
          </p>
        </div>

        {/* Filter Pills 3 Kategori */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              activeFilter === 'all' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Semua ({docReports.length})
          </button>
          <button
            onClick={() => setActiveFilter('sekolah')}
            className={`px-3 py-1 rounded-lg transition ${
              activeFilter === 'sekolah' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Sekolah
          </button>
          <button
            onClick={() => setActiveFilter('medsos')}
            className={`px-3 py-1 rounded-lg transition ${
              activeFilter === 'medsos' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Medsos
          </button>
          <button
            onClick={() => setActiveFilter('sinkron')}
            className={`px-3 py-1 rounded-lg transition ${
              activeFilter === 'sinkron' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Sinkron Berkas
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Camera className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
          <h4 className="font-semibold text-slate-700 text-sm">Belum Ada Dokumentasi pada Kategori Ini</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Dokumentasi foto akan otomatis tampil di sini setiap kali panitia mengunggah foto saat mengisi formulir pada tombol Buat Laporan Baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((item) => {
            const photos = getReportPhotos(item);
            const hasImages = photos.length > 0;
            const primaryThumb = hasImages ? photos[0] : null;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenPhotoModal(item, 0)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                    {primaryThumb ? (
                      <img
                        src={primaryThumb}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-800 to-emerald-900 text-white text-center">
                        <Camera className="w-8 h-8 mb-2 opacity-80" />
                        <span className="text-xs font-semibold px-2">Dokumentasi Arsip Lapangan</span>
                      </div>
                    )}

                    {/* Category Badge on photo */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold">
                      {item.type === 'sosialisasi_sekolah' ? (
                        <>
                          <School className="w-3 h-3 text-emerald-400" />
                          <span>Sosialisasi Sekolah</span>
                        </>
                      ) : item.type === 'sosialisasi_medsos' || item.type === 'publikasi_medsos' ? (
                        <>
                          <Share2 className="w-3 h-3 text-teal-400" />
                          <span>Sosialisasi Medsos</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 text-blue-400" />
                          <span>Sinkron Pendaftar</span>
                        </>
                      )}
                    </div>

                    {/* Multi-Photo Count Badge */}
                    {photos.length > 1 && (
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                        <Images className="w-3 h-3 text-amber-300" />
                        <span>{photos.length} Foto</span>
                      </div>
                    )}

                    {item.status === 'verified' && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Terverifikasi</span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.activityDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {item.reporterName}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold">
                    +{item.registrantsAdded} Calon Siswa
                  </span>
                  <span className="text-slate-500">
                    {item.schoolsVisited > 0 ? `${item.schoolsVisited} Sekolah` : `${item.audienceReached} Audiens`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX PHOTO MODAL with Support for Multiple Uploaded Images */}
      {selectedPhotoReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 truncate max-w-md">
                  Dokumentasi Lapangan: {selectedPhotoReport.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedPhotoReport(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Active Photo Viewport */}
            {(() => {
              const currentPhotos = getReportPhotos(selectedPhotoReport);
              const activePhoto = currentPhotos[activePhotoIndex] || selectedPhotoReport.documentationImageUrl;

              return (
                <div>
                  <div className="h-80 sm:h-96 w-full bg-slate-950 flex items-center justify-center relative overflow-hidden group">
                    {activePhoto ? (
                      <img
                        src={activePhoto}
                        alt={`Dokumentasi ${activePhotoIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-white text-center p-8">
                        <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-sm">Dokumentasi Arsip Aktivitas</p>
                      </div>
                    )}

                    {/* Navigation Arrows if > 1 photo */}
                    {currentPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition shadow-md"
                          title="Foto Sebelumnya"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIndex((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition shadow-md"
                          title="Foto Selanjutnya"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Photo Indicator Badge */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-bold">
                          Foto {activePhotoIndex + 1} dari {currentPhotos.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row if Multiple Photos */}
                  {currentPhotos.length > 1 && (
                    <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
                      {currentPhotos.map((thumb, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                            activePhotoIndex === idx
                              ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-105'
                              : 'border-white/20 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={thumb} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Photo Details and Report Notes */}
                  <div className="p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {selectedPhotoReport.type.replace('_', ' ')} • {selectedPhotoReport.regionName}
                        </span>
                        {selectedPhotoReport.status === 'verified' && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{selectedPhotoReport.activityDate}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{selectedPhotoReport.title}</h3>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                      {selectedPhotoReport.documentationNotes && (
                        <p>
                          <strong className="text-slate-900">Catatan Lampiran Foto: </strong>
                          {selectedPhotoReport.documentationNotes}
                        </p>
                      )}
                      <p>
                        <strong className="text-slate-900">Deskripsi Kegiatan: </strong>
                        {selectedPhotoReport.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">
                        Pelapor: <strong>{selectedPhotoReport.reporterName}</strong>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const rep = selectedPhotoReport;
                            setSelectedPhotoReport(null);
                            if (onSelectReport) onSelectReport(rep);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
                        >
                          Buka Detail Laporan
                        </button>
                        <button
                          onClick={() => setSelectedPhotoReport(null)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}
    </div>
  );
};
