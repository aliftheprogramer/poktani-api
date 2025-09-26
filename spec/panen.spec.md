# API Panen

Endpoint: `/api/kegiatantanam/[kegiatanId]/panen`

Wajib autentikasi (role: Petani)

## GET
Mengambil daftar panen untuk `kegiatanId` milik user aktif.

- Response 200: Array IPanen

## POST
Membuat data panen. Bisa dalam keadaan belum dijual (Belum Terjual) atau langsung dijual.

Body umum:
- harvestDate: ISO date (wajib)
- quality: "A"|"B"|"C"|"Sortir" (opsional, default A)
- harvestCost: number (opsional, default 0)
- notes, soldTo (opsional)
- saleStatus: "Belum Terjual" | "Terjual Sebagian" | "Terjual Habis" (opsional; default Belum Terjual)

Jika Belum Terjual (panen belum dijual):
- Jangan isi saleType/amount/unit/sellingPrice/totalRevenue
- totalRevenue otomatis 0
- Status kegiatan tanam: "Harvested"

Jika Langsung Dijual:
- saleType wajib salah satu: "Per Satuan" atau "Borongan"

Per Satuan:
- amount (wajib)
- unit (wajib) salah satu: "kg","kuintal","ton","buah","ikat","rumpun"
- sellingPrice (wajib)
- totalRevenue (opsional), jika kosong dihitung amount*sellingPrice

Borongan:
- totalRevenue (wajib)

Efek ke Kegiatan Tanam:
- totalRevenue kegiatan ditambah nilai totalRevenue transaksi
- Jika saleStatus = "Terjual Habis" maka status kegiatan = "Completed", selain itu = "Harvested"

Response: 201 IPanen

## PUT
Memperbarui data panen sekaligus proses penjualan jika sebelumnya Belum Terjual.

Body:
- panenId: string (wajib)
- saleStatus: salah satu nilai di atas. Jika bukan "Belum Terjual", maka dianggap dijual
- saleType: "Per Satuan" | "Borongan" (wajib ketika menjual jika belum ada nilai sebelumnya)
- Per Satuan: amount, unit, sellingPrice (wajib salah satunya disediakan atau sudah ada pada record)
- Borongan: totalRevenue (wajib)
- totalRevenue: opsional; jika Per Satuan dan tidak diberikan akan dihitung dari amount*sellingPrice
- soldTo, notes, harvestCost, quality: opsional

Efek ke Kegiatan Tanam:
- totalRevenue kegiatan disesuaikan dengan delta perubahan transaksi panen
- Jika saleStatus = "Terjual Habis" -> status kegiatan = "Completed"
- Jika saleStatus = "Belum Terjual" atau "Terjual Sebagian" -> status kegiatan = "Harvested"

Response: 200 IPanen

## Error
- 400 Validasi gagal atau ID tidak valid
- 401/403 Autentikasi/otorisasi gagal
- 405 Metode tidak diizinkan
