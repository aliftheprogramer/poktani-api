// pages/api/pestisida/[id].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import Pestisida from "@/models/pestisida.model";
import Penyemprotan from "@/models/penyemprotan.model";
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
    return res.status(400).json({ error: "ID pestisida tidak valid" });
  }

  if (req.method === "GET") {
    try {
      const pestisida = await Pestisida.findById(id);
      if (!pestisida)
        return res.status(404).json({ error: "Pestisida tidak ditemukan" });
      return res.status(200).json(pestisida);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data pestisida" });
    }
  }

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Koperasi"])(req, res))) return;

  switch (req.method) {
    case "PUT":
      let imageUrlResult;
      try {
        const { fields, files } = await parseForm(req);
        const pestisidaToUpdate = await Pestisida.findById(id);
        if (!pestisidaToUpdate) {
          return res.status(404).json({ error: "Pestisida tidak ditemukan" });
        }
        const imageFile = files.image?.[0];
        const updatedData: any = {};

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
        const netVolume = Number(fields.net_volume?.[0]);
        if (!isNaN(netVolume)) updatedData.net_volume = netVolume;

        if (fields.name?.[0]) updatedData.name = fields.name[0];
        if (fields.brand?.[0]) updatedData.brand = fields.brand[0];
        if (fields.package_unit?.[0])
          updatedData.package_unit = fields.package_unit[0];
        if (fields.net_volume_unit?.[0])
          updatedData.net_volume_unit = fields.net_volume_unit[0];
        if (fields.type?.[0]) updatedData.type = fields.type[0];
        if (fields.active_ingredient?.[0])
          updatedData.active_ingredient = fields.active_ingredient[0];
        if (fields.target_pest?.[0])
          updatedData.target_pest = fields.target_pest[0];
        if (fields.dosage_recommendation?.[0])
          updatedData.dosage_recommendation = fields.dosage_recommendation[0];
        if (fields.is_active?.[0])
          updatedData.is_active = fields.is_active[0] === "true";

        if (imageFile) {
          imageUrlResult = await uploadImage(imageFile.filepath, "pestisida");
          await fs.unlink(imageFile.filepath);
          updatedData.image_url = imageUrlResult.secure_url;
          updatedData.image_public_id = imageUrlResult.public_id;
        }

        const data = await Pestisida.findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        });

        if (imageFile && pestisidaToUpdate.image_public_id) {
          await deleteImage(pestisidaToUpdate.image_public_id);
        }

        return res.status(200).json(data);
      } catch (error: any) {
        if (imageUrlResult) {
          await deleteImage(imageUrlResult.public_id);
        }
        return res.status(400).json({
          error: "Gagal mengupdate data pestisida",
          details: error.message,
        });
      }

    case "DELETE":
      try {
        const inUse = await Penyemprotan.findOne({ pesticideId: id });
        if (inUse) {
          return res.status(409).json({
            error: "Pestisida tidak dapat dihapus karena sedang digunakan.",
          });
        }
        const pestisidaToDelete = await Pestisida.findById(id);
        if (!pestisidaToDelete) {
          return res.status(404).json({ error: "Pestisida tidak ditemukan" });
        }
        if (pestisidaToDelete.image_public_id) {
          await deleteImage(pestisidaToDelete.image_public_id);
        }
        await Pestisida.findByIdAndDelete(id);
        return res.status(200).json({ message: "Pestisida berhasil dihapus" });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Gagal menghapus data pestisida" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
