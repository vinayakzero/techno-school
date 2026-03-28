import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import CertificateTemplate from "@/models/CertificateTemplate";

export const dynamic = "force-dynamic";

const EXTRA_DOCUMENTS = [
  {
    slug: "study-certificate",
    name: "Study Certificate",
    category: "Certificate",
    description: "Formal certificate confirming the student's current course of study.",
    placeholders: ["studentName", "grade", "section", "academicYear", "issueDate"],
  },
  {
    slug: "migration-certificate",
    name: "Migration Certificate",
    category: "Certificate",
    description: "Migration certificate for board transfer or movement to another institution.",
    placeholders: ["studentName", "admissionNo", "lastClass", "reason", "issueDate"],
  },
  {
    slug: "fee-clearance-certificate",
    name: "Fee Clearance Certificate",
    category: "Certificate",
    description: "Confirms whether the student has cleared all recorded fee dues.",
    placeholders: ["studentName", "grade", "totalFees", "paidFees", "pendingFees", "issueDate"],
  },
  {
    slug: "marksheet",
    name: "Marksheet",
    category: "Report",
    description: "Detailed marksheet summary for the student's recent assessment records.",
    placeholders: ["studentName", "grade", "examName", "marksTable", "teacherRemark"],
  },
];

export default async function StudentDocumentsPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();

  const [student, templates] = await Promise.all([
    Student.findById(params.id).lean(),
    CertificateTemplate.find({
      audience: "Student",
      isActive: true,
    })
      .sort({ category: 1, name: 1 })
      .lean(),
  ]);

  if (!student) {
    notFound();
  }

  const documents = [
    ...templates.map((template: any) => ({
      ...template,
      source: "template",
    })),
    ...EXTRA_DOCUMENTS.map((document) => ({
      ...document,
      source: "system",
      _id: document.slug,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/admin/students/${student._id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Student Profile
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Student Documents</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Generate printable school documents for {student.name} ({student.grade} - Section {student.section}).
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            {student.grade}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
            Section {student.section}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
            {student.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {documents.map((template: any) => (
          <article
            key={template._id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{template.name}</h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {template.category}
                  </span>
                  {template.source === "system" && (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      Built-in
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-zinc-300">
                  {template.description || "No document description available yet."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {template.placeholders.map((placeholder: string) => (
                    <span
                      key={placeholder}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {`{{${placeholder}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/admin/students/${student._id}/documents/${template.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Printer size={16} />
                Open Print View
              </Link>
            </div>
          </article>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600" />
          <p className="mt-4 text-base font-semibold text-gray-900 dark:text-zinc-100">No active student templates found</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Activate or create student-facing templates in the Templates section first.
          </p>
        </div>
      )}
    </div>
  );
}
