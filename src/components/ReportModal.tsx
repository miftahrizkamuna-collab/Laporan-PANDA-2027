import React, { useState, useRef } from 'react';
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
  Table
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
      schoolName: '',
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
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Auto-sync total for sinkron_pendaftar when offline or online numbers change
  const handleOfflineChange = (val: number) => {
    setOfflineRegistrants(val);
    setTotalValidatedRegistrants(val + onlineWebRegistrants);
  };

  const handleOnlineChange = (val: number) => {
    setOnlineWebRegistrants(val);
    setTotalValidatedRegistrants(offlineRegistrants + val);
  };

  // Compress & convert file to Base64 image
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

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
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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
          newImages.push(base64);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let totalRegistrants = 0;
    let totalSchools = 0;
    let sdCount = 0;
    let smpCount = 0;
    let audience = 0;
    let autoDesc = description.trim();
    let schoolNamesSummary = '';
    let validSchoolVisits: SchoolVisitItem[] | undefined = undefined;

    if (reportCategory === 'sosialisasi_sekolah') {
      const activeSchools = schoolRows.filter(r => r.schoolName.trim().length > 0);
      const rowsToSave = activeSchools.length > 0 ? activeSchools : schoolRows;

      validSchoolVisits = rowsToSave;
      sdCount = rowsToSave.filter(r => r.category === 'sd_mi').length;
      smpCount = rowsToSave.filter(r => r.category === 'smp_mts').length;
      totalSchools = sdCount + smpCount;
      totalRegistrants = rowsToSave.reduce((sum, r) => sum + (Number(r.registrantsDirect) || 0), 0);
      audience = rowsToSave.reduce((sum, r) => sum + (Number(r.studentsReached) || 0), 0);
      schoolNamesSummary = rowsToSave.map(r => r.schoolName.trim()).filter(Boolean).join(', ');

      if (!autoDesc) {
        autoDesc = `Sosialisasi tatap muka dilaksanakan di ${totalSchools} sekolah: ${schoolNamesSummary || 'Sekolah sasaran'}. Menjangkau ${audience} siswa dan mengumpulkan ${totalRegistrants} berkas calon siswa baru.`;
      }
    } else if (reportCategory === 'sosialisasi_medsos') {
      totalRegistrants = Number(registrantsFromMedsos) || 0;
      audience = Number(digitalAudienceReach) || 0;
      if (!autoDesc) {
        autoDesc = `Publikasi sosialisasi digital melalui ${mediaPlatform} dengan estimasi capaian ${audience} jangkauan/tayangan. Tautan: ${mediaPostUrl || '-'}`;
      }
    } else if (reportCategory === 'sinkron_pendaftar') {
      totalRegistrants = Number(totalValidatedRegistrants) || 0;
      if (!autoDesc) {
        autoDesc = `Sinkronisasi pendaftar daerah: ${offlineRegistrants} berkas fisik panitia daerah dan ${onlineWebRegistrants} formulir online web SENSEI. Status berkas: ${completenessStatus}.`;
      }
    }

    try {
      setIsSubmitting(true);
      await submitReport({
        regionId,
        regionName,
        reporterId,
        reporterName,
        reporterEmail,
        type: reportCategory as ReportType,
        title: title.trim(),
        description: autoDesc,
        activityDate,
        registrantsAdded: totalRegistrants,
        schoolsVisited: totalSchools,
        schoolsSdMiVisited: sdCount,
        schoolsSmpMtsVisited: smpCount,
        audienceReached: audience,
        documentationNotes: documentationNotes.trim(),
        documentationPhotos: photos,
        documentationImageUrl: photos.length > 0 ? photos[0] : undefined,
        schoolNames: schoolNamesSummary || undefined,
        schoolVisits: validSchoolVisits,
        mediaPlatform: mediaPlatform.trim() || undefined,
        mediaPostUrl: mediaPostUrl.trim() || undefined,
        offlineRegistrantsCount: Number(offlineRegistrants) || 0,
        onlineWebRegistrantsCount: Number(onlineWebRegistrants) || 0,
        documentCompletenessStatus: completenessStatus,
      });

      playNotificationTone('success');
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.65 }
      });

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        setIsSubmitting(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      console.error('Submit report failed:', err);
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
              Pilih salah satu dari 3 kategori laporan di bawah ini dan lampirkan foto dokumentasi kegiatan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSuccessToast ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-1">Laporan Berhasil Terkirim!</h4>
            <p className="text-slate-600 text-sm max-w-md">
              Laporan beserta tabel sekolah dan {photos.length} foto dokumentasi telah tersimpan ke sistem Firestore dan diteruskan ke Admin Pusat SMART untuk proses verifikasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            
            {/* 3 PILIHAN LAPORAN UTAMA */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Pilih Jenis Laporan Kegiatan (3 Pilihan Utama) *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. SOSIALISASI KE SEKOLAH */}
                <button
                  type="button"
                  onClick={() => {
                    setReportCategory('sosialisasi_sekolah');
                    if (!title) setTitle(`Sosialisasi SENSEI 2027 di Sekolah Sasaran`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
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
                  onClick={() => {
                    setReportCategory('sosialisasi_medsos');
                    if (!title) setTitle(`Publikasi Medsos & Broadcast Beasiswa SENSEI`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
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
                  onClick={() => {
                    setReportCategory('sinkron_pendaftar');
                    if (!title) setTitle(`Sinkronisasi Berkas Pendaftar Fisik vs Formulir Online Web`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
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

            {/* FORM INPUT SESUAI PILIHAN YANG AKTIF */}

            {/* Judul & Tanggal Pelaksanaan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Laporan *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    reportCategory === 'sosialisasi_sekolah'
                      ? 'Contoh: Sosialisasi SENSEI di Wilayah Kab. Bogor (3 SD/MI & 1 SMP)'
                      : reportCategory === 'sosialisasi_medsos'
                        ? 'Contoh: Siaran Poster Beasiswa di Instagram & Broadcast Grup Guru SD/MI'
                        : 'Contoh: Sinkronisasi Berkas Fisik vs Formulir Online Web Periode 1'
                  }
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
                  required
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* === KONTEN KHUSUS PILIHAN 1: SOSIALISASI KE SEKOLAH (INPUT TABEL DENGAN SETIAP BARIS 1 SEKOLAH + CONTACT PERSON) === */}
            {reportCategory === 'sosialisasi_sekolah' && (
              <div className="p-4.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-emerald-700" />
                      Tabel Kunjungan Sekolah Sasaran & Contact Person
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Input setiap baris untuk 1 sekolah yang dikunjungi beserta narahubung/contact person sekolah.
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
                              required
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
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
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
                    type="url"
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
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-blue-700" />
                    Sinkronisasi & Rekonsiliasi Data Pendaftar
                  </span>
                  <span className="text-[11px] text-blue-700 font-bold">
                    Target Wilayah: 75 Calon Siswa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      (A) Berkas Fisik Panitia Daerah
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={offlineRegistrants}
                      onChange={(e) => handleOfflineChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500">Berkas fisik diterima panitia</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      (B) Formulir Online Web SENSEI
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={onlineWebRegistrants}
                      onChange={(e) => handleOnlineChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-blue-800"
                    />
                    <span className="text-[10px] text-slate-500">Akun terdaftar di formulir web</span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      (=) Total Valid Masuk Kuota
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalValidatedRegistrants}
                      onChange={(e) => setTotalValidatedRegistrants(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-emerald-400 text-sm font-extrabold text-emerald-800"
                    />
                    <span className="text-[10px] text-emerald-700">Akumulasi calon siswa valid</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Kelengkapan Dokumen / Berkas
                  </label>
                  <select
                    value={completenessStatus}
                    onChange={(e) => setCompletenessStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Lengkap (Formulir, SKTM & Rapor)">Lengkap (Formulir, SKTM & Rapor Calon Siswa Siap Verifikasi)</option>
                    <option value="Sebagian Kurang SKTM (Dalam Proses Pengurusan)">Sebagian Kurang SKTM (Dalam Proses Pengurusan Desa/Kelurahan)</option>
                    <option value="Sebagian Kurang Rapor / Surat Rekomendasi Sekolah">Sebagian Kurang Legalisir Rapor / Rekomendasi Sekolah</option>
                    <option value="Semua Berkas Fisik & Online Terverifikasi Valid">Semua Berkas Fisik & Online Terverifikasi Valid 100%</option>
                  </select>
                </div>
              </div>
            )}

            {/* Rincian & Deskripsi Kegiatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rincian & Catatan Aktivitas *
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  reportCategory === 'sosialisasi_sekolah'
                    ? 'Jelaskan jalannya sosialisasi, sambutan kepala sekolah/guru BK, dan respon calon siswa dhuafa berprestasi...'
                    : reportCategory === 'sosialisasi_medsos'
                      ? 'Rincikan caption postingan, target audiens, dan pertanyaan yang paling banyak diajukan calon pendaftar...'
                      : 'Rincikan hasil pencocokan data fisik dengan formulir website SENSEI, kendala kelengkapan berkas, dsb...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
              />
            </div>

            {/* === UPLOAD FOTO DOKUMENTASI (UPLOAD IMAGE SAJA + TOMBOL TAMBAH FOTO) === */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    Foto Dokumentasi Kegiatan (Upload Image dari Perangkat) *
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Unggah bukti foto sosialisasi sekolah, tangkapan layar medsos, atau dokumen berkas.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {photos.length} Foto Terpilih
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />

              {/* Preview Uploaded Photos */}
              {photos.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-video shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Dokumentasi ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Foto {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white shadow-xs transition"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Tombol "+ Tambah Foto" di samping preview */}
                    <button
                      type="button"
                      onClick={handleTriggerUpload}
                      disabled={isProcessingImages}
                      className="border-2 border-dashed border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl aspect-video flex flex-col items-center justify-center p-2 text-emerald-800 transition cursor-pointer group"
                    >
                      <Plus className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold">+ Tambah Foto</span>
                      <span className="text-[10px] text-emerald-600">Pilih gambar lain</span>
                    </button>
                  </div>

                  {/* Tombol Aksi Tambahan */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={handleTriggerUpload}
                      disabled={isProcessingImages}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Foto Lainnya</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotos([])}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Hapus Semua Foto
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={handleTriggerUpload}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 rounded-2xl p-6 text-center transition cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center mx-auto mb-2 transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition">
                    Klik untuk Upload Foto Dokumentasi dari Perangkat
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

              {/* Quick Sample Image Helpers for testing convenience */}
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
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Panitia Pelapor: <span className="font-bold text-slate-800">{reporterName}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingImages}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan & Foto Dokumentasi'}
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
