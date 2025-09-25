// File: types/panen.d.ts
import { Document, Types } from "mongoose";

export interface IPanen extends Document {
  userId: Types.ObjectId;
  plantingActivityId: Types.ObjectId;
  harvestDate: Date;
  saleType: "Per Satuan" | "Borongan";
  amount?: number;
  unit?: "kg" | "kuintal" | "ton" | "buah" | "ikat" | "rumpun";
  quality: "A" | "B" | "C" | "Sortir";
  harvestCost: number;
  sellingPrice?: number;
  totalRevenue: number;
  soldTo?: string;
  saleStatus: "Belum Terjual" | "Terjual Sebagian" | "Terjual Habis";
  notes?: string;
}
