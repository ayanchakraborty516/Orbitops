import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  completedAt: {
    type: Date,
  },
});

const releaseSchema = new mongoose.Schema(
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
    version: {
      type: String,
      required: [true, 'Release version is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Release title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'in_progress', 'completed', 'canceled'],
      default: 'draft',
      index: true,
    },
    targetDate: {
      type: Date,
    },
    releasedDate: {
      type: Date,
    },
    checklists: [checklistItemSchema],
    issueIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

releaseSchema.index({ workspaceId: 1, version: 1 }, { unique: true });

export const Release = mongoose.model('Release', releaseSchema);
