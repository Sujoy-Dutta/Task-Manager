import type { Request, Response, NextFunction } from 'express';
import Task from '../models/Task.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };


// GET /api/tasks
export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const { status, priority, search, sort = 'createdAt', order = 'desc' } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { userId };

    if (status === 'active' || status === 'completed') {
      filter.status = status;
    }
    if (priority === 'low' || priority === 'medium' || priority === 'high') {
      filter.priority = priority;
    }
    if (search?.trim()) {
      filter.$or = [
        { title:       { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const validSortFields = ['createdAt', 'dueDate', 'title', 'updatedAt'];
    const sortDir = order === 'asc' ? 1 : -1;

    let tasks;
    if (sort === 'priority') {
      tasks = await Task.find(filter).lean();
      tasks.sort((a, b) => {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        return order === 'asc' ? diff : -diff;
      });
    } else {
      const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
      tasks = await Task.find(filter).sort({ [sortField]: sortDir }).lean();
    }

    sendSuccess(res, { tasks, count: tasks.length }, 'Tasks retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:id
export async function getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!task) throw new AppError('Task not found.', 404);
    sendSuccess(res, { task }, 'Task retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, dueDate, priority } = req.body;

    const task = await Task.create({
      userId: req.user!._id,
      title,
      description: description ?? '',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority ?? 'medium',
    });

    sendSuccess(res, { task }, 'Task created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/tasks/:id
export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title       !== undefined) updateData.title       = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate     !== undefined) updateData.dueDate     = dueDate ? new Date(dueDate) : null;
    if (priority    !== undefined) updateData.priority    = priority;
    if (status      !== undefined) updateData.status      = status;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!task) throw new AppError('Task not found.', 404);
    sendSuccess(res, { task }, 'Task updated successfully.');
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id/toggle
export async function toggleTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!task) throw new AppError('Task not found.', 404);

    task.status = task.status === 'completed' ? 'active' : 'completed';
    await task.save();

    sendSuccess(res, { task }, `Task marked as ${task.status}.`);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!task) throw new AppError('Task not found.', 404);
    sendSuccess(res, null, 'Task deleted successfully.');
  } catch (err) {
    next(err);
  }
}
