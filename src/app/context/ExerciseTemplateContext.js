"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

const ExerciseTemplateContext = createContext();

export function ExerciseTemplateProvider({ children }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "exerciseTemplates"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.templateName || a.name || "").localeCompare(b.templateName || b.name || ""));
        setTemplates(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching exercise templates:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTemplate = async (templateData) => {
    if (!user) throw new Error("Must be logged in to add template");
    const docRef = await addDoc(collection(db, "exerciseTemplates"), {
      userId: user.uid,
      ...templateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateTemplate = async (id, templateData) => {
    if (!user) throw new Error("Must be logged in to update template");
    await updateDoc(doc(db, "exerciseTemplates", id), {
      ...templateData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteTemplate = async (id) => {
    if (!user) throw new Error("Must be logged in to delete template");
    await deleteDoc(doc(db, "exerciseTemplates", id));
  };

  return (
    <ExerciseTemplateContext.Provider value={{ templates, loading, addTemplate, updateTemplate, deleteTemplate }}>
      {children}
    </ExerciseTemplateContext.Provider>
  );
}

export function useExerciseTemplates() {
  const context = useContext(ExerciseTemplateContext);
  if (!context) {
    throw new Error("useExerciseTemplates must be used within ExerciseTemplateProvider");
  }
  return context;
}
