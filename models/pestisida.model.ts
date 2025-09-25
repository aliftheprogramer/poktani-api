// models/pestisida.model.ts
import mongoose, { Model, Schema } from "mongoose";
import { IPestisida } from "@/types/pestisida";

const pestisidaSchema = new Schema<IPestisida>(
  {
    name: {
      type: String,
      required: [true, "Nama pestisida wajib diisi"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Merek pestisida wajib diisi"],
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
      enum: ["botol", "sachet", "kaleng", "jerigen"],
    },
    net_volume: {
      type: Number,
      min: [0, "Volume bersih tidak boleh negatif"],
      required: [true, "Volume bersih wajib diisi"],
    },
    net_volume_unit: {
      type: String,
      trim: true,
      required: [true, "Satuan volume bersih wajib diisi"],
      enum: ["ml", "liter", "gram", "kg"],
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Insektisida",
        "Fungisida",
        "Herbisida",
        "Rodentisida",
        "Bakterisida",
        "Akarisida",
      ],
    },
    active_ingredient: {
      type: String,
    },
    target_pest: {
      type: String,
    },
    dosage_recommendation: {
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

const Pestisida: Model<IPestisida> =
  (mongoose.models.Pestisida as Model<IPestisida>) ||
  mongoose.model<IPestisida>("Pestisida", pestisidaSchema);

export default Pestisida;
