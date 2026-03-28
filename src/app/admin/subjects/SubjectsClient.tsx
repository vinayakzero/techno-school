"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, BookOpen } from "lucide-react";
import { deleteSubjectAction } from "./actions";

export default function SubjectsClient({ subjects }: { subjects: any[]; teachers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteSubjectAction(id);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Manage academic subjects and assignments.</p>
        </div>
        <Link
          href="/admin/subjects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-blue-700"
        >
          <Plus size={18} /> Add Subject
        </Link>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search subjects..."
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
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Grade</th>
                <th className="px-6 py-4 font-semibold">Lead Teacher</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookOpen size={32} className="text-gray-300 dark:text-zinc-600" />
                      <p>No subjects found for your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-zinc-100">{subject.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">{subject.grade}</td>
                    <td className="px-6 py-4">
                      {subject.assignedTeacher ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-600 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                            {subject.assignedTeacher.name.charAt(0)}
                          </div>
                          <span className="text-gray-700 dark:text-zinc-300">{subject.assignedTeacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-gray-400 dark:text-zinc-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          href={`/admin/subjects/${subject._id}/edit`}
                          className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          title="Edit Subject"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(subject._id, subject.name)}
                          className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Delete Subject"
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
