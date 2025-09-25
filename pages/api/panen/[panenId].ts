// File Baru: pages/api/panen/[panenId].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import Panen from "@/models/panen.model";
import KegiatanTanam from "@/models/kegiatanTanam.model"; // <-- Tambahkan import

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;

  const { panenId } = req.query;
  const userId = req.user!.userId;

  if (
    !panenId ||
    typeof panenId !== "string" ||
    !mongoose.Types.ObjectId.isValid(panenId)
  ) {
    return res.status(400).json({ error: "ID Panen tidak valid" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const panen = await Panen.findOne({ _id: panenId, userId }).session(
      session
    );

    if (!panen) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Data panen tidak ditemukan" });
    }

    const kegiatanTanam = await KegiatanTanam.findById(
      panen.plantingActivityId
    ).session(session);

    if (!kegiatanTanam) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Kegiatan tanam induk tidak ditemukan" });
    }

    switch (req.method) {
      case "GET":
        await session.abortTransaction();
        return res.status(200).json(panen);

      case "PUT":
        const oldRevenue = panen.totalRevenue;
        const newRevenue = req.body.totalRevenue || 0;
        const revenueDifference = newRevenue - oldRevenue;

        // Update totalRevenue di KegiatanTanam
        kegiatanTanam.totalRevenue += revenueDifference;
        await kegiatanTanam.save({ session });

        const updatedData = await Panen.findByIdAndUpdate(panenId, req.body, {
          new: true,
          runValidators: true,
          session,
        });

        await session.commitTransaction();
        return res.status(200).json(updatedData);

      case "DELETE":
        // Kurangi totalRevenue dari KegiatanTanam
        kegiatanTanam.totalRevenue -= panen.totalRevenue;
        await kegiatanTanam.save({ session });

        await Panen.findByIdAndDelete(panenId, { session });

        await session.commitTransaction();
        return res.status(200).json({ message: "Data panen berhasil dihapus" });

      default:
        await session.abortTransaction();
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res
          .status(405)
          .json({ error: `Metode ${req.method} tidak diizinkan` });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error(
      `Error pada API [${req.method}] /api/panen/${panenId}:`,
      error
    );
    return res
      .status(400)
      .json({ error: "Terjadi kesalahan pada server", details: error.message });
  } finally {
    session.endSession();
  }
}
