// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectionToDatabase from '@/lib/mongodb';
import User from '@/models/user.model';
import cors from '@/middleware/cors';

const JWT_SECRET = process.env.JWT_SECRET || 'qwjiowqejiu129839kajskdh91238912038jkasdksahd';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectionToDatabase();

    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        error: 'Nomor telepon dan password wajib diisi' 
      });
    }

    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Nomor telepon atau password salah' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Nomor telepon atau password salah' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        phone: user.phone, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
