"use client";

import { useState } from "react";
import { addExamAction } from "./actions";

export default function ExamForm({ 
  onClose, 
  onSuccess,
  subjects
}: { 
  onClose: () => void, 
  onSuccess?: () => void,
  subjects: any[]
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Extricate the combined subject|grade
    const selected = formData.get("subjectSelection")?.toString();
    if (!selected) {
      setError("Please select a valid subject.");
      setLoading(false); return;
    }
    
    const [subId, grade, subName] = selected.split("|");
    formData.append("subjectId", subId);
    formData.append("grade", grade);
    formData.append("name", `${subName} ${formData.get("nameSuffix")}`);

    const res = await addExamAction(formData);

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
            Schedule New Exam
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

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Subject & Grade *</label>
              <select 
                name="subjectSelection" 
                required 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                autoFocus
              >
                <option value="">Select Target Subject...</option>
                {subjects.map(sub => (
                  <option key={sub._id} value={`${sub._id}|${sub.grade}|${sub.name}`}>
                    {sub.grade} — {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Exam Term / Name *</label>
              <input 
                type="text" 
                name="nameSuffix" 
                required 
                placeholder="e.g. Midterm 2024"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">This will be appended to the Subject name (e.g., Mathematics Midterm 2024)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">Total Marks Format *</label>
                <input 
                  type="number" 
                  name="totalMarks" 
                  required 
                  min={10}
                  max={100}
                  defaultValue={100}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
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
                {loading ? "Scheduling..." : "Schedule Exam"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
