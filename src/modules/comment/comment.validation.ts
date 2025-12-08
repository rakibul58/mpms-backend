import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const commentIdParamSchema = z.object({ id: z.string().min(1) });
export const taskIdParamSchema = z.object({ taskId: z.string().min(1) });

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
