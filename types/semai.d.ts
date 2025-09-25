// File: types/semai.d.ts
import { Document, Types } from "mongoose";

export interface ISemai extends Document {
  userId: Types.ObjectId;
  seedId: Types.ObjectId;
  seedAmount: number;
  seedUnit: "gram" | "kg" | "butir" | "sachet" | "pak";
  startDate: Date;
  estimatedReadyDate?: Date;
  status: "Persiapan" | "Berlangsung" | "Siap Pindah" | "Selesai" | "Gagal";
  nurseryLocation?: string;
  cost: number;
  seedlingYield: number;
  yieldUnit: "batang" | "polybag" | "tray" | "rumpun" | "dapog";
  isPlanted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
