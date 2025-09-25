// pages/api/kegiatantanam/[kegiatanId]/biayaoperasional.ts

import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import BiayaOperasional from "@/models/biayaOperasional.model";

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
        const data = await BiayaOperasional.find({
          plantingActivityId: kegiatanId,
          userId,
        }).sort({ date: 1 });
        return res.status(200).json(data);
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Gagal mengambil riwayat biaya operasional" });
      }

    case "POST":
      // <-- KUNCI: Logika POST kini menggunakan transaksi
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const kegiatan = await KegiatanTanam.findOne({
          _id: kegiatanId,
          userId,
        }).session(session);
        if (!kegiatan) throw new Error("Kegiatan tanam tidak ditemukan.");

        const { date, costType, amount, notes } = req.body;
        if (!date || !costType || amount === undefined) {
          throw new Error(
            "Data wajib (tanggal, tipe biaya, jumlah) tidak lengkap."
          );
        }

        const newData = new BiayaOperasional({
          userId,
          plantingActivityId: kegiatanId,
          date,
          costType,
          amount,
          notes,
        });
        await newData.save({ session });

        // <-- KUNCI: Update totalCost pada model KegiatanTanam
        kegiatan.totalCost += amount;
        await kegiatan.save({ session });

        await session.commitTransaction();
        return res.status(201).json(newData);
      } catch (error: any) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ error: "Gagal menambah data biaya", details: error.message });
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
