# Benih API
Dokumentasi untuk endpoint pengelolaan data master benih. Resource ini hanya dapat dikelola (POST, PUT, DELETE) oleh peran **Koperasi**.

---

### POST /api/benih
Membuat data benih baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/benih`
- **Otorisasi:** Diperlukan **ADMIN_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{ADMIN_TOKEN}}`
    - `Content-Type: multipart/form-data`
- **Request Body:**
    - `name` (string, required): Nama benih.
    - `variety` (string, required): Varietas benih.
    - `price` (number, required): Harga benih per unit.
    - `stock` (number, required): Jumlah stok awal.
    - `unit` (string, required): Satuan kemasan (enum: "sachet", "gram", "kg", "butir", "pak", "karung", "botol", "kaleng").
    - `description` (string, optional): Deskripsi benih.
    - `days_to_harvest` (number, optional): Hari perkiraan panen.
    - `is_active` (boolean, optional): Status ketersediaan produk.
    - `image` (file, optional): File gambar untuk benih.
- **Contoh Respons (201 Created):**
```json
{
    "name": "Cabai Rawit Merah",
    "variety": "Bara",
    "price": 15000,
    "stock": 500,
    "unit": "sachet",
    "description": "Benih cabai rawit pedas dengan daya tumbuh tinggi.",
    "days_to_harvest": 90,
    "is_active": true,
    "_id": "68a95c88d813d4caa5db0666",
    "createdAt": "2025-08-23T06:15:36.389Z",
    "updatedAt": "2025-08-23T06:15:36.389Z",
    "image_url": "...",
    "image_public_id": "..."
}
```

### GET /api/benih

Mendapatkan daftar semua benih yang tersedia dengan fitur paginasi dan pencarian.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/benih`

-   **Otorisasi:** (Publik) Tidak diperlukan token.

-   **Query Parameters:**

    -   `page` (number, optional, default: 1): Nomor halaman.

    -   `limit` (number, optional, default: 10): Jumlah item per halaman.

    -   `search` (string, optional): Kata kunci untuk mencari berdasarkan nama atau varietas.

-   **Contoh Respons (200 OK):**



```json
{
    "data": [
        {
            "_id": "68a95c88d813d4caa5db0666",
            "name": "Cabai Rawit Merah",
            "variety": "Bara",
            "price": 15000,
            "stock": 500,
            "unit": "sachet",
            "days_to_harvest": 90,
            "image_url": "...",
            "image_public_id": "..."
        }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
}

```

* * * * *

### GET /api/benih/{id}

Mendapatkan detail benih berdasarkan ID.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/benih/{{ID_BENIH}}`

-   **Otorisasi:** (Publik) Tidak diperlukan token.

-   **Path Parameter:**

    -   `id` (ObjectId, required): ID benih.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a95c88d813d4caa5db0666",
    "name": "Cabai Rawit Merah",
    "variety": "Bara",
    "price": 15000,
    "stock": 500,
    "unit": "sachet",
    "description": "Benih cabai rawit pedas dengan daya tumbuh tinggi.",
    "days_to_harvest": 90,
    "is_active": true
}

```

* * * * *

### PUT /api/benih/{id}

Memperbarui data benih berdasarkan ID. Hanya dapat diakses oleh peran "Koperasi".

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/benih/{{ID_BENIH}}`

-   **Otorisasi:** Diperlukan **ADMIN_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{ADMIN_TOKEN}}`

    -   `Content-Type: multipart/form-data`

-   **Request Body:** (Semua field bersifat opsional, hanya kirim yang ingin diubah)

    -   `name` (string): Nama benih.

    -   `price` (number): Harga benih.

    -   `stock` (number): Stok benih.

    -   `image` (file): Ganti gambar benih yang sudah ada.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a95c88d813d4caa5db0666",
    "name": "Cabai Rawit Merah",
    "variety": "Bara",
    "price": 15000,
    "stock": 450,
    "unit": "sachet",
    "description": "Benih cabai rawit pedas dengan daya tumbuh tinggi.",
    "days_to_harvest": 90,
    "is_active": true,
    "updatedAt": "2025-08-23T06:20:10.123Z"
}

```

* * * * *

### DELETE /api/benih/{id}

Menghapus data benih berdasarkan ID. Hanya dapat diakses oleh peran "Koperasi".

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/benih/{{ID_BENIH}}`

-   **Otorisasi:** Diperlukan **ADMIN_TOKEN**

-   **Catatan Penting:** Endpoint ini akan gagal (`409 Conflict`) jika benih sudah digunakan dalam catatan `Semai` atau `KegiatanTanam`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Benih berhasil dihapus"
}
```