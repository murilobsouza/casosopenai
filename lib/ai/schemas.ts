import { z } from "zod";

export const AIFeedbackSchema = z.object({
  feedback: z.string(),
  score: z.number().int().min(0).max(3),
  justification: z.string(),
  next_hint: z.string().optional(),
  unsafe_flag: z.boolean().optional().default(false),
});

export type AIFeedback = z.infer<typeof AIFeedbackSchema>;
