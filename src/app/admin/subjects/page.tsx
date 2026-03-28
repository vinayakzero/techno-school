import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Teacher from "@/models/Teacher";
import SubjectsClient from "./SubjectsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubjectsPage() {
  await connectDB();
  
  // Fetch subjects and automatically populate assignedTeacher to get their names
  const subjects = await Subject.find().populate("assignedTeacher", "name email").sort({ grade: 1, name: 1 }).lean();
  
  // Fetch active teachers for assignment dropdown
  const teachers = await Teacher.find({ status: "Active" }).select("name subject _id").sort({ name: 1 }).lean();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <SubjectsClient 
        subjects={JSON.parse(JSON.stringify(subjects))} 
        teachers={JSON.parse(JSON.stringify(teachers))} 
      />
    </div>
  );
}
