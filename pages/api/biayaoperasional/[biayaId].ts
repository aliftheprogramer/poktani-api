// pages/api/biayaoperasional/[biayaId].ts

import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import BiayaOperasional from "@/models/biayaOperasional.model";
import KegiatanTanam from "@/models/kegiatanTanam.model"; // <-- KUNCI: Import model induk

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const { biayaId } = req.query;
  const userId = req.user!.userId;

  if (!mongoose.Types.ObjectId.isValid(biayaId as string)) {
    return res.status(400).json({ error: "ID Biaya tidak valid" });
  }

  // <-- KUNCI: Mulai transaksi untuk menjaga konsistensi data
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const biaya = await BiayaOperasional.findOne({
      _id: biayaId,
      userId,
    }).session(session);

    if (!biaya) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Data biaya tidak ditemukan" });
    }

    const kegiatanTanam = await KegiatanTanam.findById(
      biaya.plantingActivityId
    ).session(session);
    if (!kegiatanTanam) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Kegiatan tanam induk tidak ditemukan." });
    }

    switch (req.method) {
      case "PUT":
        // <-- KUNCI: Hitung selisih biaya dan update totalCost
        const costDifference = (req.body.amount ?? biaya.amount) - biaya.amount;
        kegiatanTanam.totalCost += costDifference;
        await kegiatanTanam.save({ session });

        const updatedData = await BiayaOperasional.findByIdAndUpdate(
          biayaId,
          req.body,
          { new: true, runValidators: true, session }
        );

        await session.commitTransaction(); // Simpan semua perubahan
        return res.status(200).json(updatedData);

      case "DELETE":
        // <-- KUNCI: Kurangi totalCost sebelum menghapus
        kegiatanTanam.totalCost -= biaya.amount;
        await kegiatanTanam.save({ session });
        await biaya.deleteOne({ session });

        await session.commitTransaction(); // Simpan semua perubahan
        return res
          .status(200)
          .json({ message: "Data biaya operasional berhasil dihapus" });

      default:
        await session.abortTransaction();
        res.setHeader("Allow", ["PUT", "DELETE"]);
        return res
          .status(405)
          .json({ error: `Metode ${req.method} tidak diizinkan` });
    }
  } catch (error: any) {
    await session.abortTransaction();
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan server", details: error.message });
  } finally {
    session.endSession();
  }
}
