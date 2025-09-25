// pages/api/pupuk/index.ts
import type { NextApiResponse } from "next";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Pupuk from "@/models/pupuk.model";
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

        const pupukList = await Pupuk.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const totalPupuk = await Pupuk.countDocuments(query);

        return res.status(200).json({
          data: pupukList,
          total: totalPupuk,
          page,
          totalPages: Math.ceil(totalPupuk / limit),
        });
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data pupuk" });
      }

    case "POST":
      if (!(await verifyToken(req, res))) return;
      if (!(await authorize(["Koperasi"])(req, res))) return;

      try {
        const { fields, files } = await parseForm(req);
        const imageFile = files.image?.[0];
        let imageUrlResult;

        if (imageFile) {
          imageUrlResult = await uploadImage(imageFile.filepath, "pupuk");
          await fs.unlink(imageFile.filepath);
        }

        const pupukData = {
          name: fields.name?.[0],
          brand: fields.brand?.[0],
          price: Number(fields.price?.[0]),
          stock: Number(fields.stock?.[0]),
          package_unit: fields.package_unit?.[0],
          net_weight: Number(fields.net_weight?.[0]),
          net_weight_unit: fields.net_weight_unit?.[0],
          type: fields.type?.[0],
          form: fields.form?.[0],
          composition: fields.composition?.[0],
          usage_recommendation: fields.usage_recommendation?.[0],
          is_active: fields.is_active?.[0] === "true",
          image_url: imageUrlResult?.secure_url,
          image_public_id: imageUrlResult?.public_id,
        };

        if (
          isNaN(pupukData.price) ||
          pupukData.price < 0 ||
          isNaN(pupukData.stock) ||
          pupukData.stock < 0 ||
          isNaN(pupukData.net_weight) ||
          pupukData.net_weight < 0
        ) {
          return res
            .status(400)
            .json({ error: "Harga, stok, atau berat bersih tidak valid." });
        }

        const newPupuk = new Pupuk(pupukData);
        await newPupuk.save();
        return res.status(201).json(newPupuk);
      } catch (error: any) {
        return res.status(400).json({
          error: "Gagal membuat data pupuk",
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
