// File: types/penyemprotan.d.ts
import { Document, Types } from "mongoose";

export interface IPenyemprotan extends Document {
  userId: Types.ObjectId;
  plantingActivityId: Types.ObjectId;
  pesticideId: Types.ObjectId;
  date: Date;
  dosage: number;
  unit: string;
  pricePerUnit: number;
  notes?: string;
}
