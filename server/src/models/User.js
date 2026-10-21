import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    themePreference: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export const User = mongoose.model('User', userSchema);
