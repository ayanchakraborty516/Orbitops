import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
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
      index: true,
    },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Member', 'Viewer'],
      default: 'Member',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const Membership = mongoose.model('Membership', membershipSchema);
