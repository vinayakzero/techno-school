import { getSettingsAction } from "./actions";
import SettingsClient from "./SettingsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const { setting } = await getSettingsAction();
  
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <SettingsClient initialSettings={setting} />
    </div>
  );
}
