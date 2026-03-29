"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createStudentAction, updateStudentAction } from "./actions";

const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["A", "B", "C", "D"];
const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["Active", "Pending", "Inactive"];

export default function StudentForm({ student, backHref = "/admin/students" }: { student?: any; backHref?: string }) {
  const router = useRouter();
  const isEdit = !!student;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(formRef.current!);
    const result = isEdit
      ? await updateStudentAction(student._id, formData)
      : await createStudentAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/admin/students");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300 transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Students
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">
          {isEdit ? "Edit Student" : "Add New Student"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {isEdit ? "Update student information." : "Fill in the details to enroll a new student."}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-y-auto px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} id="student-form">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Personal Information</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input name="name" type="text" required defaultValue={student?.name} className={inputClass} placeholder="e.g. Alex Johnson" />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input name="email" type="email" required defaultValue={student?.email} className={inputClass} placeholder="alex@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input name="phone" type="text" required defaultValue={student?.phone} className={inputClass} placeholder="555-0100" />
                </div>
                <div>
                  <label className={labelClass}>Admission Number *</label>
                  <input name="admissionNumber" type="text" required defaultValue={student?.admissionNumber} className={inputClass} placeholder="e.g. ADM-2026-0101" />
                </div>
                <div>
                  <label className={labelClass}>Academic Session</label>
                  <input name="academicSession" type="text" defaultValue={student?.academicSession || "2026-2027"} className={inputClass} placeholder="2026-2027" />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input name="dateOfBirth" type="date" required defaultValue={student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select name="gender" required defaultValue={student?.gender || ""} className={inputClass}>
                    <option value="" disabled>Select gender...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input name="address" type="text" defaultValue={student?.address} className={inputClass} placeholder="123 Main St, City" />
                </div>
                <div>
                  <label className={labelClass}>Admission Source</label>
                  <input name="admissionSource" type="text" defaultValue={student?.admissionSource} className={inputClass} placeholder="Walk-in / Referral / Transfer" />
                </div>
                <div>
                  <label className={labelClass}>Previous School</label>
                  <input name="previousSchool" type="text" defaultValue={student?.previousSchool} className={inputClass} placeholder="Previous school name" />
                </div>
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <input name="bloodGroup" type="text" defaultValue={student?.bloodGroup} className={inputClass} placeholder="e.g. O+" />
                </div>
                <div>
                  <label className={labelClass}>House</label>
                  <input name="house" type="text" defaultValue={student?.house} className={inputClass} placeholder="Red / Blue / Green / Yellow" />
                </div>
              </div>

              <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Academic Details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClass}>Grade *</label>
                  <select name="grade" required defaultValue={student?.grade || ""} className={inputClass}>
                    <option value="" disabled>Select grade...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Section *</label>
                  <select name="section" required defaultValue={student?.section || ""} className={inputClass}>
                    <option value="" disabled>Select section...</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Roll Number *</label>
                  <input name="rollNumber" type="text" required defaultValue={student?.rollNumber} className={inputClass} placeholder="e.g. 1A01" />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" defaultValue={student?.status || "Active"} className={inputClass}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Parent / Guardian Information</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Parent / Guardian Name *</label>
                  <input name="parentName" type="text" required defaultValue={student?.parentName} className={inputClass} placeholder="Robert Johnson" />
                </div>
                <div>
                  <label className={labelClass}>Parent / Guardian Phone *</label>
                  <input name="parentPhone" type="text" required defaultValue={student?.parentPhone} className={inputClass} placeholder="555-0200" />
                </div>
                <div>
                  <label className={labelClass}>Guardian Relation</label>
                  <input name="guardianRelation" type="text" defaultValue={student?.guardianRelation} className={inputClass} placeholder="Father / Mother / Guardian" />
                </div>
                <div>
                  <label className={labelClass}>Emergency Contact Name</label>
                  <input name="emergencyContactName" type="text" defaultValue={student?.emergencyContactName} className={inputClass} placeholder="Emergency contact person" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Emergency Contact Phone</label>
                  <input name="emergencyContactPhone" type="text" defaultValue={student?.emergencyContactPhone} className={inputClass} placeholder="Emergency contact phone" />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="ml-auto flex gap-3">
            <Link href={backHref} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </Link>
            <button form="student-form" type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-60">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
