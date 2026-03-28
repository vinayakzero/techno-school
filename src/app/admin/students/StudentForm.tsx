"use client";

import { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { createStudentAction, updateStudentAction } from "./actions";

interface StudentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  student?: any; // existing student for edit mode
}

const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["A", "B", "C", "D"];
const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["Active", "Pending", "Inactive"];

export default function StudentForm({ onClose, onSuccess, student }: StudentFormProps) {
  const isEdit = !!student;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(formRef.current!);
    const result = isEdit
      ? await updateStudentAction(student._id, formData)
      : await createStudentAction(formData);
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
              {isEdit ? "Edit Student" : "Add New Student"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {isEdit ? "Update student information." : "Fill in the details to enroll a new student."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} id="student-form">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input name="name" type="text" required defaultValue={student?.name} className={inputClass} placeholder="e.g. Alex Johnson" />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input name="email" type="email" required defaultValue={student?.email} className={inputClass} placeholder="alex@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input name="phone" type="text" required defaultValue={student?.phone} className={inputClass} placeholder="555-0100" />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input name="dateOfBirth" type="date" required defaultValue={student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select name="gender" required defaultValue={student?.gender || ""} className={inputClass}>
                    <option value="" disabled>Select gender...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input name="address" type="text" defaultValue={student?.address} className={inputClass} placeholder="123 Main St, City" />
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 pt-2">Academic Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Grade *</label>
                  <select name="grade" required defaultValue={student?.grade || ""} className={inputClass}>
                    <option value="" disabled>Select grade...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Section *</label>
                  <select name="section" required defaultValue={student?.section || ""} className={inputClass}>
                    <option value="" disabled>Select section...</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" defaultValue={student?.status || "Active"} className={inputClass}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 pt-2">Parent / Guardian Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Parent / Guardian Name *</label>
                  <input name="parentName" type="text" required defaultValue={student?.parentName} className={inputClass} placeholder="Robert Johnson" />
                </div>
                <div>
                  <label className={labelClass}>Parent / Guardian Phone *</label>
                  <input name="parentPhone" type="text" required defaultValue={student?.parentPhone} className={inputClass} placeholder="555-0200" />
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
            <button form="student-form" type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 shadow-sm">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Enroll Student"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
