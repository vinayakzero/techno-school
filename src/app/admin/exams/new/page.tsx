import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import ExamForm from "../ExamForm";

export const dynamic = "force-dynamic";

export default async function NewExamPage() {
  await connectDB();
  const subjects = await Subject.find().select("name code grade _id").sort({ grade: 1, name: 1 }).lean();

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <ExamForm subjects={JSON.parse(JSON.stringify(subjects))} />
    </div>
  );
}
