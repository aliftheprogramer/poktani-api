// File: models/lahan.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { ILahan } from "@/types/lahan";

const lahanSchema = new Schema<ILahan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    landArea: { type: Number, required: true },
    soilType: { type: String, required: true },
    hamlet: { type: String, required: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    plantingHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "KegiatanTanam",
      },
    ],
  },
  { timestamps: true }
);

const Lahan: Model<ILahan> =
  (mongoose.models.Lahan as Model<ILahan>) ||
  mongoose.model<ILahan>("Lahan", lahanSchema);
export default Lahan;
