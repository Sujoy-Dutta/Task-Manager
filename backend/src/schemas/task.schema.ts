import { z } from 'zod';

const mongoId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid task ID.');

export const idParamSchema = z.object({ id: mongoId });

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(120, 'Title must be under 120 characters.'),
  description: z
    .string()
    .max(2000, 'Description must be under 2000 characters.')
    .optional(),
  dueDate: z
    .union([z.iso.datetime(), z.literal(''), z.null()])
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty.')
    .max(120, 'Title must be under 120 characters.')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be under 2000 characters.')
    .optional(),
  dueDate: z
    .union([z.iso.datetime(), z.literal(''), z.null()])
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
  status: z
    .enum(['active', 'completed'])
    .optional(),
});

export type IdParam = z.infer<typeof idParamSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
