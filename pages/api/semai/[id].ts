// pages/api/semai/[id].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Semai from "@/models/semai.model";
import KegiatanTanam from "@/models/kegiatanTanam.model";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;

  const { id } = req.query;
  const userId = req.user!.userId;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID semai tidak valid" });
  }

  try {
    const semai = await Semai.findById(id);

    if (!semai) {
      return res.status(404).json({ error: "Data semai tidak ditemukan" });
    }

    if (semai.userId.toString() !== userId) {
      return res.status(403).json({ error: "Akses ditolak" });
    }

    switch (req.method) {
      case "GET":
        await semai.populate("seedId", "name variety");
        res.status(200).json(semai);
        break;

      case "PUT":
        const updatedData = await Semai.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        }).populate("seedId", "name variety");

        res.status(200).json(updatedData);
        break;

      case "DELETE":
        const isUsedInPlanting = await KegiatanTanam.findOne({
          "source.nurseryId": id,
        });

        if (isUsedInPlanting || semai.isPlanted) {
          return res.status(409).json({
            error:
              "Gagal menghapus. Data persemaian ini sudah digunakan dalam kegiatan tanam.",
          });
        }

        await Semai.findByIdAndDelete(id);
        res.status(200).json({ message: "Data semai berhasil dihapus" });
        break;

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
    }
  } catch (error: any) {
    console.error(`Error pada API [${req.method}] /api/semai/${id}:`, error);
    res
      .status(400)
      .json({ error: "Terjadi kesalahan pada server", details: error.message });
  }
}
