"use client";

import { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { createClassAction, updateClassAction } from "./actions";

interface ClassFormProps {
  onClose: () => void;
  onSuccess: () => void;
  classData?: any; // existing class for edit mode
  teachers: any[]; // list of teachers for assignment
}

const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["A", "B", "C", "D"];

export default function ClassForm({ onClose, onSuccess, classData, teachers }: ClassFormProps) {
  const isEdit = !!classData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(formRef.current!);
    const result = isEdit
      ? await updateClassAction(classData._id, formData)
      : await createClassAction(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300 transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              {isEdit ? "Edit Class" : "Create New Class"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {isEdit ? "Update class properties and assign teachers." : "Define a new class and section."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} id="class-form">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Grade *</label>
                  <select name="grade" required defaultValue={classData?.grade || ""} className={inputClass} disabled={isEdit}>
                    <option value="" disabled>Select Grade...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Section *</label>
                  <select name="section" required defaultValue={classData?.section || ""} className={inputClass} disabled={isEdit}>
                    <option value="" disabled>Select Section...</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Capacity *</label>
                <input name="capacity" type="number" min="1" required defaultValue={classData?.capacity || 40} className={inputClass} placeholder="40" />
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Maximum number of students permitted.</p>
              </div>

              <div>
                <label className={labelClass}>Class Teacher</label>
                <select name="classTeacher" defaultValue={classData?.classTeacher?._id || classData?.classTeacher || ""} className={inputClass}>
                  <option value="">-- No Class Teacher Assigned --</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.subject || "Teacher"})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Assigning a teacher makes them responsible for class attendance and summary blocks.</p>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0 bg-gray-50/50 dark:bg-zinc-900/50 rounded-b-2xl">
          {error && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button form="class-form" type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 shadow-sm">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Class"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
