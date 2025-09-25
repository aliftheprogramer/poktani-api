# Aktivitas Tanam API
Dokumentasi untuk endpoint pengelolaan aktivitas harian petani (pemupukan, penyemprotan, panen, dan biaya operasional) yang terkait dengan satu kegiatan tanam. Semua endpoint di bawah ini hanya dapat diakses oleh peran **Petani**.

---

## Pemupukan API

### POST /api/kegiatantanam/{kegiatanId}/pemupukan
Mencatat kegiatan pemupukan baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}/pemupukan`
- **Otorisasi:** Diperlukan **USER_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{USER_TOKEN}}`
    - `Content-Type: application/json`
- **Request Body:**
    - `fertilizerId` (ObjectId, required): ID pupuk dari data master.
    - `date` (Date, required): Tanggal pemupukan.
    - `amount` (number, required): Jumlah pupuk yang digunakan.
    - `unit` (string, required): Satuan jumlah (misal: "kg").
    - `pricePerUnit` (number, required): Harga per satuan (misal: harga per kg).
    - `notes` (string, optional): Catatan tambahan.
- **Logika:** Menggunakan transaksi untuk mengurangi stok pupuk dan menambahkan biaya ke `KegiatanTanam.totalCost`.
- **Contoh Respons (201 Created):**
```json
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "fertilizerId": "68a804f77d6d6191ce048696",
    "date": "2025-10-02T00:00:00.000Z",
    "amount": 10,
    "unit": "kg",
    "pricePerUnit": 3100,
    "_id": "68a972c2d813d4caa5db06fb"
}

```

### GET /api/pemupukan/{id}

