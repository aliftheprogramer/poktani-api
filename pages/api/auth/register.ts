// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectionToDatabase from '@/lib/mongodb';
import User from '@/models/user.model';
import cors from '@/middleware/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectionToDatabase();

    const { phone, password, fullName, address, role } = req.body;

    if (!phone || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Nomor telepon, password, dan nama lengkap wajib diisi' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password minimal 6 karakter' 
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Nomor telepon sudah terdaftar' 
      });
    }

    const user = new User({
      phone,
      password,
      fullName,
      address: address || '',
      role: role || 'Petani'
    });

    await user.save();

    const userResponse = {
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: userResponse
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Nomor telepon sudah terdaftar' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: Object.values(error.errors).map((err: any) => err.message).join(', ')
      });
    }

    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
