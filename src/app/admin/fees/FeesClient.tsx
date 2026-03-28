"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, FileText, Filter, Pencil, Plus, Receipt, Search, Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import FeeStructureForm from "./FeeStructureForm";
import PaymentForm from "./PaymentForm";
import { deleteFeeStructureAction, deletePaymentAction } from "./actions";

function formatMoney(amount: number, currencySymbol: string) {
  return `${currencySymbol}${amount.toLocaleString()}`;
}

function getFeeValue(student: any, key: "total" | "paid" | "pending") {
  return Number(student?.fees?.[key] || 0);
}

export default function FeesClient({
  students,
  feeStructures,
  payments,
  currencySymbol,
}: {
  students: any[];
  feeStructures: any[];
  payments: any[];
  currencySymbol: string;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && getFeeValue(student, "pending") <= 0) ||
        (statusFilter === "unpaid" && getFeeValue(student, "pending") > 0) ||
        (statusFilter === "partial" && getFeeValue(student, "paid") > 0 && getFeeValue(student, "pending") > 0);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, students]);

  const summary = useMemo(() => {
    const totalAssigned = students.reduce((sum, student) => sum + getFeeValue(student, "total"), 0);
    const totalCollected = students.reduce((sum, student) => sum + getFeeValue(student, "paid"), 0);
    const totalOutstanding = students.reduce((sum, student) => sum + getFeeValue(student, "pending"), 0);
    const fullyPaidCount = students.filter((student) => getFeeValue(student, "pending") <= 0 && getFeeValue(student, "total") > 0).length;

    return { totalAssigned, totalCollected, totalOutstanding, fullyPaidCount };
  }, [students]);

  const handleStructureEdit = (structure: any) => {
    setEditingStructure(structure);
    setShowStructureForm(true);
  };

  const handleStructureDelete = async (id: string, title: string) => {
    if (confirm(`Delete fee structure "${title}"? This will recalculate balances for that grade.`)) {
      await deleteFeeStructureAction(id);
      router.refresh();
    }
  };

  const handlePaymentDelete = async (id: string, receiptNo: string) => {
    if (confirm(`Delete payment receipt ${receiptNo}? Student balances will be recalculated.`)) {
      await deletePaymentAction(id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage grade-wise fee structures, collect payments, and monitor outstanding balances.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditingStructure(null);
              setShowStructureForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Fee Structure
          </button>
          <button
            onClick={() => {
              setSelectedStudentId(null);
              setShowPaymentForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Wallet size={16} />
            Record Payment
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<FileText className="h-5 w-5 text-blue-600" />} label="Assigned Fees" value={formatMoney(summary.totalAssigned, currencySymbol)} tone="blue" />
        <SummaryCard icon={<CreditCard className="h-5 w-5 text-emerald-600" />} label="Collected" value={formatMoney(summary.totalCollected, currencySymbol)} tone="emerald" />
        <SummaryCard icon={<Receipt className="h-5 w-5 text-amber-600" />} label="Outstanding" value={formatMoney(summary.totalOutstanding, currencySymbol)} tone="amber" />
        <SummaryCard icon={<Wallet className="h-5 w-5 text-violet-600" />} label="Fully Paid Students" value={summary.fullyPaidCount.toString()} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Student Fee Report</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                Filter by payment status to review dues by student.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search student..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Grade</th>
                  <th className="px-6 py-4 font-semibold">Assigned</th>
                  <th className="px-6 py-4 font-semibold">Paid</th>
                  <th className="px-6 py-4 font-semibold">Pending</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                      No student fee records match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/40">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-zinc-100">{student.name}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500">{student.parentName}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                        {student.grade} Section {student.section}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-zinc-100">
                        {formatMoney(getFeeValue(student, "total"), currencySymbol)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(getFeeValue(student, "paid"), currencySymbol)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          getFeeValue(student, "pending") > 0
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        }`}>
                          {formatMoney(getFeeValue(student, "pending"), currencySymbol)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudentId(student._id);
                              setShowPaymentForm(true);
                            }}
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                            title="Record payment"
                          >
                            <Wallet size={16} />
                          </button>
                          <Link
                            href={`/admin/students/${student._id}`}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                            title="Open student profile"
                          >
                            <FileText size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-gray-200 p-5 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Fee Structures</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                Grade-wise schedule used to calculate balances.
              </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {feeStructures.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-zinc-400">
                  No fee structures yet. Add one to begin assigning fees by grade.
                </div>
              ) : (
                feeStructures.map((structure) => (
                  <div key={structure._id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">{structure.title}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          structure.isActive
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
                          {structure.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                        {structure.grade} • {structure.category}
                      </p>
                      <p className="mt-2 text-base font-bold text-gray-900 dark:text-zinc-100">
                        {formatMoney(structure.amount, currencySymbol)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                        Due {new Date(structure.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStructureEdit(structure)}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        title="Edit fee structure"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleStructureDelete(structure._id, structure.title)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete fee structure"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-gray-200 p-5 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Recent Payments</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                Latest collections with direct receipt access.
              </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {payments.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-zinc-400">
                  No payments recorded yet.
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment._id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">{payment.studentId?.name || "Unknown Student"}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                        {payment.mode} • {new Date(payment.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="mt-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(payment.amount, currencySymbol)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{payment.receiptNo}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/fees/receipts/${payment._id}`}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        title="Open receipt"
                      >
                        <Receipt size={16} />
                      </Link>
                      <button
                        onClick={() => handlePaymentDelete(payment._id, payment.receiptNo)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete payment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {showStructureForm && (
        <FeeStructureForm
          feeStructure={editingStructure}
          onClose={() => {
            setShowStructureForm(false);
            setEditingStructure(null);
          }}
          onSuccess={() => {}}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          students={students}
          feeStructures={feeStructures}
          initialStudentId={selectedStudentId}
          currencySymbol={currencySymbol}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedStudentId(null);
          }}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "blue" | "emerald" | "amber" | "violet" }) {
  const tones = {
    blue: "from-blue-50 to-white dark:from-blue-500/10 dark:to-zinc-900",
    emerald: "from-emerald-50 to-white dark:from-emerald-500/10 dark:to-zinc-900",
    amber: "from-amber-50 to-white dark:from-amber-500/10 dark:to-zinc-900",
    violet: "from-violet-50 to-white dark:from-violet-500/10 dark:to-zinc-900",
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-gradient-to-br p-5 shadow-sm dark:border-zinc-800 ${tones[tone]}`}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-900">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
