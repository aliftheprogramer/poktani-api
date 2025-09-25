// pages/api/pemupukan/[pemupukanId].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import Pemupukan from "@/models/pemupukan.model";
import KegiatanTanam from "@/models/kegiatanTanam.model"; // <-- Tambahkan import
import Pupuk from "@/models/pupuk.model"; // <-- Tambahkan import

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const { pemupukanId } = req.query;
  const userId = req.user!.userId;

  if (!mongoose.Types.ObjectId.isValid(pemupukanId as string)) {
    return res.status(400).json({ error: "ID Pemupukan tidak valid" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pemupukan = await Pemupukan.findOne({
      _id: pemupukanId,
      userId,
    }).session(session);
    if (!pemupukan) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Data pemupukan tidak ditemukan" });
    }

    const kegiatanTanam = await KegiatanTanam.findById(
      pemupukan.plantingActivityId
    ).session(session);
    if (!kegiatanTanam) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Kegiatan tanam induk tidak ditemukan." });
    }

    const pupuk = await Pupuk.findById(pemupukan.fertilizerId).session(session);
    if (!pupuk) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Pupuk terkait tidak ditemukan." });
    }

    switch (req.method) {
      case "GET":
        await session.abortTransaction();
        const populatedPemupukan = await Pemupukan.findById(
          pemupukanId
        ).populate("fertilizerId", "name brand");
        return res.status(200).json(populatedPemupukan);

      case "PUT":
        const oldCost = pemupukan.amount * pemupukan.pricePerUnit;
        const newAmount = req.body.amount ?? pemupukan.amount;
        const newPrice = req.body.pricePerUnit ?? pemupukan.pricePerUnit;
        const newCost = newAmount * newPrice;
        const costDifference = newCost - oldCost;
        const amountDifference = pemupukan.amount - newAmount;

        // Cek stok
        if (pupuk.stock + amountDifference < 0) {
          await session.abortTransaction();
          return res.status(400).json({ error: "Stok pupuk tidak cukup." });
        }

        // Update stok pupuk dan totalCost kegiatan tanam
        pupuk.stock += amountDifference;
        kegiatanTanam.totalCost += costDifference;

        await pupuk.save({ session });
        await kegiatanTanam.save({ session });

        const updatedData = await Pemupukan.findByIdAndUpdate(
          pemupukanId,
          req.body,
          { new: true, runValidators: true, session }
        ).populate("fertilizerId", "name brand");

        await session.commitTransaction();
        return res.status(200).json(updatedData);

      case "DELETE":
        const costToDelete = pemupukan.amount * pemupukan.pricePerUnit;

        // Kembalikan stok pupuk dan kurangi totalCost
        pupuk.stock += pemupukan.amount;
        kegiatanTanam.totalCost -= costToDelete;

        await pupuk.save({ session });
        await kegiatanTanam.save({ session });

        await pemupukan.deleteOne({ session });
        await session.commitTransaction();
        return res
          .status(200)
          .json({ message: "Data pemupukan berhasil dihapus" });

      default:
        await session.abortTransaction();
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
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
