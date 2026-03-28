"use client";

import { useState } from "react";
import { UserPlus, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";
import StudentForm from "./StudentForm";
import { deleteStudentAction } from "./actions";

export default function StudentsClient({ students: initialStudents }: { students: any[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    setDeletingId(id);
    await deleteStudentAction(id);
    setStudents(prev => prev.filter(s => s._id !== id));
    setDeletingId(null);
  };

  const handleSuccess = () => {
    // Page will revalidate from server action — simply close form
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Students</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage student records and enrollments. Total: {students.length}</p>
        </div>
        <button
          onClick={() => { setEditStudent(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 h-10 px-4 shadow-sm transition-colors"
        >
          <UserPlus size={18} />
          Add Student
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, grade..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow dark:text-zinc-300"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Grade / Section</th>
                <th className="px-6 py-4 font-medium">Date of Birth</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm shrink-0">
                        {student.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <a href={`/admin/students/${student._id}`} className="font-semibold text-gray-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{student.name}</a>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-zinc-200 font-medium">{student.grade}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">Section {student.section}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      student.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : student.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditStudent(student); setShowForm(true); }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id, student.name)}
                        disabled={deletingId === student._id}
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
                    {search ? `No students matching "${search}".` : "No students found. Click Add Student to begin."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 text-sm text-gray-500 dark:text-zinc-400 bg-gray-50/50 dark:bg-zinc-900/50">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <StudentForm
          student={editStudent}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
