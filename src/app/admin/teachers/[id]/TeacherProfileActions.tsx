"use client";

import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import { deleteTeacherAction } from "../actions";
import { useRouter } from "next/navigation";

export default function TeacherProfileActions({ teacher }: { teacher: any }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${teacher.name}?`)) return;
    await deleteTeacherAction(teacher._id);
    router.push("/admin/teachers");
  };

  return (
    <>
      <Link
        href={`/admin/teachers/${teacher._id}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Edit2 size={15} /> Edit
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
