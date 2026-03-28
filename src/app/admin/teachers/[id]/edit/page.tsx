import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import TeacherForm from "../../TeacherForm";

export const dynamic = "force-dynamic";

export default async function EditTeacherPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();
  const teacher = await Teacher.findById(params.id).lean();

  if (!teacher) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <TeacherForm teacher={JSON.parse(JSON.stringify(teacher))} />
    </div>
  );
}
