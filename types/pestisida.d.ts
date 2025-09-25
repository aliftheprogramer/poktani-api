// types/pestisida.d.ts
import { Document } from "mongoose";

export interface IPestisida extends Document {
  name: string;
  brand: string;
  price: number;
  stock: number;
  package_unit: "botol" | "sachet" | "kaleng" | "jerigen";
  net_volume: number;
  net_volume_unit: "ml" | "liter" | "gram" | "kg";
  type:
    | "Insektisida"
    | "Fungisida"
    | "Herbisida"
    | "Rodentisida"
    | "Bakterisida"
    | "Akarisida";
  active_ingredient?: string;
  target_pest?: string;
  dosage_recommendation?: string;
  is_active: boolean;
  image_url?: string;
  image_public_id?: string; // Tambahan
  createdAt: Date;
  updatedAt: Date;
}
