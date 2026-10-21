import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model('Comment', commentSchema);
