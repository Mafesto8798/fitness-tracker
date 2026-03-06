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
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for user's workouts
  useEffect(() => {
    if (!user) {
      // User not logged in - reset state
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query workouts for this user, ordered by date descending
    const workoutsQuery = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      workoutsQuery,
      (snapshot) => {
        const workoutsData = snapshot.docs.map((doc) => ({
          id: doc.id, // Firestore document ID
          ...doc.data(),
        }));
        setWorkouts(workoutsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching workouts:", err);
        setError("Failed to load workouts. Please try again.");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or user change
    return () => unsubscribe();
  }, [user]);

  // Add a new workout
  const addWorkout = async (workoutData) => {
    if (!user) {
      throw new Error("Must be logged in to add workout");
    }

    try {
      const newWorkout = {
        userId: user.uid,
        name: workoutData.name,
        date: workoutData.date,
        label: workoutData.label,
        exercises: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "workouts"), newWorkout);
      return docRef.id;
    } catch (err) {
      console.error("Error adding workout:", err);
      throw new Error("Failed to add workout. Please try again.");
    }
  };

  // Get workout by ID (synchronous - reads from local state)
  const getWorkoutById = (id) => {
    return workouts.find((workout) => workout.id === id);
  };

  // Add exercise to a specific workout
  const addExerciseToWorkout = async (workoutId, exerciseData) => {
    if (!user) {
      throw new Error("Must be logged in to add exercise");
    }

    try {
      const workout = workouts.find((w) => w.id === workoutId);
      if (!workout) {
        throw new Error("Workout not found");
      }

      // Generate new exercise ID
      const newExerciseId =
        workout.exercises.length > 0
          ? Math.max(...workout.exercises.map((e) => e.id)) + 1
          : 1;

      const newExercise = {
        id: newExerciseId,
        ...exerciseData,
      };

      const updatedExercises = [...workout.exercises, newExercise];

      const workoutRef = doc(db, "workouts", workoutId);
      await updateDoc(workoutRef, {
        exercises: updatedExercises,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding exercise:", err);
      throw new Error("Failed to add exercise. Please try again.");
    }
  };

  // Update a workout
  const updateWorkout = async (workoutId, updatedData) => {
    if (!user) {
      throw new Error("Must be logged in to update workout");
    }

    try {
      const workoutRef = doc(db, "workouts", workoutId);
      await updateDoc(workoutRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating workout:", err);
      throw new Error("Failed to update workout. Please try again.");
    }
  };

  // Delete a workout
  const deleteWorkout = async (workoutId) => {
    if (!user) {
      throw new Error("Must be logged in to delete workout");
    }

    try {
      const workoutRef = doc(db, "workouts", workoutId);
      await deleteDoc(workoutRef);
    } catch (err) {
      console.error("Error deleting workout:", err);
      throw new Error("Failed to delete workout. Please try again.");
    }
  };

  // Update an exercise within a workout
  const updateExercise = async (workoutId, exerciseId, updatedData) => {
    if (!user) {
      throw new Error("Must be logged in to update exercise");
    }

    try {
      const workout = workouts.find((w) => w.id === workoutId);
      if (!workout) {
        throw new Error("Workout not found");
      }

      const updatedExercises = workout.exercises.map((exercise) =>
        exercise.id === parseInt(exerciseId)
          ? { ...exercise, ...updatedData }
          : exercise
      );

      const workoutRef = doc(db, "workouts", workoutId);
      await updateDoc(workoutRef, {
        exercises: updatedExercises,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating exercise:", err);
      throw new Error("Failed to update exercise. Please try again.");
    }
  };

  // Delete an exercise from a workout
  const deleteExercise = async (workoutId, exerciseId) => {
    if (!user) {
      throw new Error("Must be logged in to delete exercise");
    }

    try {
      const workout = workouts.find((w) => w.id === workoutId);
      if (!workout) {
        throw new Error("Workout not found");
      }

      const updatedExercises = workout.exercises.filter(
        (exercise) => exercise.id !== parseInt(exerciseId)
      );

      const workoutRef = doc(db, "workouts", workoutId);
      await updateDoc(workoutRef, {
        exercises: updatedExercises,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error deleting exercise:", err);
      throw new Error("Failed to delete exercise. Please try again.");
    }
  };

  // Clear all workouts (for logout) - deletes all user's workouts
  const clearWorkouts = async () => {
    if (!user) {
      setWorkouts([]);
      return;
    }

    try {
      const workoutsQuery = query(
        collection(db, "workouts"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(workoutsQuery);
      const deletePromises = snapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
      setWorkouts([]);
    } catch (err) {
      console.error("Error clearing workouts:", err);
      throw new Error("Failed to clear workouts. Please try again.");
    }
  };

  const value = {
    workouts,
    loading,
    error,
    addWorkout,
    getWorkoutById,
    addExerciseToWorkout,
    updateWorkout,
    deleteWorkout,
    updateExercise,
    deleteExercise,
    clearWorkouts,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

// Custom hook to use the workout context
export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkouts must be used within a WorkoutProvider");
  }
  return context;
}
