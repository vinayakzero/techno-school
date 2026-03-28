import connectDB from "@/lib/mongodb";
import ClassModel from "@/models/Class";
import Teacher from "@/models/Teacher";
import ClassesClient from "./ClassesClient";

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  await connectDB();
  const classes = await ClassModel.find().populate("classTeacher", "name _id").sort({ grade: 1, section: 1 }).lean();
  const teachers = await Teacher.find().select("name _id subject").sort({ name: 1 }).lean();
  
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <ClassesClient classes={JSON.parse(JSON.stringify(classes))} teachers={JSON.parse(JSON.stringify(teachers))} />
    </div>
  );
}
