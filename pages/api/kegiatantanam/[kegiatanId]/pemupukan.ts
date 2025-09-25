// pages/api/kegiatantanam/[kegiatanId]/pemupukan.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Pemupukan from "@/models/pemupukan.model";
import Pupuk from "@/models/pupuk.model";

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
        const data = await Pemupukan.find({
          plantingActivityId: kegiatanId,
          userId,
        }).populate("fertilizerId", "name brand");
        return res.status(200).json(data);
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Gagal mengambil riwayat pemupukan" });
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

        const { fertilizerId, pricePerUnit, amount, unit, date, notes } =
          req.body;
        if (
          pricePerUnit === undefined ||
          typeof pricePerUnit !== "number" ||
          amount === undefined ||
          typeof amount !== "number"
        ) {
          throw new Error("Harga dan jumlah pupuk wajib diisi.");
        }

        const pupuk = await Pupuk.findById(fertilizerId).session(session);
        if (!pupuk) throw new Error("Pupuk tidak ditemukan di data master.");

        if (pupuk.stock < amount) {
          throw new Error("Stok pupuk tidak cukup.");
        }

        pupuk.stock -= amount;
        await pupuk.save({ session });

        const newData = new Pemupukan({
          userId,
          plantingActivityId: kegiatanId,
          fertilizerId,
          pricePerUnit,
          amount,
          unit,
          date,
          notes,
        });

        await newData.save({ session });

        // Update denormalized total cost
        kegiatan.totalCost += amount * pricePerUnit;
        await kegiatan.save({ session });

        const populatedData = await Pemupukan.findById(newData._id)
          .populate("fertilizerId", "name brand")
          .session(session);

        await session.commitTransaction();
        return res.status(201).json(populatedData);
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Gagal menambah data pemupukan",
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
