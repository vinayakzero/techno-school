"use client";

import { useState } from "react";
import { Plus, Search, Trash2, CalendarHeart, ClipboardEdit, Printer } from "lucide-react";
import { deleteExamAction } from "./actions";
import Link from "next/link";
import { formatShortDate } from "@/lib/date";

export default function ExamsClient({ exams }: { exams: any[]; subjects: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Warning: Deleting ${name} will permanently remove all student marks associated with it! Are you sure?`)) {
      await deleteExamAction(id);
    }
  };

  const filteredExams = exams.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.subject?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Examinations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Schedule exams and enter marks for students.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/exams/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-blue-700"
          >
            <Plus size={18} /> Schedule Exam
          </Link>
          <Link
            href="/admin/exams/timetable"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Printer size={18} />
            Print Timetable
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search exams by name, grade, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:bg-zinc-900"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Exam Level & Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Max Score</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarHeart size={32} className="text-gray-300 dark:text-zinc-600" />
                      <p>No exams found or scheduled yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam._id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-zinc-100">{exam.name}</div>
                      <div className="text-xs text-gray-500">{exam.grade}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-zinc-400">
                        {exam.subject ? `${exam.subject.name} (${exam.subject.code})` : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {formatShortDate(exam.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-gray-500 dark:text-zinc-400">{exam.totalMarks}</span>
                    </td>
                    <td className="flex items-center justify-end gap-2 px-6 py-4 text-right">
                      <div className="flex items-center gap-2 opacity-50 transition-opacity xl:opacity-0 group-hover:opacity-100">
                        <Link
                          href={`/admin/exams/${exam._id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                        >
                          <ClipboardEdit size={14} /> Enter Marks
                        </Link>

                        <button
                          onClick={() => handleDelete(exam._id, exam.name)}
                          className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Delete Exam"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
