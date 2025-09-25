import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Icon } from '@iconify/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Hero() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
      style={{ backgroundColor: "#EEEEEE" }}
    >
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-xl text-center sm:text-left">
        {/* Logo tetap gambar */}
        <Image
          src="/favicon/icon.png" // Ganti dengan logo Agritrack kamu di folder public
          alt="Agritrack Logo"
          width={180}
          height={38}
          priority
        />

        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "#2D6A4F" }}>
          Agritrack API (GEMASTIK XVIII/18/2025)
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: "#2D6A4F" }}>
          Pantau lahan, tanam, panen, dan gunakan data cerdas untuk optimalkan hasil panen Anda.
          Mulai perjalanan digitalisasi pertanian Anda dengan mudah dan cepat.
        </p>
        <ol
          className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left"
          style={{ color: "#2D6A4F" }}
        >
          <li className="mb-2 tracking-[-.01em]">
            Mulai dengan mengisi data lahan di halaman{" "}
            <code
              className="font-mono font-semibold px-1 py-0.5 rounded"
              style={{ backgroundColor: "#D9EEDB", color: "#2D6A4F" }}
            >
              /lahan
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Catat aktivitas semai, pupuk, dan pestisida secara realtime.
          </li>
          <li className="tracking-[-.01em]">
            Pantau panen dan dapatkan laporan hasil pertanian secara detail.
          </li>
        </ol>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 sm:w-auto"
            href="https://agritrack-ai.vercel.app"
            style={{ backgroundColor: "#2D6A4F", color: "white" }}
          >
            <Icon icon="mdi:view-dashboard" width={20} height={20} />
            Mulai Sekarang
          </a>
          <a
            className="rounded-full border border-solid transition-colors flex items-center justify-center font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto md:w-[158px]"
            href="https://agritrack-ai.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              borderColor: "#2D6A4F",
              color: "#2D6A4F",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#D9EEDB";
              (e.currentTarget as HTMLElement).style.color = "#1B4733";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#2D6A4F";
              (e.currentTarget as HTMLElement).style.borderColor = "#2D6A4F";
            }}
          >
            Dokumentasi
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm" style={{ color: "#2D6A4F" }}>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://agritrack-api.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="mdi:school" width={16} height={16} />
          Tutorial
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/matun-gemastik"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="mdi:github" width={16} height={16} />
          GitHub Repo
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://agritrack-ai.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="mdi:web" width={16} height={16} />
          Kunjungi Situs
        </a>
      </footer>
    </div>
  );
}
