import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import ExamsClient from "./ExamsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExamsPage() {
  await connectDB();
  
  // Fetch exams and populate subject data
  const exams = await Exam.find()
    .populate("subject", "name code")
    .sort({ date: -1, name: 1 })
    .lean();
    
  // Fetch active subjects for exam creation dropdown
  const subjects = await Subject.find().select("name code grade _id").sort({ grade: 1, name: 1 }).lean();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <ExamsClient 
        exams={JSON.parse(JSON.stringify(exams))} 
        subjects={JSON.parse(JSON.stringify(subjects))} 
      />
    </div>
  );
}
