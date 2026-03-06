"use client";

import { useState } from "react";
import { useExerciseTemplates } from "../context/ExerciseTemplateContext";
import { useToast } from "../context/ToastContext";
import ExerciseTemplateModal from "./ExerciseTemplateModal";
import ConfirmDialog from "./ConfirmDialog";
import FloatingActionButton from "./FloatingActionButton";

function templateSummary(template) {
  if (template.category === "Strength") {
    const parts = [`${template.sets} × ${template.reps}`];
    if (template.weight > 0) parts.push(`@ ${template.weight} lbs`);
    return parts.join(" ");
  }
  if (template.category === "Cardio") {
    return `${template.duration} min`;
  }
  return template.category;
}

export default function ExerciseTemplatesView() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useExerciseTemplates();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleAdd = async (data) => {
    try {
      await addTemplate(data);
      setIsAddModalOpen(false);
      showToast("Template saved!", "success");
    } catch (error) {
      showToast(error.message || "Failed to save template");
    }
  };

  const handleEditClick = (template) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleEdit = async (data) => {
    try {
      await updateTemplate(selectedTemplate.id, data);
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
      showToast("Template updated!", "success");
    } catch (error) {
      showToast(error.message || "Failed to update template");
    }
  };

  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteTemplate(selectedTemplate.id);
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
      showToast("Template deleted", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete template");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Exercise Templates
        </h2>
        <button className="btn-primary hide-on-mobile" onClick={() => setIsAddModalOpen(true)}>
          + Add Template
        </button>
      </div>

      {templates.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            No Templates Yet
          </p>
          <p className="text-base font-medium mb-6" style={{ color: "var(--text-secondary)" }}>
            Save your go-to exercises so you can load them quickly when logging a workout.
          </p>
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {templates.map((template) => (
            <div key={template.id} className="workout-card animate-fade-up">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{template.templateName || template.name}</h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {template.name} · {template.category} · {templateSummary(template)}
                </p>
                {template.notes && (
                  <p className="text-xs mt-1 italic" style={{ color: "var(--text-light)" }}>{template.notes}</p>
                )}
              </div>
              <div className="icon-button-group">
                <button
                  onClick={() => handleEditClick(template)}
                  className="icon-button icon-button-edit"
                  title="Edit template"
                  aria-label="Edit template"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteClick(template)}
                  className="icon-button icon-button-danger"
                  title="Delete template"
                  aria-label="Delete template"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>

    {/* Fixed-position elements outside the transformed div */}
    <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

    <ExerciseTemplateModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSubmit={handleAdd}
      template={null}
    />

    {/* key forces re-mount (and fresh state) when switching between templates */}
    <ExerciseTemplateModal
      key={selectedTemplate?.id}
      isOpen={isEditModalOpen}
      onClose={() => { setIsEditModalOpen(false); setSelectedTemplate(null); }}
      onSubmit={handleEdit}
      template={selectedTemplate}
    />

    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => { setIsDeleteDialogOpen(false); setSelectedTemplate(null); }}
      onConfirm={handleDelete}
      title="Delete Template"
      message={`Are you sure you want to delete the "${selectedTemplate?.name}" template? This action cannot be undone.`}
      confirmText="Delete"
      variant="danger"
    />
    </>
  );
}
