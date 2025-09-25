// pages/api/lahan/[id].ts

import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import Lahan from "@/models/lahan.model";
import KegiatanTanam from "@/models/kegiatanTanam.model";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const userId = req.user?.userId;
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "ID lahan tidak valid" });
  }

  switch (req.method) {
    case "GET":
      try {
        const lahan = await Lahan.findOne({ _id: id, userId });
        if (!lahan) {
          return res.status(404).json({ error: "Lahan tidak ditemukan" });
        }
        return res.status(200).json(lahan);
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data lahan" });
      }

    case "PUT":
      try {
        const updatedLahan = await Lahan.findOneAndUpdate(
          { _id: id, userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedLahan) {
          return res.status(404).json({ error: "Lahan tidak ditemukan" });
        }
        return res.status(200).json(updatedLahan);
      } catch (error: any) {
        return res.status(400).json({
          error: "Gagal memperbarui data lahan",
          details: error.message,
        });
      }

    case "DELETE": // <-- KUNCI: Gunakan Transaksi untuk DELETE
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const lahan = await Lahan.findOne({ _id: id, userId }).session(session);
        if (!lahan) {
          throw new Error("Lahan tidak ditemukan");
        } // Pastikan pengecekan juga berada dalam transaksi
        const inUse = await KegiatanTanam.findOne({ landId: id }).session(
          session
        );
        if (inUse) {
          throw new Error(
            "Lahan tidak dapat dihapus karena sudah digunakan dalam Kegiatan Tanam."
          );
        }

        await Lahan.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        return res.status(200).json({ message: "Lahan berhasil dihapus" });
      } catch (error: any) {
        await session.abortTransaction();
        if (error.message.includes("digunakan")) {
          return res.status(409).json({ error: error.message });
        }
        return res
          .status(500)
          .json({ error: "Gagal menghapus lahan", details: error.message });
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
