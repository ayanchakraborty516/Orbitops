import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['project', 'issue', 'comment', 'incident', 'service', 'release', 'member'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityTitle: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activitySchema.index({ workspaceId: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
