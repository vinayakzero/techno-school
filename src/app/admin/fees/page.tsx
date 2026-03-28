import connectDB from "@/lib/mongodb";
import FeeStructure from "@/models/FeeStructure";
import Payment from "@/models/Payment";
import Setting from "@/models/Setting";
import Student from "@/models/Student";
import FeesClient from "./FeesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeesPage() {
  await connectDB();

  const [students, feeStructures, payments, setting] = await Promise.all([
    Student.find()
      .select("name grade section parentName fees")
      .sort({ grade: 1, name: 1 })
      .lean(),
    FeeStructure.find().sort({ grade: 1, dueDate: 1, title: 1 }).lean(),
    Payment.find()
      .populate("studentId", "name")
      .sort({ date: -1, createdAt: -1 })
      .limit(12)
      .lean(),
    Setting.findOne().lean(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <FeesClient
        students={JSON.parse(JSON.stringify(students))}
        feeStructures={JSON.parse(JSON.stringify(feeStructures))}
        payments={JSON.parse(JSON.stringify(payments))}
        currencySymbol={setting?.currencySymbol || "$"}
      />
    </div>
  );
}
