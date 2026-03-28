"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, CalendarHeart, ClipboardEdit } from "lucide-react";
import ExamForm from "./ExamForm";
import { deleteExamAction } from "./actions";
import Link from "next/link";
import { formatShortDate } from "@/lib/date";

export default function ExamsClient({ exams, subjects }: { exams: any[], subjects: any[] }) {
  const [showForm, setShowForm] = useState(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Examinations</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Schedule exams and enter marks for students.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} /> Schedule Exam
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search exams by name, grade, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Exam Level & Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Max Score</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                  <tr key={exam._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
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
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium text-xs border border-indigo-200 dark:border-indigo-500/20">
                        {formatShortDate(exam.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-gray-500 dark:text-zinc-400">{exam.totalMarks}</span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      <div className="flex items-center gap-2 opacity-50 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/exams/${exam._id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition-colors border border-blue-200 dark:border-blue-500/20"
                        >
                          <ClipboardEdit size={14} /> Enter Marks
                        </Link>
                        
                        <button 
                          onClick={() => handleDelete(exam._id, exam.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
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

      {showForm && (
        <ExamForm 
          onClose={() => setShowForm(false)} 
          subjects={subjects} 
        />
      )}
    </div>
  );
}
