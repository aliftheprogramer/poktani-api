// File: models/semai.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { ISemai } from "@/types/semai";

const semaiSchema = new Schema<ISemai>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seedId: { type: Schema.Types.ObjectId, ref: "Benih", required: true },
    seedAmount: { type: Number, required: true },
    seedUnit: {
      type: String,
      required: true,
      trim: true, // Tambahkan trim
      enum: ["gram", "kg", "butir", "sachet", "pak"],
    },
    startDate: { type: Date, required: true },
    estimatedReadyDate: { type: Date },
    status: {
      type: String,
      required: true,
      trim: true, // Tambahkan trim
      enum: ["Persiapan", "Berlangsung", "Siap Pindah", "Selesai", "Gagal"],
      default: "Persiapan",
    },
    nurseryLocation: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    seedlingYield: {
      type: Number,
      default: 0,
    },
    yieldUnit: {
      type: String,
      default: "batang",
      trim: true,
      enum: ["batang", "polybag", "tray", "rumpun", "dapog"],
    },
    isPlanted: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Semai: Model<ISemai> =
  mongoose.models.Semai || mongoose.model<ISemai>("Semai", semaiSchema);

export default Semai;
