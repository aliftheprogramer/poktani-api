// types/biayaOperasional.d.ts
import { Document, Types } from "mongoose";

export interface IBiayaOperasional extends Document {
  userId: Types.ObjectId;
  plantingActivityId: Types.ObjectId;
  date: Date;
  costType: "Tenaga Kerja" | "Sewa Alat" | "Bahan Pendukung" | "Lain-lain";
  amount: number;
  notes?: string;
}
