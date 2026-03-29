import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import Result from "@/models/Result";
import CertificateTemplate from "@/models/CertificateTemplate";
import Setting from "@/models/Setting";

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

function formatDate(value: Date | string | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getAdmissionNo(student: any) {
  if (student.admissionNumber) return student.admissionNumber;
  return `ADM-${new Date(student.enrollmentDate || Date.now()).getFullYear()}-${student._id
    .toString()
    .slice(-5)
    .toUpperCase()}`;
}

function getRollNo(student: any) {
  if (student.rollNumber) return student.rollNumber;
  return `${student.grade.replace("Grade ", "")}${student.section}${student._id
    .toString()
    .slice(-2)
    .toUpperCase()}`;
}

function getRecentPerformance(results: any[]) {
  if (!results.length) {
    return {
      averageScore: 0,
      examCount: 0,
      marksTable: "Results not published yet",
      teacherRemark: "Awaiting assessment data.",
      examSchedule: "See exam office notice board for the final subject-wise schedule.",
    };
  }

  const averageScore = Math.round(
    results.reduce((sum, result) => sum + (result.marksObtained || 0), 0) / results.length
  );

  const marksTable = results
    .slice(0, 6)
    .map((result, index) => `Assessment ${index + 1}: ${result.marksObtained}`)
    .join(" | ");

  return {
    averageScore,
    examCount: results.length,
    marksTable,
    teacherRemark:
      averageScore >= 85
        ? "Excellent academic consistency across recent assessments."
        : averageScore >= 65
          ? "Satisfactory progress with scope for stronger revision."
          : "Needs additional support and follow-up practice.",
    examSchedule: "Hall entry at 8:45 AM. Carry school ID card and required stationery.",
  };
}

function buildDocumentValues({
  student,
  setting,
  latestPayment,
  results,
}: {
  student: any;
  setting: any;
  latestPayment: any;
  results: any[];
}) {
  const performance = getRecentPerformance(results);
  const totalFees = student.fees?.total || 0;
  const paidFees = student.fees?.paid || 0;
  const pendingFees = student.fees?.pending || 0;

  return {
    studentName: student.name,
    grade: student.grade,
    section: student.section,
    academicYear: setting?.academicYear || "2026-2027",
    session: setting?.academicYear || "2026-2027",
    issueDate: formatDate(new Date()),
    admissionNo: getAdmissionNo(student),
    dateOfBirth: formatDate(student.dateOfBirth),
    lastClass: `${student.grade} Section ${student.section}`,
    reason: "Issued on guardian request",
    conductRemark: student.status === "Active" ? "Good conduct and regular school behavior." : "Status requires office review.",
    rollNo: getRollNo(student),
    contactNumber: student.parentPhone || student.phone || "-",
    receiptNo: latestPayment?.receiptNo || "No recent receipt",
    amount: latestPayment ? `${setting?.currencySymbol || "$"}${latestPayment.amount.toLocaleString()}` : "No payment",
    paymentDate: latestPayment ? formatDate(latestPayment.date) : "No payment date",
    mode: latestPayment?.mode || "Not available",
    examName: "Current Academic Assessment",
    marksTable: performance.marksTable,
    teacherRemark: performance.teacherRemark,
    examSchedule: performance.examSchedule,
    examCount: performance.examCount,
    averageScore: performance.averageScore,
    totalFees: `${setting?.currencySymbol || "$"}${totalFees.toLocaleString()}`,
    paidFees: `${setting?.currencySymbol || "$"}${paidFees.toLocaleString()}`,
    pendingFees: `${setting?.currencySymbol || "$"}${pendingFees.toLocaleString()}`,
    feeStatus: pendingFees > 0 ? "Pending dues exist" : "All dues cleared",
  };
}

function renderDocumentLayout({
  template,
  student,
  values,
  schoolName,
  schoolAddress,
}: {
  template: any;
  student: any;
  values: Record<string, string | number>;
  schoolName: string;
  schoolAddress: string;
}) {
  switch (template.slug) {
    case "bonafide-certificate":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Bonafide Certificate" schoolName={schoolName} schoolAddress={schoolAddress} />
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            This is to certify that <strong>{values.studentName}</strong>, Admission No.{" "}
            <strong>{values.admissionNo}</strong>, is a bonafide student of <strong>{schoolName}</strong> and is
            currently studying in <strong>{values.grade}</strong>, <strong>Section {values.section}</strong> during
            the academic session <strong>{values.academicYear}</strong>.
          </p>
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            As per school records, the student maintains regular enrollment status and this certificate is issued upon
            request for official use on <strong>{values.issueDate}</strong>.
          </p>
          <SignatureRow />
        </div>
      );

    case "study-certificate":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Study Certificate" schoolName={schoolName} schoolAddress={schoolAddress} />
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            This is to certify that <strong>{values.studentName}</strong> is enrolled in{" "}
            <strong>{values.grade}</strong>, <strong>Section {values.section}</strong>, for the academic year{" "}
            <strong>{values.academicYear}</strong> at <strong>{schoolName}</strong>.
          </p>
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            This study certificate is issued on <strong>{values.issueDate}</strong> for submission wherever required.
          </p>
          <SignatureRow />
        </div>
      );

    case "transfer-certificate":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Transfer Certificate" schoolName={schoolName} schoolAddress={schoolAddress} />
          <div className="grid gap-4 md:grid-cols-2">
            <KeyValueCard label="Student Name" value={String(values.studentName)} />
            <KeyValueCard label="Admission No" value={String(values.admissionNo)} />
            <KeyValueCard label="Date of Birth" value={String(values.dateOfBirth)} />
            <KeyValueCard label="Last Studied Class" value={String(values.lastClass)} />
            <KeyValueCard label="Reason" value={String(values.reason)} />
            <KeyValueCard label="Issue Date" value={String(values.issueDate)} />
          </div>
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            The above student is being relieved from the rolls of the school as per request. This certificate is issued
            after reviewing the current academic record available in the system.
          </p>
          <SignatureRow />
        </div>
      );

    case "migration-certificate":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Migration Certificate" schoolName={schoolName} schoolAddress={schoolAddress} />
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            This is to certify that <strong>{values.studentName}</strong>, Admission No.{" "}
            <strong>{values.admissionNo}</strong>, previously studying in <strong>{values.lastClass}</strong>, is
            permitted to migrate from <strong>{schoolName}</strong> for further educational purposes.
          </p>
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            Reason recorded: <strong>{values.reason}</strong>. Issued on <strong>{values.issueDate}</strong>.
          </p>
          <SignatureRow />
        </div>
      );

    case "character-certificate":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Character Certificate" schoolName={schoolName} schoolAddress={schoolAddress} />
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            This is to certify that <strong>{values.studentName}</strong> of <strong>{values.grade}</strong>,
            Section <strong>{values.section}</strong>, session <strong>{values.session}</strong>, has displayed{" "}
            <strong>{values.conductRemark}</strong>
          </p>
          <p className="text-base leading-8 text-gray-700 dark:text-zinc-300">
            This certificate is issued in good faith for official and educational purposes on{" "}
            <strong>{values.issueDate}</strong>.
          </p>
          <SignatureRow />
        </div>
      );

    case "fee-clearance-certificate":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Fee Clearance Certificate" schoolName={schoolName} schoolAddress={schoolAddress} />
          <div className="grid gap-4 md:grid-cols-2">
            <KeyValueCard label="Student Name" value={String(values.studentName)} />
            <KeyValueCard label="Class" value={`${values.grade} / Section ${values.section}`} />
            <KeyValueCard label="Total Fees" value={String(values.totalFees)} />
            <KeyValueCard label="Paid Fees" value={String(values.paidFees)} />
            <KeyValueCard label="Pending Fees" value={String(values.pendingFees)} />
            <KeyValueCard label="Status" value={String(values.feeStatus)} />
          </div>
          <SignatureRow />
        </div>
      );

    case "student-id-card":
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-slate-900 via-blue-900 to-sky-700 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">Student ID Card</p>
            <h2 className="mt-3 text-2xl font-black">{schoolName}</h2>
            <div className="mt-6 flex items-start gap-5">
              <div className="flex h-24 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold">
                {student.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part: string) => part[0])
                  .join("")}
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-white/70">Name:</span> {values.studentName}</p>
                <p><span className="text-white/70">Grade:</span> {values.grade}</p>
                <p><span className="text-white/70">Section:</span> {values.section}</p>
                <p><span className="text-white/70">Roll No:</span> {values.rollNo}</p>
                <p><span className="text-white/70">Contact:</span> {values.contactNumber}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">Card Notes</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-700 dark:text-zinc-300">
              <li>Admission No: {values.admissionNo}</li>
              <li>Academic Session: {values.academicYear}</li>
              <li>Issued On: {values.issueDate}</li>
              <li>Address: {student.address || "School address on record"}</li>
            </ul>
          </div>
        </div>
      );

    case "progress-report-card":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Progress Report Card" schoolName={schoolName} schoolAddress={schoolAddress} />
          <div className="grid gap-4 md:grid-cols-3">
            <KeyValueCard label="Student" value={String(values.studentName)} />
            <KeyValueCard label="Class" value={`${values.grade} / Section ${values.section}`} />
            <KeyValueCard label="Session" value={String(values.session)} />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">Assessment Summary</p>
            <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-zinc-300">{String(values.marksTable)}</p>
            <p className="mt-4 text-sm font-semibold text-blue-700 dark:text-blue-300">
              Average Score: {String(values.averageScore)} across {String(values.examCount)} recent records
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-zinc-300">{String(values.teacherRemark)}</p>
          </div>
          <SignatureRow />
        </div>
      );

    case "marksheet":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Marksheet" schoolName={schoolName} schoolAddress={schoolAddress} />
          <div className="grid gap-4 md:grid-cols-2">
            <KeyValueCard label="Student Name" value={String(values.studentName)} />
            <KeyValueCard label="Class" value={`${values.grade} / Section ${values.section}`} />
            <KeyValueCard label="Assessment" value={String(values.examName)} />
            <KeyValueCard label="Issued On" value={String(values.issueDate)} />
          </div>
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-6 dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Marks Summary</p>
            <p className="mt-4 text-sm leading-7 text-blue-900 dark:text-blue-100">{String(values.marksTable)}</p>
            <p className="mt-4 text-sm leading-7 text-blue-900 dark:text-blue-100">{String(values.teacherRemark)}</p>
          </div>
          <SignatureRow />
        </div>
      );

    case "exam-admit-card":
      return (
        <div className="space-y-8">
          <DocumentHeading title="Exam Admit Card" schoolName={schoolName} schoolAddress={schoolAddress} />
          <div className="grid gap-4 md:grid-cols-2">
            <KeyValueCard label="Student Name" value={String(values.studentName)} />
            <KeyValueCard label="Roll Number" value={String(values.rollNo)} />
            <KeyValueCard label="Grade" value={String(values.grade)} />
            <KeyValueCard label="Exam Name" value={String(values.examName)} />
          </div>
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Exam Instructions</p>
            <p className="mt-4 text-sm leading-7 text-amber-900 dark:text-amber-100">{String(values.examSchedule)}</p>
          </div>
          <SignatureRow />
        </div>
      );

    default:
      return (
        <div className="space-y-8">
          <DocumentHeading title={template.name} schoolName={schoolName} schoolAddress={schoolAddress} />
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-6 dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Resolved Template Content</p>
            <div className="mt-4 space-y-3">
              {template.placeholders.map((placeholder: string) => (
                <div
                  key={placeholder}
                  className="flex items-start justify-between gap-4 border-b border-blue-100 pb-3 last:border-b-0 last:pb-0 dark:border-blue-500/10"
                >
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{`{{${placeholder}}}`}</span>
                  <span className="text-right text-sm text-blue-900 dark:text-blue-100">
                    {String(values[placeholder] || "Not mapped yet")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }
}

export default async function StudentDocumentPrintPage({
  params,
}: {
  params: { id: string; slug: string };
}) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();

  const [student, template, setting, latestPayment, results] = await Promise.all([
    Student.findById(params.id).lean(),
    CertificateTemplate.findOne({ slug: params.slug, audience: "Student", isActive: true }).lean(),
    Setting.findOne().lean(),
    Payment.findOne({ studentId: params.id }).sort({ date: -1 }).lean(),
    Result.find({ student: params.id }).sort({ createdAt: -1 }).limit(12).lean(),
  ]);

  const document = template || EXTRA_DOCUMENTS.find((item) => item.slug === params.slug);

  if (!student || !document) {
    notFound();
  }

  const schoolName = setting?.schoolName || "My School";
  const schoolAddress = setting?.schoolAddress || "School address not configured";
  const values = buildDocumentValues({
    student,
    setting,
    latestPayment,
    results,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/admin/students/${student._id}/documents`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
        <p className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
          <Printer size={15} />
          Open browser print to print this document.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-200 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-700 px-8 py-8 text-white dark:border-zinc-800">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">{document.category}</p>
          <h1 className="mt-3 text-3xl font-black">{document.name}</h1>
          <p className="mt-2 text-sm text-white/80">{schoolName}</p>
          <p className="mt-1 max-w-2xl text-sm text-white/70">{schoolAddress}</p>
        </div>

        <div className="px-8 py-8">
          {renderDocumentLayout({
            template: document,
            student,
            values,
            schoolName,
            schoolAddress,
          })}
        </div>
      </div>
    </div>
  );
}

function DocumentHeading({
  title,
  schoolName,
  schoolAddress,
}: {
  title: string;
  schoolName: string;
  schoolAddress: string;
}) {
  return (
    <div className="border-b border-dashed border-gray-200 pb-6 dark:border-zinc-800">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-zinc-500">Official School Document</p>
      <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">{schoolName}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{schoolAddress}</p>
    </div>
  );
}

function KeyValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

function SignatureRow() {
  return (
    <div className="grid gap-6 pt-10 md:grid-cols-2">
      <div className="border-t border-gray-300 pt-3 text-sm font-semibold text-gray-700 dark:border-zinc-700 dark:text-zinc-300">
        Class Teacher
      </div>
      <div className="border-t border-gray-300 pt-3 text-sm font-semibold text-gray-700 dark:border-zinc-700 dark:text-zinc-300">
        Principal / Office Seal
      </div>
    </div>
  );
}
