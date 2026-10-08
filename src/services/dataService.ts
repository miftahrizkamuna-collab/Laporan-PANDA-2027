import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  increment
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase/config';
import { ReportItem, NotificationItem, RegionData } from '../types';

// 14 Provinsi Resmi Panitia Daerah SENSEI 2027 (Kondisi Kosong Siap Uji Coba)
export const INITIAL_REGIONS: RegionData[] = [
  {
    id: 'sumut',
    name: 'Sumatera Utara',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'sumbar',
    name: 'Sumatera Barat',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'sumsel',
    name: 'Sumatera Selatan',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'kepri',
    name: 'Kepulauan Riau',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'riau',
    name: 'Riau',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'lampung',
    name: 'Lampung',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'bengkulu',
    name: 'Bengkulu',
    island: 'Sumatera',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'jabar',
    name: 'Jawa Barat',
    island: 'Jawa',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'jateng',
    name: 'Jawa Tengah',
    island: 'Jawa',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'bali',
    name: 'Bali',
    island: 'Bali & Nusa Tenggara',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'ntb',
    name: 'NTB',
    island: 'Bali & Nusa Tenggara',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'kalbar',
    name: 'Kalimantan Barat',
    island: 'Kalimantan',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'kalsel',
    name: 'Kalimantan Selatan',
    island: 'Kalimantan',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  },
  {
    id: 'sulbar',
    name: 'Sulawesi Barat',
    island: 'Sulawesi',
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    status: 'active'
  }
];

// Seluruh Laporan Awal Dikosongkan (Siap untuk Uji Coba Input Pengguna)
export const INITIAL_REPORTS: ReportItem[] = [];

// Seluruh Notifikasi Awal Dikosongkan
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// Helper untuk inisialisasi database jika koleksi wilayah belum ada
export async function initFirestoreDataIfNeeded() {
  try {
    const regionsCol = collection(db, 'regions');
    const snapshot = await getDocs(regionsCol);
    if (snapshot.empty) {
      for (const reg of INITIAL_REGIONS) {
        await setDoc(doc(db, 'regions', reg.id), reg);
      }
    }
  } catch (error) {
    console.warn('Init firestore data check note:', error);
  }
}

