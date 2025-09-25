// pages/api/pupuk/[id].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Pupuk from "@/models/pupuk.model";
import { authorize } from "@/middleware/authorize";
import Pemupukan from "@/models/pemupukan.model";
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
    return res.status(400).json({ error: "ID pupuk tidak valid" });
  }

  if (req.method === "GET") {
    try {
      const data = await Pupuk.findById(id);
      if (!data)
        return res.status(404).json({ error: "Pupuk tidak ditemukan" });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data pupuk" });
    }
  }

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Koperasi"])(req, res))) return;

  switch (req.method) {
    case "PUT":
      let imageUrlResult;
      try {
        const { fields, files } = await parseForm(req);
        const pupukToUpdate = await Pupuk.findById(id);
        if (!pupukToUpdate) {
          return res.status(404).json({ error: "Pupuk tidak ditemukan" });
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
        const netWeight = Number(fields.net_weight?.[0]);
        if (!isNaN(netWeight)) updatedData.net_weight = netWeight;

        if (fields.name?.[0]) updatedData.name = fields.name[0];
        if (fields.brand?.[0]) updatedData.brand = fields.brand[0];
        if (fields.package_unit?.[0])
          updatedData.package_unit = fields.package_unit[0];
        if (fields.net_weight_unit?.[0])
          updatedData.net_weight_unit = fields.net_weight_unit[0];
        if (fields.type?.[0]) updatedData.type = fields.type[0];
        if (fields.form?.[0]) updatedData.form = fields.form[0];
        if (fields.composition?.[0])
          updatedData.composition = fields.composition[0];
        if (fields.usage_recommendation?.[0])
          updatedData.usage_recommendation = fields.usage_recommendation[0];
        if (fields.is_active?.[0])
          updatedData.is_active = fields.is_active[0] === "true";

        if (imageFile) {
          imageUrlResult = await uploadImage(imageFile.filepath, "pupuk");
          await fs.unlink(imageFile.filepath);
          updatedData.image_url = imageUrlResult.secure_url;
          updatedData.image_public_id = imageUrlResult.public_id;
        }

        const data = await Pupuk.findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        });

        if (imageFile && pupukToUpdate.image_public_id) {
          await deleteImage(pupukToUpdate.image_public_id);
        }

        return res.status(200).json(data);
      } catch (error: any) {
        if (imageUrlResult) {
          await deleteImage(imageUrlResult.public_id);
        }
        return res.status(400).json({
          error: "Gagal mengupdate data pupuk",
          details: error.message,
        });
      }

    case "DELETE":
      try {
        const inUseInPemupukan = await Pemupukan.findOne({ fertilizerId: id });
        if (inUseInPemupukan) {
          return res.status(409).json({
            error:
              "Pupuk tidak dapat dihapus karena digunakan dalam riwayat Pemupukan.",
          });
        }
        const pupukToDelete = await Pupuk.findById(id);
        if (!pupukToDelete) {
          return res.status(404).json({ error: "Pupuk tidak ditemukan" });
        }
        if (pupukToDelete.image_public_id) {
          await deleteImage(pupukToDelete.image_public_id);
        }
        await Pupuk.findByIdAndDelete(id);
        return res.status(200).json({ message: "Pupuk berhasil dihapus" });
      } catch (error: any) {
        return res.status(500).json({
          error: "Gagal menghapus data pupuk",
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
