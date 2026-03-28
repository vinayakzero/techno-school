import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/models/Class";
import Teacher from "@/models/Teacher";
import ClassForm from "../../ClassForm";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();
  const [classData, teachers] = await Promise.all([
    ClassModel.findById(params.id).populate("classTeacher", "name subject _id").lean(),
    Teacher.find({ status: { $in: ["Active", "On Leave"] } }).select("name subject _id").sort({ name: 1 }).lean(),
  ]);

  if (!classData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <ClassForm classData={JSON.parse(JSON.stringify(classData))} teachers={JSON.parse(JSON.stringify(teachers))} />
    </div>
  );
}
