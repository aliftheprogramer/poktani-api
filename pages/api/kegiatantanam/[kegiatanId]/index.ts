// pages\api\kegiatantanam\[kegiatanId]\index.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Lahan from "@/models/lahan.model";
import Panen from "@/models/panen.model";
import Pemupukan from "@/models/pemupukan.model";
import Penyemprotan from "@/models/penyemprotan.model";

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
        const kegiatan = await KegiatanTanam.findOne({
          _id: kegiatanId,
          userId,
        })
          .populate("landId", "name village district")
          .populate("seedId");

        if (!kegiatan)
          return res
            .status(404)
            .json({ error: "Kegiatan tanam tidak ditemukan" });

        return res.status(200).json(kegiatan);
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data" });
      }

    case "PUT":
      try {
        const updated = await KegiatanTanam.findOneAndUpdate(
          { _id: kegiatanId, userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!updated)
          return res
            .status(404)
            .json({ error: "Kegiatan tanam tidak ditemukan" });
        return res.status(200).json(updated);
      } catch (error: any) {
        return res
          .status(400)
          .json({ error: "Gagal mengupdate data", details: error.message });
      }

    case "DELETE":
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const kegiatan = await KegiatanTanam.findOne({
          _id: kegiatanId,
          userId,
        }).session(session);
        if (!kegiatan) throw new Error("Kegiatan tanam tidak ditemukan.");

        // Cascade delete
        await Panen.deleteMany({ plantingActivityId: kegiatanId }).session(
          session
        );
        await Pemupukan.deleteMany({ plantingActivityId: kegiatanId }).session(
          session
        );
        await Penyemprotan.deleteMany({
          plantingActivityId: kegiatanId,
        }).session(session);

        // Hapus dari riwayat Lahan
        await Lahan.updateOne(
          { _id: kegiatan.landId },
          { $pull: { plantingHistory: kegiatanId } }
        ).session(session);

        // Hapus kegiatan itu sendiri
        await kegiatan.deleteOne({ session });

        await session.commitTransaction();
        return res.status(200).json({
          message: "Kegiatan tanam dan semua riwayatnya berhasil dihapus.",
        });
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(500).json({
          error: "Gagal menghapus kegiatan tanam",
          details: error.message,
        });
      } finally {
        session.endSession();
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
