// pages/api/kegiatantanam/[kegiatanId]/panen.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Panen from "@/models/panen.model";

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

  switch (req.method) {
    case "GET":
      try {
        const data = await Panen.find({
          plantingActivityId: kegiatanId,
          userId,
        });
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil riwayat panen" });
      }

    case "POST":
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const kegiatan = await KegiatanTanam.findOne({
          _id: kegiatanId,
          userId,
        }).session(session);
        if (!kegiatan) throw new Error("Kegiatan tanam tidak ditemukan.");

        const { saleType, amount, unit, sellingPrice, totalRevenue } = req.body;

        if (saleType === "Per Satuan") {
          if (!amount || !unit || !sellingPrice) {
            throw new Error(
              "Untuk penjualan 'Per Satuan', jumlah, satuan, dan harga jual wajib diisi."
            );
          }
        } else if (saleType === "Borongan") {
          if (!totalRevenue) {
            throw new Error(
              "Untuk penjualan 'Borongan', total pendapatan wajib diisi."
            );
          }
        } else {
          throw new Error("Tipe penjualan tidak valid.");
        }

        const newData = new Panen({
          ...req.body,
          userId,
          plantingActivityId: kegiatanId,
        });
        await newData.save({ session });

        kegiatan.status = "Harvested";
        // Update denormalized total revenue
        kegiatan.totalRevenue += totalRevenue || amount * sellingPrice;
        await kegiatan.save({ session });

        await session.commitTransaction();
        return res.status(201).json(newData);
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Gagal menambah data panen",
          details: error.message,
        });
      } finally {
        session.endSession();
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
