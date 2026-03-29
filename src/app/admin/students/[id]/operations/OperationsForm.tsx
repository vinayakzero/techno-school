"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { runStudentOperationAction } from "../../actions";

const OPERATIONS = [
  { value: "promote", label: "Promote" },
  { value: "transfer", label: "Transfer" },
  { value: "withdraw", label: "Withdraw" },
  { value: "archive", label: "Archive" },
  { value: "reactivate", label: "Reactivate" },
];

const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["A", "B", "C", "D"];

export default function OperationsForm({ student }: { student: any }) {
  const router = useRouter();
  const [operation, setOperation] = useState("promote");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const result = await runStudentOperationAction(student._id, formData);
    setSaving(false);

    if (result.success) {
      router.push(`/admin/students/${student._id}`);
      router.refresh();
      return;
    }

    setError(result.error || "Unable to process student operation.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/admin/students/${student._id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
          <ArrowLeft size={16} />
          Back to Student Profile
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">Student Operations</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Manage promotions, transfers, withdrawals, archives, and reactivation for {student.name}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Operation</label>
              <select name="operation" value={operation} onChange={(e) => setOperation(e.target.value)} className={inputClass}>
                {OPERATIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Effective Date</label>
              <input name="effectiveDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} className={inputClass} />
            </div>
            {(operation === "promote" || operation === "reactivate") && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Target Grade</label>
                  <select name="nextGrade" defaultValue={student.grade} className={inputClass}>
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Target Section</label>
                  <select name="nextSection" defaultValue={student.section} className={inputClass}>
                    {SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Office Note</label>
              <textarea name="lifecycleNote" rows={4} className={`${inputClass} resize-none`} placeholder="Reason, destination school, archive note, or promotion remarks." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href={`/admin/students/${student._id}`} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
              {saving ? "Saving..." : "Apply Operation"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
