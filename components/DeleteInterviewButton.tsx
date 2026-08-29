"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteInterviewById } from "@/lib/actions/general";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteInterviewButtonProps {
  interviewId: string;
  userId: string;
}

export default function DeleteInterviewButton({
  interviewId,
  userId,
}: DeleteInterviewButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interview history? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInterviewById(interviewId, userId);
      toast.success("Interview history cleared.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete interview.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="ghost-btn py-2.5 px-3 text-sm flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
      title="Clear History"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
