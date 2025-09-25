// File: types/pemupukan.d.ts
import { Document, Types } from "mongoose";

export interface IPemupukan extends Document {
  userId: Types.ObjectId;
  plantingActivityId: Types.ObjectId;
  fertilizerId: Types.ObjectId;
  date: Date;
  amount: number;
  unit: string;
  pricePerUnit: number;
  notes?: string;
}
