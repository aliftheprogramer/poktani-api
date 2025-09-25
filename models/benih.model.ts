// models/benih.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IBenih } from "@/types/benih";

const benihSchema = new Schema<IBenih>(
  {
    name: {
      type: String,
      required: [true, "Nama benih wajib diisi"],
      trim: true,
    },
    variety: {
      type: String,
      required: [true, "Varietas wajib diisi"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Harga wajib diisi"],
      min: [0, "Harga tidak boleh negatif"],
    },
    stock: {
      type: Number,
      required: [true, "Stok wajib diisi"],
      min: [0, "Stok tidak boleh negatif"],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, "Satuan wajib diisi"],
      trim: true,
      enum: [
        "sachet",
        "gram",
        "kg",
        "butir",
        "pak",
        "karung",
        "botol",
        "kaleng",
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    days_to_harvest: {
      type: Number,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image_url: {
      type: String,
    },
    image_public_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const Benih: Model<IBenih> =
  (mongoose.models.Benih as Model<IBenih>) ||
  mongoose.model<IBenih>("Benih", benihSchema);

export default Benih;
