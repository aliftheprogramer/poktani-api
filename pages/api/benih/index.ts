// pages/api/benih/index.ts
import type { NextApiResponse } from "next";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Benih from "@/models/benih.model";
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
            { variety: { $regex: search, $options: "i" } },
          ];
        }

        const benihList = await Benih.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const totalBenih = await Benih.countDocuments(query);

        return res.status(200).json({
          data: benihList,
          total: totalBenih,
          page,
          totalPages: Math.ceil(totalBenih / limit),
        });
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data benih" });
      }

    case "POST":
      if (!(await verifyToken(req, res))) return;
      if (!(await authorize(["Koperasi"])(req, res))) return;

      try {
        const { fields, files } = await parseForm(req);
        const imageFile = files.image?.[0];
        let imageUrlResult;

        if (imageFile) {
          imageUrlResult = await uploadImage(imageFile.filepath, "benih");
          await fs.unlink(imageFile.filepath);
        }

        const benihData = {
          name: fields.name?.[0],
          variety: fields.variety?.[0],
          price: Number(fields.price?.[0]),
          stock: Number(fields.stock?.[0]),
          unit: fields.unit?.[0],
          description: fields.description?.[0],
          days_to_harvest: Number(fields.days_to_harvest?.[0]),
          is_active: fields.is_active?.[0] === "true",
          image_url: imageUrlResult?.secure_url,
          image_public_id: imageUrlResult?.public_id,
        };

        // Validasi input
        if (isNaN(benihData.price) || benihData.price < 0) {
          return res.status(400).json({ error: "Harga tidak valid." });
        }
        if (isNaN(benihData.stock) || benihData.stock < 0) {
          return res.status(400).json({ error: "Stok tidak valid." });
        }

        const newBenih = new Benih(benihData);
        await newBenih.save();
        return res.status(201).json(newBenih);
      } catch (error: any) {
        return res.status(400).json({
          error: "Gagal membuat data benih",
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
