import connectDB from "@/lib/mongodb";
import Syllabus from "@/models/Syllabus";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export default async function SyllabusPage() {
  await connectDB();

  const [syllabi, setting] = await Promise.all([
    Syllabus.find().populate("subject", "name code").sort({ grade: 1, academicYear: 1 }).lean(),
    Setting.findOne().lean(),
  ]);

  const totalUnits = syllabi.reduce((sum: number, item: any) => sum + (item.units?.length || 0), 0);
  const totalBooks = syllabi.reduce((sum: number, item: any) => sum + (item.referenceBooks?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Syllabus</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Inspect subject-wise syllabus planning and unit coverage for {setting?.academicYear || "the active academic year"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Syllabus Records" value={syllabi.length.toString()} />
          <SummaryCard label="Units Planned" value={totalUnits.toString()} />
          <SummaryCard label="Reference Books" value={totalBooks.toString()} />
        </div>

        <div className="space-y-4">
          {syllabi.map((item: any) => (
            <article key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {(item.subject as any)?.name || "Subject"}
                </h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {item.grade}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.academicYear}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                {(item.subject as any)?.code || "No subject code"} - {item.units?.length || 0} units
              </p>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">Units</p>
                  <div className="mt-3 space-y-3">
                    {(item.units || []).map((unit: any, index: number) => (
                      <div key={`${item._id}-${index}`} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">{unit.title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{unit.recommendedWeeks} recommended weeks</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(unit.objectives || []).map((objective: string) => (
                            <span key={objective} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                              {objective}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">Assessment Pattern</p>
                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-zinc-300">
                      {item.assessmentPattern || "No assessment pattern defined yet."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">Reference Books</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(item.referenceBooks || []).map((book: string) => (
                        <span key={book} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {book}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
