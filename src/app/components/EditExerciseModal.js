"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

const STRENGTH_EXERCISES_BY_GROUP = {
  Chest: ["Bench Press", "Dips"],
  Back: ["Deadlift", "Barbell Row", "Pull-ups", "Lat Pulldown"],
  Shoulders: ["Shoulder Press"],
  Arms: ["Bicep Curls", "Tricep Extensions"],
  Legs: ["Squat", "Leg Press", "Lunges"],
};

const ALL_STRENGTH = Object.values(STRENGTH_EXERCISES_BY_GROUP).flat();

const CARDIO_EXERCISES = [
  "Running",
  "Cycling",
  "Swimming",
  "Rowing",
  "Elliptical",
  "Jump Rope",
  "Stair Climber",
  "Walking",
  "HIIT",
  "Custom",
];

export default function EditExerciseModal({ isOpen, onClose, onSubmit, exercise }) {
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    customName: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when exercise changes or modal opens
  useEffect(() => {
    if (exercise && isOpen) {
      // Determine if exercise name is custom
      const isStrengthCustom = exercise.category === "Strength" &&
        !ALL_STRENGTH.includes(exercise.name);
      const isCardioCustom = exercise.category === "Cardio" &&
        !CARDIO_EXERCISES.slice(0, -1).includes(exercise.name);
      const isCustom = isStrengthCustom || isCardioCustom;

      setFormData({
        category: exercise.category || "",
        name: isCustom ? "Custom" : exercise.name || "",
        customName: isCustom ? exercise.name : "",
        sets: exercise.sets?.toString() || "",
        reps: exercise.reps?.toString() || "",
        weight: exercise.weight?.toString() || "",
        duration: exercise.duration?.toString() || "",
        notes: exercise.notes || "",
      });
      setErrors({}); // Clear errors when opening
    }
  }, [exercise, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate category
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    // Validate exercise name/customName
    if (formData.category === "Other" && !formData.customName.trim()) {
      newErrors.customName = "Exercise name is required";
    } else if (formData.category && formData.category !== "Other") {
      if (!formData.name) {
        newErrors.name = "Please select an exercise";
      } else if (formData.name === "Custom" && !formData.customName.trim()) {
        newErrors.customName = "Custom exercise name is required";
      }
    }

    // Validate strength fields
    if (formData.category === "Strength") {
      if (!formData.sets) {
        newErrors.sets = "Sets is required";
      }
      if (!formData.reps || parseInt(formData.reps) < 1) {
        newErrors.reps = "Reps must be at least 1";
      }
      if (formData.weight && parseFloat(formData.weight) < 0) {
        newErrors.weight = "Weight cannot be negative";
      }
    }

    // Validate cardio fields
    if (formData.category === "Cardio") {
      if (!formData.duration) {
        newErrors.duration = "Duration is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Determine the final exercise name
    const exerciseName =
      formData.category === "Other"
        ? formData.customName
        : formData.name === "Custom"
          ? formData.customName
          : formData.name;

    // Build exercise object based on category
    let exerciseData = {
      category: formData.category,
      name: exerciseName,
      notes: formData.notes,
    };

    if (formData.category === "Strength") {
      exerciseData = {
        ...exerciseData,
        sets: parseInt(formData.sets),
        reps: parseInt(formData.reps),
        weight: parseFloat(formData.weight) || 0,
      };
    } else if (formData.category === "Cardio") {
      exerciseData = {
        ...exerciseData,
        duration: parseInt(formData.duration),
      };
    }

    // Simulate brief loading for UX
    await new Promise(resolve => setTimeout(resolve, 400));

    onSubmit(exerciseData);
    setIsSubmitting(false);
  };

  const getExerciseOptions = () => {
    if (formData.category === "Cardio") return CARDIO_EXERCISES;
    return [];
  };

  const showCustomInput = formData.name === "Custom" && formData.category !== "Other";
  const showExerciseDropdown =
    formData.category === "Strength" || formData.category === "Cardio";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Exercise">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label htmlFor="edit-category" className="form-label">
            Category
          </label>
          <select
            id="edit-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-select ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">Select category...</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Exercise Name - Dropdown for Strength/Cardio */}
        {showExerciseDropdown && (
          <div>
            <label htmlFor="edit-exercise-name" className="form-label">
              Exercise
            </label>
            <select
              id="edit-exercise-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-select ${errors.name ? 'border-red-500' : ''}`}
            >
              <option value="">Select exercise...</option>
              {formData.category === "Strength" ? (
                <>
                  {Object.entries(STRENGTH_EXERCISES_BY_GROUP).map(([group, exercises]) => (
                    <optgroup key={group} label={group}>
                      {exercises.map((exercise) => (
                        <option key={exercise} value={exercise}>{exercise}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="Custom">Custom</option>
                </>
              ) : (
                getExerciseOptions().map((exercise) => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))
              )}
            </select>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
        )}

        {/* Exercise Name - Text Input for Other */}
        {formData.category === "Other" && (
          <div>
            <label htmlFor="edit-custom-name" className="form-label">
              Exercise Name
            </label>
            <input
              type="text"
              id="edit-custom-name"
              name="customName"
              value={formData.customName}
              onChange={handleChange}
              className={`form-input ${errors.customName ? 'border-red-500' : ''}`}
              placeholder="Enter exercise name"
            />
            {errors.customName && (
              <p className="text-red-500 text-sm mt-1">{errors.customName}</p>
            )}
          </div>
        )}

        {/* Custom Exercise Name Input */}
        {showCustomInput && (
          <div>
            <label htmlFor="edit-custom-name-2" className="form-label">
              Custom Exercise Name
            </label>
            <input
              type="text"
              id="edit-custom-name-2"
              name="customName"
              value={formData.customName}
              onChange={handleChange}
              className={`form-input ${errors.customName ? 'border-red-500' : ''}`}
              placeholder="Enter custom exercise name"
            />
            {errors.customName && (
              <p className="text-red-500 text-sm mt-1">{errors.customName}</p>
            )}
          </div>
        )}

        {/* Strength-specific fields */}
        {formData.category === "Strength" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-sets" className="form-label">
                  Sets
                </label>
                <select
                  id="edit-sets"
                  name="sets"
                  value={formData.sets}
                  onChange={handleChange}
                  className={`form-select ${errors.sets ? 'border-red-500' : ''}`}
                >
                  <option value="">Sets</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                {errors.sets && (
                  <p className="text-red-500 text-sm mt-1">{errors.sets}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-reps" className="form-label">
                  Reps
                </label>
                <input
                  type="number"
                  id="edit-reps"
                  name="reps"
                  value={formData.reps}
                  onChange={handleChange}
                  className={`form-input ${errors.reps ? 'border-red-500' : ''}`}
                  placeholder="Enter reps"
                  min="1"
                  step="1"
                />
                {errors.reps && (
                  <p className="text-red-500 text-sm mt-1">{errors.reps}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="edit-weight" className="form-label">
                Weight (lbs)
              </label>
              <input
                type="number"
                id="edit-weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`form-input ${errors.weight ? 'border-red-500' : ''}`}
                placeholder="Enter weight"
                min="0"
                step="1"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
              )}
            </div>
          </>
        )}

        {/* Cardio-specific fields */}
        {formData.category === "Cardio" && (
          <div>
            <label htmlFor="edit-duration" className="form-label">
              Duration (minutes)
            </label>
            <select
              id="edit-duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`form-select ${errors.duration ? 'border-red-500' : ''}`}
            >
              <option value="">Select duration...</option>
              {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>
        )}

        {/* Notes - Always shown */}
        {formData.category && (
          <div>
            <label htmlFor="edit-notes" className="form-label">
              Notes (optional)
            </label>
            <textarea
              id="edit-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Add any notes about this exercise..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
