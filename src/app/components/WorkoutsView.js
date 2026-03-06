"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddWorkoutModal from "./AddWorkoutModal";
import EditWorkoutModal from "./EditWorkoutModal";
import ConfirmDialog from "./ConfirmDialog";
import FloatingActionButton from "./FloatingActionButton";
import { useWorkouts } from "../context/WorkoutContext";
import { useToast } from "../context/ToastContext";

export default function WorkoutsView() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const { workouts, loading, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { showToast } = useToast();

  const handleAddWorkout = async (workoutData) => {
    try {
      const newWorkoutId = await addWorkout(workoutData);
      setIsModalOpen(false);
      showToast("Workout created successfully!", "success");
      router.push(`/workout/${newWorkoutId}`);
    } catch (error) {
      console.error("Error creating workout:", error);
      showToast(error.message || "Failed to create workout");
    }
  };

  const handleEditClick = (e, workout) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWorkout(workout);
    setIsEditModalOpen(true);
  };

  const handleEditWorkout = async (updatedData) => {
    try {
      await updateWorkout(selectedWorkout.id, updatedData);
      setIsEditModalOpen(false);
      setSelectedWorkout(null);
      showToast("Workout updated!", "success");
    } catch (error) {
      console.error("Error updating workout:", error);
      showToast(error.message || "Failed to update workout");
    }
  };

  const handleDeleteClick = (e, workout) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWorkout(workout);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteWorkout = async () => {
    try {
      await deleteWorkout(selectedWorkout.id);
      setIsDeleteDialogOpen(false);
      setSelectedWorkout(null);
      showToast("Workout deleted", "success");
    } catch (error) {
      console.error("Error deleting workout:", error);
      showToast(error.message || "Failed to delete workout");
    }
  };

  // Filter out templates from the workout list
  const regularWorkouts = workouts.filter(w => !w.isTemplate);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
          <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Animated content — no fixed-position descendants */}
      <div className="animate-fade-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>
            My Workouts
          </h2>
          <button className="btn-primary hide-on-mobile" onClick={() => setIsModalOpen(true)}>
            + Add Workout
          </button>
        </div>

        {regularWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-primary-color opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <p className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              Ready to Start Your Fitness Journey?
            </p>
            <p className="text-base font-medium mb-6" style={{color: 'var(--text-secondary)'}}>
              Create your first workout to begin tracking your progress!
            </p>
            <button
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Create Your First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {regularWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="workout-card animate-fade-up"
              >
                <div>
                  <h3 className="text-base font-bold" style={{color: 'var(--text-primary)'}}>{workout.name}</h3>
                  <p className="text-sm mt-0.5" style={{color: 'var(--text-secondary)'}}>
                    {workout.date?.split('-').slice(1).concat(workout.date?.split('-')[0]).join('/')}
                    {workout.label ? ` · ${workout.label}` : ''}
                  </p>
                </div>
                <div className="icon-button-group">
                  <button
                    onClick={(e) => handleEditClick(e, workout)}
                    className="icon-button icon-button-edit"
                    title="Edit workout"
                    aria-label="Edit workout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, workout)}
                    className="icon-button icon-button-danger"
                    title="Delete workout"
                    aria-label="Delete workout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Fixed-position elements outside the transformed div */}
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      <AddWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddWorkout}
      />

      <EditWorkoutModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditWorkout}
        workout={selectedWorkout}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteWorkout}
        title="Delete Workout"
        message={`Are you sure you want to delete "${selectedWorkout?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
