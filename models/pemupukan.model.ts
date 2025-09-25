// File: models/pemupukan.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IPemupukan } from "@/types/pemupukan";

const pemupukanSchema = new Schema<IPemupukan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plantingActivityId: {
      type: Schema.Types.ObjectId,
      ref: "KegiatanTanam",
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Harga satuan wajib diisi"],
      min: 0,
    },
    fertilizerId: { type: Schema.Types.ObjectId, ref: "Pupuk", required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Pemupukan: Model<IPemupukan> =
  mongoose.models.Pemupukan ||
  mongoose.model<IPemupukan>("Pemupukan", pemupukanSchema);
export default Pemupukan;
