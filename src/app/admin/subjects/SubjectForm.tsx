"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { addSubjectAction, updateSubjectAction } from "./actions";

export default function SubjectForm({
  subjectToEdit,
  teachers,
  backHref = "/admin/subjects",
}: {
  subjectToEdit?: any;
  teachers: any[];
  backHref?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = subjectToEdit
      ? await updateSubjectAction(subjectToEdit._id, formData)
      : await addSubjectAction(formData);

    if (res.success) {
      router.push("/admin/subjects");
      router.refresh();
      return;
    }

    setError(res.error || "Something went wrong.");
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Subjects
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
          {subjectToEdit ? "Edit Subject" : "Add New Subject"}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Create and manage academic subject records without using modal popups.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            {subjectToEdit ? "Subject Details" : "New Subject Details"}
          </h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div>
              <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Subject Name *</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={subjectToEdit?.name || ""}
                placeholder="e.g. Mathematics"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Subject Code *</label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={subjectToEdit?.code || ""}
                  placeholder="e.g. MAT101"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 uppercase transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Grade *</label>
                <select
                  name="grade"
                  required
                  defaultValue={subjectToEdit?.grade || ""}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
              <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Assigned Teacher (Optional)</label>
              <select
                name="assignedTeacher"
                defaultValue={subjectToEdit?.assignedTeacher?._id || subjectToEdit?.assignedTeacher || ""}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">-- No Teacher Assigned --</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.subject})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href={backHref}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 hover:bg-blue-700"
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
