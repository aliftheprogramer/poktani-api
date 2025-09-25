// seed/seedAdmin.ts
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model";

const seedAdmin = async () => {
  const DATABASE_URL = process.env.MONGODB_URI;
  const ADMIN_PHONE = process.env.ADMIN_PHONE;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME || "Admin Koperasi";
  const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "Kantor Koperasi";

  if (!DATABASE_URL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
    console.error(
      "❌ Harap sediakan DATABASE_URL, ADMIN_PHONE, dan ADMIN_PASSWORD di file .env"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(DATABASE_URL);
    console.log("🌱 Terhubung ke database untuk seeding...");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = await User.findOneAndUpdate(
      { phone: ADMIN_PHONE },
      {
        $set: {
          phone: ADMIN_PHONE,
          password: hashedPassword,
          fullName: ADMIN_FULLNAME,
          address: ADMIN_ADDRESS,
          role: "Koperasi",
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("✅ Admin Koperasi berhasil dibuat atau diperbarui:");
    console.log(`   Phone: ${adminUser.phone}`);
    console.log(`   Role: ${adminUser.role}`);
  } catch (error) {
    console.error("❌ Gagal melakukan seeding admin:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🌱 Koneksi database ditutup.");
  }
};

seedAdmin();
