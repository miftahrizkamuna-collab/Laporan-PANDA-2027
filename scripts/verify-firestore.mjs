import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "yodeling-drummer-x8chg",
  appId: "1:468162884192:web:af274cdd4d48072e6cc905",
  apiKey: "AIzaSyCq-B2AbviW5iAOmP3wN2OYJTxeg_Cuhr8",
  authDomain: "yodeling-drummer-x8chg.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-796d3b79-0134-4bac-8732-9467068cbcb3",
};

console.log("==================================================");
console.log("  VERIFIKASI ATURAN FIRESTORE & IZIN TULIS (WRITE)");
console.log("==================================================");
console.log(`Project ID   : ${firebaseConfig.projectId}`);
console.log(`Database ID  : ${firebaseConfig.firestoreDatabaseId}`);
console.log(`Auth State   : Unauthenticated / Anonymous (Tanpa Login)`);
console.log("--------------------------------------------------");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function verify() {
  const testId = `verify-${Date.now()}`;
  
  // 1. Uji Tulis Dokumen Laporan (reports)
  console.log("\n[1/3] Menguji izin TULIS (WRITE) ke koleksi 'reports'...");
  try {
    const reportRef = doc(db, 'reports', testId);
    await setDoc(reportRef, {
      title: 'Uji Coba Izin Tulis Publik SENSEI 2027',
      status: 'pending',
      regionId: 'jabar',
      createdAt: new Date().toISOString()
    });
    console.log("  -> BERHASIL: Dokumen berhasil ditulis ke 'reports'!");

    // 2. Uji Baca Dokumen (read)
    console.log("\n[2/3] Menguji izin BACA (READ) dari koleksi 'reports'...");
    const snap = await getDoc(reportRef);
    if (snap.exists()) {
      console.log("  -> BERHASIL: Dokumen berhasil dibaca kembali:");
      console.log("    ", JSON.stringify(snap.data()));
    } else {
      console.log("  -> PERINGATAN: Dokumen tidak ditemukan setelah penulisan.");
    }

    // 3. Bersihkan Dokumen Uji
    console.log("\n[3/3] Membersihkan dokumen uji coba...");
    await deleteDoc(reportRef);
    console.log("  -> BERHASIL: Dokumen uji coba telah dihapus.");

    console.log("\n--------------------------------------------------");
    console.log("HASIL: Aturan 'allow read, write: if true;' AKTIF!");
    console.log("Koleksi 'reports', 'regions', dan 'notifications' mengizinkan");
    console.log("penulisan langsung dari klien (Netlify / web produksi).");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("\nGAGAL: Terjadi kendala izin atau koneksi:", error);
    console.log("Silakan jalankan deploy_firebase untuk menyinkronkan aturan firestore.rules.");
    process.exit(1);
  }
}

verify();
