import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { INITIAL_REGIONS } from '../services/dataService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile;
  loading: boolean;
  isAdminAuthenticated: boolean;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchSimulatedRole: (role: UserRole, regionId?: string) => void;
  isSimulated: boolean;
}

const DEFAULT_ADMIN_EMAIL = 'miftahrizkamuna@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  // Default: tidak langsung login admin pusat saat pertama buka web
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Default initial profile: umum / panitia daerah (bukan admin pusat)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const defaultReg = INITIAL_REGIONS.find(r => r.id === 'jabar') || INITIAL_REGIONS[0];
    return {
      uid: 'guest-sensei-viewer',
      email: 'panwil.jabar@sensei2027.id',
      displayName: defaultReg.coordinatorName || 'Panitia Jawa Barat',
      role: 'panitia_wilayah',
      regionId: defaultReg.id,
      regionName: defaultReg.name,
      phone: defaultReg.coordinatorPhone,
    };
  });

  useEffect(() => {
    // Pastikan tidak ada sesi admin yang tersisa otomatis saat pertama kali dibuka
    sessionStorage.removeItem('sensei_admin_logged_in');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSimulated(false);
        // Penting: Jangan otomatis elevate ke admin pusat saat pertama buka web.
        // Pengguna harus secara eksplisit login melalui modal "Login Admin Pusat".
        const defaultReg = INITIAL_REGIONS.find(r => r.id === 'jabar') || INITIAL_REGIONS[0];
        setProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna SENSEI',
          photoURL: user.photoURL || undefined,
          role: 'panitia_wilayah',
          regionId: defaultReg.id,
          regionName: defaultReg.name,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdmin = (username: string, pass: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if ((cleanUser === 'admin' || cleanUser === 'admin@sensei2027.id') && cleanPass === 'Sensei2027') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('sensei_admin_logged_in', 'true');
      setProfile({
        uid: 'admin-pusat-master',
        email: 'admin@sensei2027.id',
        displayName: 'Admin Pusat SMART (SMART Ekselensia)',
        role: 'admin_pusat',
        regionName: 'Sekretariat Pusat SMART',
        phone: '0812-8899-0011',
      });
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('sensei_admin_logged_in');
    const defaultReg = INITIAL_REGIONS.find(r => r.id === 'jabar') || INITIAL_REGIONS[0];
    setProfile({
      uid: 'usr-jabar-coord',
      email: 'panwil.jabar@sensei2027.id',
      displayName: defaultReg.coordinatorName,
      role: 'panitia_wilayah',
      regionId: defaultReg.id,
      regionName: defaultReg.name,
      phone: defaultReg.coordinatorPhone,
    });
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      logoutAdmin();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const switchSimulatedRole = (role: UserRole, regionId?: string) => {
    setIsSimulated(true);
    if (role === 'admin_pusat') {
      setProfile({
        uid: 'admin-pusat-master',
        email: 'admin@sensei2027.id',
        displayName: 'Admin Pusat SMART (SMART Ekselensia)',
        role: 'admin_pusat',
        regionName: 'Sekretariat Pusat SMART',
        phone: '0812-8899-0011',
      });
    } else {
      const targetRegId = regionId || 'jabar';
      const reg = INITIAL_REGIONS.find(r => r.id === targetRegId) || INITIAL_REGIONS[0];
      setProfile({
        uid: `usr-${targetRegId}-coord`,
        email: `panwil.${targetRegId}@sensei2027.id`,
        displayName: reg.coordinatorName || `Koordinator ${reg.name}`,
        role: 'panitia_wilayah',
        regionId: reg.id,
        regionName: reg.name,
        phone: reg.coordinatorPhone,
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile,
      loading,
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin,
      signInWithGoogle,
      signOut,
      switchSimulatedRole,
      isSimulated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
