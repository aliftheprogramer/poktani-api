// pages/api/kegiatantanam/[kegiatanId]/analisis.ts (Updated)
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Panen from "@/models/panen.model";
import { IBenih } from "@/types/benih";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const { kegiatanId } = req.query;
  const userId = req.user!.userId;

  if (!mongoose.Types.ObjectId.isValid(kegiatanId as string)) {
    return res.status(400).json({ error: "ID Kegiatan Tanam tidak valid" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ error: `Metode ${req.method} tidak diizinkan` });
  }

  try {
    const kegiatan = await KegiatanTanam.findOne({
      _id: kegiatanId,
      userId,
    }).populate<{ seedId: IBenih }>("seedId");

    if (!kegiatan) {
      return res.status(404).json({ error: "Kegiatan tanam tidak ditemukan" });
    }

    const panenList = await Panen.find({ plantingActivityId: kegiatanId });

    const costPanen = panenList.reduce(
      (sum, item) => sum + (item.harvestCost || 0),
      0
    );

    const totalCost = kegiatan.totalCost + costPanen;
    const totalRevenue = kegiatan.totalRevenue;
    const netProfit = totalRevenue - totalCost;

    const { totalAmountInKg, otherAmounts } = panenList.reduce(
      (acc, item) => {
        const amount = item.amount || 0;
        const unit = item.unit || "lainnya";

        if (unit === "kuintal") {
          acc.totalAmountInKg += amount * 100;
        } else if (unit === "ton") {
          acc.totalAmountInKg += amount * 1000;
        } else if (unit === "kg") {
          acc.totalAmountInKg += amount;
        } else {
          acc.otherAmounts[unit] = (acc.otherAmounts[unit] || 0) + amount;
        }
        return acc;
      },
      { totalAmountInKg: 0, otherAmounts: {} as Record<string, number> }
    );

    const analysisResult = {
      kegiatanTanamId: kegiatan._id,
      kegiatanTanamName: `${kegiatan.status} - ${kegiatan.seedId.name}`,
      totalRevenue,
      totalCost,
      netProfit,
      harvestDetails: {
        totalHarvests: panenList.length,
        totalAmountInKg,
        otherAmounts,
      },
    };

    return res.status(200).json(analysisResult);
  } catch (error: any) {
    console.error("Gagal melakukan analisis:", error);
    return res.status(500).json({
      error: "Terjadi kesalahan saat melakukan analisis",
      details: error.message,
    });
  }
}
