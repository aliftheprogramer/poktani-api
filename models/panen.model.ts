// File: models/panen.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IPanen } from "@/types/panen";

const panenSchema = new Schema<IPanen>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plantingActivityId: {
      type: Schema.Types.ObjectId,
      ref: "KegiatanTanam",
      required: true,
    },
    harvestDate: { type: Date, required: true },
    saleType: {
      type: String,
      trim: true,
      enum: ["Per Satuan", "Borongan"],
    },
    amount: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
      enum: ["kg", "kuintal", "ton", "buah", "ikat", "rumpun"],
    },
    quality: {
      type: String,
      trim: true,
      default: "A",
      enum: ["A", "B", "C", "Sortir"],
    },
    harvestCost: {
      type: Number,
      default: 0,
      min: [0, "Biaya panen tidak boleh negatif"],
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: [0, "Harga jual tidak boleh negatif"],
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldTo: {
      type: String,
      trim: true,
    },
    saleStatus: {
      type: String,
      enum: ["Belum Terjual", "Terjual Sebagian", "Terjual Habis"],
      default: "Belum Terjual",
      trim: true,
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// In dev, ensure schema updates are picked by removing cached model
if (mongoose.models.Panen) {
  try {
    mongoose.deleteModel("Panen");
  } catch {}
}

const Panen: Model<IPanen> =
  (mongoose.models.Panen as Model<IPanen>) ||
  mongoose.model<IPanen>("Panen", panenSchema);

export default Panen;
