import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ReportItem, NotificationItem, RegionData } from '../types';

// Storage keys for Zero-API local persistence (Free forever, unlimited, 0 quota)
const STORAGE_KEYS = {
  REGIONS: 'sensei_2027_regions_v1',
  REPORTS: 'sensei_2027_reports_v1',
  NOTIFICATIONS: 'sensei_2027_notifications_v1',
  INITIALIZED: 'sensei_2027_initialized_v1',
};

// 14 Provinsi Resmi Panitia Daerah SENSEI 2027 + Unit Roadshow Panitia Pusat Jabodetabek
export const INITIAL_REGIONS: RegionData[] = [
  {
    id: 'jabodetabek',
    name: 'Jabodetabek (Roadshow Panitia Pusat)',
    island: 'Khusus Roadshow Pusat',
    targetRegistrants: 100,
    currentRegistrants: 0,
    targetSchoolsSdMi: 10,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 15,
    currentSchools: 0,
    coordinatorName: 'Tim Roadshow Panitia Pusat SMART',
    coordinatorPhone: '0812-8888-2027',
    status: 'active'
  },
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
    id: 'jatim',
    name: 'Jawa Timur',
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
    id: 'diy',
    name: 'DI Yogyakarta',
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
    id: 'banten',
    name: 'Banten',
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

export const INITIAL_REPORTS: ReportItem[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// In-memory cache guarantees 100% immediate data availability
let inMemoryRegions: RegionData[] = [...INITIAL_REGIONS];
let inMemoryReports: ReportItem[] = [];
let inMemoryNotifs: NotificationItem[] = [];

// Utility: Clean any undefined values before sending to Firestore
function sanitizeForFirestore(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean;
}

// ==========================================
// ZERO-API LOCAL STORAGE ENGINE (100% GRATIS)
// ==========================================

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (key === STORAGE_KEYS.REGIONS && inMemoryRegions.length > 0) return inMemoryRegions as unknown as T;
      if (key === STORAGE_KEYS.REPORTS && inMemoryReports.length > 0) return inMemoryReports as unknown as T;
      if (key === STORAGE_KEYS.NOTIFICATIONS && inMemoryNotifs.length > 0) return inMemoryNotifs as unknown as T;
      return defaultValue;
    }
    const parsed = JSON.parse(raw) as T;
    // Keep in-memory cache updated without overwriting newer in-memory items
    if (key === STORAGE_KEYS.REGIONS && Array.isArray(parsed)) inMemoryRegions = parsed as unknown as RegionData[];
    if (key === STORAGE_KEYS.REPORTS && Array.isArray(parsed)) {
      if (inMemoryReports.length > parsed.length) {
        return inMemoryReports as unknown as T;
      }
      inMemoryReports = parsed as unknown as ReportItem[];
    }
    if (key === STORAGE_KEYS.NOTIFICATIONS && Array.isArray(parsed)) {
      if (inMemoryNotifs.length > parsed.length) {
        return inMemoryNotifs as unknown as T;
      }
      inMemoryNotifs = parsed as unknown as NotificationItem[];
    }
    return parsed;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    if (key === STORAGE_KEYS.REPORTS && inMemoryReports.length > 0) return inMemoryReports as unknown as T;
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  // Always update in-memory cache first
  if (key === STORAGE_KEYS.REGIONS && Array.isArray(value)) inMemoryRegions = value as unknown as RegionData[];
  if (key === STORAGE_KEYS.REPORTS && Array.isArray(value)) inMemoryReports = value as unknown as ReportItem[];
  if (key === STORAGE_KEYS.NOTIFICATIONS && Array.isArray(value)) inMemoryNotifs = value as unknown as NotificationItem[];

  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage quota notice for ${key}, falling back to compact/safe storage:`, e);
    // If reports exceed localStorage 5MB limit, strip photos to preserve report metadata 100%
    if (key === STORAGE_KEYS.REPORTS && Array.isArray(value)) {
      try {
        const lightweight = (value as ReportItem[]).map((r) => ({
          ...r,
          // Strip base64 data URLs to guarantee report text, dates, numbers and status are saved
          documentationPhotos: (r.documentationPhotos || []).filter(p => !p.startsWith('data:image')),
          documentationImageUrl: (r.documentationImageUrl && r.documentationImageUrl.startsWith('data:image')) 
            ? undefined 
            : r.documentationImageUrl,
        }));
        localStorage.setItem(key, JSON.stringify(lightweight));
      } catch {
        // If still full, in-memory cache remains active
      }
    }
  }

  // Dispatch local custom event for instant same-window reactivity
  window.dispatchEvent(new CustomEvent('sensei_sync', { detail: { key } }));
}

// Inisialisasi awal penyimpanan lokal jika kosong
function ensureLocalDataInitialized(): void {
  if (typeof window === 'undefined') return;
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    setLocalData(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
    setLocalData(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } else {
    // Populate in-memory cache and ensure any newly added default region (e.g. Jabodetabek) exists
    const current = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
    const existingIds = new Set(current.map(r => r.id));
    const missing = INITIAL_REGIONS.filter(r => !existingIds.has(r.id));
    let updated = [...current, ...missing];
    // Sync Jabodetabek target to 15 schools (SD dan SMP)
    updated = updated.map(r => {
      if (r.id === 'jabodetabek') {
        return {
          ...r,
          targetSchools: 15,
          targetSchoolsSdMi: 10,
          targetSchoolsSmpMts: 5,
        };
      }
      return r;
    });
    setLocalData(STORAGE_KEYS.REGIONS, updated);
    getLocalData(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    getLocalData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
}

// Helper untuk inisialisasi database jika koleksi wilayah belum ada
export async function initFirestoreDataIfNeeded() {
  ensureLocalDataInitialized();
  try {
    const regionsCol = collection(db, 'regions');
    const snapshot = await getDocs(regionsCol);
    if (snapshot.empty) {
      const currentLocal = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
      for (const reg of currentLocal) {
        const cleanReg = sanitizeForFirestore(reg) as Record<string, unknown>;
        setDoc(doc(db, 'regions', reg.id), cleanReg).catch(() => {});
      }
    } else {
      // Ensure jabodetabek document exists in Firestore
      const jSnap = await getDoc(doc(db, 'regions', 'jabodetabek')).catch(() => null);
      if (!jSnap || !jSnap.exists()) {
        const jData = INITIAL_REGIONS.find(r => r.id === 'jabodetabek');
        if (jData) {
          const clean = sanitizeForFirestore(jData) as Record<string, unknown>;
          setDoc(doc(db, 'regions', 'jabodetabek'), clean).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.warn('Firestore sync note (berjalan dalam mode lokal bebas kuota):', error);
  }
}

// Alias untuk kompatibilitas
export const seedInitialFirestoreData = initFirestoreDataIfNeeded;

// Fungsi manual untuk mengosongkan seluruh data kapan saja (untuk kebutuhan uji coba pengguna)
export async function clearAllDatabaseData(): Promise<boolean> {
  const resetRegions: RegionData[] = INITIAL_REGIONS.map(reg => ({
    ...reg,
    currentRegistrants: 0,
    currentSchoolsSdMi: 0,
    currentSchoolsSmpMts: 0,
    currentSchools: 0,
    coordinatorName: '',
    coordinatorPhone: '',
  }));

  setLocalData(STORAGE_KEYS.REGIONS, resetRegions);
  setLocalData(STORAGE_KEYS.REPORTS, []);
  setLocalData(STORAGE_KEYS.NOTIFICATIONS, []);

  // Background Firestore sync
  try {
    for (const reg of resetRegions) {
      setDoc(doc(db, 'regions', reg.id), sanitizeForFirestore(reg) as Record<string, unknown>).catch(() => {});
    }
    getDocs(collection(db, 'reports')).then((repSnapshot) => {
      repSnapshot.docs.forEach((docSnap) => deleteDoc(docSnap.ref).catch(() => {}));
    }).catch(() => {});
    getDocs(collection(db, 'notifications')).then((notifSnapshot) => {
      notifSnapshot.docs.forEach((docSnap) => deleteDoc(docSnap.ref).catch(() => {}));
    }).catch(() => {});
  } catch (error) {
    console.warn('Clear Firestore background sync note:', error);
  }

  return true;
}

// Update data koordinator daerah oleh panitia / admin
export async function updateRegionCoordinator(
  regionId: string,
  coordinatorName: string,
  coordinatorPhone: string
) {
  const regions = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
  const updated = regions.map(r => {
    if (r.id === regionId) {
      return {
        ...r,
        coordinatorName: coordinatorName.trim(),
        coordinatorPhone: coordinatorPhone.trim()
      };
    }
    return r;
  });
  setLocalData(STORAGE_KEYS.REGIONS, updated);

  try {
    const regRef = doc(db, 'regions', regionId);
    updateDoc(regRef, {
      coordinatorName: coordinatorName.trim(),
      coordinatorPhone: coordinatorPhone.trim()
    }).catch(() => {});
  } catch (error) {
    console.warn('Firestore updateRegionCoordinator note:', error);
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
    targetRegistrants: 75,
    currentRegistrants: 0,
    targetSchoolsSdMi: 15,
    currentSchoolsSdMi: 0,
    targetSchoolsSmpMts: 5,
    currentSchoolsSmpMts: 0,
    targetSchools: 20,
    currentSchools: 0,
    coordinatorName: newRegion.coordinatorName,
    coordinatorPhone: newRegion.coordinatorPhone,
    status: 'active'
  };

  const notifId = `notif-reg-${Date.now()}`;
  const autoNotif: NotificationItem = {
    id: notifId,
    title: `Wilayah Baru Terdaftar: ${newRegion.name}`,
    message: `Panitia daerah Provinsi ${newRegion.name} telah berhasil didaftarkan ke sistem SENSEI 2027 (Target: 75 Calon Siswa, 15 SD/MI, 5 SMP/MTs).`,
    type: 'announcement',
    targetRole: 'all',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    isRead: false
  };

  const currentRegions = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
  const updatedRegions = [...currentRegions.filter(r => r.id !== cleanId), fullRegionData];
  setLocalData(STORAGE_KEYS.REGIONS, updatedRegions);

  const currentNotifs = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  setLocalData(STORAGE_KEYS.NOTIFICATIONS, [autoNotif, ...currentNotifs]);

  try {
    setDoc(doc(db, 'regions', cleanId), sanitizeForFirestore(fullRegionData) as Record<string, unknown>).catch(() => {});
    setDoc(doc(db, 'notifications', notifId), sanitizeForFirestore(autoNotif) as Record<string, unknown>).catch(() => {});
  } catch (error) {
    console.warn('Firestore addNewRegion note:', error);
  }
}

// Menghapus wilayah dari sistem oleh Admin Pusat
export async function deleteRegion(regionId: string, regionName: string): Promise<boolean> {
  const notifId = `notif-del-reg-${Date.now()}`;
  const autoNotif: NotificationItem = {
    id: notifId,
    title: `Wilayah Dihapus: ${regionName}`,
    message: `Panitia daerah Provinsi ${regionName} telah dihapus dari sistem SENSEI 2027 oleh Admin Pusat.`,
    type: 'announcement',
    targetRole: 'all',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    isRead: false
  };

  const currentRegions = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
  setLocalData(STORAGE_KEYS.REGIONS, currentRegions.filter(r => r.id !== regionId));

  const currentNotifs = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  setLocalData(STORAGE_KEYS.NOTIFICATIONS, [autoNotif, ...currentNotifs]);

  try {
    deleteDoc(doc(db, 'regions', regionId)).catch(() => {});
    setDoc(doc(db, 'notifications', notifId), sanitizeForFirestore(autoNotif) as Record<string, unknown>).catch(() => {});
  } catch (error) {
    console.warn('Firestore deleteRegion note:', error);
  }

  return true;
}

// Subscribe to real-time reports (Dual Engine: Local + Firestore)
export function subscribeToReports(callback: (reports: ReportItem[]) => void) {
  ensureLocalDataInitialized();

  // 1. Emit local data immediately
  const emitCurrent = () => {
    const local = getLocalData<ReportItem[]>(STORAGE_KEYS.REPORTS, inMemoryReports);
    const source = (inMemoryReports.length >= local.length) ? inMemoryReports : local;
    const sorted = [...source].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(sorted);
  };
  emitCurrent();

  // 2. Listen to local cross-component events
  const handleLocalSync = (e: Event) => {
    const custom = e as CustomEvent<{ key?: string }>;
    if (!custom.detail?.key || custom.detail.key === STORAGE_KEYS.REPORTS) {
      emitCurrent();
    }
  };
  window.addEventListener('sensei_sync', handleLocalSync);
  window.addEventListener('storage', handleLocalSync);

  // 3. Optional Firestore listener
  let unsubFirestore: (() => void) | null = null;
  try {
    const q = query(collection(db, 'reports'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const items: ReportItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as ReportItem);
        });
        if (items.length > 0) {
          const local = getLocalData<ReportItem[]>(STORAGE_KEYS.REPORTS, inMemoryReports);
          const remoteIds = new Set(items.map(i => i.id));
          const localOnly = local.filter(l => !remoteIds.has(l.id));
          const merged = [...items, ...localOnly];
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLocalData(STORAGE_KEYS.REPORTS, merged);
          callback(merged);
        }
      },
      (error) => {
        console.warn('Reports Firestore offline/quota notice (menggunakan mode lokal):', error);
      }
    );
  } catch (err) {
    console.warn('Firestore reports subscription error (menggunakan mode lokal):', err);
  }

  return () => {
    window.removeEventListener('sensei_sync', handleLocalSync);
    window.removeEventListener('storage', handleLocalSync);
    if (unsubFirestore) unsubFirestore();
  };
}

// Subscribe to real-time notifications (Dual Engine: Local + Firestore)
export function subscribeToNotifications(callback: (notifs: NotificationItem[]) => void) {
  ensureLocalDataInitialized();

  const emitCurrent = () => {
    const local = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, inMemoryNotifs);
    local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(local);
  };
  emitCurrent();

  const handleLocalSync = (e: Event) => {
    const custom = e as CustomEvent<{ key?: string }>;
    if (!custom.detail?.key || custom.detail.key === STORAGE_KEYS.NOTIFICATIONS) {
      emitCurrent();
    }
  };
  window.addEventListener('sensei_sync', handleLocalSync);
  window.addEventListener('storage', handleLocalSync);

  let unsubFirestore: (() => void) | null = null;
  try {
    const q = query(collection(db, 'notifications'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const items: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
        });
        if (items.length > 0) {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLocalData(STORAGE_KEYS.NOTIFICATIONS, items);
          callback(items);
        }
      },
      (error) => {
        console.warn('Notifications Firestore notice (menggunakan mode lokal):', error);
      }
    );
  } catch (err) {
    console.warn('Firestore notifications subscription error:', err);
  }

  return () => {
    window.removeEventListener('sensei_sync', handleLocalSync);
    window.removeEventListener('storage', handleLocalSync);
    if (unsubFirestore) unsubFirestore();
  };
}

// Subscribe to real-time regions (Dual Engine: Local + Firestore)
export function subscribeToRegions(callback: (regions: RegionData[]) => void) {
  ensureLocalDataInitialized();

  const emitCurrent = () => {
    const local = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, inMemoryRegions);
    local.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(local.length > 0 ? local : INITIAL_REGIONS);
  };
  emitCurrent();

  const handleLocalSync = (e: Event) => {
    const custom = e as CustomEvent<{ key?: string }>;
    if (!custom.detail?.key || custom.detail.key === STORAGE_KEYS.REGIONS) {
      emitCurrent();
    }
  };
  window.addEventListener('sensei_sync', handleLocalSync);
  window.addEventListener('storage', handleLocalSync);

  let unsubFirestore: (() => void) | null = null;
  try {
    const q = query(collection(db, 'regions'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const items: RegionData[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as RegionData);
        });
        if (items.length > 0) {
          const remoteMap = new Map(items.map(r => [r.id, r]));
          const merged: RegionData[] = INITIAL_REGIONS.map(initial => {
            const remote = remoteMap.get(initial.id);
            if (!remote) return initial;
            return {
              ...initial,
              ...remote,
              name: remote.name || initial.name,
              island: remote.island || initial.island,
            };
          });
          items.forEach(r => {
            if (!INITIAL_REGIONS.some(init => init.id === r.id)) {
              merged.push({
                ...r,
                name: r.name || `Wilayah ${r.id}`,
                island: r.island || 'Indonesia',
              });
            }
          });
          merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setLocalData(STORAGE_KEYS.REGIONS, merged);
          callback(merged);
        }
      },
      (error) => {
        console.warn('Regions Firestore notice (menggunakan mode lokal):', error);
      }
    );
  } catch (err) {
    console.warn('Firestore regions subscription error:', err);
  }

  return () => {
    window.removeEventListener('sensei_sync', handleLocalSync);
    window.removeEventListener('storage', handleLocalSync);
    if (unsubFirestore) unsubFirestore();
  };
}

// Submit a new activity report with automatic notification trigger
export async function submitReport(reportData: Omit<ReportItem, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const newId = `rep-${Date.now()}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const photos = reportData.documentationPhotos || [];
  const primaryImageUrl = photos.length > 0 ? photos[0] : (reportData.documentationImageUrl || undefined);
  const cleanDriveUrl = (reportData.googleDriveUrl || '').trim();

  const newReport: ReportItem = {
    ...reportData,
    id: newId,
    documentationImageUrl: primaryImageUrl,
    documentationPhotos: photos,
    googleDriveUrl: cleanDriveUrl || undefined,
    isFeaturedDocumentation: !!cleanDriveUrl || photos.length > 0 || !!primaryImageUrl || !!reportData.documentationNotes,
    status: 'pending',
    createdAt: nowStr,
  };

  const sdAdded = Number(reportData.schoolsSdMiVisited) || 0;
  const smpAdded = Number(reportData.schoolsSmpMtsVisited) || 0;
  const totalSchoolsAdded = (sdAdded + smpAdded) || Number(reportData.schoolsVisited) || 0;
  const registrantsAdded = Number(reportData.registrantsAdded) || 0;

  // 1. Simpan ke Local Storage & Memory Segera (Bebas Kuota, 100% Berhasil Instan)
  const currentReports = getLocalData<ReportItem[]>(STORAGE_KEYS.REPORTS, inMemoryReports);
  setLocalData(STORAGE_KEYS.REPORTS, [newReport, ...currentReports]);

  // Update counters lokal untuk provinsi terkait
  const currentRegions = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, inMemoryRegions);
  const updatedRegions = currentRegions.map(reg => {
    if (reg.id === reportData.regionId) {
      return {
        ...reg,
        currentRegistrants: (reg.currentRegistrants || 0) + registrantsAdded,
        currentSchoolsSdMi: (reg.currentSchoolsSdMi || 0) + sdAdded,
        currentSchoolsSmpMts: (reg.currentSchoolsSmpMts || 0) + smpAdded,
        currentSchools: (reg.currentSchools || 0) + totalSchoolsAdded,
      };
    }
    return reg;
  });
  setLocalData(STORAGE_KEYS.REGIONS, updatedRegions);

  // Buat notifikasi lokal untuk Admin Pusat
  const notifId = `notif-${Date.now()}`;
  const typeLabel = 
    reportData.type === 'sosialisasi_sekolah' ? 'Sosialisasi Sekolah' :
    reportData.type === 'sosialisasi_medsos' ? 'Sosialisasi Medsos' :
    reportData.type === 'sinkron_pendaftar' ? 'Sinkron Pendaftar' : 'Aktivitas';

  const docNotice = cleanDriveUrl ? 'Link Google Drive dilampirkan' : (photos.length > 0 ? `${photos.length} foto dilampirkan` : 'Dokumentasi siap');

  const isJabodetabek = reportData.regionId === 'jabodetabek' || (reportData.regionName || '').toLowerCase().includes('jabodetabek');

  const autoNotif: NotificationItem = {
    id: notifId,
    title: isJabodetabek 
      ? `Laporan Roadshow [${typeLabel}]: Jabodetabek` 
      : `Laporan [${typeLabel}]: Provinsi ${reportData.regionName}`,
    message: isJabodetabek && (reportData.roadshowPic || reportData.roadshowArea)
      ? `[PIC: ${reportData.roadshowPic || '-'}${reportData.roadshowArea ? ` • Wilayah: ${reportData.roadshowArea}` : ''}] ${reportData.reporterName} melaporkan "${reportData.title}" (${registrantsAdded > 0 ? `+${registrantsAdded} calon siswa, ` : ''}${docNotice}). Segera verifikasi!`
      : `${reportData.reporterName} melaporkan "${reportData.title}" (${registrantsAdded > 0 ? `+${registrantsAdded} calon siswa, ` : ''}${docNotice}). Segera verifikasi!`,
    type: 'new_report',
    reportId: newId,
    targetRole: 'admin_pusat',
    targetRegionId: reportData.regionId,
    createdAt: nowStr,
    isRead: false
  };

  const currentNotifs = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, inMemoryNotifs);
  setLocalData(STORAGE_KEYS.NOTIFICATIONS, [autoNotif, ...currentNotifs]);

  // 2. Non-blocking sanitized Firestore sync with fast timeout fallback
  try {
    const firestoreSyncDoc: ReportItem = {
      ...newReport,
      documentationPhotos: photos.length > 2 ? photos.slice(0, 2) : photos,
    };
    const cleanReport = sanitizeForFirestore(firestoreSyncDoc) as Record<string, unknown>;

    // Attempt direct write with 2.5s timeout so UI never hangs even on weak networks
    await Promise.race([
      setDoc(doc(db, 'reports', newId), cleanReport),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
    ]).catch((err) => {
      console.warn('Background Firestore sync report notice:', err);
    });

    if (registrantsAdded > 0 || totalSchoolsAdded > 0) {
      const regRef = doc(db, 'regions', reportData.regionId);
      const updatePayload: Record<string, unknown> = {
        name: reportData.regionName,
      };
      if (registrantsAdded > 0) updatePayload.currentRegistrants = increment(registrantsAdded);
      if (sdAdded > 0) updatePayload.currentSchoolsSdMi = increment(sdAdded);
      if (smpAdded > 0) updatePayload.currentSchoolsSmpMts = increment(smpAdded);
      if (totalSchoolsAdded > 0) updatePayload.currentSchools = increment(totalSchoolsAdded);
      setDoc(regRef, updatePayload, { merge: true }).catch((err) => {
        console.warn('Background Firestore sync counter notice:', err);
      });
    }

    const cleanNotif = sanitizeForFirestore(autoNotif) as Record<string, unknown>;
    setDoc(doc(db, 'notifications', notifId), cleanNotif).catch((err) => {
      console.warn('Background Firestore sync notif notice:', err);
    });
  } catch (syncErr) {
    console.warn('Background sync setup note:', syncErr);
  }

  return newId;
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

  // 1. Update lokal
  const currentReports = getLocalData<ReportItem[]>(STORAGE_KEYS.REPORTS, inMemoryReports);
  const updatedReports = currentReports.map(rep => {
    if (rep.id === reportId) {
      return {
        ...rep,
        status,
        verifiedBy: verifierName,
        verificationNotes: notes,
        verifiedAt: nowStr,
        updatedAt: nowStr
      };
    }
    return rep;
  });
  setLocalData(STORAGE_KEYS.REPORTS, updatedReports);

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

  const currentNotifs = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, inMemoryNotifs);
  setLocalData(STORAGE_KEYS.NOTIFICATIONS, [autoNotif, ...currentNotifs]);

  // 2. Sinkronisasi Firestore di background
  try {
    updateDoc(doc(db, 'reports', reportId), {
      status,
      verifiedBy: verifierName,
      verificationNotes: notes,
      verifiedAt: nowStr,
      updatedAt: nowStr
    }).catch(() => {});
    setDoc(doc(db, 'notifications', notifId), sanitizeForFirestore(autoNotif) as Record<string, unknown>).catch(() => {});
  } catch (error) {
    console.warn('Firestore verifyReport sync note:', error);
  }
}

