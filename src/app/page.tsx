import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
          School <span className="text-blue-600">Management</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive, real-time management for modern educational institutions. 
          Manage students, teachers, classes, and performance with ease.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/admin"
            className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-500 transition-all duration-200"
          >
            Go to Admin Dashboard
          </Link>
          <button className="rounded-full bg-white dark:bg-gray-800 px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
            Learn More
          </button>
        </div>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <FeatureCard 
          title="Student Records" 
          description="Complete profile management for every student with attendance and grade tracking."
        />
        <FeatureCard 
          title="Teacher Analytics" 
          description="Performance metrics and schedule management for your faculty members."
        />
        <FeatureCard 
          title="Resource Planning" 
          description="Classroom allocation and academic calendar management in one place."
        />
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
