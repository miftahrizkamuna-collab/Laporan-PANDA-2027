import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PortalHome } from './components/PortalHome';
import { AdminDashboard } from './components/AdminDashboard';
import { RegionalDashboard } from './components/RegionalDashboard';
import { ReportModal } from './components/ReportModal';
import { VerificationModal } from './components/VerificationModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { 
  RegionData, 
  ReportItem, 
  NotificationItem 
} from './types';
import { 
  seedInitialFirestoreData, 
  subscribeToRegions, 
  subscribeToReports, 
  subscribeToNotifications,
  INITIAL_REGIONS
} from './services/dataService';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  KeyRound, 
  LogOut,
  Home,
  ArrowLeft
} from 'lucide-react';

type AppView = 'portal' | 'admin' | 'region';

function MainLayout() {
  const { 
    profile, 
    switchSimulatedRole, 
    isAdminAuthenticated, 
    loginAdmin, 
    logoutAdmin 
  } = useAuth();

  const [regions, setRegions] = useState<RegionData[]>(INITIAL_REGIONS);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Main View State: 'portal' (initial home interface) | 'admin' | 'region'
  const [currentView, setCurrentView] = useState<AppView>('portal');
  const [selectedPortalRegionId, setSelectedPortalRegionId] = useState<string>('jabar');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [selectedReportForVerify, setSelectedReportForVerify] = useState<ReportItem | null>(null);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<ReportItem | null>(null);

  // Initialize and subscribe to Firestore
  useEffect(() => {
    seedInitialFirestoreData();

    const unsubRegions = subscribeToRegions((data) => setRegions(data));
    const unsubReports = subscribeToReports((data) => setReports(data));
    const unsubNotifs = subscribeToNotifications((data) => setNotifications(data));

    return () => {
      unsubRegions();
      unsubReports();
      unsubNotifs();
    };
  }, []);

  const handleSelectReportFromNotif = (reportId: string) => {
    const found = reports.find(r => r.id === reportId);
    if (found) {
      if (profile.role === 'admin_pusat' && found.status === 'pending') {
        setSelectedReportForVerify(found);
      } else {
        setSelectedReportForDetail(found);
      }
    }
  };

  const handleAdminNavClick = () => {
    if (isAdminAuthenticated) {
      switchSimulatedRole('admin_pusat');
      setCurrentView('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    setCurrentView('portal');
  };

  // Find active region for Panitia Wilayah
  const currentRegion = regions.find(r => r.id === profile.regionId) || regions.find(r => r.id === selectedPortalRegionId) || regions[0] || INITIAL_REGIONS[0];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-16">
      
      {/* Top Navbar */}
      <Navbar
        notifications={notifications}
        regions={regions}
        onSelectReport={handleSelectReportFromNotif}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onGoHome={() => setCurrentView('portal')}
      />

      {/* Top Quick Status Bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-xs px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            {currentView === 'portal' ? (
              <span className="font-semibold text-emerald-200">
                Halaman Awal: <span className="text-white">Pilih Login Admin Pusat atau Pilih Halaman Wilayah</span>
              </span>
            ) : (
              <span>
                Sedang membuka tampilan: <strong className="text-white underline">{currentView === 'admin' ? 'Admin Pusat SMART' : `Panitia Provinsi ${currentRegion?.name || ''}`}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentView !== 'portal' && (
              <button
                onClick={() => setCurrentView('portal')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-white/10"
              >
                <Home className="w-3.5 h-3.5 text-emerald-300" />
                <span>Halaman Awal (Portal)</span>
              </button>
            )}

            <button
              onClick={handleAdminNavClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentView === 'admin' && isAdminAuthenticated
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isAdminAuthenticated ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>🛡️ Dasbor Admin Pusat (Aktif)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Login Admin Pusat SMART</span>
                </>
              )}
            </button>

            {isAdminAuthenticated && (
              <button
                onClick={handleLogoutAdmin}
                className="px-2 py-1 bg-white/10 hover:bg-rose-500/80 text-white text-[11px] rounded-lg transition flex items-center gap-1"
                title="Keluar dari Admin Pusat"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout Admin</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10">
              <span className="text-emerald-200 text-[11px] font-medium">Buka Wilayah:</span>
              <select
                value={currentView === 'region' ? (currentRegion?.id || '') : selectedPortalRegionId}
                onChange={(e) => {
                  if (e.target.value) {
                    const newId = e.target.value;
                    setSelectedPortalRegionId(newId);
                    switchSimulatedRole('panitia_wilayah', newId);
                    setCurrentView('region');
                  }
                }}
                className="bg-white text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>-- Pilih Provinsi Sasaran --</option>
                {regions.map((reg, idx) => (
                  <option key={reg.id} value={reg.id}>
                    {idx + 1}. {reg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {currentView === 'portal' ? (
          /* Halaman Awal: Pilihan Login Admin Pusat ATAU Melihat Halaman Wilayah dengan Dropdown */
          <PortalHome
            regions={regions}
            selectedRegionId={selectedPortalRegionId}
            onSelectRegion={(id) => {
              setSelectedPortalRegionId(id);
              switchSimulatedRole('panitia_wilayah', id);
            }}
            onEnterRegion={(id) => {
              setSelectedPortalRegionId(id);
              switchSimulatedRole('panitia_wilayah', id);
              setCurrentView('region');
            }}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
            onEnterAdmin={() => {
              switchSimulatedRole('admin_pusat');
              setCurrentView('admin');
            }}
          />
        ) : currentView === 'admin' ? (
          isAdminAuthenticated ? (
            <AdminDashboard
              regions={regions}
              reports={reports}
              onOpenVerify={(rep) => setSelectedReportForVerify(rep)}
              onOpenDetail={(rep) => setSelectedReportForDetail(rep)}
              onBackToPortal={() => setCurrentView('portal')}
            />
          ) : (
            /* Protected Admin View Screen */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-xl mx-auto shadow-sm my-8">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Akses Terbatas: Dashboard Admin Pusat SMART
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-md mx-auto">
                Halaman ini memerlukan autentikasi resmi panitia pusat SENSEI 2027 untuk memverifikasi laporan seluruh provinsi.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md transition"
                >
                  Masuk ke Dashboard Admin Pusat
                </button>
                <button
                  onClick={() => setCurrentView('portal')}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
                >
                  Kembali ke Halaman Awal (Portal)
                </button>
              </div>
            </div>
          )
        ) : (
          /* Halaman Wilayah Terpilih */
          <RegionalDashboard
            region={currentRegion}
            reports={reports}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDetail={(rep) => setSelectedReportForDetail(rep)}
            onBackToPortal={() => setCurrentView('portal')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
              S
            </div>
            <span>
              © 2027 <strong>SENSEI</strong> • Sistem Penerimaan Nasional Siswa Baru SMART Ekselensia Indonesia. Dompet Dhuafa.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersinkronisasi Real-time dengan Firebase Firestore
            </span>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal (user: admin | pass: Sensei2027) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLogin={loginAdmin}
        onSuccess={() => {
          switchSimulatedRole('admin_pusat');
          setCurrentView('admin');
        }}
      />

      {/* Report Submission Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reporterName={currentRegion.coordinatorName || profile.displayName || `Panitia ${currentRegion.name}`}
        reporterEmail={profile.email}
        reporterId={profile.uid}
        regionId={currentRegion.id}
        regionName={currentRegion.name}
      />

      {/* Report Verification Modal */}
      <VerificationModal
        isOpen={!!selectedReportForVerify}
        report={selectedReportForVerify}
        onClose={() => setSelectedReportForVerify(null)}
        adminName={profile.displayName}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        isOpen={!!selectedReportForDetail}
        report={selectedReportForDetail}
        onClose={() => setSelectedReportForDetail(null)}
        canVerify={profile.role === 'admin_pusat' && isAdminAuthenticated}
        onOpenVerify={(rep) => setSelectedReportForVerify(rep)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
