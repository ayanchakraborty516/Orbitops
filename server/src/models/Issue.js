import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['bug', 'task', 'story', 'epic'],
      default: 'task',
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ workspaceId: 1, key: 1 }, { unique: true });
issueSchema.index({ workspaceId: 1, status: 1 });

export const Issue = mongoose.model('Issue', issueSchema);
