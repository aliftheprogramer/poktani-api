// types/user.d.ts
import { Document } from 'mongoose';

export type RoleType = 'Koperasi' | 'Petani';

export interface IUser extends Document {
  phone: string;
  password: string;
  fullName: string;
  address?: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}
