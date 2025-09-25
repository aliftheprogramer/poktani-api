// pages/api/lahan/index.ts
import type { NextApiResponse } from "next";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Lahan from "@/models/lahan.model";
import { authorize } from "@/middleware/authorize";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const userId = req.user?.userId;

  switch (req.method) {
    case "GET":
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || "";
        const skip = (page - 1) * limit;

        const query: any = { userId };
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { village: { $regex: search, $options: "i" } },
            { district: { $regex: search, $options: "i" } },
          ];
        }

        const lahanList = await Lahan.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const totalLahan = await Lahan.countDocuments(query);

        return res.status(200).json({
          data: lahanList,
          total: totalLahan,
          page,
          totalPages: Math.ceil(totalLahan / limit),
        });
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data lahan" });
      }

    case "POST":
      try {
        const newLahan = new Lahan({ ...req.body, userId });
        await newLahan.save();
        return res.status(201).json(newLahan);
      } catch (error: any) {
        return res
          .status(400)
          .json({ error: "Gagal membuat lahan baru", details: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
