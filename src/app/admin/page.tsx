import { Users, GraduationCap, School, MoreVertical, CreditCard } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import ClassModel from "@/models/Class";
import Payment from "@/models/Payment";
import Setting from "@/models/Setting";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await connectDB();

  const [totalStudents, totalTeachers, activeClasses, paymentAgg, outstandingAgg, recentStudents, setting] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    ClassModel.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Student.aggregate([{ $group: { _id: null, total: { $sum: "$fees.pending" } } }]),
    Student.find().sort({ enrollmentDate: -1, _id: -1 }).limit(4).lean(),
    Setting.findOne().lean(),
  ]);

  const currencySymbol = setting?.currencySymbol || "$";
  const feesCollected = paymentAgg[0]?.total || 0;
  const outstandingFees = outstandingAgg[0]?.total || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Overview</h1>
          <p className="text-gray-500 dark:text-zinc-400">Welcome back, Administrator. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/students" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Open Students
          </Link>
          <Link href="/admin/fees" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500">
            Open Fees
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="h-5 w-5 text-blue-600" />} 
          title="Total Students" 
          value={totalStudents.toLocaleString()} 
          change="Updated today"
          isPositive={true}
        />
        <StatCard 
          icon={<GraduationCap className="h-5 w-5 text-emerald-600" />} 
          title="Total Teachers" 
          value={totalTeachers.toLocaleString()} 
          change="Updated today"
          isPositive={true}
        />
        <StatCard 
          icon={<School className="h-5 w-5 text-amber-600" />} 
          title="Active Classes" 
          value={activeClasses.toLocaleString()} 
          change="Live class records"
          isPositive={true}
        />
        <StatCard 
          icon={<CreditCard className="h-5 w-5 text-violet-600" />} 
          title="Fees Collected" 
          value={`${currencySymbol}${feesCollected.toLocaleString()}`} 
          change={`${currencySymbol}${outstandingFees.toLocaleString()} outstanding`}
          isPositive={true}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Recent Students</h2>
            <Link href="/admin/students" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800">
                  <th className="pb-4 font-medium">Student Name</th>
                  <th className="pb-4 font-medium">Grade</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {recentStudents.map((student: any) => (
                  <StudentRow 
                    key={student._id.toString()}
                    name={student.name} 
                    grade={student.grade} 
                    status={student.status || "Active"} 
                    date={new Date(student.enrollmentDate || student.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})} 
                  />
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-zinc-500">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <QuickActionButton label="Add New Student" description="Enrollment form for new entries" />
            <QuickActionButton label="Schedule Exam" description="Set dates and subjects" />
            <QuickActionButton label="Generate Report" description="Monthly academic summary" />
            <QuickActionButton label="Send Announcement" description="Notify parents and staff" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change, isPositive }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:translate-y-[-2px] transition-transform">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">{icon}</div>
        <div className="text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded transition-colors cursor-pointer">
          <MoreVertical size={16} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-1">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
          {change}
        </p>
      </div>
    </div>
  );
}

function StudentRow({ name, grade, status, date }: any) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="py-4 font-medium text-gray-900 dark:text-zinc-100">{name}</td>
      <td className="py-4 text-gray-600 dark:text-zinc-400">{grade}</td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        }`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-gray-500 dark:text-zinc-400">{date}</td>
      <td className="py-4 text-right">
        <button className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
}

function QuickActionButton({ label, description }: any) {
  return (
    <button className="w-full text-left p-4 rounded-lg border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
      <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{label}</p>
      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{description}</p>
    </button>
  );
}
