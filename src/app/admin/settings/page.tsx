import SettingsForm from "@/components/admin/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">Store Settings</h1>
      <p className="mt-1 text-sm text-brown/50">
        Make sure to verify configuration before changing tax or delivery parameters.
      </p>

      <div className="mt-6">
        <SettingsForm />
      </div>
    </div>
  );
}