// Fungsi manual untuk mengosongkan seluruh data kapan saja (untuk kebutuhan uji coba pengguna)
export async function clearAllDatabaseData() {
  try {
    // 1. Reset seluruh 14 provinsi ke nilai awal kosong (0 pendaftar, 0 sekolah, nama koordinator kosong)
    for (const reg of INITIAL_REGIONS) {
      await setDoc(doc(db, 'regions', reg.id), {
        ...reg,
        currentRegistrants: 0,
        currentSchoolsSdMi: 0,
        currentSchoolsSmpMts: 0,
        currentSchools: 0,
        coordinatorName: '',
        coordinatorPhone: '',
      });
    }

    // 2. Kosongkan koleksi laporan di Firestore
    const reportsCol = collection(db, 'reports');
    const repSnapshot = await getDocs(reportsCol);
    for (const docSnap of repSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    // 3. Kosongkan koleksi notifikasi di Firestore
    const notifsCol = collection(db, 'notifications');
    const notifSnapshot = await getDocs(notifsCol);
    for (const docSnap of notifSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    return true;
  } catch (error) {
    console.error('Clear all data error:', error);
    return false;
  }
}

// Alias untuk kompatibilitas
export const seedInitialFirestoreData = initFirestoreDataIfNeeded;

// Update data koordinator daerah oleh panitia / admin
export async function updateRegionCoordinator(
  regionId: string,
  coordinatorName: string,
  coordinatorPhone: string
) {
  try {
    const regRef = doc(db, 'regions', regionId);
    await updateDoc(regRef, {
      coordinatorName: coordinatorName.trim(),
      coordinatorPhone: coordinatorPhone.trim()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `regions/${regionId}`);
  }
}

// Add a new region dynamically with 75 registrants target and 15 SD / 5 SMP
export async function addNewRegion(newRegion: {
  id: string;
  name: string;
  island: string;
  targetRegistrants?: number;
  coordinatorName: string;
  coordinatorPhone: string;
}) {
  const cleanId = newRegion.id.toLowerCase().replace(/[^a-z0-9_-]/g, '') || `prop-${Date.now()}`;
  const fullRegionData: RegionData = {
    id: cleanId,
    name: newRegion.name,
    island: newRegion.island,
    targetRegistrants: 75, // Standar target tiap daerah: 75 calon siswa
    currentRegistrants: 0,
    targetSchoolsSdMi: 15, // Standar minimal 15 SD/MI
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5, // Standar minimal 5 SMP/MTs
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: newRegion.coordinatorName,
    coordinatorPhone: newRegion.coordinatorPhone,
    status: 'active'
  };

  try {
    await setDoc(doc(db, 'regions', cleanId), fullRegionData);

    const notifId = `notif-reg-${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      title: `Wilayah Baru Terdaftar: ${newRegion.name}`,
      message: `Panitia daerah Provinsi ${newRegion.name} telah berhasil didaftarkan ke sistem SENSEI 2027 (Target: 75 Calon Siswa, 15 SD/MI, 5 SMP/MTs).`,
      type: 'announcement',
      targetRole: 'all',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `regions/${cleanId}`);
  }
}

// Menghapus wilayah dari sistem oleh Admin Pusat
export async function deleteRegion(regionId: string, regionName: string) {
  try {
    await deleteDoc(doc(db, 'regions', regionId));

    const notifId = `notif-del-reg-${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      title: `Wilayah Dihapus: ${regionName}`,
      message: `Panitia daerah Provinsi ${regionName} telah dihapus dari sistem SENSEI 2027 oleh Admin Pusat.`,
      type: 'announcement',
      targetRole: 'all',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `regions/${regionId}`);
    return false;
  }
}

// Subscribe to real-time reports
export function subscribeToReports(callback: (reports: ReportItem[]) => void) {
  try {
    const q = query(collection(db, 'reports'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ReportItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as ReportItem);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        callback([]);
        try {
          handleFirestoreError(error, OperationType.LIST, 'reports');
        } catch (e) {
          console.warn('Reports listener note:', e);
        }
      }
    );
  } catch (err) {
    console.error('Error attaching reports listener:', err);
    callback([]);
    return () => {};
  }
}

// Subscribe to real-time notifications
export function subscribeToNotifications(callback: (notifs: NotificationItem[]) => void) {
  try {
    const q = query(collection(db, 'notifications'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        callback([]);
        try {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        } catch (e) {
          console.warn('Notifications listener note:', e);
        }
      }
    );
  } catch (err) {
    console.error('Error attaching notifications listener:', err);
    callback([]);
    return () => {};
  }
}

// Subscribe to real-time regions
export function subscribeToRegions(callback: (regions: RegionData[]) => void) {
  try {
    const q = query(collection(db, 'regions'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: RegionData[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as RegionData);
        });
        items.sort((a, b) => a.name.localeCompare(b.name));
        callback(items.length > 0 ? items : INITIAL_REGIONS);
      },
      (error) => {
        callback(INITIAL_REGIONS);
        try {
          handleFirestoreError(error, OperationType.LIST, 'regions');
        } catch (e) {
          console.warn('Regions listener note:', e);
        }
      }
    );
  } catch (err) {
    console.error('Error attaching regions listener:', err);
    callback(INITIAL_REGIONS);
    return () => {};
  }
}

