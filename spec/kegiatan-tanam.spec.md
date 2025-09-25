# Kegiatan Tanam API
Dokumentasi untuk endpoint pengelolaan siklus tanam dari petani. Resource ini hanya dapat diakses oleh peran **Petani**.

---

### POST /api/kegiatantanam
Membuat catatan kegiatan tanam baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/kegiatantanam`
- **Otorisasi:** Diperlukan **USER_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{USER_TOKEN}}`
    - `Content-Type: application/json`
- **Request Body:**
    - `landId` (ObjectId, required): ID lahan yang digunakan.
    - `seedId` (ObjectId, required): ID benih yang digunakan.
    - `plantingDate` (Date, required): Tanggal penanaman.
    - `plantingAmount` (number, required): Jumlah bibit yang ditanam.
    - `notes` (string): Catatan tambahan.
    - `source` (object, required):
        - `type` (string, required, enum: "FROM_NURSERY", "DIRECT_PURCHASE")
        - `nurseryId` (ObjectId, required jika type="FROM_NURSERY"): ID persemaian.
        - `purchaseInfo` (object, required jika type="DIRECT_PURCHASE"):
            - `supplier` (string): Nama supplier.
            - `price` (number): Biaya pembelian benih.
- **Contoh Respons (201 Created):**
```json
{
    "_id": "68a966a6d813d4caa5db0688",
    "userId": "68a966a6d813d4caa5db0687",
    "landId": "68a966a6d813d4caa5db0686",
    "seedId": "68a95c88d813d4caa5db0666",
    "source": {
        "type": "FROM_NURSERY",
        "nurseryId": "68a966a6d813d4caa5db0685"
    },
    "plantingDate": "2025-09-18T00:00:00.000Z",
    "plantingAmount": 400,
    "totalCost": 50000,
    "totalRevenue": 0,
    "status": "Active"
}
```

### GET /api/kegiatantanam/{id}

Mendapatkan detail lengkap satu kegiatan tanam.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Path Parameter:**

    -   `id` (ObjectId, required): ID kegiatan tanam.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a966a6d813d4caa5db0688",
    "userId": "...",
    "landId": {
        "_id": "...",
        "name": "Sawah Cepat Panen"
    },
    "seedId": {
        "_id": "...",
        "name": "Cabai Rawit Merah",
        "variety": "Bara"
    },
    "totalCost": 305000,
    "totalRevenue": 7500000,
    "status": "Harvested"
}

```

* * * * *

### GET /api/kegiatantanam/{id}/analisis

Mendapatkan laporan analisis keuntungan dan biaya untuk kegiatan tanam tertentu. Endpoint ini memanfaatkan data denormalisasi di model `KegiatanTanam` untuk performa tinggi.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}/analisis`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Contoh Respons (200 OK):**



```JSON
{
    "kegiatanTanamId": "68a966a6d813d4caa5db06fa",
    "kegiatanTanamName": "Harvested - Cabai Rawit Merah",
    "totalRevenue": 7500000,
    "totalCost": 485000,
    "netProfit": 7015000,
    "harvestDetails": {
        "totalHarvests": 2,
        "totalAmountInKg": 270,
        "otherAmounts": {}
    }
}

```

* * * * *

### PUT /api/kegiatantanam/{id}

Memperbarui data kegiatan tanam.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Request Body:** (Semua field bersifat opsional, hanya kirim yang ingin diubah)

    -   `status` (string): Mengubah status kegiatan tanam (misal: "Completed").

    -   `notes` (string): Mengubah catatan.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a966a6d813d4caa5db0688",
    "status": "Completed"
}

```

* * * * *

### DELETE /api/kegiatantanam/{id}

Menghapus kegiatan tanam beserta semua data anak (panen, biaya, pemupukan, penyemprotan) yang terkait secara kaskade.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Catatan Penting:** Aksi ini **irreversible** dan menggunakan transaksi untuk menjamin semua data terhapus sepenuhnya.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Kegiatan tanam dan semua riwayatnya berhasil dihapus."
}
```