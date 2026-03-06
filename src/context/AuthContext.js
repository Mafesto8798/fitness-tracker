'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs, deleteDoc, addDoc,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

// ─── Guest demo data ─────────────────────────────────────────────────────────

function localDateString(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function seedGuestData(uid) {
  const workouts = [
    {
      userId: uid, name: 'Chest & Triceps', date: localDateString(0), label: 'Strength',
      exercises: [
        { name: 'Bench Press',           category: 'Strength', sets: 3, reps: 10, weight: 185, notes: '' },
        { name: 'Incline Dumbbell Press', category: 'Strength', sets: 3, reps: 12, weight: 65,  notes: '' },
        { name: 'Tricep Pushdown',        category: 'Strength', sets: 3, reps: 15, weight: 50,  notes: '' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      userId: uid, name: 'Leg Day', date: localDateString(2), label: 'Strength',
      exercises: [
        { name: 'Squat',             category: 'Strength', sets: 4, reps: 8,  weight: 225, notes: '' },
        { name: 'Romanian Deadlift', category: 'Strength', sets: 3, reps: 10, weight: 185, notes: '' },
        { name: 'Leg Press',         category: 'Strength', sets: 3, reps: 12, weight: 270, notes: '' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      userId: uid, name: 'Back & Cardio', date: localDateString(4), label: 'Mixed',
      exercises: [
        { name: 'Deadlift',    category: 'Strength', sets: 3, reps: 5,  weight: 275, notes: '' },
        { name: 'Pull-ups',    category: 'Strength', sets: 3, reps: 8,  weight: 0,   notes: '' },
        { name: 'Barbell Row', category: 'Strength', sets: 3, reps: 10, weight: 155, notes: '' },
        { name: 'Running',     category: 'Cardio',   duration: 25, notes: '' },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const templates = [
    { userId: uid, templateName: 'Heavy Squat', name: 'Squat',       category: 'Strength', sets: 4, reps: 8,  weight: 225, notes: '' },
    { userId: uid, templateName: 'Bench Press', name: 'Bench Press', category: 'Strength', sets: 3, reps: 10, weight: 185, notes: '' },
    { userId: uid, templateName: 'Morning Run', name: 'Running',     category: 'Cardio',   duration: 30, notes: 'Steady pace' },
  ];

  await Promise.all([
    ...workouts.map(w  => addDoc(collection(db, 'workouts'),          w)),
    ...templates.map(t => addDoc(collection(db, 'exerciseTemplates'), t)),
  ]);
}

async function deleteGuestData(uid) {
  const [workoutsSnap, templatesSnap] = await Promise.all([
    getDocs(query(collection(db, 'workouts'),          where('userId', '==', uid))),
    getDocs(query(collection(db, 'exerciseTemplates'), where('userId', '==', uid))),
  ]);
  await Promise.all([
    ...workoutsSnap.docs.map(d  => deleteDoc(d.ref)),
    ...templatesSnap.docs.map(d => deleteDoc(d.ref)),
    deleteDoc(doc(db, 'users', uid)),
  ]);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchUserProfile = async (firebaseUser) => {
    try {
      const uid = firebaseUser.uid;
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        const defaultProfile = {
          uid,
          email: firebaseUser.email || null,
          displayName: firebaseUser.isAnonymous ? 'Guest' : firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
          bio: '',
          favoriteExercise: '',
          subscriptionTier: 'free',
          isGuest: firebaseUser.isAnonymous || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      const result = await signInAnonymously(auth);
      await seedGuestData(result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Error signing in as guest:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (user?.isAnonymous) {
        await deleteGuestData(user.uid);
      }
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = { ...updates, updatedAt: new Date().toISOString() };
      await updateDoc(userDocRef, updatedData);
      setUserProfile((prev) => ({ ...prev, ...updatedData }));
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isGuest: user?.isAnonymous ?? false,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    updateUserProfile,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
