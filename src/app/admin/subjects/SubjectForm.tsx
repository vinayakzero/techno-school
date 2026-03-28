"use client";

import { useState } from "react";
import { addSubjectAction, updateSubjectAction } from "./actions";

export default function SubjectForm({ 
  onClose, 
  onSuccess, 
  subjectToEdit,
  teachers
}: { 
  onClose: () => void, 
  onSuccess?: () => void,
  subjectToEdit?: any,
  teachers: any[]
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    let res;

    if (subjectToEdit) {
      res = await updateSubjectAction(subjectToEdit._id, formData);
    } else {
      res = await addSubjectAction(formData);
    }

    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(res.error || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl shadow-black/10 overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            {subjectToEdit ? "Edit Subject" : "Add New Subject"}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors text-gray-500"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm whitespace-nowrap">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Subject Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                defaultValue={subjectToEdit?.name || ""}
                placeholder="e.g. Mathematics"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Subject Code *</label>
                <input 
                  type="text" 
                  name="code" 
                  required 
                  defaultValue={subjectToEdit?.code || ""}
                  placeholder="e.g. MAT101"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Grade *</label>
                <select 
                  name="grade" 
                  required 
                  defaultValue={subjectToEdit?.grade || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="" disabled>Select Grade...</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Pre-K">Pre-K</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Assigned Teacher (Optional)</label>
              <select 
                name="assignedTeacher" 
                defaultValue={subjectToEdit?.assignedTeacher?._id || subjectToEdit?.assignedTeacher || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="">-- No Teacher Assigned --</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.subject})</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold transition-all active:scale-[0.98]"
              >
                {loading ? "Saving..." : subjectToEdit ? "Update Subject" : "Create Subject"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
