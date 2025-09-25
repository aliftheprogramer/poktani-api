// pages/api/kegiatantanam/index.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Lahan from "@/models/lahan.model";
import Semai from "@/models/semai.model";
import Benih from "@/models/benih.model"; // Tambahkan import Benih

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const userId = req.user!.userId;

  switch (req.method) {
    case "GET":
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const landId = req.query.landId as string;
        const skip = (page - 1) * limit;

        const query: any = { userId };
        if (status) query.status = status;
        if (landId) query.landId = landId;

        const data = await KegiatanTanam.find(query)
          .populate("landId", "name")
          .populate("seedId", "name variety")
          .sort({ plantingDate: -1 })
          .skip(skip)
          .limit(limit);

        const total = await KegiatanTanam.countDocuments(query);

        return res.status(200).json({
          data,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Gagal mengambil data kegiatan tanam" });
      }

    case "POST":
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { landId, seedId, source, plantingDate, plantingAmount, notes } =
          req.body;

        const lahan = await Lahan.findOne({ _id: landId, userId }).session(
          session
        );
        if (!lahan)
          throw new Error("Lahan tidak ditemukan atau bukan milik Anda.");
        let initialCost = 0; // <-- Inisiasi biaya awal

        if (source.type === "FROM_NURSERY") {
          const semai = await Semai.findOne({
            _id: source.nurseryId,
            userId,
          }).session(session);
          if (!semai) throw new Error("Data persemaian tidak ditemukan.");
          if (semai.status !== "Siap Pindah") {
            throw new Error("Persemaian belum siap untuk dipindahkan.");
          }
          if (semai.isPlanted)
            throw new Error("Data persemaian ini sudah ditanam."); // <-- Ambil biaya dari semai

          initialCost = semai.cost;
          semai.isPlanted = true;
          await semai.save({ session });
        } else if (source.type === "DIRECT_PURCHASE") {
          const benih = await Benih.findById(seedId).session(session);
          if (!benih) throw new Error("Benih tidak ditemukan di data master.");
          if (benih.stock < plantingAmount) {
            throw new Error("Stok benih tidak cukup.");
          }
          benih.stock -= plantingAmount;
          await benih.save({ session }); // <-- Hitung biaya dari pembelian langsung
          initialCost = source.purchaseInfo.price || 0;
        } else {
          throw new Error("Tipe sumber benih tidak valid.");
        }

        const newKegiatan = new KegiatanTanam({
          userId,
          landId,
          seedId,
          source,
          plantingDate,
          plantingAmount,
          notes,
          totalCost: initialCost, // <-- Biaya awal sudah terisi
        });

        const savedKegiatan = await newKegiatan.save({ session });
        lahan.plantingHistory.push(
          savedKegiatan._id as mongoose.Types.ObjectId
        );
        await lahan.save({ session });

        await session.commitTransaction();
        return res.status(201).json(savedKegiatan);
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Gagal membuat kegiatan tanam baru",
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
