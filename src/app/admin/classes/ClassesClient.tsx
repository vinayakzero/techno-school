"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";
import ClassForm from "./ClassForm";
import { deleteClassAction } from "./actions";

export default function ClassesClient({ classes: initialClasses, teachers }: { classes: any[], teachers: any[] }) {
  const [classesList, setClassesList] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClass, setEditClass] = useState<any>(null);
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

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Classes</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage all registered classes, sections, and class teachers.</p>
        </div>
        <button
          onClick={() => { setEditClass(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 h-10 px-4 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Create Class
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by grade, section, or teacher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow dark:text-zinc-300"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">{filtered.length} classes found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-medium">Class Name</th>
                <th className="px-6 py-4 font-medium">Section</th>
                <th className="px-6 py-4 font-medium">Class Teacher</th>
                <th className="px-6 py-4 font-medium">Capacity</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((cls) => (
                <tr key={cls._id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center text-orange-700 dark:text-orange-400 shrink-0">
                        <Users size={18} />
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-zinc-100 text-base">{cls.grade}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                      Section {cls.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                    {cls.classTeacher ? (
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] uppercase font-bold dark:bg-blue-900/50 dark:text-blue-400">
                           {cls.classTeacher.name?.substring(0, 2)}
                        </div>
                        {cls.classTeacher.name}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400 font-mono text-xs">
                     0 / {cls.capacity} Enrolled
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditClass(cls); setShowForm(true); }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id, `${cls.grade} Section ${cls.section}`)}
                        disabled={deletingId === cls._id}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
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

      {showForm && (
        <ClassForm
          classData={editClass}
          teachers={teachers}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
