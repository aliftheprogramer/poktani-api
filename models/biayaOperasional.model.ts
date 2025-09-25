// models/biayaOperasional.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IBiayaOperasional } from "@/types/biayaOperasional";

const biayaOperasionalSchema = new Schema<IBiayaOperasional>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plantingActivityId: {
      type: Schema.Types.ObjectId,
      ref: "KegiatanTanam",
      required: true,
    },
    date: { type: Date, required: true },
    costType: {
      type: String,
      required: true,
      trim: true,
      enum: ["Tenaga Kerja", "Sewa Alat", "Bahan Pendukung", "Lain-lain"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const BiayaOperasional: Model<IBiayaOperasional> =
  mongoose.models.BiayaOperasional ||
  mongoose.model<IBiayaOperasional>("BiayaOperasional", biayaOperasionalSchema);

export default BiayaOperasional;
