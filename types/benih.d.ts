// types/benih.d.ts
import { Document } from "mongoose";

export interface IBenih extends Document {
  name: string;
  variety: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  days_to_harvest?: number;
  is_active: boolean;
  image_url?: string;
  image_public_id?: string;

  createdAt: Date;
  updatedAt: Date;
}
