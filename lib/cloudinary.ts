// lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Tambahkan parameter 'folder'
export const uploadImage = async (
  filePath: string,
  folder: string
): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(filePath, {
    folder: `agritrack/${folder}`, // <-- Gunakan folder dinamis
    resource_type: "image",
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
