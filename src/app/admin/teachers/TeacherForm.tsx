"use client";

import { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { createTeacherAction, updateTeacherAction } from "./actions";

interface TeacherFormProps {
  onClose: () => void;
  onSuccess: () => void;
  teacher?: any;
}

const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["Active", "On Leave", "Inactive"];

export default function TeacherForm({ onClose, onSuccess, teacher }: TeacherFormProps) {
  const isEdit = !!teacher;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(formRef.current!);
    const result = isEdit
      ? await updateTeacherAction(teacher._id, formData)
      : await createTeacherAction(formData);
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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              {isEdit ? "Edit Teacher" : "Add New Teacher"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {isEdit ? "Update faculty member information." : "Fill in the details to add a new faculty member."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} id="teacher-form">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input name="name" type="text" required defaultValue={teacher?.name} className={inputClass} placeholder="e.g. Prof. John Smith" />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input name="email" type="email" required defaultValue={teacher?.email} className={inputClass} placeholder="j.smith@school.edu" />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input name="phone" type="text" required defaultValue={teacher?.phone} className={inputClass} placeholder="555-1000" />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select name="gender" required defaultValue={teacher?.gender || ""} className={inputClass}>
                    <option value="" disabled>Select gender...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input name="address" type="text" defaultValue={teacher?.address} className={inputClass} placeholder="123 Faculty Row, City" />
                </div>
                <div>
                  <label className={labelClass}>Join Date</label>
                  <input name="joinDate" type="date" defaultValue={teacher?.joinDate ? new Date(teacher.joinDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} className={inputClass} />
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 pt-2">Professional Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Subject(s) *</label>
                  <input name="subject" type="text" required defaultValue={teacher?.subject} className={inputClass} placeholder="Mathematics, Physics" />
                </div>
                <div>
                  <label className={labelClass}>Qualification *</label>
                  <input name="qualification" type="text" required defaultValue={teacher?.qualification} className={inputClass} placeholder="PhD in Mathematics" />
                </div>
                <div>
                  <label className={labelClass}>Experience (years) *</label>
                  <input name="experience" type="number" min="0" required defaultValue={teacher?.experience ?? 0} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Annual Salary ($) *</label>
                  <input name="salary" type="number" min="0" required defaultValue={teacher?.salary ?? 0} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" defaultValue={teacher?.status || "Active"} className={inputClass}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Assigned Classes</label>
                  <input name="classes" type="text" defaultValue={teacher?.classes?.join(", ")} className={inputClass} placeholder="Grade 10, Grade 12" />
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Comma-separated list of grades.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0 bg-gray-50/50 dark:bg-zinc-900/50 rounded-b-2xl">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button form="teacher-form" type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 shadow-sm">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Teacher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
