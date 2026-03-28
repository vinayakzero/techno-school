"use client";

import { useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addFeeStructureAction, updateFeeStructureAction } from "./actions";

const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const CATEGORIES = ["Tuition", "Transport", "Library", "Examination", "Miscellaneous"];

export default function FeeStructureForm({
  onClose,
  onSuccess,
  feeStructure,
}: {
  onClose: () => void;
  onSuccess: () => void;
  feeStructure?: any;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!feeStructure;

  const inputClass = "w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(formRef.current!);
    const result = isEdit
      ? await updateFeeStructureAction(feeStructure._id, formData)
      : await addFeeStructureAction(formData);

    setIsSubmitting(false);

    if (result.success) {
      router.refresh();
      onSuccess();
      onClose();
      return;
    }

    setError(result.error || "Unable to save fee structure.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              {isEdit ? "Edit Fee Structure" : "Add Fee Structure"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Define fee amounts and due dates by grade.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={feeStructure?.title}
                  className={inputClass}
                  placeholder="e.g. Term 1 Tuition"
                  autoFocus
                />
              </div>

              <div>
                <label className={labelClass}>Grade *</label>
                <select name="grade" required defaultValue={feeStructure?.grade || ""} className={inputClass}>
                  <option value="" disabled>Select grade...</option>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select name="category" required defaultValue={feeStructure?.category || "Tuition"} className={inputClass}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Amount *</label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={feeStructure?.amount ?? ""}
                  className={inputClass}
                  placeholder="5000"
                />
              </div>

              <div>
                <label className={labelClass}>Due Date *</label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={feeStructure?.dueDate ? new Date(feeStructure.dueDate).toISOString().split("T")[0] : ""}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={feeStructure?.description}
                  className={`${inputClass} resize-none`}
                  placeholder="Optional notes about this fee."
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 dark:border-zinc-700 dark:text-zinc-300 sm:col-span-2">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={feeStructure?.isActive ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Keep this fee structure active for balance calculations
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? "Save Changes" : "Create Fee Structure"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
