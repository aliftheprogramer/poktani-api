// 📄 File: pages/api/pestisida/index.ts
import type { NextApiResponse } from "next";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Pestisida from "@/models/pestisida.model";
import { authorize } from "@/middleware/authorize";
import { uploadImage } from "@/lib/cloudinary";
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

  switch (req.method) {
    case "GET":
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || "";
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
          ];
        }

        const pestisidaList = await Pestisida.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const totalPestisida = await Pestisida.countDocuments(query);

        return res.status(200).json({
          data: pestisidaList,
          total: totalPestisida,
          page,
          totalPages: Math.ceil(totalPestisida / limit),
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Gagal mengambil data pestisida" });
      }

    case "POST":
      if (!(await verifyToken(req, res))) return;
      if (!(await authorize(["Koperasi"])(req, res))) return;

      try {
        const { fields, files } = await parseForm(req);
        const imageFile = files.image?.[0];
        let imageUrlResult;

        if (imageFile) {
          imageUrlResult = await uploadImage(imageFile.filepath, "pestisida");
          await fs.unlink(imageFile.filepath);
        }

        const pestisidaData = {
          name: fields.name?.[0],
          brand: fields.brand?.[0],
          price: Number(fields.price?.[0]),
          stock: Number(fields.stock?.[0]),
          package_unit: fields.package_unit?.[0],
          net_volume: Number(fields.net_volume?.[0]),
          net_volume_unit: fields.net_volume_unit?.[0],
          type: fields.type?.[0],
          active_ingredient: fields.active_ingredient?.[0],
          target_pest: fields.target_pest?.[0],
          dosage_recommendation: fields.dosage_recommendation?.[0],
          is_active: fields.is_active?.[0] === "true",
          image_url: imageUrlResult?.secure_url,
          image_public_id: imageUrlResult?.public_id,
        };

        if (
          isNaN(pestisidaData.price) ||
          pestisidaData.price < 0 ||
          isNaN(pestisidaData.stock) ||
          pestisidaData.stock < 0 ||
          isNaN(pestisidaData.net_volume) ||
          pestisidaData.net_volume < 0
        ) {
          return res
            .status(400)
            .json({ error: "Harga, stok, atau volume bersih tidak valid." });
        }

        const newPestisida = new Pestisida(pestisidaData);
        await newPestisida.save();
        return res.status(201).json(newPestisida);
      } catch (error: any) {
        return res.status(400).json({
          error: "Gagal membuat data pestisida",
          details: error.message,
        });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
