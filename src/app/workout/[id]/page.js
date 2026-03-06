"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddExerciseModal from "../../components/AddExerciseModal";
import EditWorkoutModal from "../../components/EditWorkoutModal";
import EditExerciseModal from "../../components/EditExerciseModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useWorkouts } from "../../context/WorkoutContext";
import { useToast } from "../../context/ToastContext";
import AuthGuard from "@/components/AuthGuard";

function WorkoutDetailContent({ params }) {
  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = use(params);

  const router = useRouter();
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isEditWorkoutModalOpen, setIsEditWorkoutModalOpen] = useState(false);
  const [isEditExerciseModalOpen, setIsEditExerciseModalOpen] = useState(false);
  const [isDeleteWorkoutDialogOpen, setIsDeleteWorkoutDialogOpen] = useState(false);
  const [isDeleteExerciseDialogOpen, setIsDeleteExerciseDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const {
    getWorkoutById,
    addExerciseToWorkout,
    updateWorkout,
    deleteWorkout,
    updateExercise,
    deleteExercise,
    loading
  } = useWorkouts();
  const { showToast } = useToast();
  const workout = getWorkoutById(unwrappedParams.id);

  const handleAddExercise = async (exerciseData) => {
    try {
      await addExerciseToWorkout(unwrappedParams.id, exerciseData);
      setIsExerciseModalOpen(false);
      showToast("Exercise added!", "success");
    } catch (error) {
      console.error("Error adding exercise:", error);
      showToast(error.message || "Failed to add exercise");
    }
  };

  const handleEditWorkout = async (updatedData) => {
    try {
      await updateWorkout(unwrappedParams.id, updatedData);
      setIsEditWorkoutModalOpen(false);
      showToast("Workout updated!", "success");
    } catch (error) {
      console.error("Error updating workout:", error);
      showToast(error.message || "Failed to update workout");
    }
  };

  const handleDeleteWorkout = async () => {
    try {
      await deleteWorkout(unwrappedParams.id);
      showToast("Workout deleted", "success");
      router.push("/home");
    } catch (error) {
      console.error("Error deleting workout:", error);
      showToast(error.message || "Failed to delete workout");
    }
  };

  const handleEditExercise = async (updatedData) => {
    try {
      await updateExercise(unwrappedParams.id, selectedExercise.id, updatedData);
      setIsEditExerciseModalOpen(false);
      setSelectedExercise(null);
      showToast("Exercise updated!", "success");
    } catch (error) {
      console.error("Error updating exercise:", error);
      showToast(error.message || "Failed to update exercise");
    }
  };

  const handleDeleteExercise = async () => {
    try {
      await deleteExercise(unwrappedParams.id, selectedExercise.id);
      setIsDeleteExerciseDialogOpen(false);
      setSelectedExercise(null);
      showToast("Exercise deleted", "success");
    } catch (error) {
      console.error("Error deleting exercise:", error);
      showToast(error.message || "Failed to delete exercise");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading workout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/home" className="btn-primary inline-block mb-6">
            Back
          </Link>
          <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
            Workout not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/home" className="btn-primary inline-block mb-6">
          Back
        </Link>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-color mb-2">{workout.name}</h1>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {workout.date.slice(5, 7)}/{workout.date.slice(8, 10)}/{workout.date.slice(0, 4)} • {workout.label}
              </p>
            </div>
            <div className="icon-button-group">
              <button
                onClick={() => setIsEditWorkoutModalOpen(true)}
                className="icon-button icon-button-edit"
                title="Edit workout"
                aria-label="Edit workout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setIsDeleteWorkoutDialogOpen(true)}
                className="icon-button icon-button-danger"
                title="Delete workout"
                aria-label="Delete workout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <button
            className="btn-primary w-full md:w-auto"
            onClick={() => setIsExerciseModalOpen(true)}
          >
            Add Exercise
          </button>
        </div>

        <div className="card">
          <h2
            className="text-xl font-bold mb-5"
            style={{ color: "var(--text-secondary)" }}
          >
            Exercises
          </h2>

          {workout.exercises.length === 0 ? (
            <div className="border-t pt-4" style={{ borderColor: "var(--text-light)" }}>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-primary-color opacity-30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <p
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No Exercises Yet
                </p>
                <p
                  className="text-sm font-medium mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Start building your workout by adding exercises
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setIsExerciseModalOpen(true)}
                >
                  Add Your First Exercise
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {workout.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border-l-4 pl-4 py-3"
                  style={{ borderColor: "var(--primary)" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">
                          {exercise.name}
                        </h3>
                        <span
                          className={`category-badge ${exercise.category.toLowerCase()}`}
                        >
                          {exercise.category}
                        </span>
                      </div>

                      {exercise.category === "Strength" && (
                        <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight > 0 && ` @ ${exercise.weight} lbs`}
                        </p>
                      )}

                      {exercise.category === "Cardio" && (
                        <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
                          Duration: {exercise.duration} minutes
                        </p>
                      )}

                      {exercise.notes && (
                        <p
                          className="mt-2 text-sm italic"
                          style={{ color: "var(--text-light)" }}
                        >
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                    <div className="icon-button-group ml-2">
                      <button
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setIsEditExerciseModalOpen(true);
                        }}
                        className="icon-button icon-button-edit"
                        title="Edit exercise"
                        aria-label="Edit exercise"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setIsDeleteExerciseDialogOpen(true);
                        }}
                        className="icon-button icon-button-danger"
                        title="Delete exercise"
                        aria-label="Delete exercise"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AddExerciseModal
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
          onSubmit={handleAddExercise}
        />

        <EditWorkoutModal
          isOpen={isEditWorkoutModalOpen}
          onClose={() => setIsEditWorkoutModalOpen(false)}
          onSubmit={handleEditWorkout}
          workout={workout}
        />

        <EditExerciseModal
          isOpen={isEditExerciseModalOpen}
          onClose={() => setIsEditExerciseModalOpen(false)}
          onSubmit={handleEditExercise}
          exercise={selectedExercise}
        />

        <ConfirmDialog
          isOpen={isDeleteWorkoutDialogOpen}
          onClose={() => setIsDeleteWorkoutDialogOpen(false)}
          onConfirm={handleDeleteWorkout}
          title="Delete Workout"
          message={`Are you sure you want to delete "${workout?.name}"? This will also delete all exercises in this workout. This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={isDeleteExerciseDialogOpen}
          onClose={() => setIsDeleteExerciseDialogOpen(false)}
          onConfirm={handleDeleteExercise}
          title="Delete Exercise"
          message={`Are you sure you want to delete "${selectedExercise?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
}

export default function WorkoutDetail({ params }) {
  return (
    <AuthGuard>
      <WorkoutDetailContent params={params} />
    </AuthGuard>
  );
}
