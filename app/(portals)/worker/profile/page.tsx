import { getWorkerContext } from "@/lib/data/worker";
import { ProfileForm } from "@/components/worker/ProfileForm";

export const dynamic = "force-dynamic";

export default async function WorkerProfilePage() {
  const ctx = await getWorkerContext();
  const profile = ctx?.profile;
  const contractor = ctx?.contractor;

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">My Profile</h1>

      {!contractor ? (
        <p className="rounded-lg border border-dashed border-axora-slate bg-white p-8 text-center text-sm text-axora-navy/60">
          Your contractor profile isn&apos;t set up yet. It becomes available
          once your application is approved.
        </p>
      ) : (
        <ProfileForm
          fullName={fullName}
          servicesOffered={contractor.services_offered ?? []}
          email={profile?.email ?? ""}
          phone={profile?.phone ?? ""}
          availableDays={contractor.available_days ?? []}
          serviceAreas={contractor.service_areas ?? []}
          acceptsShortNotice={contractor.accepts_short_notice ?? false}
        />
      )}
    </div>
  );
}
