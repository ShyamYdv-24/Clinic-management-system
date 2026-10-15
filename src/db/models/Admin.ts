import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin' | 'staff';
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'staff'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware: Securely hash the admin password using bcrypt.hash(password, 10)
 * Never store the plain-text password in MongoDB.
 */
AdminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  // If already hashed by bcrypt ($2a$ or $2b$ prefix with cost factor), avoid re-hashing
  if (typeof this.password === 'string' && /^\$2[ab]\$\d{2}\$/.test(this.password)) {
    return;
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to hash admin password');
    throw err;
  }
});

/**
 * Compare entered password against the stored bcrypt hash.
 */
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Password comparison error in Admin model:', err);
    return false;
  }
};

export const AdminModel: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
