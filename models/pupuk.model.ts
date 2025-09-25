// models/pupuk.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IPupuk } from "@/types/pupuk";

const pupukSchema = new Schema<IPupuk>(
  {
    name: {
      type: String,
      required: [true, "Nama pupuk wajib diisi"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Merek pupuk wajib diisi"],
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
    package_unit: {
      type: String,
      required: [true, "Satuan kemasan wajib diisi"],
      trim: true,
      enum: ["karung", "botol", "sachet", "jerigen", "pack"],
    },
    net_weight: {
      type: Number,
      min: [0, "Berat bersih tidak boleh negatif"],
      required: [true, "Berat bersih wajib diisi"],
    },
    net_weight_unit: {
      type: String,
      trim: true,
      required: [true, "Satuan berat bersih wajib diisi"],
      enum: ["kg", "gram", "liter", "ml"],
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["Anorganik", "Organik", "Hayati"],
    },
    form: {
      type: String,
      required: true,
      trim: true,
      enum: ["Padat", "Cair"],
    },
    composition: {
      type: String,
    },
    usage_recommendation: {
      type: String,
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

const Pupuk: Model<IPupuk> =
  (mongoose.models.Pupuk as Model<IPupuk>) ||
  mongoose.model<IPupuk>("Pupuk", pupukSchema);

export default Pupuk;
