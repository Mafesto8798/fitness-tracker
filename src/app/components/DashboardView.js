"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddWorkoutModal from "./AddWorkoutModal";
import { useWorkouts } from "../context/WorkoutContext";
import { useToast } from "../context/ToastContext";
import StatCard from "./StatCard";
import { getStartOfWeek, getEndOfWeek, formatDateRange } from "../utils/dateUtils";
import {
  calculateWorkoutStats,
  getWorkoutsInRange,
  getExerciseCount
} from "../utils/statsCalculator";

function getTodayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMMDDYYYY(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

export default function DashboardView() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { workouts, loading, addWorkout } = useWorkouts();
  const { showToast } = useToast();

  const today = getTodayLocal();

  // Get this week's date range
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();
  const dateRangeText = formatDateRange(startOfWeek, endOfWeek);

  // Get workouts for this week
  const workoutsThisWeek = getWorkoutsInRange(workouts, startOfWeek, endOfWeek);

  // Calculate stats
  const stats = calculateWorkoutStats(workoutsThisWeek);

  // Today's workouts
  const todaysWorkouts = workouts.filter((w) => !w.isTemplate && w.date === today);

  // Recent workouts excluding today (last 3, already sorted desc by Firestore)
  const recentWorkouts = workouts
    .filter((w) => !w.isTemplate && w.date !== today)
    .slice(0, 3);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
          <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="animate-fade-up">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold mb-1" style={{color: 'var(--text-primary)'}}>
          This Week&apos;s Progress
        </h2>
        <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
          {dateRangeText}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 stagger-children">
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{color:'var(--primary)'}}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          title="Workouts"
          value={stats.workoutCount}
          subtitle="This week"
          color="primary"
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{color:'#5B9BD5'}}>
              <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4" />
            </svg>
          }
          title="Total Exercises"
          value={stats.totalExercises}
          subtitle={`${stats.strengthCount} Strength · ${stats.cardioCount} Cardio`}
          color="info"
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{color:'#4CAF7D'}}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          }
          title="Cardio Time"
          value={`${stats.totalCardioMinutes} min`}
          subtitle="Total minutes"
          color="success"
        />
      </div>

      {/* Today's Section */}
      <div className="card mb-4">
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
          Today
        </h3>

        {todaysWorkouts.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-base font-semibold mb-1" style={{color: 'var(--text-primary)'}}>
              Let&apos;s get started!
            </p>
            <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>
              No workouts logged for today yet.
            </p>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              + Add Workout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="flex justify-between items-center p-3 rounded-xl transition-all"
                style={{background: 'var(--input-background)'}}
              >
                <div>
                  <h4 className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>
                    {workout.name}
                  </h4>
                  {workout.label && (
                    <p className="text-xs mt-0.5" style={{color: 'var(--text-secondary)'}}>
                      {workout.label}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background: 'rgba(107,155,111,0.12)', color: 'var(--primary)'}}>
                  {getExerciseCount(workout)} exercises
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Workouts (excluding today) */}
      {recentWorkouts.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
            Recent Workouts
          </h3>
          <div className="space-y-2">
            {recentWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="flex justify-between items-center p-3 rounded-xl transition-all"
                style={{background: 'var(--input-background)'}}
              >
                <div>
                  <h4 className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>
                    {workout.name}
                  </h4>
                  <p className="text-xs mt-0.5" style={{color: 'var(--text-secondary)'}}>
                    {formatMMDDYYYY(workout.date)}{workout.label ? ` · ${workout.label}` : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background: 'rgba(107,155,111,0.12)', color: 'var(--primary)'}}>
                  {getExerciseCount(workout)} exercises
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>

    {/* Fixed-position modal outside the transformed div */}
    <AddWorkoutModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleAddWorkout}
    />
    </>
  );
}
