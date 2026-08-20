import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

export type UserRole = 'ADMIN' | 'INVESTIGATOR' | 'ANALYST' | 'REVIEWER';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  badgeNumber: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  loginAsDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<UserRole, Partial<UserProfile>> = {
  ADMIN: {
    displayName: 'A. Vance',
    role: 'ADMIN',
    organizationId: 'ORG-FED-01',
    organizationName: 'Federal Forensic Bureau',
    badgeNumber: 'FFB-0019',
  },
  INVESTIGATOR: {
    displayName: 'M. Okonkwo',
    role: 'INVESTIGATOR',
    organizationId: 'ORG-FED-01',
    organizationName: 'Federal Forensic Bureau',
    badgeNumber: 'FFB-0421',
  },
  ANALYST: {
    displayName: 'R. Nayar',
    role: 'ANALYST',
    organizationId: 'ORG-FED-01',
    organizationName: 'Federal Forensic Bureau',
    badgeNumber: 'FFB-0812',
  },
  REVIEWER: {
    displayName: 'Dr. K. Osei',
    role: 'REVIEWER',
    organizationId: 'ORG-FED-01',
    organizationName: 'Federal Forensic Bureau',
    badgeNumber: 'FFB-0105',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
          } else {
            // Default initial profile
            const isDefaultAdmin = firebaseUser.email === 'aariefking01@gmail.com';
            const defaultRole: UserRole = isDefaultAdmin ? 'ADMIN' : 'INVESTIGATOR';
            const demoInfo = DEMO_PROFILES[defaultRole];
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'investigator@authentivision.gov',
              displayName: firebaseUser.displayName || demoInfo.displayName || 'Forensic Agent',
              role: defaultRole,
              organizationId: 'ORG-FED-01',
              organizationName: 'Federal Forensic Bureau',
              badgeNumber: isDefaultAdmin ? 'FFB-ADMIN-01' : 'FFB-0421',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile, { merge: true });
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Firestore profile load error, using cached memory profile:', err);
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'investigator@authentivision.gov',
            displayName: firebaseUser.displayName || 'M. Okonkwo',
            role: 'INVESTIGATOR',
            organizationId: 'ORG-FED-01',
            organizationName: 'Federal Forensic Bureau',
            badgeNumber: 'FFB-0421',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const userDocRef = doc(db, 'users', res.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const isDefaultAdmin = res.user.email === 'aariefking01@gmail.com';
          const newProfile: UserProfile = {
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || 'Forensic Investigator',
            role: isDefaultAdmin ? 'ADMIN' : 'INVESTIGATOR',
            organizationId: 'ORG-FED-01',
            organizationName: 'Federal Forensic Bureau',
            badgeNumber: isDefaultAdmin ? 'FFB-ADMIN-01' : 'FFB-' + Math.floor(1000 + Math.random() * 9000),
            photoURL: res.user.photoURL || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
        }
      }
    } catch (err) {
      console.warn('Google sign-in popup notice:', err);
      // Fallback
      await signInAnonymously(auth);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      if (email && pass) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, pass);
          if (res.user) {
            const userDocRef = doc(db, 'users', res.user.uid);
            const newProfile: UserProfile = {
              uid: res.user.uid,
              email,
              displayName: email.split('@')[0]?.replace('.', ' ') || 'Forensic User',
              role: 'INVESTIGATOR',
              organizationId: 'ORG-FED-01',
              organizationName: 'Federal Forensic Bureau',
              badgeNumber: 'FFB-' + Math.floor(1000 + Math.random() * 9000),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
            return;
          }
        } catch {
          const res = await signInAnonymously(auth);
          if (res.user) {
            const userDocRef = doc(db, 'users', res.user.uid);
            const newProfile: UserProfile = {
              uid: res.user.uid,
              email,
              displayName: email.split('@')[0] || 'Forensic User',
              role: 'INVESTIGATOR',
              organizationId: 'ORG-FED-01',
              organizationName: 'Federal Forensic Bureau',
              badgeNumber: 'FFB-' + Math.floor(1000 + Math.random() * 9000),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        }
      }
    }
  };

  const register = async (email: string, pass: string, name: string, role: UserRole = 'INVESTIGATOR') => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        role,
        organizationId: 'ORG-FED-01',
        organizationName: 'Federal Forensic Bureau',
        badgeNumber: 'FFB-' + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setProfile(newProfile);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateRole = async (newRole: UserRole) => {
    if (!profile || !user) return;
    const updated = { ...profile, role: newRole, updatedAt: new Date().toISOString() };
    setProfile(updated);
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Doc update notice:', e);
    }
  };

  const loginAsDemoRole = async (role: UserRole) => {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      const res = await signInAnonymously(auth);
      currentUser = res.user;
    }
    const demoInfo = DEMO_PROFILES[role];
    const newProfile: UserProfile = {
      uid: currentUser.uid,
      email: `${role.toLowerCase()}@authentivision.gov`,
      displayName: demoInfo.displayName || `${role} Officer`,
      role,
      organizationId: 'ORG-FED-01',
      organizationName: 'Federal Forensic Bureau',
      badgeNumber: demoInfo.badgeNumber || 'FFB-0001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setProfile(newProfile);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), newProfile, { merge: true });
    } catch (err) {
      console.warn('Set doc error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateRole,
        loginAsDemoRole,
      }}
    >
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
