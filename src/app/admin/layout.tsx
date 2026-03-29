import { LayoutDashboard, Users, GraduationCap, Calendar, Settings, LogOut, BookOpen, ClipboardCheck, Wallet, CalendarDays, FileText, School } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">SchoolAdmin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active href="/admin" />
          <SidebarItem icon={<Users size={20} />} label="Students" href="/admin/students" />
          <SidebarItem icon={<Users size={20} />} label="Teachers" href="/admin/teachers" />
          <SidebarItem icon={<GraduationCap size={20} />} label="Classes" href="/admin/classes" />
          <SidebarItem icon={<BookOpen size={20} />} label="Subjects" href="/admin/subjects" />
          <SidebarItem icon={<School size={20} />} label="Courses" href="/admin/courses" />
          <SidebarItem icon={<FileText size={20} />} label="Syllabus" href="/admin/syllabus" />
          <SidebarItem icon={<ClipboardCheck size={20} />} label="Exams" href="/admin/exams" />
          <SidebarItem icon={<Calendar size={20} />} label="Attendance" href="/admin/attendance" />
          <SidebarItem icon={<CalendarDays size={20} />} label="Calendar" href="/admin/calendar" />
          <SidebarItem icon={<Wallet size={20} />} label="Fees" href="/admin/fees" />
          <SidebarItem icon={<FileText size={20} />} label="Templates" href="/admin/templates" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" href="/admin/settings" />
        </nav>
        
        <div className="p-6 border-t border-gray-200 dark:border-zinc-800">
          <button className="flex items-center gap-3 text-red-600 hover:text-red-500 transition-colors w-full font-medium">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-zinc-400">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-zinc-100">Overview</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
              VK
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, href }: { icon: React.ReactNode, label: string, active?: boolean, href: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
        active 
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
          : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100"
      }`}
    >
      <span className={active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
