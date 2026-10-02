import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDbConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginQuickDemo: (role?: 'admin' | 'operator') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(true);

  useEffect(() => {
    testFirestoreConnection().then(res => setIsDbConnected(res));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profileDocRef = doc(db, 'user_profiles', user.uid);
          const snap = await getDoc(profileDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // Create default profile in Firestore
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || 'admin@nazlacontainer.com',
              displayName: user.displayName || 'NAZLA (Owner)',
              role: user.email?.includes('super') ? 'superadmin' : 'admin',
              company: 'PT NAZLA TERMINAL PETIKEMAS',
              createdAt: new Date().toISOString()
            };
            await setDoc(profileDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not sync user profile to firestore:', err);
          setUserProfile({
            id: user.uid,
            email: user.email || 'admin@nazlacontainer.com',
            displayName: user.displayName || 'NAZLA (Owner)',
            role: 'admin',
            company: 'PT NAZLA TERMINAL PETIKEMAS',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error('Email Sign-In Error:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        const profileDocRef = doc(db, 'user_profiles', res.user.uid);
        const newProfile: UserProfile = {
          id: res.user.uid,
          email: res.user.email || email,
          displayName: name,
          role: 'admin',
          company: 'PT NAZLA TERMINAL PETIKEMAS',
          createdAt: new Date().toISOString()
        };
        await setDoc(profileDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Registration Error:', err);
      throw err;
    }
  };

  const loginQuickDemo = async (role: 'admin' | 'operator' = 'admin') => {
    const demoEmail = role === 'admin' ? 'admin.nazla@nazlacontainer.com' : 'operator.shark@nazlacontainer.com';
    const demoPass = 'NazlaShark2026!';
    const demoName = role === 'admin' ? 'NAZLA (Owner & Direktur Utama)' : 'Petugas Lapangan CY Shark';

    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
    } catch (err: any) {
      // If user doesn't exist yet in Firebase Auth, create it automatically
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const res = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          if (res.user) {
            await updateProfile(res.user, { displayName: demoName });
            const profileDocRef = doc(db, 'user_profiles', res.user.uid);
            const newProfile: UserProfile = {
              id: res.user.uid,
              email: demoEmail,
              displayName: demoName,
              role: role === 'admin' ? 'superadmin' : 'operator',
              company: 'PT NAZLA TERMINAL PETIKEMAS',
              createdAt: new Date().toISOString()
            };
            await setDoc(profileDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (createErr) {
          console.error('Demo registration fallback error:', createErr);
          throw createErr;
        }
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      isDbConnected,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      loginQuickDemo,
      logout
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
