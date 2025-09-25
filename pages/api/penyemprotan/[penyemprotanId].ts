// pages/api/penyemprotan/[penyemprotanId].ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import Penyemprotan from "@/models/penyemprotan.model";
import KegiatanTanam from "@/models/kegiatanTanam.model"; // <-- Tambahkan import
import Pestisida from "@/models/pestisida.model"; // <-- Tambahkan import

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  await connectionToDatabase();

  if (!(await verifyToken(req, res))) return;
  if (!(await authorize(["Petani"])(req, res))) return;

  const { penyemprotanId } = req.query;
  const userId = req.user!.userId;

  if (!mongoose.Types.ObjectId.isValid(penyemprotanId as string)) {
    return res.status(400).json({ error: "ID Penyemprotan tidak valid" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const penyemprotan = await Penyemprotan.findOne({
      _id: penyemprotanId,
      userId,
    }).session(session);
    if (!penyemprotan) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Data penyemprotan tidak ditemukan" });
    }

    const kegiatanTanam = await KegiatanTanam.findById(
      penyemprotan.plantingActivityId
    ).session(session);
    if (!kegiatanTanam) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Kegiatan tanam induk tidak ditemukan." });
    }

    const pestisida = await Pestisida.findById(
      penyemprotan.pesticideId
    ).session(session);
    if (!pestisida) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Pestisida terkait tidak ditemukan." });
    }

    switch (req.method) {
      case "GET":
        await session.abortTransaction();
        const populatedPenyemprotan = await Penyemprotan.findById(
          penyemprotanId
        ).populate("pesticideId", "name brand");
        return res.status(200).json(populatedPenyemprotan);

      case "PUT":
        const oldCost = penyemprotan.dosage * penyemprotan.pricePerUnit;
        const newDosage = req.body.dosage ?? penyemprotan.dosage;
        const newPrice = req.body.pricePerUnit ?? penyemprotan.pricePerUnit;
        const newCost = newDosage * newPrice;
        const costDifference = newCost - oldCost;
        const dosageDifference = penyemprotan.dosage - newDosage;

        // Cek stok pestisida
        if (pestisida.stock + dosageDifference < 0) {
          await session.abortTransaction();
          return res.status(400).json({ error: "Stok pestisida tidak cukup." });
        }

        // Update stok pestisida dan totalCost kegiatan tanam
        pestisida.stock += dosageDifference;
        kegiatanTanam.totalCost += costDifference;

        await pestisida.save({ session });
        await kegiatanTanam.save({ session });

        const updatedData = await Penyemprotan.findByIdAndUpdate(
          penyemprotanId,
          req.body,
          { new: true, runValidators: true, session }
        ).populate("pesticideId", "name brand");

        await session.commitTransaction();
        return res.status(200).json(updatedData);

      case "DELETE":
        const costToDelete = penyemprotan.dosage * penyemprotan.pricePerUnit;

        // Kembalikan stok pestisida dan kurangi totalCost
        pestisida.stock += penyemprotan.dosage;
        kegiatanTanam.totalCost -= costToDelete;

        await pestisida.save({ session });
        await kegiatanTanam.save({ session });

        await penyemprotan.deleteOne({ session });
        await session.commitTransaction();
        return res
          .status(200)
          .json({ message: "Data penyemprotan berhasil dihapus" });

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
