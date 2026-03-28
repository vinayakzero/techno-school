"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClassAction, updateClassAction } from "./actions";

const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["A", "B", "C", "D"];

export default function ClassForm({ classData, teachers, backHref = "/admin/classes" }: { classData?: any; teachers: any[]; backHref?: string }) {
  const router = useRouter();
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
      router.push("/admin/classes");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300 transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
          <ArrowLeft size={16} />
          Back to Classes
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">
          {isEdit ? "Edit Class" : "Create New Class"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {isEdit ? "Update class properties and assign teachers." : "Define a new class and section."}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} id="class-form">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Maximum number of students permitted.</p>
              </div>

              <div>
                <label className={labelClass}>Class Teacher</label>
                <select name="classTeacher" defaultValue={classData?.classTeacher?._id || classData?.classTeacher || ""} className={inputClass}>
                  <option value="">-- No Class Teacher Assigned --</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.subject || "Teacher"})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Assigning a teacher makes them responsible for class attendance and summary blocks.</p>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          <div className="ml-auto flex gap-3">
            <Link href={backHref} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </Link>
            <button form="class-form" type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-60">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Class"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
