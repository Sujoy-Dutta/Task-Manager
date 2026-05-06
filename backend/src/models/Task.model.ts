import { Schema, model, Document, Model, Types } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed';

export interface ITask {
  userId: Types.ObjectId;
  title: string;
  description: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

interface ITaskModel extends Model<ITaskDocument> {}

const taskSchema = new Schema<ITaskDocument, ITaskModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [1, 'Title cannot be empty.'],
      maxlength: [120, 'Title must be under 120 characters.'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description must be under 2000 characters.'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'] as TaskPriority[],
        message: 'Priority must be low, medium, or high.',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed'] as TaskStatus[],
        message: 'Status must be active or completed.',
      },
      default: 'active',
    },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });

taskSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: unknown, ret: any) {
    ret.__v = undefined;
    return ret;
  },
});

const Task = model<ITaskDocument, ITaskModel>('Task', taskSchema);
export default Task;
