import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import TeachersClient from "./TeachersClient";

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  await connectDB();
  const teachers = await Teacher.find().sort({ createdAt: -1 }).lean();
  return <TeachersClient teachers={JSON.parse(JSON.stringify(teachers))} />;
}
