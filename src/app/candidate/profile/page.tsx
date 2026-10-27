import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { LogoutButton } from "@/components/auth/logout-button";

async function CandidateProfileContent() {
  const user = await requireRole(Role.CANDIDATE);

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Candidate Profile
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Welcome, <span className="font-semibold">{user.name}</span> ({user.role})
      </p>
      <p className="mt-2 text-sm text-gray-500">Signed in as {user.email}</p>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <LogoutButton />
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-8">
      <Suspense fallback={<p className="text-gray-500">Loading profile...</p>}>
        <CandidateProfileContent />
      </Suspense>
    </div>
  );
}