// Mark notifications as read
export async function markNotificationAsRead(notifId: string) {
  const currentNotifs = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, inMemoryNotifs);
  const updated = currentNotifs.map(n => n.id === notifId ? { ...n, isRead: true } : n);
  setLocalData(STORAGE_KEYS.NOTIFICATIONS, updated);

  try {
    updateDoc(doc(db, 'notifications', notifId), { isRead: true }).catch(() => {});
  } catch (error) {
    console.warn('Mark notif read error:', error);
  }
}

// ==========================================
// BACKUP & RESTORE DATA JSON (100% BEBAS KUOTA)
// ==========================================

export function exportAllDataAsJson(): string {
  const regions = getLocalData<RegionData[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
  const reports = getLocalData<ReportItem[]>(STORAGE_KEYS.REPORTS, inMemoryReports);
  const notifications = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, inMemoryNotifs);

  const exportObj = {
    app: 'SENSEI 2027',
    exportedAt: new Date().toISOString(),
    regions,
    reports,
    notifications,
  };

  return JSON.stringify(exportObj, null, 2);
}

export function importAllDataFromJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.regions && Array.isArray(data.regions)) {
      setLocalData(STORAGE_KEYS.REGIONS, data.regions);
    }
    if (data.reports && Array.isArray(data.reports)) {
      setLocalData(STORAGE_KEYS.REPORTS, data.reports);
    }
    if (data.notifications && Array.isArray(data.notifications)) {
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
    }
    return true;
  } catch (e) {
    console.error('Import data error:', e);
    return false;
  }
}
