"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { addExamAction } from "./actions";

export default function ExamForm({
  subjects,
  backHref = "/admin/exams",
}: {
  subjects: any[];
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
    const selected = formData.get("subjectSelection")?.toString();
    if (!selected) {
      setError("Please select a valid subject.");
      setLoading(false);
      return;
    }

    const [subId, grade, subName] = selected.split("|");
    formData.append("subjectId", subId);
    formData.append("grade", grade);
    formData.append("name", `${subName} ${formData.get("nameSuffix")}`);

    const res = await addExamAction(formData);

    if (res.success) {
      router.push("/admin/exams");
      router.refresh();
    } else {
      setError(res.error || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
          <ArrowLeft size={16} />
          Back to Exams
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">Schedule New Exam</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Create exam records from a dedicated page instead of a popup.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Subject & Grade *</label>
              <select
                name="subjectSelection"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                autoFocus
              >
                <option value="">Select Target Subject...</option>
                {subjects.map(sub => (
                  <option key={sub._id} value={`${sub._id}|${sub.grade}|${sub.name}`}>
                    {sub.grade} - {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Exam Term / Name *</label>
              <input
                type="text"
                name="nameSuffix"
                required
                placeholder="e.g. Midterm 2024"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="mt-1 text-xs text-gray-500">This will be appended to the Subject name.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-gray-700 dark:text-zinc-300">Total Marks Format *</label>
                <input
                  type="number"
                  name="totalMarks"
                  required
                  min={10}
                  max={100}
                  defaultValue={100}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href={backHref} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 hover:bg-blue-700">
                {loading ? "Saving..." : "Create Exam"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
