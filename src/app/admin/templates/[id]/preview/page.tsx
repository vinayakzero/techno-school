import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import CertificateTemplate from "@/models/CertificateTemplate";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

const SAMPLE_VALUES: Record<string, string> = {
  studentName: "Aarav Sharma",
  teacherName: "Nisha Sharma",
  grade: "Grade 8",
  section: "Section A",
  academicYear: "2026-2027",
  session: "2026-2027",
  issueDate: "March 29, 2026",
  admissionNo: "ADM-2026-081",
  dateOfBirth: "May 14, 2012",
  lastClass: "Grade 8",
  reason: "Relocation",
  conductRemark: "Excellent conduct and discipline",
  rollNo: "8A12",
  contactNumber: "+91 98765 43210",
  employeeCode: "EMP-014",
  department: "Science Department",
  receiptNo: "RCPT-08-0012-1",
  amount: "Rs. 6,500",
  paymentDate: "June 19, 2026",
  mode: "Bank Transfer",
  examName: "Term 1 Examination",
  marksTable: "English 88 | Mathematics 91 | Science 86",
  teacherRemark: "Steady progress across all core subjects",
  examSchedule: "Mathematics - Apr 8 | Science - Apr 10 | English - Apr 12",
};

function getPreviewLines(template: any) {
  if (template.category === "ID Card") {
    return [
      "Front Side",
      `${template.audience} identity format with school branding, photo zone, and core profile fields.`,
      "Back Side",
      "Emergency contact, address, and validity details ready for wallet-size printing.",
    ];
  }

  if (template.category === "Receipt") {
    return [
      "Receipt Header",
      "School name, address, receipt number, and payment confirmation summary.",
      "Receipt Body",
      "Student details, fee head, payment mode, amount received, and signatory block.",
    ];
  }

  if (template.category === "Report") {
    return [
      "Academic Report",
      "Student details, assessment summary, marks panel, and teacher remarks section.",
      "Footer",
      "Principal acknowledgement, class teacher signature, and issue timestamp.",
    ];
  }

  return [
    "Certificate Header",
    "Formal school letterhead with title, issuance metadata, and identity details.",
    "Certificate Body",
    "Readable body text with placeholders resolved from student or staff records.",
  ];
}

export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();

  const [template, setting] = await Promise.all([
    CertificateTemplate.findById(params.id).lean(),
    Setting.findOne().lean(),
  ]);

  if (!template) {
    notFound();
  }

  const schoolName = setting?.schoolName || "My School";
  const schoolAddress = setting?.schoolAddress || "School address not configured";
  const previewLines = getPreviewLines(template);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Templates
        </Link>
        <p className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
          <Printer size={15} />
          Open browser print to test this preview layout.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-200 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-700 px-8 py-8 text-white dark:border-zinc-800">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">{template.category} Preview</p>
          <h1 className="mt-3 text-3xl font-black">{template.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">{schoolName} - {schoolAddress}</p>
        </div>

        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {template.audience}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {template.paperSize}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {template.orientation}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">{previewLines[0]}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-zinc-300">{previewLines[1]}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">{previewLines[2]}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-zinc-300">{previewLines[3]}</p>
                </div>
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Sample Output Text</p>
                  <p className="mt-3 text-sm leading-7 text-blue-900 dark:text-blue-100">
                    This preview shows how the template can be rendered using school records. During actual generation,
                    each placeholder is replaced with live student, teacher, fee, or exam data from the system.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Placeholder Map</h2>
              <div className="mt-4 space-y-3">
                {template.placeholders.length > 0 ? (
                  template.placeholders.map((placeholder: string) => (
                    <div key={placeholder} className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">{`{{${placeholder}}}`}</p>
                      <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300">{SAMPLE_VALUES[placeholder] || "Sample value not mapped yet"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">No placeholders configured for this template.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Template Notes</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-zinc-300">
                {template.description || "Add a template description to explain when this print format should be used by school staff."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
