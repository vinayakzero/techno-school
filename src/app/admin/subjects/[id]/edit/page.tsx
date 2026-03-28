import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Teacher from "@/models/Teacher";
import SubjectForm from "../../SubjectForm";

export const dynamic = "force-dynamic";

export default async function EditSubjectPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();
  const [subject, teachers] = await Promise.all([
    Subject.findById(params.id).populate("assignedTeacher", "name subject _id").lean(),
    Teacher.find({ status: "Active" }).select("name subject _id").sort({ name: 1 }).lean(),
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <SubjectForm
        subjectToEdit={JSON.parse(JSON.stringify(subject))}
        teachers={JSON.parse(JSON.stringify(teachers))}
      />
    </div>
  );
}
