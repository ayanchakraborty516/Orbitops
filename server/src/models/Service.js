import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance'],
      default: 'operational',
      index: true,
    },
    uptimePercentage: {
      type: Number,
      default: 99.98,
      min: 0,
      max: 100,
    },
    latencyMs: {
      type: Number,
      default: 45,
    },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'production',
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    lastCheckedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Service = mongoose.model('Service', serviceSchema);
