// pages/api/lahan/[id]/clear-history.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import Lahan from "@/models/lahan.model";
import KegiatanTanam from "@/models/kegiatanTanam.model";
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

  const { id } = req.query;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "ID lahan tidak valid" });
  }

  // Gunakan metode POST untuk tindakan seperti ini
  if (req.method === "POST") {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Verifikasi kepemilikan Lahan
      const lahan = await Lahan.findOne({ _id: id, userId }).session(session);
      if (!lahan) {
        throw new Error(
          "Lahan tidak ditemukan atau Anda tidak memiliki akses."
        );
      }

      // 2. Temukan semua KegiatanTanam yang terkait dengan lahan ini
      const kegiatanTanamList = await KegiatanTanam.find({
        landId: id,
        userId,
      }).session(session);
      if (kegiatanTanamList.length === 0) {
        return res
          .status(200)
          .json({
            message:
              "Lahan sudah bersih, tidak ada riwayat kegiatan untuk dihapus.",
          });
      }

      const kegiatanTanamIds = kegiatanTanamList.map((k) => k._id);

      // 3. Hapus semua data turunan (Panen, Pemupukan, Penyemprotan)
      await Panen.deleteMany({
        plantingActivityId: { $in: kegiatanTanamIds },
      }).session(session);
      await Pemupukan.deleteMany({
        plantingActivityId: { $in: kegiatanTanamIds },
      }).session(session);
      await Penyemprotan.deleteMany({
        plantingActivityId: { $in: kegiatanTanamIds },
      }).session(session);

      // 4. Hapus KegiatanTanam itu sendiri
      await KegiatanTanam.deleteMany({
        _id: { $in: kegiatanTanamIds },
      }).session(session);

      // 5. Kosongkan array plantingHistory di Lahan
      lahan.plantingHistory = [];
      await lahan.save({ session });

      await session.commitTransaction();
      return res
        .status(200)
        .json({
          message: `Riwayat kegiatan tanam untuk lahan '${lahan.name}' berhasil dibersihkan.`,
        });
    } catch (error: any) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({
          error: "Gagal membersihkan riwayat lahan",
          details: error.message,
        });
    } finally {
      session.endSession();
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: `Metode ${req.method} tidak diizinkan.` });
  }
}
