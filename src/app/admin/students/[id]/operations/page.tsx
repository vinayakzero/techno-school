import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import OperationsForm from "./OperationsForm";

export const dynamic = "force-dynamic";

export default async function StudentOperationsPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();
  const student = await Student.findById(params.id).lean();

  if (!student) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <OperationsForm student={JSON.parse(JSON.stringify(student))} />
    </div>
  );
}