// Submit a new activity report with automatic notification trigger
export async function submitReport(reportData: Omit<ReportItem, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const newId = `rep-${Date.now()}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const photos = reportData.documentationPhotos || [];
  const primaryImageUrl = photos.length > 0 ? photos[0] : (reportData.documentationImageUrl || undefined);

  const newReport: ReportItem = {
    ...reportData,
    id: newId,
    documentationImageUrl: primaryImageUrl,
    documentationPhotos: photos,
    isFeaturedDocumentation: photos.length > 0 || !!primaryImageUrl || !!reportData.documentationNotes,
    status: 'pending',
    createdAt: nowStr,
  };

  try {
    // 1. Save report
    await setDoc(doc(db, 'reports', newId), newReport);

    // 2. Update region counters for registrants and SD/SMP breakdown
    const sdAdded = Number(reportData.schoolsSdMiVisited) || 0;
    const smpAdded = Number(reportData.schoolsSmpMtsVisited) || 0;
    const totalSchoolsAdded = (sdAdded + smpAdded) || Number(reportData.schoolsVisited) || 0;
    const registrantsAdded = Number(reportData.registrantsAdded) || 0;

    if (registrantsAdded > 0 || totalSchoolsAdded > 0) {
      try {
        const regRef = doc(db, 'regions', reportData.regionId);
        const updatePayload: Record<string, ReturnType<typeof increment>> = {};
        if (registrantsAdded > 0) {
          updatePayload.currentRegistrants = increment(registrantsAdded);
        }
        if (sdAdded > 0) {
          updatePayload.currentSchoolsSdMi = increment(sdAdded);
        }
        if (smpAdded > 0) {
          updatePayload.currentSchoolsSmpMts = increment(smpAdded);
        }
        if (totalSchoolsAdded > 0) {
          updatePayload.currentSchools = increment(totalSchoolsAdded);
        }

        await updateDoc(regRef, updatePayload);
      } catch (e) {
        console.warn('Update region counter fallback:', e);
      }
    }

    // 3. Create AUTOMATED NOTIFICATION for Admin Pusat SMART
    const notifId = `notif-${Date.now()}`;
    const typeLabel = 
      reportData.type === 'sosialisasi_sekolah' ? 'Sosialisasi Sekolah' :
      reportData.type === 'sosialisasi_medsos' ? 'Sosialisasi Medsos' :
      reportData.type === 'sinkron_pendaftar' ? 'Sinkron Pendaftar' : 'Aktivitas';

    const autoNotif: NotificationItem = {
      id: notifId,
      title: `Laporan [${typeLabel}]: Provinsi ${reportData.regionName}`,
      message: `${reportData.reporterName} melaporkan "${reportData.title}" (${registrantsAdded > 0 ? `+${registrantsAdded} calon siswa, ` : ''}${photos.length} foto dilampirkan). Segera verifikasi!`,
      type: 'new_report',
      reportId: newId,
      targetRole: 'admin_pusat',
      targetRegionId: reportData.regionId,
      createdAt: nowStr,
      isRead: false
    };

    await setDoc(doc(db, 'notifications', notifId), autoNotif);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reports/${newId}`);
  }
}

// Verify or request revision on a report with automatic notification to region committee
export async function verifyReport(
  reportId: string, 
  status: 'verified' | 'needs_revision' | 'rejected', 
  verifierName: string, 
  notes: string,
  reportInfo: { title: string; regionId: string; regionName: string }
) {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const path = `reports/${reportId}`;

  try {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      verifiedBy: verifierName,
      verificationNotes: notes,
      verifiedAt: nowStr,
      updatedAt: nowStr
    });

    const notifId = `notif-verif-${Date.now()}`;
    const isVerified = status === 'verified';
    const notifTitle = isVerified 
      ? `Laporan Diverifikasi: ${reportInfo.title}` 
      : status === 'needs_revision'
        ? `Perlu Revisi: ${reportInfo.title}`
        : `Laporan Ditolak: ${reportInfo.title}`;

    const notifMsg = isVerified
      ? `Laporan "${reportInfo.title}" dari Provinsi ${reportInfo.regionName} telah diverifikasi oleh ${verifierName}. ${notes ? `Catatan: "${notes}"` : ''}`
      : `Admin Pusat SMART meminta evaluasi/revisi untuk laporan "${reportInfo.title}". Catatan: "${notes || 'Mohon lengkapi dokumentasi berkas'}"`;

    const autoNotif: NotificationItem = {
      id: notifId,
      title: notifTitle,
      message: notifMsg,
      type: isVerified ? 'report_verified' : 'revision_needed',
      reportId,
      targetRole: 'panitia_wilayah',
      targetRegionId: reportInfo.regionId,
      createdAt: nowStr,
      isRead: false
    };

    await setDoc(doc(db, 'notifications', notifId), autoNotif);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Mark notifications as read
export async function markNotificationAsRead(notifId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), {
      isRead: true
    });
  } catch (error) {
    console.warn('Mark notif read error:', error);
  }
}
