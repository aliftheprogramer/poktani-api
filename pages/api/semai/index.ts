// pages/api/semai/index.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Semai from "@/models/semai.model";
import Benih from "@/models/benih.model";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;

  const userId = req.user!.userId;

  switch (req.method) {
    case "GET":
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const search = req.query.search as string;
        const skip = (page - 1) * limit;

        const query: any = { userId };

        if (status) {
          query.status = status;
        }

        if (search) {
          const benihIds = await Benih.find({
            name: { $regex: search, $options: "i" },
          }).select("_id");

          query.seedId = { $in: benihIds.map((b) => b._id) };
        }

        const semaiList = await Semai.find(query)
          .populate("seedId", "name variety")
          .sort({ startDate: -1 })
          .skip(skip)
          .limit(limit);

        const totalRecords = await Semai.countDocuments(query);

        return res.status(200).json({
          data: semaiList,
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        });
      } catch (error) {
        console.error("Gagal mengambil data semai:", error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
      }
      break;

    case "POST":
      try {
        const {
          seedId,
          seedAmount,
          seedUnit,
          startDate,
          estimatedReadyDate,
          nurseryLocation,
          additionalCost, // <-- Menerima biaya tambahan dari frontend
          notes,
        } = req.body;

        if (!seedId || !seedAmount || !seedUnit || !startDate) {
          return res.status(400).json({ error: "Data wajib tidak lengkap" });
        }

        if (!mongoose.Types.ObjectId.isValid(seedId)) {
          return res.status(400).json({ error: "ID benih tidak valid." });
        }

        const benih = await Benih.findById(seedId);
        if (!benih) {
          return res.status(404).json({ error: "Benih tidak ditemukan." });
        } // <-- KUNCI: Hitung total biaya di backend

        const totalSemaiCost = benih.price * seedAmount + (additionalCost || 0);

        const newSemai = new Semai({
          userId,
          seedId,
          seedAmount,
          seedUnit,
          startDate,
          estimatedReadyDate,
          nurseryLocation,
          cost: totalSemaiCost,
          notes,
        });

        await newSemai.save();

        const populatedSemai = await Semai.findById(newSemai._id).populate(
          "seedId",
          "name variety"
        );
        res.status(201).json(populatedSemai);
      } catch (error: any) {
        console.error("Gagal menyimpan data semai:", error);
        res.status(400).json({
          error: "Gagal menyimpan data semai",
          details: error.message,
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
