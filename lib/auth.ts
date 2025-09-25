// lib/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { RoleType } from "@/types/user";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface UserPayload {
  userId: string;
  phone: string;
  role: RoleType;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: UserPayload;
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<boolean> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan." });
    return false;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    return true;
  } catch (error) {
    res
      .status(401)
      .json({ error: "Token tidak valid atau sudah kedaluwarsa." });
    return false;
  }
};