Mendapatkan detail catatan pemupukan.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/pemupukan/{{ID_PEMUPUKAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "fertilizerId": {
        "_id": "68a804f77d6d6191ce048696",
        "name": "Pupuk ZA",
        "brand": "Petrokimia Gresik"
    },
    "date": "2025-10-02T00:00:00.000Z",
    "amount": 10,
    "unit": "kg",
    "pricePerUnit": 3100,
    "_id": "68a972c2d813d4caa5db06fb"
}

```

### PUT /api/pemupukan/{id}

Memperbarui catatan pemupukan.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/pemupukan/{{ID_PEMUPUKAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk menyesuaikan stok pupuk dan `KegiatanTanam.totalCost` berdasarkan perubahan data.

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "...",
    "plantingActivityId": "...",
    "fertilizerId": {
        "_id": "68a804f77d6d6191ce048696",
        "name": "Pupuk ZA",
        "brand": "Petrokimia Gresik"
    },
    "date": "2025-10-02T00:00:00.000Z",
    "amount": 15,
    "unit": "kg",
    "pricePerUnit": 3100,
    "_id": "..."
}

```

### DELETE /api/pemupukan/{id}

Menghapus catatan pemupukan.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/pemupukan/{{ID_PEMUPUKAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk mengembalikan stok pupuk dan mengurangi `KegiatanTanam.totalCost`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Data pemupukan berhasil dihapus"
}

```

* * * * *

Penyemprotan API
----------------

### POST /api/kegiatantanam/{kegiatanId}/penyemprotan

Mencatat kegiatan penyemprotan baru.

-   **Metode:** `POST`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}/penyemprotan`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{USER_TOKEN}}`

    -   `Content-Type: application/json`

-   **Request Body:**

    -   `pesticideId` (ObjectId, required): ID pestisida dari data master.

    -   `date` (Date, required): Tanggal penyemprotan.

    -   `dosage` (number, required): Dosis pestisida yang digunakan.

    -   `unit` (string, required): Satuan dosis (misal: "gram", "ml").

    -   `pricePerUnit` (number, required): Harga per satuan dosis (misal: harga per gram).

    -   `notes` (string, optional): Catatan tambahan.

-   **Logika:** Menggunakan transaksi untuk mengurangi stok pestisida dan menambahkan biaya ke `KegiatanTanam.totalCost`.

-   **Contoh Respons (201 Created):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "pesticideId": "68a80cc27d6d6191ce0486ac",
    "date": "2025-10-09T00:00:00.000Z",
    "dosage": 50,
    "unit": "gram",
    "pricePerUnit": 240,
    "_id": "..."
}

```

### GET /api/penyemprotan/{id}

Mendapatkan detail catatan penyemprotan.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/penyemprotan/{{ID_PENYEMPROTAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "pesticideId": {
        "_id": "68a80cc27d6d6191ce0486ac",
        "name": "Antracol 70 WP",
        "brand": "Bayer"
    },
    "date": "2025-10-09T00:00:00.000Z",
    "dosage": 50,
    "unit": "gram",
    "pricePerUnit": 240,
    "_id": "..."
}

```

### PUT /api/penyemprotan/{id}

Memperbarui catatan penyemprotan.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/penyemprotan/{{ID_PENYEMPROTAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk menyesuaikan stok pestisida dan `KegiatanTanam.totalCost` berdasarkan perubahan data.

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "...",
    "plantingActivityId": "...",
    "pesticideId": { ... },
    "date": "2025-10-09T00:00:00.000Z",
    "dosage": 75,
    "unit": "gram",
    "pricePerUnit": 240,
    "_id": "..."
}

```

### DELETE /api/penyemprotan/{id}

Menghapus catatan penyemprotan.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/penyemprotan/{{ID_PENYEMPROTAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk mengembalikan stok pestisida dan mengurangi `KegiatanTanam.totalCost`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Data penyemprotan berhasil dihapus"
}

```

* * * * *

Biaya Operasional API
---------------------

### POST /api/kegiatantanam/{kegiatanId}/biayaoperasional

Mencatat biaya operasional lainnya (tenaga kerja, sewa alat, dll.).

-   **Metode:** `POST`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}/biayaoperasional`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{USER_TOKEN}}`

    -   `Content-Type: application/json`

-   **Request Body:**

    -   `date` (Date, required): Tanggal biaya.

    -   `costType` (string, required): Tipe biaya (enum: "Tenaga Kerja", "Sewa Alat", "Bahan Pendukung", "Lain-lain").

    -   `amount` (number, required): Jumlah biaya.

    -   `notes` (string, optional): Catatan tambahan.

-   **Logika:** Menggunakan transaksi untuk menambahkan biaya ke `KegiatanTanam.totalCost`.

-   **Contoh Respons (201 Created):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "date": "2025-10-12T00:00:00.000Z",
    "costType": "Tenaga Kerja",
    "amount": 150000,
    "notes": "Upah pasang mulsa",
    "_id": "..."
}

```

### PUT /api/biayaoperasional/{id}

Memperbarui catatan biaya operasional.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/biayaoperasional/{{ID_BIAYA}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk menyesuaikan `KegiatanTanam.totalCost` berdasarkan perubahan data.

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "...",
    "plantingActivityId": "...",
    "date": "2025-10-12T00:00:00.000Z",
    "costType": "Tenaga Kerja",
    "amount": 160000,
    "notes": "Upah pasang mulsa (revisi)",
    "_id": "..."
}

```

### DELETE /api/biayaoperasional/{id}

Menghapus catatan biaya operasional.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/biayaoperasional/{{ID_BIAYA}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk mengurangi `KegiatanTanam.totalCost`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Data biaya operasional berhasil dihapus"
}

```

* * * * *

Panen API
---------

### POST /api/kegiatantanam/{kegiatanId}/panen

Mencatat hasil panen baru.

-   **Metode:** `POST`

-   **URL:** `{{BASE_URL}}/api/kegiatantanam/{{ID_KEGIATAN_TANAM}}/panen`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{USER_TOKEN}}`

    -   `Content-Type: application/json`

-   **Request Body:**

    -   `harvestDate` (Date, required): Tanggal panen.

    -   `saleType` (string, required): Tipe penjualan (enum: "Per Satuan", "Borongan").

    -   `amount` (number, required jika `saleType`="Per Satuan"): Jumlah hasil.

    -   `unit` (string, required jika `saleType`="Per Satuan"): Satuan jumlah (misal: "kg").

    -   `sellingPrice` (number, required jika `saleType`="Per Satuan"): Harga jual per unit.

    -   `totalRevenue` (number, required jika `saleType`="Borongan"): Total pendapatan.

    -   `harvestCost` (number, optional): Biaya panen (misal: upah pemanen).

    -   `quality` (string, optional): Kualitas hasil panen.

-   **Logika:** Menggunakan transaksi untuk menambahkan pendapatan ke `KegiatanTanam.totalRevenue` dan mengubah status kegiatan tanam menjadi "Harvested".

-   **Contoh Respons (201 Created):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "harvestDate": "2025-11-28T00:00:00.000Z",
    "saleType": "Per Satuan",
    "amount": 150,
    "unit": "kg",
    "harvestCost": 100000,
    "sellingPrice": 30000,
    "totalRevenue": 4500000,
    "quality": "A",
    "saleStatus": "Terjual Habis",
    "_id": "..."
}

```

### GET /api/panen/{id}

Mendapatkan detail catatan panen.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/panen/{{ID_PANEN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "plantingActivityId": "68a966a6d813d4caa5db0688",
    "harvestDate": "2025-11-28T00:00:00.000Z",
    "saleType": "Per Satuan",
    "amount": 150,
    "unit": "kg",
    "harvestCost": 100000,
    "sellingPrice": 30000,
    "totalRevenue": 4500000,
    "_id": "..."
}

```

### PUT /api/panen/{id}

Memperbarui catatan panen.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/panen/{{ID_PANEN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk menyesuaikan `KegiatanTanam.totalRevenue` berdasarkan perubahan data.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "...",
    "saleType": "Per Satuan",
    "amount": 160,
    "totalRevenue": 4800000
}

```

### DELETE /api/panen/{id}

Menghapus catatan panen.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/panen/{{ID_PANEN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Logika:** Menggunakan transaksi untuk mengurangi `KegiatanTanam.totalRevenue`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Data panen berhasil dihapus"
}
```