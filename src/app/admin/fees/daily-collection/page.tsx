import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

function getDayRange(dateString?: string) {
  const base = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end, iso: start.toISOString().split("T")[0] };
}

export default async function DailyCollectionPage({
  searchParams,
}: {
  searchParams?: { date?: string };
}) {
  await connectDB();

  const { start, end, iso } = getDayRange(searchParams?.date);
  const [payments, setting] = await Promise.all([
    Payment.find({
      status: { $ne: "Cancelled" },
      date: { $gte: start, $lte: end },
    })
      .populate("studentId", "name grade section")
      .sort({ date: -1, createdAt: -1 })
      .lean(),
    Setting.findOne().lean(),
  ]);

  const currencySymbol = setting?.currencySymbol || "$";
  const schoolName = setting?.schoolName || "My School";

  const summary = payments.reduce(
    (acc, payment: any) => {
      acc.received += Number(payment.amount || 0);
      acc.credited += Number(payment.baseAmount ?? payment.amount ?? 0);
      acc.waived += Number(payment.waiverAmount || 0);
      acc.fine += Number(payment.fineAmount || 0);
      acc[payment.mode] = (acc[payment.mode] || 0) + Number(payment.amount || 0);
      return acc;
    },
    { received: 0, credited: 0, waived: 0, fine: 0, Cash: 0, Online: 0, "Bank Transfer": 0, Cheque: 0 } as Record<string, number>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/fees" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
            Back to Fees
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">Daily Cash Collection</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Office-day summary for receipts, concessions, and fine handling. Use browser print for a hard copy.
          </p>
        </div>
        <form className="flex flex-wrap gap-3">
          <input
            type="date"
            name="date"
            defaultValue={iso}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Load Date
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white dark:border-zinc-800">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Daily Collection Sheet</p>
          <h2 className="mt-3 text-3xl font-black">{schoolName}</h2>
          <p className="mt-2 text-sm text-white/80">
            {new Date(start).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="grid gap-4 border-b border-gray-200 px-8 py-6 md:grid-cols-3 xl:grid-cols-6 dark:border-zinc-800">
          <SummaryBlock label="Received" value={`${currencySymbol}${summary.received.toLocaleString()}`} />
          <SummaryBlock label="Credited" value={`${currencySymbol}${summary.credited.toLocaleString()}`} />
          <SummaryBlock label="Waived" value={`${currencySymbol}${summary.waived.toLocaleString()}`} />
          <SummaryBlock label="Fine" value={`${currencySymbol}${summary.fine.toLocaleString()}`} />
          <SummaryBlock label="Cash" value={`${currencySymbol}${Number(summary.Cash || 0).toLocaleString()}`} />
          <SummaryBlock label="Digital" value={`${currencySymbol}${(Number(summary.Online || 0) + Number(summary["Bank Transfer"] || 0) + Number(summary.Cheque || 0)).toLocaleString()}`} />
        </div>

        <div className="overflow-x-auto px-8 py-6">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="py-3 pr-4 font-semibold">Receipt</th>
                <th className="py-3 pr-4 font-semibold">Student</th>
                <th className="py-3 pr-4 font-semibold">Mode</th>
                <th className="py-3 pr-4 font-semibold">Received</th>
                <th className="py-3 pr-4 font-semibold">Credited</th>
                <th className="py-3 pr-4 font-semibold">Waiver</th>
                <th className="py-3 pr-4 font-semibold">Fine</th>
                <th className="py-3 pr-4 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500 dark:text-zinc-400">
                    No collections recorded for this date.
                  </td>
                </tr>
              ) : (
                payments.map((payment: any) => (
                  <tr key={payment._id.toString()}>
                    <td className="py-4 pr-4 font-semibold text-blue-600 dark:text-blue-400">
                      <Link href={`/admin/fees/receipts/${payment._id.toString()}`}>{payment.receiptNo}</Link>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-gray-900 dark:text-zinc-100">{payment.studentId?.name || "Unknown Student"}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500">
                        {payment.studentId?.grade || payment.grade} {payment.studentId?.section ? `• Section ${payment.studentId.section}` : ""}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-gray-600 dark:text-zinc-300">{payment.mode}</td>
                    <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-zinc-100">{currencySymbol}{Number(payment.amount || 0).toLocaleString()}</td>
                    <td className="py-4 pr-4 text-emerald-600 dark:text-emerald-400">{currencySymbol}{Number(payment.baseAmount ?? payment.amount ?? 0).toLocaleString()}</td>
                    <td className="py-4 pr-4 text-sky-600 dark:text-sky-400">{currencySymbol}{Number(payment.waiverAmount || 0).toLocaleString()}</td>
                    <td className="py-4 pr-4 text-rose-600 dark:text-rose-400">{currencySymbol}{Number(payment.fineAmount || 0).toLocaleString()}</td>
                    <td className="py-4 pr-4 text-xs text-gray-500 dark:text-zinc-400">
                      {[payment.installmentLabel, payment.collectedBy, payment.notes].filter(Boolean).join(" • ") || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
