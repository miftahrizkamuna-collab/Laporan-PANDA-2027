export type UserRole = 'admin_pusat' | 'panitia_wilayah';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  regionId?: string;
  regionName?: string;
  phone?: string;
}

export type ReportType = 
  | 'sosialisasi_sekolah'
  | 'sosialisasi_medsos'
  | 'sinkron_pendaftar'
  | 'publikasi_medsos'
  | 'audiensi_tokoh'
  | 'update_pendaftar'
  | 'kendala_lapangan';

export interface SchoolVisitItem {
  schoolName: string;
  category: 'sd_mi' | 'smp_mts';
  contactPersonName?: string;
  contactPersonPhone?: string;
  studentsReached?: number;
  registrantsDirect?: number;
}

export type ReportStatus = 'pending' | 'verified' | 'needs_revision' | 'rejected';

export interface ReportItem {
  id: string;
  regionId: string;
  regionName: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  type: ReportType;
  title: string;
  description: string;
  activityDate: string;
  registrantsAdded: number;
  schoolsVisited: number;
  schoolsSdMiVisited?: number;
  schoolsSmpMtsVisited?: number;
  audienceReached: number;
  documentationNotes?: string;
  documentationUrls?: string[];
  documentationImageUrl?: string;
  documentationPhotos?: string[]; // uploaded photos array
  // Khusus Pilihan 1: Sosialisasi Sekolah
  schoolNames?: string;
  schoolVisits?: SchoolVisitItem[];
  // Khusus Pilihan 2: Sosialisasi Medsos
  mediaPlatform?: string;
  mediaPostUrl?: string;
  // Khusus Pilihan 3: Sinkron Pendaftar Daerah & Web SENSEI
  offlineRegistrantsCount?: number;
  onlineWebRegistrantsCount?: number;
  documentCompletenessStatus?: string;
  isFeaturedDocumentation?: boolean;
  status: ReportStatus;
  verifiedBy?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType = 
  | 'new_report' 
  | 'report_verified' 
  | 'revision_needed' 
  | 'target_alert' 
  | 'announcement';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  reportId?: string;
  targetRole: 'all' | 'admin_pusat' | 'panitia_wilayah';
  targetRegionId?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface RegionData {
  id: string;
  name: string;
  island: string;
  targetRegistrants: number; // 75 pendaftar per daerah
  currentRegistrants: number;
  targetSchoolsSdMi: number; // minimal 15 sekolah SD/MI
  currentSchoolsSdMi: number;
  targetSchoolsSmpMts: number; // minimal 5 sekolah SMP/MTs
  currentSchoolsSmpMts: number;
  targetSchools: number; // 20 sekolah total
  currentSchools: number;
  coordinatorName: string;
  coordinatorPhone: string;
  todayReportsCount?: number;
  lastReportDate?: string;
  status: 'active' | 'warning' | 'completed';
}
