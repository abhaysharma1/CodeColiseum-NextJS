import { z } from "zod";

const SUPPORTED_LANGUAGES = ["c", "cpp", "python", "java"] as const;

const languageSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => (SUPPORTED_LANGUAGES as readonly string[]).includes(value), {
    message: `Unsupported language. Must be one of: ${SUPPORTED_LANGUAGES.join(", ")}`,
  });

const testSchema = z.object({
  input: z.string().max(100_000, "Input must be at most 100,000 characters"),
  output: z.string().max(100_000, "Output must be at most 100,000 characters"),
});

export const problemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(300, "Title must be at most 300 characters"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().default("MEDIUM"),
  source: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  publicTests: z.array(testSchema).optional().default([]),
  hiddenTests: z.array(testSchema).optional().default([]),
  hidden: z.boolean().optional().default(false),
  referenceSolution: z.object({
    language: languageSchema.optional(),
    languageId: z.number().int("languageId must be an integer").optional(),
    code: z.string().min(1, "Reference solution code is required"),
  }),
});

export const uploadProblemsSchema = z.array(problemSchema).max(
  2000,
  "Cannot upload more than 2000 problems at once",
);

export type ProblemInput = z.infer<typeof problemSchema>;
export type UploadProblemsInput = z.infer<typeof uploadProblemsSchema>;
