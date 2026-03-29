"use client";

import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import { deleteStudentAction } from "../actions";
import { useRouter } from "next/navigation";

export default function StudentProfileActions({ student }: { student: any }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) return;
    await deleteStudentAction(student._id);
    router.push("/admin/students");
  };

  return (
    <>
      <Link
        href={`/admin/students/${student._id}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Edit2 size={15} /> Edit
      </Link>
      <Link
        href={`/admin/students/${student._id}/operations`}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/10 dark:text-blue-300 dark:hover:bg-blue-900/20"
      >
        Manage Status
      </Link>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800/50 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <Trash2 size={15} /> Delete
      </button>
    </>
  );
}
