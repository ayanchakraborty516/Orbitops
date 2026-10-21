import mongoose from 'mongoose';

const incidentTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['investigating', 'identified', 'monitoring', 'resolved'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const incidentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['minor', 'major', 'critical'],
      default: 'minor',
      index: true,
    },
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      default: 'investigating',
      index: true,
    },
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timeline: [incidentTimelineSchema],
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({ workspaceId: 1, status: 1 });

export const Incident = mongoose.model('Incident', incidentSchema);
