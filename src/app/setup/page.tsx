import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if role already exists
  const role =
    (sessionClaims?.metadata as { role?: string })?.role ??
    (sessionClaims?.publicMetadata as { role?: string })?.role;

  // If role exists, redirect to their dashboard
  if (role) {
    redirect(`/${role}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
          Account Setup Required
        </h1>
        
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <p className="text-center text-sm text-blue-800">
            Your account needs to be assigned a role by an administrator before you can access the system.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>What happens next?</strong>
          </p>
          <ul className="ml-4 list-disc space-y-2">
            <li>An administrator will review your account</li>
            <li>You'll be assigned an appropriate role (Admin, Teacher, Student, or Parent)</li>
            <li>You'll receive an email notification once your account is activated</li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500">
            <strong>Need help?</strong> Contact your school administrator at{" "}
            <a href="mailto:admin@school.com" className="text-blue-600 hover:underline">
              admin@school.com
            </a>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}