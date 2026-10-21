import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 120,
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    issueCounter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ workspaceId: 1, key: 1 }, { unique: true });

export const Project = mongoose.model('Project', projectSchema);
