import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    releaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Release',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'staging',
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'in_progress', 'successful', 'failed', 'rolled_back'],
      default: 'queued',
      index: true,
    },
    commitHash: {
      type: String,
      trim: true,
      default: '',
    },
    commitMessage: {
      type: String,
      trim: true,
      default: '',
    },
    deployedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logs: [
      {
        type: String,
      },
    ],
    durationSeconds: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

deploymentSchema.index({ workspaceId: 1, environment: 1, createdAt: -1 });

export const Deployment = mongoose.model('Deployment', deploymentSchema);
