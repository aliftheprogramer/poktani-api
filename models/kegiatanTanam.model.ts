// File: models/kegiatanTanam.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IKegiatanTanam } from "@/types/kegiatanTanam";

const kegiatanTanamSchema = new Schema<IKegiatanTanam>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    landId: { type: Schema.Types.ObjectId, ref: "Lahan", required: true },
    seedId: { type: Schema.Types.ObjectId, ref: "Benih", required: true },
    source: {
      type: {
        type: String,
        required: true,
        enum: ["FROM_NURSERY", "DIRECT_PURCHASE"],
      },
      nurseryId: {
        type: Schema.Types.ObjectId,
        ref: "Semai",
        required: function () {
          return this.source.type === "FROM_NURSERY";
        },
      },
      purchaseInfo: {
        supplier: { type: String },
        price: { type: Number },
      },
    },
    plantingDate: { type: Date, required: true },
    plantingAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Active", "Harvested", "Completed", "Failed"],
      default: "Active",
    },
    notes: { type: String, trim: true },
    // Tambahan untuk denormalisasi
    totalCost: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const KegiatanTanam: Model<IKegiatanTanam> =
  mongoose.models.KegiatanTanam ||
  mongoose.model<IKegiatanTanam>("KegiatanTanam", kegiatanTanamSchema);
export default KegiatanTanam;
