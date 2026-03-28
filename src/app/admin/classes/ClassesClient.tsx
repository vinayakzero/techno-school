"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";
import { deleteClassAction } from "./actions";

export default function ClassesClient({ classes: initialClasses }: { classes: any[]; teachers: any[] }) {
  const [classesList, setClassesList] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = classesList.filter(c =>
    c.grade.toLowerCase().includes(search.toLowerCase()) ||
    c.section.toLowerCase().includes(search.toLowerCase()) ||
    c.classTeacher?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setDeletingId(id);
    await deleteClassAction(id);
    setClassesList(prev => prev.filter(c => c._id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Classes</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage all registered classes, sections, and class teachers.</p>
        </div>
        <Link
          href="/admin/classes/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          <Plus size={18} />
          Create Class
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by grade, section, or teacher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">{filtered.length} classes found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <th className="px-6 py-4 font-medium">Class Name</th>
                <th className="px-6 py-4 font-medium">Section</th>
                <th className="px-6 py-4 font-medium">Class Teacher</th>
                <th className="px-6 py-4 font-medium">Capacity</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((cls) => (
                <tr key={cls._id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/80">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800/50 dark:bg-orange-900/30 dark:text-orange-400">
                        <Users size={18} />
                      </div>
                      <div className="text-base font-semibold text-gray-900 dark:text-zinc-100">{cls.grade}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                      Section {cls.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                    {cls.classTeacher ? (
                      <div className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                           {cls.classTeacher.name?.substring(0, 2)}
                        </div>
                        {cls.classTeacher.name}
                      </div>
                    ) : (
                      <span className="italic text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-zinc-400">
                     0 / {cls.capacity} Enrolled
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/admin/classes/${cls._id}/edit`}
                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(cls._id, `${cls.grade} Section ${cls.section}`)}
                        disabled={deletingId === cls._id}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-500">
                    {search ? `No classes matching "${search}".` : "No classes found. Click Create Class to begin."}
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
