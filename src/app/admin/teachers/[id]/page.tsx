import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, BookOpen, DollarSign } from "lucide-react";
import TeacherProfileActions from "./TeacherProfileActions";

export const dynamic = 'force-dynamic';

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  await connectDB();

  const teacher = await Teacher.findById(params.id).lean();
  if (!teacher) notFound();

  const t = JSON.parse(JSON.stringify(teacher));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/admin/teachers" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <ArrowLeft size={16} />
        Back to Teachers
      </Link>

      {/* Hero Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-3xl shrink-0">
              {t.name ? t.name.split(" ").filter(Boolean).map((n: string) => n[0]?.toUpperCase()).join("").substring(0, 2) : "TC"}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{t.name || "Unknown Teacher"}</h1>
              <p className="text-gray-500 dark:text-zinc-400">{t.subject || "Subject"} · {t.experience || 0} years experience · {t.gender || "Gender"}</p>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${t.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : t.status === "On Leave" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                }`}>
                {t.status}
              </span>
              <TeacherProfileActions teacher={t} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Experience" value={`${t.experience} yrs`} color="indigo" />
        <StatBox label="Annual Salary" value={`$${t.salary?.toLocaleString()}`} color="emerald" />
        <StatBox label="Classes Assigned" value={t.classes?.length || 0} color="amber" />
        <StatBox label="Qualification" value={t.qualification?.split(" ")[0] || "—"} color="blue" subtitle={t.qualification} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Personal Information</h2>
          <div className="space-y-3">
            <InfoRow icon={<Mail size={16} />} label="Email" value={t.email} />
            <InfoRow icon={<Phone size={16} />} label="Phone" value={t.phone} />
            <InfoRow icon={<User size={16} />} label="Gender" value={t.gender} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={t.address || "—"} />
            <InfoRow icon={<Calendar size={16} />} label="Join Date"
              value={t.joinDate ? new Date(t.joinDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"} />
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Professional Details</h2>
            <div className="space-y-3">
              <InfoRow icon={<BookOpen size={16} />} label="Subject(s)" value={t.subject} />
              <InfoRow icon={<BookOpen size={16} />} label="Qualification" value={t.qualification} />
              <InfoRow icon={<DollarSign size={16} />} label="Annual Salary" value={`$${t.salary?.toLocaleString()}`} />
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Assigned Classes</h2>
            {t.classes && t.classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {t.classes.map((cls: string) => (
                  <span key={cls} className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                    {cls}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-zinc-400">No classes assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, subtitle }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };
  return (
    <div className={`rounded-xl p-5 ${colors[color]} border border-current/10`}>
      <p className="text-2xl font-black mb-1 truncate">{value}</p>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      {subtitle && <p className="text-xs opacity-60 mt-0.5 truncate">{subtitle}</p>}
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0">{icon}</span>
      <span className="text-sm text-gray-500 dark:text-zinc-400 w-32 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}
