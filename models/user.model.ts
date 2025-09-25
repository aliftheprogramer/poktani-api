// models/user.model.ts
import mongoose, { Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '@/types/user';

const SALT_ROUNDS = 10;

const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: [true, 'Nomor telepon wajib diisi'],
      unique: true,
      trim: true,
      minlength: 6,
      maxlength: 20,
      match: [/^\+?\d{6,20}$/, 'Nomor telepon tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: 6,
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Nama lengkap wajib diisi'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['Koperasi', 'Petani'],
      default: 'Petani',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;
