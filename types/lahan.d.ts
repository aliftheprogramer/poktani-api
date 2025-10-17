// File: types/lahan.d.ts
import { Document, Types } from "mongoose";

export interface ILahan extends Document {
  userId: Types.ObjectId;
  name: string;
  landArea: number;
  soilType: string;
  hamlet: string;
  village: string;
  district: string;
  latitude: number;
  longitude: number;
  gambar?: string;
  plantingHistory: Types.ObjectId[];
}
