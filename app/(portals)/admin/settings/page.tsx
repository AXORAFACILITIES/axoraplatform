import { getAdminSettings } from "@/lib/data/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
