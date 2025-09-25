// seed/seedProduk.ts
import mongoose from "mongoose";
import Benih from "../models/benih.model";
import Pupuk from "../models/pupuk.model";
import Pestisida from "../models/pestisida.model";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Harap setel MONGODB_URI pada file .env atau .env.local");
  process.exit(1);
}

async function seedBenih() {
  const data = [
    {
      name: "Padi IR64",
      variety: "IR64",
      price: 45000,
      stock: 100,
      unit: "kg",
      description: "Benih padi unggul dengan umur panen sekitar 115 hari",
      days_to_harvest: 115,
    },
    {
      name: "Jagung Hibrida Bisi 2",
      variety: "Bisi 2",
      price: 35000,
      stock: 80,
      unit: "kg",
      description: "Benih jagung hibrida berdaya hasil tinggi",
      days_to_harvest: 95,
    },
    {
      name: "Cabai Rawit Super",
      variety: "Rawit Super",
      price: 25000,
      stock: 200,
      unit: "gram",
      description: "Benih cabai rawit dengan tingkat kepedasan tinggi",
      days_to_harvest: 80,
    },
    {
      name: "Kedelai Anjasmoro",
      variety: "Anjasmoro",
      price: 40000,
      stock: 60,
      unit: "kg",
      description: "Varietas kedelai populer, tahan rebah",
      days_to_harvest: 85,
    },
    {
      name: "Tomat Servo F1",
      variety: "Servo F1",
      price: 30000,
      stock: 120,
      unit: "sachet",
      description: "Benih tomat hibrida dengan produktivitas tinggi",
      days_to_harvest: 70,
    },
  ];

  const ops = data.map((doc) => ({
    updateOne: {
      filter: { name: doc.name, variety: doc.variety },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Benih.bulkWrite(ops, { ordered: false });
  console.log(
    `✅ Benih: upserted=${result.upsertedCount ?? 0}, modified=${result.modifiedCount ?? 0}`
  );
}

async function seedPupuk() {
  const data = [
    {
      name: "Urea",
      brand: "Pupuk Indonesia",
      price: 250000,
      stock: 100,
      package_unit: "karung",
      net_weight: 50,
      net_weight_unit: "kg",
      type: "Anorganik",
      form: "Padat",
      composition: "46% N (Nitrogen)",
      usage_recommendation: "200-300 kg/ha, sesuaikan dengan analisis tanah",
    },
    {
      name: "NPK Phonska",
      brand: "Pupuk Indonesia",
      price: 280000,
      stock: 90,
      package_unit: "karung",
      net_weight: 50,
      net_weight_unit: "kg",
      type: "Anorganik",
      form: "Padat",
      composition: "15-15-15 (N-P-K)",
      usage_recommendation: "100-200 kg/ha tergantung komoditas",
    },
    {
      name: "Kompos Organik",
      brand: "AgriOrganic",
      price: 80000,
      stock: 50,
      package_unit: "karung",
      net_weight: 20,
      net_weight_unit: "kg",
      type: "Organik",
      form: "Padat",
      composition: "Bahan organik terdekomposisi",
      usage_recommendation: "1-2 ton/ha sebagai pembenah tanah",
    },
    {
      name: "Pupuk Kandang Cair",
      brand: "BioFarm",
      price: 45000,
      stock: 120,
      package_unit: "botol",
      net_weight: 1,
      net_weight_unit: "liter",
      type: "Organik",
      form: "Cair",
      usage_recommendation: "Dosis 2-5 ml/liter air, semprot daun",
    },
    {
      name: "Pupuk Hayati Mikroba",
      brand: "BioGrow",
      price: 60000,
      stock: 70,
      package_unit: "sachet",
      net_weight: 100,
      net_weight_unit: "gram",
      type: "Hayati",
      form: "Padat",
      usage_recommendation: "Inokulasi benih atau aplikasi ke perakaran",
    },
  ];

  const ops = data.map((doc) => ({
    updateOne: {
      filter: { name: doc.name, brand: doc.brand },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Pupuk.bulkWrite(ops, { ordered: false });
  console.log(
    `✅ Pupuk: upserted=${result.upsertedCount ?? 0}, modified=${result.modifiedCount ?? 0}`
  );
}

async function seedPestisida() {
  const data = [
    {
      name: "Deltametrin 25 EC",
      brand: "AgroChem",
      price: 50000,
      stock: 150,
      package_unit: "botol",
      net_volume: 250,
      net_volume_unit: "ml",
      type: "Insektisida",
      active_ingredient: "Deltamethrin",
      target_pest: "Ulat, kutu daun, thrips",
      dosage_recommendation: "1-2 ml/liter air, semprot merata",
    },
    {
      name: "Mankozeb 80 WP",
      brand: "AgroChem",
      price: 40000,
      stock: 140,
      package_unit: "sachet",
      net_volume: 200,
      net_volume_unit: "gram",
      type: "Fungisida",
      active_ingredient: "Mancozeb",
      target_pest: "Penyakit jamur daun",
      dosage_recommendation: "2-3 gram/liter air",
    },
    {
      name: "Glifosat 480 SL",
      brand: "HerbiMax",
      price: 120000,
      stock: 60,
      package_unit: "jerigen",
      net_volume: 1,
      net_volume_unit: "liter",
      type: "Herbisida",
      active_ingredient: "Glyphosate",
      target_pest: "Gulma daun sempit & lebar",
      dosage_recommendation: "Tergantung jenis gulma & umur",
    },
    {
      name: "Brodifacoum 0.005% RB",
      brand: "Rodex",
      price: 90000,
      stock: 40,
      package_unit: "kaleng",
      net_volume: 500,
      net_volume_unit: "gram",
      type: "Rodentisida",
      active_ingredient: "Brodifacoum",
      target_pest: "Tikus sawah",
      dosage_recommendation: "Aplikasi umpan di jalur tikus",
    },
    {
      name: "Abamektin 18 EC",
      brand: "AgroChem",
      price: 70000,
      stock: 110,
      package_unit: "botol",
      net_volume: 100,
      net_volume_unit: "ml",
      type: "Akarisida",
      active_ingredient: "Abamectin",
      target_pest: "Tungau & trips",
      dosage_recommendation: "0.5-1 ml/liter air",
    },
  ];

  const ops = data.map((doc) => ({
    updateOne: {
      filter: { name: doc.name, brand: doc.brand },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Pestisida.bulkWrite(ops, { ordered: false });
  console.log(
    `✅ Pestisida: upserted=${result.upsertedCount ?? 0}, modified=${result.modifiedCount ?? 0}`
  );
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("🌱 Terhubung ke database untuk seeding produk...");

    await seedBenih();
    await seedPupuk();
    await seedPestisida();

    console.log("🎉 Seeding selesai.");
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat seeding:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Koneksi database ditutup.");
  }
}

main();
