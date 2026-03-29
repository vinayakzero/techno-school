import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export default async function FeeReceiptPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();

  const [payment, setting] = await Promise.all([
    Payment.findById(params.id)
      .populate("studentId", "name grade section parentName parentPhone email")
      .populate("feeStructureId", "title category dueDate")
      .lean(),
    Setting.findOne().lean(),
  ]);

  if (!payment) {
    notFound();
  }

  const currencySymbol = setting?.currencySymbol || "$";
  const schoolName = setting?.schoolName || "My School";
  const schoolAddress = setting?.schoolAddress || "School address not configured";
  const student = payment.studentId as any;
  const structure = payment.feeStructureId as any;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/fees" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
          <ArrowLeft size={16} />
          Back to Fees
        </Link>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Open your browser print dialog to print this receipt.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white dark:border-zinc-800">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Payment Receipt</p>
          <h1 className="mt-3 text-3xl font-black">{schoolName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">{schoolAddress}</p>
        </div>

        <div className="grid gap-8 px-8 py-8 lg:grid-cols-2">
          <ReceiptBlock title="Receipt Details">
            <ReceiptRow label="Receipt No." value={payment.receiptNo} />
            <ReceiptRow label="Payment Date" value={new Date(payment.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
            <ReceiptRow label="Payment Mode" value={payment.mode} />
            <ReceiptRow label="Amount Paid" value={`${currencySymbol}${payment.amount.toLocaleString()}`} highlight />
            <ReceiptRow label="Fee Credit" value={`${currencySymbol}${Number((payment as any).baseAmount ?? payment.amount ?? 0).toLocaleString()}`} />
            <ReceiptRow label="Waiver" value={`${currencySymbol}${Number((payment as any).waiverAmount || 0).toLocaleString()}`} />
            <ReceiptRow label="Fine" value={`${currencySymbol}${Number((payment as any).fineAmount || 0).toLocaleString()}`} />
          </ReceiptBlock>

          <ReceiptBlock title="Student Details">
            <ReceiptRow label="Student" value={student?.name || "Unknown Student"} />
            <ReceiptRow label="Grade" value={student ? `${student.grade} Section ${student.section}` : payment.grade} />
            <ReceiptRow label="Parent" value={student?.parentName || "-"} />
            <ReceiptRow label="Phone" value={student?.parentPhone || "-"} />
          </ReceiptBlock>

          <ReceiptBlock title="Fee Details">
            <ReceiptRow label="Fee Structure" value={structure?.title || "General payment"} />
            <ReceiptRow label="Category" value={structure?.category || "General"} />
            <ReceiptRow label="Due Date" value={structure?.dueDate ? new Date(structure.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-"} />
            <ReceiptRow label="Recorded Grade" value={payment.grade} />
            <ReceiptRow label="Installment" value={(payment as any).installmentLabel || "-"} />
            <ReceiptRow label="Collected By" value={(payment as any).collectedBy || "-"} />
          </ReceiptBlock>

          <ReceiptBlock title="Notes">
            <p className="text-sm leading-6 text-gray-600 dark:text-zinc-300">
              {payment.notes || "No additional notes were recorded for this transaction."}
            </p>
          </ReceiptBlock>
        </div>

        <div className="border-t border-dashed border-gray-200 px-8 py-6 text-sm text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
          This receipt was generated from the school management fee module and is ready for printing or sharing.
        </div>
      </div>
    </div>
  );
}

function ReceiptBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function ReceiptRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 dark:border-zinc-800">
      <span className="text-sm text-gray-500 dark:text-zinc-400">{label}</span>
      <span className={`text-right text-sm font-semibold ${highlight ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-zinc-100"}`}>
        {value}
      </span>
    </div>
  );
}
