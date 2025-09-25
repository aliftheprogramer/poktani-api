// pages/api/admin/auth/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectionToDatabase from "@/lib/mongodb";
import User from "@/models/user.model";
import cors from "@/middleware/cors";

// Gunakan variabel environment yang sama
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Terapkan middleware CORS
  await cors(req, res);

  // Hanya izinkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectionToDatabase();

    const { phone, password } = req.body;

    // Validasi input dasar
    if (!phone || !password) {
      return res.status(400).json({
        error: "Nomor telepon dan password wajib diisi",
      });
    }

    // Cari user berdasarkan nomor telepon dan minta field password
    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(401).json({
        error: "Kredensial tidak valid", // Pesan error generik untuk keamanan
      });
    }

    // ✅ Best Practice: Validasi peran SEBELUM memeriksa password
    // Ini memastikan hanya akun 'Koperasi' yang dapat mencoba login di sini.
    if (user.role !== "Koperasi") {
      return res.status(403).json({
        error: "Akses ditolak. Endpoint ini hanya untuk admin.",
      });
    }

    // Bandingkan password yang diberikan dengan hash di database
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Kredensial tidak valid",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userResponse = {
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      address: user.address,
      role: user.role,
    };

    res.status(200).json({
      message: "Login admin berhasil",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}
