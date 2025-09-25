// lib/apiUtils.ts
import { AuthenticatedRequest } from "@/lib/auth";
import formidable from "formidable";

export const parseForm = (
  req: AuthenticatedRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};
