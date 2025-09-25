// File: models/penyemprotan.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IPenyemprotan } from "@/types/penyemprotan";

const penyemprotanSchema = new Schema<IPenyemprotan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plantingActivityId: {
      type: Schema.Types.ObjectId,
      ref: "KegiatanTanam",
      required: true,
    },
    pesticideId: {
      type: Schema.Types.ObjectId,
      ref: "Pestisida",
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Harga satuan wajib diisi"],
      min: 0,
    },
    date: { type: Date, required: true },
    dosage: { type: Number, required: true },
    unit: { type: String, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Penyemprotan: Model<IPenyemprotan> =
  mongoose.models.Penyemprotan ||
  mongoose.model<IPenyemprotan>("Penyemprotan", penyemprotanSchema);
export default Penyemprotan;
