import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  School, 
  Share2, 
  RefreshCw, 
  UploadCloud, 
  CheckCircle, 
  Camera, 
  GraduationCap, 
  Trash2, 
  Plus, 
  Phone,
  User,
  Building2,
  Table,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ReportType, SchoolVisitItem } from '../types';
import { submitReport } from '../services/dataService';
import { playNotificationTone } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporterName: string;
  reporterEmail: string;
  reporterId: string;
  regionId: string;
  regionName: string;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reporterName,
  reporterEmail,
  reporterId,
  regionId,
  regionName,
  onSuccess,
}) => {
  // 3 Pilihan Laporan Utama
  const [reportCategory, setReportCategory] = useState<
    'sosialisasi_sekolah' | 'sosialisasi_medsos' | 'sinkron_pendaftar'
  >('sosialisasi_sekolah');

  // Common Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  // Field Khusus Pilihan 1: TABEL SEKOLAH DENGAN SETIAP BARIS 1 SEKOLAH & CONTACT PERSON
  const [schoolRows, setSchoolRows] = useState<SchoolVisitItem[]>([
    {
      schoolName: 'MIS / SD Sasaran 1',
      category: 'sd_mi',
      contactPersonName: '',
      contactPersonPhone: '',
      studentsReached: 40,
      registrantsDirect: 3,
    }
  ]);

  // Field Khusus Pilihan 2: Sosialisasi Medsos
  const [mediaPlatform, setMediaPlatform] = useState('Instagram & WhatsApp');
  const [mediaPostUrl, setMediaPostUrl] = useState('');
  const [digitalAudienceReach, setDigitalAudienceReach] = useState<number>(250);
  const [registrantsFromMedsos, setRegistrantsFromMedsos] = useState<number>(3);

  // Field Khusus Pilihan 3: Sinkron Pendaftar Daerah & Web SENSEI
  const [offlineRegistrants, setOfflineRegistrants] = useState<number>(10);
  const [onlineWebRegistrants, setOnlineWebRegistrants] = useState<number>(15);
  const [totalValidatedRegistrants, setTotalValidatedRegistrants] = useState<number>(25);
  const [completenessStatus, setCompletenessStatus] = useState('Lengkap (Formulir, SKTM & Rapor)');

  // Multiple Image Upload State
  const [photos, setPhotos] = useState<string[]>([]);
  const [documentationNotes, setDocumentationNotes] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper title generator
  const getDefaultTitle = (cat: string, regName: string) => {
    if (cat === 'sosialisasi_sekolah') return `Sosialisasi SENSEI 2027 di Sekolah Sasaran — Provinsi ${regName}`;
    if (cat === 'sosialisasi_medsos') return `Publikasi & Siaran Medsos SENSEI 2027 — Provinsi ${regName}`;
    return `Sinkronisasi Pendaftar Calon Siswa & Web — Provinsi ${regName}`;
  };

  // Auto initialize default title on open
  useEffect(() => {
    if (isOpen) {
      if (!title || title.trim() === '') {
        setTitle(getDefaultTitle(reportCategory, regionName));
      }
      setIsSubmitting(false);
      setIsProcessingImages(false);
      setSubmitError(null);
    }
  }, [isOpen, regionName]);

  const handleCategoryChange = (newCat: 'sosialisasi_sekolah' | 'sosialisasi_medsos' | 'sinkron_pendaftar') => {
    setReportCategory(newCat);
    setTitle(getDefaultTitle(newCat, regionName));
  };

  // Quick fill sample data for fast testing by the user
  const handleQuickFillDemo = () => {
    setTitle(`Uji Coba Laporan Sosialisasi SENSEI 2027 — Provinsi ${regionName}`);
    setDescription(`Sosialisasi beasiswa SMART Ekselensia Indonesia SENSEI 2027 telah dilaksanakan dengan antusiasme tinggi dari para siswa dan dewan guru.`);
    setSchoolRows([
      {
        schoolName: 'SDIT Al-Fattah',
        category: 'sd_mi',
        contactPersonName: 'Ibu Fatimah, S.Pd (Guru BK)',
        contactPersonPhone: '0812-3456-7890',
        studentsReached: 45,
        registrantsDirect: 3,
      },
      {
        schoolName: 'SMPN 1 Teladan',
        category: 'smp_mts',
        contactPersonName: 'Pak Hendra, M.Pd (Kesiswaan)',
        contactPersonPhone: '0813-9876-5432',
        studentsReached: 55,
        registrantsDirect: 4,
      }
    ]);
    setPhotos([
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
    ]);
    setDocumentationNotes('Foto sesi sosialisasi tatap muka di ruang kelas dan penyerahan berkas pendaftaran.');
    setSubmitError(null);
  };

  if (!isOpen) return null;

  // Handler for school table rows
  const handleAddSchoolRow = () => {
    const lastCategory = schoolRows[schoolRows.length - 1]?.category || 'sd_mi';
    setSchoolRows((prev) => [
      ...prev,
      {
        schoolName: '',
        category: lastCategory === 'sd_mi' ? 'sd_mi' : 'smp_mts',
        contactPersonName: '',
        contactPersonPhone: '',
        studentsReached: 35,
        registrantsDirect: 2,
      }
    ]);
  };

  const handleUpdateSchoolRow = <K extends keyof SchoolVisitItem>(
    index: number,
    field: K,
    value: SchoolVisitItem[K]
  ) => {
    setSchoolRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveSchoolRow = (index: number) => {
    if (schoolRows.length <= 1) {
      setSchoolRows([{
        schoolName: '',
        category: 'sd_mi',
        contactPersonName: '',
        contactPersonPhone: '',
        studentsReached: 0,
        registrantsDirect: 0,
      }]);
      return;
    }
    setSchoolRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Live calculations from school rows
  const calculatedSdCount = schoolRows.filter(r => r.category === 'sd_mi' && r.schoolName.trim().length > 0).length || schoolRows.filter(r => r.category === 'sd_mi').length;
  const calculatedSmpCount = schoolRows.filter(r => r.category === 'smp_mts' && r.schoolName.trim().length > 0).length || schoolRows.filter(r => r.category === 'smp_mts').length;
  const calculatedTotalSchools = calculatedSdCount + calculatedSmpCount;
  const calculatedAudience = schoolRows.reduce((sum, r) => sum + (Number(r.studentsReached) || 0), 0);
  const calculatedDirectRegistrants = schoolRows.reduce((sum, r) => sum + (Number(r.registrantsDirect) || 0), 0);

  // Auto-sync total for sinkron_pendaftar
  const handleOfflineChange = (val: number) => {
    setOfflineRegistrants(val);
    setTotalValidatedRegistrants(val + onlineWebRegistrants);
  };

  const handleOnlineChange = (val: number) => {
    setOnlineWebRegistrants(val);
    setTotalValidatedRegistrants(offlineRegistrants + val);
  };

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve('');
      }, 6000);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const dataUrl = (e.target?.result as string) || '';
            if (!dataUrl) {
              clearTimeout(timeoutId);
              return resolve('');
            }
            const img = new Image();
            img.onload = () => {
              clearTimeout(timeoutId);
              try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 640;

                if (width > height && width > maxDim) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else if (height > maxDim) {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/jpeg', 0.5));
                } else {
                  resolve(dataUrl);
                }
              } catch {
                resolve(dataUrl);
              }
            };
            img.onerror = () => {
              clearTimeout(timeoutId);
              resolve('');
            };
            img.src = dataUrl;
          } catch {
            clearTimeout(timeoutId);
            resolve('');
          }
        };
        reader.onerror = () => {
          clearTimeout(timeoutId);
          resolve('');
        };
        reader.readAsDataURL(file);
      } catch {
        clearTimeout(timeoutId);
        resolve('');
      }
    });
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsProcessingImages(true);
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const base64 = await processImageFile(file);
          if (base64) newImages.push(base64);
        }
      }
      setPhotos((prev) => [...prev, ...newImages]);
      e.target.value = '';
    } catch (err) {
      console.error('Error processing images:', err);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add sample photos for testing convenience
  const handleAddSamplePhotos = (sampleType: 'sekolah' | 'medsos' | 'berkas') => {
    const samples = {
      sekolah: [
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      ],
      medsos: [
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      ],
      berkas: [
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      ]
    };
    setPhotos((prev) => [...prev, ...samples[sampleType]]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      try {
        e.preventDefault();
      } catch {
        // Safe fallback
      }
    }

    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const safetyTimer = setTimeout(() => {
      setIsSubmitting(false);
    }, 5000);

    try {
      // Guaranteed title fallback so submission is NEVER blocked by empty title
      const safeRegName = regionName || 'Wilayah';
      const finalTitle = (title || '').trim() || getDefaultTitle(reportCategory, safeRegName);

      let totalRegistrants = 0;
      let totalSchools = 0;
      let sdCount = 0;
      let smpCount = 0;
      let audience = 0;
      let autoDesc = (description || '').trim();
      let schoolNamesSummary = '';
      let validSchoolVisits: SchoolVisitItem[] | undefined = undefined;

      if (reportCategory === 'sosialisasi_sekolah') {
        // Auto-clean school rows with complete null-safety
        const cleanedRows: SchoolVisitItem[] = (schoolRows && schoolRows.length > 0 ? schoolRows : [
          {
            schoolName: 'Sekolah Sasaran 1',
            category: 'sd_mi',
            contactPersonName: '',
            contactPersonPhone: '',
            studentsReached: 30,
            registrantsDirect: 2,
          }
        ]).map((r, idx) => ({
          schoolName: (r?.schoolName || '').trim() || `Sekolah Sasaran ${idx + 1}`,
          category: r?.category === 'smp_mts' ? 'smp_mts' : 'sd_mi',
          contactPersonName: (r?.contactPersonName || '').trim(),
          contactPersonPhone: (r?.contactPersonPhone || '').trim(),
          studentsReached: Number(r?.studentsReached) || 0,
          registrantsDirect: Number(r?.registrantsDirect) || 0,
        }));

        validSchoolVisits = cleanedRows;
        sdCount = cleanedRows.filter(r => r.category === 'sd_mi').length;
        smpCount = cleanedRows.filter(r => r.category === 'smp_mts').length;
        totalSchools = sdCount + smpCount;
        totalRegistrants = cleanedRows.reduce((sum, r) => sum + (Number(r.registrantsDirect) || 0), 0);
        audience = cleanedRows.reduce((sum, r) => sum + (Number(r.studentsReached) || 0), 0);
        schoolNamesSummary = cleanedRows.map(r => (r.schoolName || '').trim()).filter(Boolean).join(', ');

        if (!autoDesc) {
          autoDesc = `Sosialisasi tatap muka dilaksanakan di ${totalSchools} sekolah: ${schoolNamesSummary || 'Sekolah sasaran'}. Menjangkau ${audience} siswa dan mengumpulkan ${totalRegistrants} berkas calon siswa baru.`;
        }
      } else if (reportCategory === 'sosialisasi_medsos') {
        totalRegistrants = Number(registrantsFromMedsos) || 0;
        audience = Number(digitalAudienceReach) || 0;
        if (!autoDesc) {
          autoDesc = `Publikasi sosialisasi digital melalui ${mediaPlatform || 'Media Sosial'} dengan estimasi capaian ${audience} jangkauan/tayangan. Tautan: ${mediaPostUrl || '-'}`;
        }
      } else if (reportCategory === 'sinkron_pendaftar') {
        totalRegistrants = Number(totalValidatedRegistrants) || 0;
        if (!autoDesc) {
          autoDesc = `Sinkronisasi pendaftar daerah: ${offlineRegistrants || 0} berkas fisik panitia daerah dan ${onlineWebRegistrants || 0} formulir online web SENSEI. Status berkas: ${completenessStatus || 'Lengkap'}.`;
        }
      }

      const activeRegionId = regionId || 'jabar';
      const activeReporterName = reporterName || `Panitia ${safeRegName}`;
      const activeReporterEmail = reporterEmail || 'panwil@sensei2027.id';

      await submitReport({
        regionId: activeRegionId,
        regionName: safeRegName,
        reporterId: reporterId || 'panitia-user',
        reporterName: activeReporterName,
        reporterEmail: activeReporterEmail,
        type: (reportCategory || 'sosialisasi_sekolah') as ReportType,
        title: finalTitle,
        description: autoDesc,
        activityDate: activityDate || new Date().toISOString().substring(0, 10),
        registrantsAdded: totalRegistrants,
        schoolsVisited: totalSchools,
        schoolsSdMiVisited: sdCount,
        schoolsSmpMtsVisited: smpCount,
        audienceReached: audience,
        documentationNotes: (documentationNotes || '').trim(),
        documentationPhotos: Array.isArray(photos) ? photos : [],
        documentationImageUrl: Array.isArray(photos) && photos.length > 0 ? photos[0] : undefined,
        schoolNames: schoolNamesSummary || undefined,
        schoolVisits: validSchoolVisits,
        mediaPlatform: (mediaPlatform || '').trim() || undefined,
        mediaPostUrl: (mediaPostUrl || '').trim() || undefined,
        offlineRegistrantsCount: Number(offlineRegistrants) || 0,
        onlineWebRegistrantsCount: Number(onlineWebRegistrants) || 0,
        documentCompletenessStatus: completenessStatus || 'Lengkap',
      });

      clearTimeout(safetyTimer);

      try {
        playNotificationTone('success');
      } catch {
        // Safe fallback
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback if canvas is restricted
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        setIsSubmitting(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: unknown) {
      clearTimeout(safetyTimer);
      console.error('Submit report failed:', err);
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan laporan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/20 mb-1">
              <span>Formulir Pelaporan Panitia Daerah</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              + Buat Laporan Baru — Provinsi {regionName}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Pilih jenis kegiatan, lengkapi rincian, dan lampirkan foto dokumentasi kegiatan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
              title="Isi contoh data untuk pengujian cepat"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contoh Cepat</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSuccessToast ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-1">Laporan Berhasil Terkirim!</h4>
            <p className="text-slate-600 text-sm max-w-md">
              Laporan beserta {photos.length} foto dokumentasi telah tersimpan ke sistem SENSEI 2027 dan diteruskan ke Admin Pusat SMART untuk proses verifikasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            
            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Kendala Pengiriman:</strong>
                  <span>{submitError}</span>
                </div>
              </div>
            )}

            {/* Quick Demo Fill button for mobile */}
            <div className="sm:hidden flex justify-end">
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Isi Contoh Uji Coba Cepat</span>
              </button>
            </div>

            {/* 3 PILIHAN LAPORAN UTAMA */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Pilih Jenis Laporan Kegiatan (3 Pilihan Utama) *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. SOSIALISASI KE SEKOLAH */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('sosialisasi_sekolah')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    reportCategory === 'sosialisasi_sekolah'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        reportCategory === 'sosialisasi_sekolah' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Pilihan 1
                      </span>
                      <School className={`w-4 h-4 ${reportCategory === 'sosialisasi_sekolah' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      Sosialisasi ke Sekolah
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      Tabel per sekolah sasaran & contact person narahubung
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-800">
                    Target: Min. 15 SD & 5 SMP
                  </div>
                </button>

                {/* 2. SOSIALISASI MEDSOS */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('sosialisasi_medsos')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    reportCategory === 'sosialisasi_medsos'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500 shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        reportCategory === 'sosialisasi_medsos' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Pilihan 2
                      </span>
                      <Share2 className={`w-4 h-4 ${reportCategory === 'sosialisasi_medsos' ? 'text-teal-700' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      Sosialisasi Medsos
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      Publikasi poster/flyer di IG, FB, TikTok, & WA group
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-teal-800">
                    Jangkauan Luas Digital
                  </div>
                </button>

                {/* 3. SINKRON PENDAFTAR DAERAH & FORMULIR ONLINE WEB SENSEI */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('sinkron_pendaftar')}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    reportCategory === 'sinkron_pendaftar'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500 shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        reportCategory === 'sinkron_pendaftar' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Pilihan 3
                      </span>
                      <RefreshCw className={`w-4 h-4 ${reportCategory === 'sinkron_pendaftar' ? 'text-blue-700' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      Sinkron Pendaftar Daerah & Web
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      Rekap berkas fisik daerah vs formulir online di web SENSEI
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-blue-800">
                    Target Kuota: 75 Calon Siswa
                  </div>
                </button>
              </div>
            </div>

            {/* Judul & Tanggal Pelaksanaan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Laporan *
                </label>
                <input
                  type="text"
                  placeholder="Judul laporan kegiatan..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tanggal Kegiatan *
                </label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* === KONTEN KHUSUS PILIHAN 1: SOSIALISASI KE SEKOLAH === */}
            {reportCategory === 'sosialisasi_sekolah' && (
              <div className="p-4.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-emerald-700" />
                      Tabel Kunjungan Sekolah Sasaran & Contact Person
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Input baris sekolah yang dikunjungi beserta narahubung/contact person sekolah.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSchoolRow}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Baris Sekolah</span>
                  </button>
                </div>

                {/* Tabel Sekolah */}
                <div className="overflow-x-auto border border-emerald-200/80 rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-emerald-100/70 border-b border-emerald-200 text-emerald-950 font-bold text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-2 text-center w-8">No</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Nama Sekolah Sasaran *</th>
                        <th className="py-2.5 px-3 w-32">Jenjang *</th>
                        <th className="py-2.5 px-3 min-w-[170px]">Contact Person (Nama Guru/Kepsek)</th>
                        <th className="py-2.5 px-3 min-w-[140px]">No. HP / WA CP</th>
                        <th className="py-2.5 px-2 text-center w-24">Audiens Siswa</th>
                        <th className="py-2.5 px-2 text-center w-28">Calon Siswa</th>
                        <th className="py-2.5 px-2 text-center w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schoolRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/30 transition">
                          <td className="py-2.5 px-2 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              placeholder="Contoh: MIS Al-Ikhlas / SMPN 1"
                              value={row.schoolName}
                              onChange={(e) => handleUpdateSchoolRow(idx, 'schoolName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <select
                              value={row.category}
                              onChange={(e) => handleUpdateSchoolRow(idx, 'category', e.target.value as 'sd_mi' | 'smp_mts')}
                              className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold ${
                                row.category === 'sd_mi' 
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                                  : 'bg-blue-50 text-blue-900 border-blue-300'
                              }`}
                            >
                              <option value="sd_mi">SD / MI</option>
                              <option value="smp_mts">SMP / MTs</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Pak Budi, S.Pd (Guru BK/Kepsek)"
                                value={row.contactPersonName || ''}
                                onChange={(e) => handleUpdateSchoolRow(idx, 'contactPersonName', e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                            </div>
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="relative">
                              <input
                                type="tel"
                                placeholder="0812-3456-7890"
                                value={row.contactPersonPhone || ''}
                                onChange={(e) => handleUpdateSchoolRow(idx, 'contactPersonPhone', e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                              />
                              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                            </div>
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              min="0"
                              value={row.studentsReached}
                              onChange={(e) => handleUpdateSchoolRow(idx, 'studentsReached', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-center font-bold text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              min="0"
                              value={row.registrantsDirect}
                              onChange={(e) => handleUpdateSchoolRow(idx, 'registrantsDirect', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/50 text-center font-bold text-emerald-800 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSchoolRow(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus baris sekolah ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary & Quick Add */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddSchoolRow}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 bg-emerald-100 rounded-md p-0.5" />
                    <span>+ Tambah Baris Sekolah Lagi</span>
                  </button>

                  {/* Live Calculated Stats Pills */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-semibold text-emerald-900">
                      SD/MI: <strong>{calculatedSdCount}</strong> (Min 15)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 font-semibold text-blue-900">
                      SMP/MTs: <strong>{calculatedSmpCount}</strong> (Min 5)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      Total Audiens: <strong>{calculatedAudience}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-950 font-bold">
                      Calon Siswa: <strong>+{calculatedDirectRegistrants}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* === KONTEN KHUSUS PILIHAN 2: SOSIALISASI MEDSOS === */}
            {reportCategory === 'sosialisasi_medsos' && (
              <div className="p-4.5 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-teal-700" />
                    Rincian Publikasi & Media Sosial
                  </span>
                  <span className="text-[11px] text-teal-700 font-medium">
                    Kampanye Digital Panitia Wilayah
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kanal / Platform Medsos
                    </label>
                    <select
                      value={mediaPlatform}
                      onChange={(e) => setMediaPlatform(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      <option value="Instagram & WhatsApp">Instagram & WhatsApp</option>
                      <option value="Instagram Resmi">Instagram Resmi</option>
                      <option value="WhatsApp Group Guru / Kepala Sekolah">WhatsApp Group Guru / Komite</option>
                      <option value="Facebook & Komunitas">Facebook & Komunitas</option>
                      <option value="TikTok Edukasi">TikTok Edukasi</option>
                      <option value="Portal Berita / Media Lokal">Portal Berita / Media Lokal</option>
                      <option value="Radio / Siaran Daerah">Radio / Siaran Daerah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Estimasi Jangkauan (Views / Impresi)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={digitalAudienceReach}
                      onChange={(e) => setDigitalAudienceReach(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-bold text-teal-900"
                    />
                    <span className="text-[10px] text-slate-500">Tayangan / pembaca</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 text-emerald-900">
                      + Calon Siswa Bertanya / Masuk
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={registrantsFromMedsos}
                      onChange={(e) => setRegistrantsFromMedsos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 text-sm font-bold text-teal-700"
                    />
                    <span className="text-[10px] text-slate-500">Respon pendaftar</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tautan / Link Postingan Medsos (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/p/... atau link postingan Facebook / Berita"
                    value={mediaPostUrl}
                    onChange={(e) => setMediaPostUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* === KONTEN KHUSUS PILIHAN 3: SINKRON PENDAFTAR DAERAH & FORMULIR ONLINE WEB SENSEI === */}
            {reportCategory === 'sinkron_pendaftar' && (
              <div className="p-4.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-blue-700" />
                    Sinkronisasi Berkas Pendaftar Fisik vs Formulir Online Web
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    Target Wilayah: 75 Calon Siswa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Berkas Fisik Terkumpul (Panitia Daerah)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={offlineRegistrants}
                      onChange={(e) => handleOfflineChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-500">Formulir cetak & berkas fisik</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pendaftar Formulir Online Web SENSEI
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={onlineWebRegistrants}
                      onChange={(e) => handleOnlineChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-bold text-blue-900"
                    />
                    <span className="text-[10px] text-slate-500">Input formulir web</span>
                  </div>

                  <div className="bg-blue-100/70 p-3 rounded-xl border border-blue-300 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-blue-900">Total Valid Terinput:</span>
                    <span className="text-2xl font-black text-blue-950">
                      {totalValidatedRegistrants} <span className="text-xs font-normal text-blue-700">Calon Siswa</span>
                    </span>
                    <span className="text-[10px] text-blue-800 font-medium">
                      Otomatis tersinkron ke kuota 75
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Kelengkapan Berkas Persyaratan Beasiswa
                  </label>
                  <select
                    value={completenessStatus}
                    onChange={(e) => setCompletenessStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Lengkap (Formulir, SKTM & Rapor)">Lengkap (Formulir, SKTM & Rapor telah diverifikasi panitia daerah)</option>
                    <option value="Proses Melengkapi Berkas SKTM / Rapor">Proses Melengkapi Berkas (Menunggu SKTM / Legalisir Rapor)</option>
                    <option value="Sebagian Berkas Siap Validasi Pusat">Sebagian Berkas Siap Dikirim ke Pusat</option>
                  </select>
                </div>
              </div>
            )}

            {/* Narasi / Ringkasan Aktivitas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Ringkasan / Catatan Aktivitas
                </label>
                <span className="text-[11px] text-slate-400">
                  (Otomatis terisi jika dibiarkan kosong)
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan penting pelaksanaan, sambutan sekolah, kendala di lapangan, atau koordinasi tindak lanjut..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed"
              />
            </div>

            {/* MULTIPLE PHOTO UPLOAD SECTION */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    Lampiran Foto Dokumentasi Kegiatan ({photos.length} Foto Terpilih)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Unggah foto sosialisasi kelas, foto bersama guru/kepala sekolah, bukti tayangan medsos, atau berkas calon siswa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  disabled={isProcessingImages}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>+ Tambah Foto</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelected}
                className="hidden"
              />

              {/* Photos Preview Grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {photos.map((imgSrc, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-300 bg-black/10 shadow-xs">
                      <img
                        src={imgSrc}
                        alt={`Dokumentasi ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full opacity-80 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded">
                        Foto #{idx + 1}
                      </span>
                    </div>
                  ))}

                  {/* Add more photo card */}
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl aspect-video hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold">Tambah Foto</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleTriggerUpload}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer group"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 mx-auto mb-2 transition" />
                  <h5 className="text-xs font-bold text-slate-700 group-hover:text-emerald-900">
                    Klik di sini untuk unggah foto dokumentasi
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung file JPG, PNG, WEBP. Dapat memilih lebih dari 1 foto sekaligus.
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs group-hover:bg-emerald-700 transition">
                      <Camera className="w-3.5 h-3.5" />
                      Pilih Foto dari Komputer / HP
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Sample Image Helpers */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 flex-wrap">
                <span>Gunakan contoh foto siap pakai:</span>
                <button
                  type="button"
                  onClick={() => handleAddSamplePhotos('sekolah')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-400 font-medium cursor-pointer"
                >
                  + Foto Sosialisasi Kelas
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSamplePhotos('medsos')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-400 font-medium cursor-pointer"
                >
                  + Foto Bukti Medsos
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSamplePhotos('berkas')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-400 font-medium cursor-pointer"
                >
                  + Foto Berkas Calon Siswa
                </button>
              </div>

              {/* Catatan / Keterangan Foto Dokumentasi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Catatan Keterangan Foto / Tautan Bukti Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Foto penyerahan berkas formulir dan sesi foto bersama guru & kepala madrasah"
                  value={documentationNotes}
                  onChange={(e) => setDocumentationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Footer Form */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {isProcessingImages && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-800 text-xs font-medium animate-in fade-in">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <span>Sedang memproses & mengompresi foto dokumentasi...</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                  Panitia Pelapor: <span className="font-bold text-slate-800">{reporterName || `Panitia ${regionName}`}</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sedang Mengirim Laporan...' : 'Kirim Laporan & Foto Dokumentasi'}</span>
                  </button>
                </div>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
