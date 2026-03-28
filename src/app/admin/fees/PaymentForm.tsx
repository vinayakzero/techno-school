"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { recordPaymentAction } from "./actions";

const PAYMENT_MODES = ["Cash", "Online", "Bank Transfer", "Cheque"];

function getFeeValue(student: any, key: "total" | "paid" | "pending") {
  return Number(student?.fees?.[key] || 0);
}

export default function PaymentForm({
  onClose,
  onSuccess,
  students,
  feeStructures,
  initialStudentId,
  currencySymbol,
}: {
  onClose: () => void;
  onSuccess: (paymentId?: string) => void;
  students: any[];
  feeStructures: any[];
  initialStudentId?: string | null;
  currencySymbol: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState(initialStudentId || "");

  const inputClass = "w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300";

  const selectedStudent = useMemo(
    () => students.find((student) => student._id === studentId),
    [students, studentId]
  );

  const availableStructures = useMemo(() => {
    if (!selectedStudent) return feeStructures;
    return feeStructures.filter((structure) => structure.grade === selectedStudent.grade && structure.isActive);
  }, [feeStructures, selectedStudent]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(formRef.current!);
    const result = await recordPaymentAction(formData);

    setIsSubmitting(false);

    if (result.success) {
      router.refresh();
      onSuccess(result.paymentId);
      onClose();
      return;
    }

    setError(result.error || "Unable to record payment.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Record Payment</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Log a fee payment and generate a receipt entry.
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
                <label className={labelClass}>Student *</label>
                <select
                  name="studentId"
                  required
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  className={inputClass}
                  autoFocus
                >
                  <option value="" disabled>Select student...</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.grade} Section {student.section}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Fee Structure</label>
                <select name="feeStructureId" defaultValue="" className={inputClass}>
                  <option value="">General payment / not linked</option>
                  {availableStructures.map((structure) => (
                    <option key={structure._id} value={structure._id}>
                      {structure.title} - {structure.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Amount *</label>
                <input name="amount" type="number" min="0" step="0.01" required className={inputClass} placeholder="2500" />
              </div>

              <div>
                <label className={labelClass}>Payment Date *</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Mode *</label>
                <select name="mode" defaultValue="Cash" className={inputClass}>
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Receipt Number</label>
                <input name="receiptNo" className={inputClass} placeholder="Leave blank to auto-generate" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows={3} className={`${inputClass} resize-none`} placeholder="Optional payment notes." />
              </div>
            </div>

            {selectedStudent && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Total Fee</p>
                    <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">{currencySymbol}{getFeeValue(selectedStudent, "total").toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Paid</p>
                    <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">{currencySymbol}{getFeeValue(selectedStudent, "paid").toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Pending</p>
                    <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">{currencySymbol}{getFeeValue(selectedStudent, "pending").toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Save Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
