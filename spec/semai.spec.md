# Semai API
Dokumentasi untuk endpoint pengelolaan data persemaian benih oleh petani. Resource ini hanya dapat diakses oleh peran **Petani**.

---

### POST /api/semai
Mencatat kegiatan persemaian benih baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/semai`
- **Otorisasi:** Diperlukan **USER_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{USER_TOKEN}}`
    - `Content-Type: application/json`
- **Request Body:**
    - `seedId` (ObjectId, required): ID benih yang digunakan.
    - `seedAmount` (number, required): Jumlah benih yang digunakan.
    - `seedUnit` (string, required): Satuan benih (enum: "gram", "kg", "butir", "sachet", "pak").
    - `startDate` (Date, required): Tanggal mulai persemaian.
    - `additionalCost` (number, optional): Total biaya tambahan (upah, media tanam, dll.).
    - `estimatedReadyDate` (Date, optional): Tanggal perkiraan siap pindah.
    - `nurseryLocation` (string, optional): Lokasi persemaian.
    - `notes` (string, optional): Catatan tambahan.
- **Contoh Respons (201 Created):**
```json
{
    "userId": "68a966a6d813d4caa5db0687",
    "seedId": "68a95c88d813d4caa5db0666",
    "seedAmount": 1,
    "seedUnit": "sachet",
    "startDate": "2025-08-28T00:00:00.000Z",
    "cost": 50000,
    "seedlingYield": 0,
    "yieldUnit": "batang",
    "isPlanted": false,
    "status": "Persiapan",
    "_id": "68a972c2d813d4caa5db06f9"
}
```

### GET /api/semai

Mendapatkan daftar semua kegiatan persemaian milik user.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/semai`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Query Parameters:**

    -   `page` (number, optional, default: 1): Nomor halaman.

    -   `limit` (number, optional, default: 10): Jumlah item per halaman.

    -   `search` (string, optional): Kata kunci untuk mencari berdasarkan nama benih.

    -   `status` (string, optional): Filter berdasarkan status persemaian (enum: "Persiapan", "Berlangsung", "Siap Pindah", "Selesai", "Gagal").

-   **Contoh Respons (200 OK):**



```JSON
{
    "data": [
        {
            "_id": "68a972c2d813d4caa5db06f9",
            "seedId": {
                "_id": "68a95c88d813d4caa5db0666",
                "name": "Cabai Rawit Merah",
                "variety": "Bara"
            },
            "seedAmount": 1,
            "startDate": "2025-08-28T00:00:00.000Z",
            "status": "Siap Pindah",
            "cost": 50000,
            "isPlanted": false
        }
    ],
    "totalRecords": 1,
    "page": 1,
    "totalPages": 1
}

```

* * * * *

### GET /api/semai/{id}

Mendapatkan detail persemaian berdasarkan ID.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/semai/{{ID_SEMAI}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Path Parameter:**

    -   `id` (ObjectId, required): ID persemaian.

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "seedId": {
        "_id": "68a95c88d813d4caa5db0666",
        "name": "Cabai Rawit Merah",
        "variety": "Bara"
    },
    "seedAmount": 1,
    "seedUnit": "sachet",
    "startDate": "2025-08-28T00:00:00.000Z",
    "status": "Siap Pindah",
    "cost": 50000,
    "isPlanted": false,
    "_id": "68a972c2d813d4caa5db06f9"
}

```

* * * * *

### PUT /api/semai/{id}

Memperbarui data persemaian berdasarkan ID.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/semai/{{ID_SEMAI}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{USER_TOKEN}}`

    -   `Content-Type: application/json`

-   **Request Body:** (Semua field bersifat opsional, hanya kirim yang ingin diubah)

    -   `status` (string): Mengubah status persemaian.

    -   `cost` (number): Mengubah total biaya persemaian.

    -   `notes` (string): Mengubah catatan.

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "seedId": { ... },
    "seedAmount": 1,
    "startDate": "2025-08-28T00:00:00.000Z",
    "status": "Siap Pindah",
    "cost": 50000,
    "notes": "Bibit sudah siap."
}

```

* * * * *

### DELETE /api/semai/{id}

Menghapus data persemaian berdasarkan ID.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/semai/{{ID_SEMAI}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Catatan Penting:** Endpoint ini akan gagal (`409 Conflict`) jika persemaian sudah digunakan untuk kegiatan tanam.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Data semai berhasil dihapus"
}
```