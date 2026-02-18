import { toast } from "sonner";

export default function handleExamError(err: { status: number; message: string }) {
  switch (err.status) {
    case 401:
      toast.error("Please log in to continue");
      break;

    case 403:
      toast.error("You are not allowed to attempt this exam");
      break;

    case 404:
      toast.error("Exam not found");
      break;

    case 409:
      toast.error("Exam is not active right now");
      break;

    default:
      toast.error(err.message);
  }
}
