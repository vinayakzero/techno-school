import connectDB from "@/lib/mongodb";
import FeeStructure from "@/models/FeeStructure";
import Setting from "@/models/Setting";
import Student from "@/models/Student";
import PaymentForm from "../../PaymentForm";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams?: { studentId?: string };
}) {
  await connectDB();

  const [students, feeStructures, setting] = await Promise.all([
    Student.find()
      .select("name grade section parentName fees")
      .sort({ grade: 1, name: 1 })
      .lean(),
    FeeStructure.find().sort({ grade: 1, dueDate: 1, title: 1 }).lean(),
    Setting.findOne().lean(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <PaymentForm
        students={JSON.parse(JSON.stringify(students))}
        feeStructures={JSON.parse(JSON.stringify(feeStructures))}
        initialStudentId={searchParams?.studentId || ""}
        currencySymbol={setting?.currencySymbol || "$"}
      />
    </div>
  );
}
