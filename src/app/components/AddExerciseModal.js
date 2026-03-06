"use client";

import { useState } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import { useExerciseTemplates } from "../context/ExerciseTemplateContext";

const STRENGTH_EXERCISES_BY_GROUP = {
  Chest: ["Bench Press", "Dips"],
  Back: ["Deadlift", "Barbell Row", "Pull-ups", "Lat Pulldown"],
  Shoulders: ["Shoulder Press"],
  Arms: ["Bicep Curls", "Tricep Extensions"],
  Legs: ["Squat", "Leg Press", "Lunges"],
};

const CARDIO_EXERCISES = [
  "Running", "Cycling", "Swimming", "Rowing", "Elliptical",
  "Jump Rope", "Stair Climber", "Walking", "HIIT", "Custom",
];

export default function AddExerciseModal({ isOpen, onClose, onSubmit }) {
  const { templates } = useExerciseTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset template selection when switching away from Template category
    if (name === "category" && value !== "Template") {
      setSelectedTemplateId("");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (formData.category === "Template") {
      if (!selectedTemplateId) newErrors.templateId = "Please select a template";
    } else if (formData.category === "Other") {
      if (!formData.customName.trim()) newErrors.customName = "Exercise name is required";
    } else if (formData.category) {
      if (!formData.name) newErrors.name = "Please select an exercise";
      else if (formData.name === "Custom" && !formData.customName.trim()) {
        newErrors.customName = "Custom exercise name is required";
      }
    }

    if (formData.category === "Strength") {
      if (!formData.sets) newErrors.sets = "Sets is required";
      if (!formData.reps || parseInt(formData.reps) < 1) newErrors.reps = "Reps must be at least 1";
      if (formData.weight && parseFloat(formData.weight) < 0) newErrors.weight = "Weight cannot be negative";
    }

    if (formData.category === "Cardio") {
      if (!formData.duration) newErrors.duration = "Duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;
    setIsSubmitting(true);

    let exerciseData;

    if (formData.category === "Template") {
      const template = templates.find((t) => t.id === selectedTemplateId);
      exerciseData = {
        category: template.category,
        name: template.name,
        notes: template.notes || "",
        ...(template.category === "Strength"
          ? { sets: template.sets, reps: template.reps, weight: template.weight }
          : {}),
        ...(template.category === "Cardio" ? { duration: template.duration } : {}),
      };
    } else {
      const exerciseName =
        formData.category === "Other"
          ? formData.customName
          : formData.name === "Custom"
            ? formData.customName
            : formData.name;

      exerciseData = {
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
        exerciseData = { ...exerciseData, duration: parseInt(formData.duration) };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    onSubmit(exerciseData);

    setSelectedTemplateId("");
    setFormData({ category: "", name: "", customName: "", sets: "", reps: "", weight: "", duration: "", notes: "" });
    setErrors({});
    setIsSubmitting(false);
  };

  const showExerciseDropdown = formData.category === "Strength" || formData.category === "Cardio";
  // Only show custom name input for Strength/Cardio "Custom" selection — not for Other
  const showCustomInput = formData.name === "Custom" && formData.category !== "Other";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-select ${errors.category ? "border-red-500" : ""}`}
          >
            <option value="">Select category...</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="Other">Other</option>
            {templates.length > 0 && <option value="Template">Template</option>}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Template selection */}
        {formData.category === "Template" && (
          <div>
            <label htmlFor="templateSelect" className="form-label">Template</label>
            <select
              id="templateSelect"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className={`form-select ${errors.templateId ? "border-red-500" : ""}`}
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateName || t.name}
                  {t.templateName && t.templateName !== t.name ? ` (${t.name})` : ""}
                  {t.category === "Strength"
                    ? ` — ${t.sets}×${t.reps}${t.weight > 0 ? ` @ ${t.weight} lbs` : ""}`
                    : t.category === "Cardio"
                    ? ` — ${t.duration} min`
                    : ""}
                </option>
              ))}
            </select>
            {errors.templateId && <p className="text-red-500 text-sm mt-1">{errors.templateId}</p>}
          </div>
        )}

        {/* Exercise dropdown for Strength/Cardio */}
        {showExerciseDropdown && (
          <div>
            <label htmlFor="name" className="form-label">Exercise</label>
            <select
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-select ${errors.name ? "border-red-500" : ""}`}
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
                CARDIO_EXERCISES.map((exercise) => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))
              )}
            </select>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        )}

        {/* Exercise name for Other */}
        {formData.category === "Other" && (
          <div>
            <label htmlFor="customName" className="form-label">Exercise Name</label>
            <input
              type="text"
              id="customName"
              name="customName"
              value={formData.customName}
              onChange={handleChange}
              className={`form-input ${errors.customName ? "border-red-500" : ""}`}
              placeholder="Enter exercise name"
            />
            {errors.customName && <p className="text-red-500 text-sm mt-1">{errors.customName}</p>}
          </div>
        )}

        {/* Custom name for Strength/Cardio "Custom" option */}
        {showCustomInput && (
          <div>
            <label htmlFor="customName" className="form-label">Custom Exercise Name</label>
            <input
              type="text"
              id="customName"
              name="customName"
              value={formData.customName}
              onChange={handleChange}
              className={`form-input ${errors.customName ? "border-red-500" : ""}`}
              placeholder="Enter custom exercise name"
            />
            {errors.customName && <p className="text-red-500 text-sm mt-1">{errors.customName}</p>}
          </div>
        )}

        {/* Strength fields */}
        {formData.category === "Strength" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sets" className="form-label">Sets</label>
                <select
                  id="sets"
                  name="sets"
                  value={formData.sets}
                  onChange={handleChange}
                  className={`form-select ${errors.sets ? "border-red-500" : ""}`}
                >
                  <option value="">Sets</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                {errors.sets && <p className="text-red-500 text-sm mt-1">{errors.sets}</p>}
              </div>
              <div>
                <label htmlFor="reps" className="form-label">Reps</label>
                <input
                  type="number"
                  id="reps"
                  name="reps"
                  value={formData.reps}
                  onChange={handleChange}
                  className={`form-input ${errors.reps ? "border-red-500" : ""}`}
                  placeholder="Enter reps"
                  min="1"
                  step="1"
                />
                {errors.reps && <p className="text-red-500 text-sm mt-1">{errors.reps}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="weight" className="form-label">Weight (lbs)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter weight"
                min="0"
                step="1"
              />
            </div>
          </>
        )}

        {/* Cardio fields */}
        {formData.category === "Cardio" && (
          <div>
            <label htmlFor="duration" className="form-label">Duration (minutes)</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`form-select ${errors.duration ? "border-red-500" : ""}`}
            >
              <option value="">Select duration...</option>
              {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>
        )}

        {/* Notes — not shown for Template since it carries its own */}
        {formData.category && formData.category !== "Template" && (
          <div>
            <label htmlFor="notes" className="form-label">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Add any notes about this exercise..."
            />
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><LoadingSpinner size="small" />Adding...</>
            ) : (
              "Add Exercise"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
