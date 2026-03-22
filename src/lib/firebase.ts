import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOh4LbA8v3tgg7lVI-fmcOfUEeOLbjgbM",
  authDomain: "creationx-abd82.firebaseapp.com",
  projectId: "creationx-abd82",
  storageBucket: "creationx-abd82.firebasestorage.app",
  messagingSenderId: "425259247669",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:425259247669:web:9f8ac519ad480d836d297c",
  measurementId: "G-NY8JQFLEHN"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  
  console.log('🔥 Firebase initialized:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
}

export { auth, db, googleProvider, storage };
export default app!;
