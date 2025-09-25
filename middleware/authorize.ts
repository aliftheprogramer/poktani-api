// middleware/authorize.ts
import type { NextApiResponse } from "next";
import { AuthenticatedRequest } from "@/lib/auth";
import { RoleType } from "@/types/user";

export const authorize =
  (allowedRoles: RoleType[]) =>
  async (req: AuthenticatedRequest, res: NextApiResponse): Promise<boolean> => {
    if (!req.user) {
      res
        .status(401)
        .json({ error: "Autentikasi diperlukan sebelum otorisasi." });
      return false;
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      return true;
    } else {
      res.status(403).json({
        error: "Akses ditolak. Anda tidak memiliki izin yang diperlukan.",
      });
      return false;
    }
  };
