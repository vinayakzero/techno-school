import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import ClassForm from "../ClassForm";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  await connectDB();
  const teachers = await Teacher.find({ status: { $in: ["Active", "On Leave"] } }).select("name subject _id").sort({ name: 1 }).lean();

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <ClassForm teachers={JSON.parse(JSON.stringify(teachers))} />
    </div>
  );
}
