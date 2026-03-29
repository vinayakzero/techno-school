"use client";

import Link from "next/link";
import { useState } from "react";
import { UserPlus, Search, Edit2, Trash2 } from "lucide-react";
import { deleteTeacherAction } from "./actions";

export default function TeachersClient({ teachers: initialTeachers }: { teachers: any[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) return;
    setDeletingId(id);
    await deleteTeacherAction(id);
    setTeachers(prev => prev.filter(t => t._id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Teachers</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage faculty members and staff profiles. Total: {teachers.length}</p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          <UserPlus size={18} />
          Add Teacher
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <th className="px-6 py-4 font-medium">Teacher Info</th>
                <th className="px-6 py-4 font-medium">Subject(s)</th>
                <th className="px-6 py-4 font-medium">Experience</th>
                <th className="px-6 py-4 font-medium">Salary</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((teacher) => (
                <tr key={teacher._id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/80">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-sm font-bold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {teacher.name.split(" ").map((n: string) => n[0].replace(/[^a-zA-Z]/g, "")).join("").substring(0, 2)}
                      </div>
                      <div>
                        <Link href={`/admin/teachers/${teacher._id}`} className="font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">{teacher.name}</Link>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-zinc-200">{teacher.subject}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">{teacher.classes?.join(", ") || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">{teacher.experience} yrs</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">${teacher.salary?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      teacher.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : teacher.status === "On Leave" ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                      : "border-gray-200 bg-gray-100 text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/admin/teachers/${teacher._id}/edit`}
                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(teacher._id, teacher.name)}
                        disabled={deletingId === teacher._id}
                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-500">
                    {search ? `No teachers matching "${search}".` : "No teachers found. Click Add Teacher to begin."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
