"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

export default function EditWorkoutModal({ isOpen, onClose, onSubmit, workout }) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    label: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when workout changes or modal opens
  useEffect(() => {
    if (workout && isOpen) {
      setFormData({
        name: workout.name || "",
        date: workout.date || "",
        label: workout.label || "",
      });
      setErrors({}); // Clear errors when opening
    }
  }, [workout, isOpen]);

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

    // Validate workout name
    if (!formData.name.trim()) {
      newErrors.name = "Workout name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Workout name must be at least 2 characters";
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (selectedDate > oneYearFromNow) {
        newErrors.date = "Date cannot be more than 1 year in the future";
      }
    }

    // Validate label
    if (!formData.label) {
      newErrors.label = "Please select a label";
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

    // Simulate brief loading for UX
    await new Promise(resolve => setTimeout(resolve, 400));

    onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Workout">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="edit-name" className="form-label">
            Workout Name
          </label>
          <input
            type="text"
            id="edit-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Morning Workout"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-date" className="form-label">
            Date
          </label>
          <input
            type="date"
            id="edit-date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'border-red-500' : ''}`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-label" className="form-label">
            Label
          </label>
          <select
            id="edit-label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            className={`form-select ${errors.label ? 'border-red-500' : ''}`}
          >
            <option value="">Select a label...</option>
            <option value="Chest">Chest</option>
            <option value="Back">Back</option>
            <option value="Upper Body">Upper Body</option>
            <option value="Lower Body">Lower Body</option>
            <option value="Cardio">Cardio</option>
            <option value="Full Body">Full Body</option>
          </select>
          {errors.label && (
            <p className="text-red-500 text-sm mt-1">{errors.label}</p>
          )}
        </div>

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
