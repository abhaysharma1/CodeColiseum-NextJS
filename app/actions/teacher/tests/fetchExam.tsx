'use server'
import assertExamAccess from "./assertExamAccess";

export default async function fetchExam(examId: string) {
  const { exam } = await assertExamAccess(examId);

  return exam;
}
