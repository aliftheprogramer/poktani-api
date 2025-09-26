// pages/api/kegiatantanam/[kegiatanId]/panen.ts
import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import { AuthenticatedRequest, verifyToken } from "@/lib/auth";
import connectionToDatabase from "@/lib/mongodb";
import cors from "@/middleware/cors";
import { authorize } from "@/middleware/authorize";
import KegiatanTanam from "@/models/kegiatanTanam.model";
import Panen from "@/models/panen.model";

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
        const data = await Panen.find({
          plantingActivityId: kegiatanId,
          userId,
        });
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil riwayat panen" });
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

        const {
          harvestDate,
          saleType,
          amount,
          unit,
          sellingPrice,
          totalRevenue,
          saleStatus,
        } = req.body as any;

        if (!harvestDate) {
          throw new Error("Tanggal panen (harvestDate) wajib diisi.");
        }

        // Determine flow: unsold or sold on creation
        const isUnsold = (saleStatus || "Belum Terjual") === "Belum Terjual";
        let computedRevenue = Number(totalRevenue) || 0;

        if (!isUnsold) {
          if (saleType === "Per Satuan") {
            if (!amount || !unit || !sellingPrice) {
              throw new Error(
                "Untuk penjualan 'Per Satuan', amount, unit, dan sellingPrice wajib diisi."
              );
            }
            computedRevenue = computedRevenue || Number(amount) * Number(sellingPrice);
          } else if (saleType === "Borongan") {
            if (!computedRevenue) {
              throw new Error(
                "Untuk penjualan 'Borongan', totalRevenue wajib diisi."
              );
            }
          } else {
            throw new Error("Tipe penjualan tidak valid (Per Satuan/Borongan).");
          }
        } else {
          // Unsold: force revenue = 0
          computedRevenue = 0;
        }

        const newData = new Panen({
          ...req.body,
          saleStatus: saleStatus || "Belum Terjual",
          totalRevenue: computedRevenue,
          userId,
          plantingActivityId: kegiatanId,
        });
        await newData.save({ session });

        // Update kegiatan status and revenue
        if (isUnsold) {
          // Belum dijual: status tetap Harvested (panen terjadi)
          kegiatan.status = "Harvested";
        } else {
          // Dijual saat pembuatan panen
          kegiatan.totalRevenue += computedRevenue;
          // Jika terjual habis maka Completed, jika sebagian tetap Harvested
          if (newData.saleStatus === "Terjual Habis") {
            kegiatan.status = "Completed";
          } else {
            kegiatan.status = "Harvested";
          }
        }
        await kegiatan.save({ session });

        await session.commitTransaction();
        return res.status(201).json(newData);
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Gagal menambah data panen",
          details: error.message,
        });
      } finally {
        session.endSession();
      }

    case "PUT": {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { panenId } = req.body as any;
        if (!panenId || !mongoose.Types.ObjectId.isValid(panenId)) {
          throw new Error("panenId tidak valid");
        }

        const kegiatan = await KegiatanTanam.findOne({
          _id: kegiatanId,
          userId,
        }).session(session);
        if (!kegiatan) throw new Error("Kegiatan tanam tidak ditemukan.");

        const panen = await Panen.findOne({
          _id: panenId,
          plantingActivityId: kegiatanId,
          userId,
        }).session(session);
        if (!panen) throw new Error("Data panen tidak ditemukan.");

        const update: any = {};
        const {
          saleType,
          amount,
          unit,
          sellingPrice,
          totalRevenue,
          saleStatus,
          soldTo,
          notes,
          harvestCost,
          quality,
        } = req.body as any;

        // Compute new revenue according to sale type; allow partial update
        let newRevenue = Number(totalRevenue ?? panen.totalRevenue ?? 0);
        if (saleStatus && saleStatus !== "Belum Terjual") {
          if (saleType === "Per Satuan") {
            const amt = amount ?? panen.amount;
            const u = unit ?? panen.unit;
            const price = sellingPrice ?? panen.sellingPrice;
            if (!amt || !u || !price) {
              throw new Error(
                "Untuk penjualan 'Per Satuan', amount, unit, dan sellingPrice wajib diisi (baik baru atau nilai sebelumnya harus ada)."
              );
            }
            newRevenue = Number(totalRevenue) || Number(amt) * Number(price);
          } else if (saleType === "Borongan" || panen.saleType === "Borongan") {
            if (!newRevenue) {
              throw new Error(
                "Untuk penjualan 'Borongan', totalRevenue wajib diisi."
              );
            }
          } else if (saleType) {
            throw new Error("Tipe penjualan tidak valid (Per Satuan/Borongan).");
          }
        }

        // Prepare update fields
        if (saleType) update.saleType = saleType;
        if (typeof amount !== "undefined") update.amount = amount;
        if (typeof unit !== "undefined") update.unit = unit;
        if (typeof sellingPrice !== "undefined") update.sellingPrice = sellingPrice;
        if (typeof harvestCost !== "undefined") update.harvestCost = harvestCost;
        if (typeof quality !== "undefined") update.quality = quality;
        if (typeof soldTo !== "undefined") update.soldTo = soldTo;
        if (typeof notes !== "undefined") update.notes = notes;
        if (typeof saleStatus !== "undefined") update.saleStatus = saleStatus;

        // Adjust revenue delta on kegiatan
        if (saleStatus && saleStatus !== "Belum Terjual") {
          update.totalRevenue = newRevenue;
          const delta = Number(newRevenue) - Number(panen.totalRevenue || 0);
          if (delta !== 0) {
            kegiatan.totalRevenue += delta;
          }
          // Update kegiatan status
          if (saleStatus === "Terjual Habis") {
            kegiatan.status = "Completed";
          } else {
            kegiatan.status = "Harvested";
          }
        }

        const updated = await Panen.findByIdAndUpdate(panen._id, { $set: update }, {
          new: true,
          session,
          runValidators: true,
        });
        await kegiatan.save({ session });

        await session.commitTransaction();
        return res.status(200).json(updated);
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Gagal memperbarui data panen",
          details: error.message,
        });
      } finally {
        session.endSession();
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      return res
        .status(405)
        .json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}
