import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'pro', 'enterprise'],
      default: 'pro',
    },
    settings: {
      allowPublicIncidents: { type: Boolean, default: true },
      enableSlackIntegration: { type: Boolean, default: false },
      autoResolveIncidentsMinutes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model('Workspace', workspaceSchema);
