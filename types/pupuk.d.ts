// types/pupuk.d.ts
import { Document } from "mongoose";

export interface IPupuk extends Document {
  name: string;
  brand: string;
  price: number;
  stock: number;
  package_unit: "karung" | "botol" | "sachet" | "jerigen" | "pack";
  net_weight: number;
  net_weight_unit: "kg" | "gram" | "liter" | "ml";
  type: "Anorganik" | "Organik" | "Hayati";
  form: "Padat" | "Cair";
  composition?: string;
  usage_recommendation?: string;
  is_active: boolean;
  image_url?: string;
  image_public_id?: string;
  createdAt: Date;
  updatedAt: Date;
}
