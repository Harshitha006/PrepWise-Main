import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import InterviewFlowGuard from "@/components/InterviewFlowGuard";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="page-container py-10">
      <div className="max-w-2xl mx-auto">
        <InterviewFlowGuard user={{ id: user.id, name: user.name }} />
      </div>
    </div>
  );
}
