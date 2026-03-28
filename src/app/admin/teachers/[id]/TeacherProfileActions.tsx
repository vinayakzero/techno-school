"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import TeacherForm from "../TeacherForm";
import { deleteTeacherAction } from "../actions";
import { useRouter } from "next/navigation";

export default function TeacherProfileActions({ teacher }: { teacher: any }) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${teacher.name}?`)) return;
    await deleteTeacherAction(teacher._id);
    router.push("/admin/teachers");
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <Edit2 size={15} /> Edit
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 size={15} /> Delete
      </button>
      {showForm && (
        <TeacherForm
          teacher={teacher}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
