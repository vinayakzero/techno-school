import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import SubjectForm from "../SubjectForm";

export const dynamic = "force-dynamic";

export default async function NewSubjectPage() {
  await connectDB();
  const teachers = await Teacher.find({ status: "Active" }).select("name subject _id").sort({ name: 1 }).lean();

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <SubjectForm teachers={JSON.parse(JSON.stringify(teachers))} />
    </div>
  );
}
