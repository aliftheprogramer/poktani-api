// pages/api/benih/[id].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import Benih from "@/models/benih.model";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Semai from "@/models/semai.model";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { parseForm } from "@/lib/apiUtils";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  const { id } = req.query;
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "ID benih tidak valid" });
  }

  if (req.method === "GET") {
    try {
      const benih = await Benih.findById(id);
      if (!benih)
        return res.status(404).json({ error: "Benih tidak ditemukan" });
      return res.status(200).json(benih);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data benih" });
    }
  }

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Koperasi"])(req, res))) return;

  switch (req.method) {
    case "PUT":
      let imageUrlResult;
      try {
        const { fields, files } = await parseForm(req);
        const benihToUpdate = await Benih.findById(id);
        if (!benihToUpdate) {
          return res.status(404).json({ error: "Benih tidak ditemukan" });
        }

        const imageFile = files.image?.[0];
        const updatedData: any = {};

        // Cek jika stok diupdate, pastikan tidak kurang dari 0
        const newStock = fields.stock?.[0];
        if (newStock !== undefined) {
          const parsedStock = Number(newStock);
          if (isNaN(parsedStock) || parsedStock < 0) {
            return res
              .status(400)
              .json({ error: "Stok harus berupa angka non-negatif." });
          }
          updatedData.stock = parsedStock;
        }

        const price = Number(fields.price?.[0]);
        if (!isNaN(price)) updatedData.price = price;
        const daysToHarvest = Number(fields.days_to_harvest?.[0]);
        if (!isNaN(daysToHarvest)) updatedData.days_to_harvest = daysToHarvest;
        if (fields.name?.[0]) updatedData.name = fields.name[0];
        if (fields.variety?.[0]) updatedData.variety = fields.variety[0];
        if (fields.unit?.[0]) updatedData.unit = fields.unit[0];
        if (fields.description?.[0])
          updatedData.description = fields.description[0];
        if (fields.is_active?.[0])
          updatedData.is_active = fields.is_active[0] === "true";

        if (imageFile) {
          imageUrlResult = await uploadImage(imageFile.filepath, "benih");
          await fs.unlink(imageFile.filepath);
          updatedData.image_url = imageUrlResult.secure_url;
          updatedData.image_public_id = imageUrlResult.public_id;
        }

        const updatedBenih = await Benih.findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        });

        if (imageFile && benihToUpdate.image_public_id) {
          await deleteImage(benihToUpdate.image_public_id);
        }

        return res.status(200).json(updatedBenih);
      } catch (error: any) {
        if (imageUrlResult) {
          await deleteImage(imageUrlResult.public_id);
        }
        return res.status(400).json({
          error: "Gagal mengupdate data benih",
          details: error.message,
        });
      }

    case "DELETE":
      try {
        const inUseInKegiatan = await KegiatanTanam.findOne({ seedId: id });
        const inUseInSemai = await Semai.findOne({ seedId: id });
        if (inUseInKegiatan || inUseInSemai) {
          return res.status(409).json({
            error: "Benih tidak dapat dihapus karena sudah digunakan.",
          });
        }
        const benihToDelete = await Benih.findById(id);
        if (!benihToDelete) {
          return res.status(404).json({ error: "Benih tidak ditemukan" });
        }
        if (benihToDelete.image_public_id) {
          await deleteImage(benihToDelete.image_public_id);
        }
        await Benih.findByIdAndDelete(id);
        return res.status(200).json({ message: "Benih berhasil dihapus" });
      } catch (error: any) {
        return res.status(500).json({
          error: "Gagal menghapus data benih",
          details: error.message,
        });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
