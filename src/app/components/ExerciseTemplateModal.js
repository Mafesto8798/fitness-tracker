"use client";

import { useState } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

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

function buildInitialForm(template) {
  if (!template) {
    return { templateName: "", category: "", name: "", customName: "", sets: "", reps: "", weight: "", duration: "", notes: "" };
  }
  const inStrength = Object.values(STRENGTH_EXERCISES_BY_GROUP).flat().includes(template.name);
  const inCardio = CARDIO_EXERCISES.includes(template.name);
  const isStandard =
    (template.category === "Strength" && inStrength) ||
    (template.category === "Cardio" && inCardio);

  return {
    templateName: template.templateName || "",
    category: template.category || "",
    name: isStandard ? template.name : template.category !== "Other" ? "Custom" : "",
    customName: isStandard ? "" : template.name || "",
    sets: template.sets?.toString() || "",
    reps: template.reps?.toString() || "",
    weight: template.weight?.toString() || "",
    duration: template.duration?.toString() || "",
    notes: template.notes || "",
  };
}

export default function ExerciseTemplateModal({ isOpen, onClose, onSubmit, template }) {
  const isEditing = !!template;
  const [formData, setFormData] = useState(() => buildInitialForm(template));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.templateName.trim()) newErrors.templateName = "Template name is required";
    if (!formData.category) newErrors.category = "Please select a category";

    if (formData.category === "Other") {
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
    if (isSubmitting || !validate()) return;
    setIsSubmitting(true);

    const exerciseName =
      formData.category === "Other"
        ? formData.customName
        : formData.name === "Custom"
          ? formData.customName
          : formData.name;

    let templateData = {
      templateName: formData.templateName.trim(),
      category: formData.category,
      name: exerciseName,
      notes: formData.notes,
    };

    if (formData.category === "Strength") {
      templateData = {
        ...templateData,
        sets: parseInt(formData.sets),
        reps: parseInt(formData.reps),
        weight: parseFloat(formData.weight) || 0,
      };
    } else if (formData.category === "Cardio") {
      templateData = { ...templateData, duration: parseInt(formData.duration) };
    }

    await new Promise((r) => setTimeout(r, 400));
    onSubmit(templateData);
    setFormData(buildInitialForm(null));
    setErrors({});
    setIsSubmitting(false);
  };

  const showExerciseDropdown = formData.category === "Strength" || formData.category === "Cardio";
  const showCustomInput = formData.name === "Custom";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Template" : "Add Template"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Name */}
        <div>
          <label htmlFor="tmpl-templateName" className="form-label">Template Name</label>
          <input
            type="text"
            id="tmpl-templateName"
            name="templateName"
            value={formData.templateName}
            onChange={handleChange}
            className={`form-input ${errors.templateName ? "border-red-500" : ""}`}
            placeholder="e.g., Standard Bench Set"
          />
          {errors.templateName && <p className="text-red-500 text-sm mt-1">{errors.templateName}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="tmpl-category" className="form-label">Category</label>
          <select
            id="tmpl-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-select ${errors.category ? "border-red-500" : ""}`}
          >
            <option value="">Select category...</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Exercise dropdown */}
        {showExerciseDropdown && (
          <div>
            <label htmlFor="tmpl-name" className="form-label">Exercise</label>
            <select
              id="tmpl-name"
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
                      {exercises.map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="Custom">Custom</option>
                </>
              ) : (
                CARDIO_EXERCISES.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))
              )}
            </select>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        )}

        {/* Other category free-text */}
        {formData.category === "Other" && (
          <div>
            <label htmlFor="tmpl-customName-other" className="form-label">Exercise Name</label>
            <input
              type="text"
              id="tmpl-customName-other"
              name="customName"
              value={formData.customName}
              onChange={handleChange}
              className={`form-input ${errors.customName ? "border-red-500" : ""}`}
              placeholder="Enter exercise name"
            />
            {errors.customName && <p className="text-red-500 text-sm mt-1">{errors.customName}</p>}
          </div>
        )}

        {/* Custom exercise name */}
        {showCustomInput && (
          <div>
            <label htmlFor="tmpl-customName" className="form-label">Custom Exercise Name</label>
            <input
              type="text"
              id="tmpl-customName"
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
                <label htmlFor="tmpl-sets" className="form-label">Sets</label>
                <select
                  id="tmpl-sets"
                  name="sets"
                  value={formData.sets}
                  onChange={handleChange}
                  className={`form-select ${errors.sets ? "border-red-500" : ""}`}
                >
                  <option value="">Sets</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {errors.sets && <p className="text-red-500 text-sm mt-1">{errors.sets}</p>}
              </div>
              <div>
                <label htmlFor="tmpl-reps" className="form-label">Reps</label>
                <input
                  type="number"
                  id="tmpl-reps"
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
              <label htmlFor="tmpl-weight" className="form-label">Weight (lbs)</label>
              <input
                type="number"
                id="tmpl-weight"
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
            <label htmlFor="tmpl-duration" className="form-label">Duration (minutes)</label>
            <select
              id="tmpl-duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select duration...</option>
              {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        {formData.category && (
          <div>
            <label htmlFor="tmpl-notes" className="form-label">Notes (optional)</label>
            <textarea
              id="tmpl-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Add any notes..."
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
              <><LoadingSpinner size="small" />{isEditing ? "Saving..." : "Adding..."}</>
            ) : (
              isEditing ? "Save Template" : "Add Template"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
