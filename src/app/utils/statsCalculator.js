/**
 * Statistics calculation functions for fitness tracker
 */

/**
 * Calculate workout statistics for a given list of workouts
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Statistics object
 */
export function calculateWorkoutStats(workouts) {
  let totalExercises = 0;
  let strengthCount = 0;
  let cardioCount = 0;
  let otherCount = 0;
  let totalCardioMinutes = 0;

  workouts.forEach(workout => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach(exercise => {
        totalExercises++;

        if (exercise.category === 'Strength') {
          strengthCount++;
        } else if (exercise.category === 'Cardio') {
          cardioCount++;
          totalCardioMinutes += exercise.duration || 0;
        } else {
          otherCount++;
        }
      });
    }
  });

  return {
    totalExercises,
    strengthCount,
    cardioCount,
    otherCount,
    totalCardioMinutes,
    workoutCount: workouts.length
  };
}

/**
 * Get workouts within a specific date range
 * @param {Array} workouts - Array of workout objects
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {Array} Filtered workouts
 */
export function getWorkoutsInRange(workouts, startDate, endDate) {
  return workouts.filter(workout => {
    // Skip templates (they don't have dates)
    if (workout.isTemplate) return false;

    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });
}

/**
 * Get the most recent N workouts
 * @param {Array} workouts - Array of workout objects
 * @param {number} count - Number of workouts to return
 * @returns {Array} Most recent workouts
 */
export function getRecentWorkouts(workouts, count = 3) {
  // Filter out templates
  const regularWorkouts = workouts.filter(w => !w.isTemplate);

  // Sort by date descending (most recent first)
  return regularWorkouts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
}

/**
 * Calculate total weight lifted across all strength exercises
 * @param {Array} workouts - Array of workout objects
 * @returns {number} Total weight in lbs
 */
export function calculateTotalWeightLifted(workouts) {
  let totalWeight = 0;

  workouts.forEach(workout => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach(exercise => {
        if (exercise.category === 'Strength') {
          const weight = exercise.weight || 0;
          const sets = exercise.sets || 0;
          const reps = exercise.reps || 0;
          totalWeight += weight * sets * reps;
        }
      });
    }
  });

  return totalWeight;
}

/**
 * Get exercise count for a specific workout
 * @param {Object} workout - Workout object
 * @returns {number} Number of exercises
 */
export function getExerciseCount(workout) {
  return workout.exercises ? workout.exercises.length : 0;
}
