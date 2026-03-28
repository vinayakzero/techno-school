"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTeacherAction, updateTeacherAction } from "./actions";

const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["Active", "On Leave", "Inactive"];

export default function TeacherForm({ teacher, backHref = "/admin/teachers" }: { teacher?: any; backHref?: string }) {
  const router = useRouter();
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
      router.push("/admin/teachers");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300 transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
          <ArrowLeft size={16} />
          Back to Teachers
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">
          {isEdit ? "Edit Teacher" : "Add New Teacher"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {isEdit ? "Update faculty member information." : "Fill in the details to add a new faculty member."}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-y-auto px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} id="teacher-form">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Personal Information</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Professional Details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Comma-separated list of grades.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="ml-auto flex gap-3">
            <Link href={backHref} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </Link>
            <button form="teacher-form" type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-60">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Teacher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
