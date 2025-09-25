// File: types/kegiatanTanam.d.ts
import { Document, Types } from "mongoose";

export interface IKegiatanTanam extends Document {
  userId: Types.ObjectId;
  landId: Types.ObjectId;
  seedId: Types.ObjectId;
  source: {
    type: "FROM_NURSERY" | "DIRECT_PURCHASE";
    nurseryId?: Types.ObjectId;
    purchaseInfo?: {
      supplier?: string;
      price?: number;
    };
  };
  plantingDate: Date;
  plantingAmount: number;
  status: "Active" | "Harvested" | "Completed" | "Failed";
  notes?: string;
  totalCost: number;
  totalRevenue: number;
}
