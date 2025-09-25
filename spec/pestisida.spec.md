# Pestisida API
Dokumentasi untuk endpoint pengelolaan data master pestisida. Resource ini hanya dapat dikelola (POST, PUT, DELETE) oleh peran **Koperasi**.

---

### POST /api/pestisida
Membuat data pestisida baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/pestisida`
- **Otorisasi:** Diperlukan **ADMIN_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{ADMIN_TOKEN}}`
    - `Content-Type: multipart/form-data`
- **Request Body:**
    - `name` (string, required): Nama pestisida.
    - `brand` (string, required): Merek pestisida.
    - `price` (number, required): Harga pestisida per unit kemasan.
    - `stock` (number, required): Jumlah stok awal.
    - `package_unit` (string, required): Satuan kemasan (enum: "botol", "sachet", "kaleng", "jerigen").
    - `net_volume` (number, required): Volume bersih per kemasan.
    - `net_volume_unit` (string, required): Satuan volume bersih (enum: "ml", "liter", "gram", "kg").
    - `type` (string, required): Jenis pestisida (enum: "Insektisida", "Fungisida", "Herbisida", "Rodentisida", "Bakterisida", "Akarisida").
    - `active_ingredient` (string, optional): Bahan aktif.
    - `target_pest` (string, optional): Target hama/penyakit.
    - `dosage_recommendation` (string, optional): Rekomendasi dosis.
    - `is_active` (boolean, optional): Status ketersediaan produk.
    - `image` (file, optional): File gambar untuk pestisida.
- **Contoh Respons (201 Created):**
```json
{
    "name": "Antracol 70 WP",
    "brand": "Bayer",
    "price": 60000,
    "stock": 250,
    "package_unit": "sachet",
    "net_volume": 250,
    "net_volume_unit": "gram",
    "type": "Fungisida",
    "is_active": true,
    "_id": "68a80cc27d6d6191ce0486ac",
    "createdAt": "2025-08-22T06:22:58.363Z",
    "updatedAt": "2025-08-22T06:22:58.363Z"
}
```

### GET /api/pestisida

Mendapatkan daftar semua pestisida yang tersedia dengan fitur paginasi dan pencarian.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/pestisida`

-   **Otorisasi:** (Publik) Tidak diperlukan token.

-   **Query Parameters:**

    -   `page` (number, optional, default: 1): Nomor halaman.

    -   `limit` (number, optional, default: 10): Jumlah item per halaman.

    -   `search` (string, optional): Kata kunci untuk mencari berdasarkan nama atau merek.

-   **Contoh Respons (200 OK):**



```JSON
{
    "data": [
        {
            "_id": "68a80cc27d6d6191ce0486ac",
            "name": "Antracol 70 WP",
            "brand": "Bayer",
            "price": 60000,
            "stock": 250,
            "package_unit": "sachet",
            "net_volume": 250,
            "net_volume_unit": "gram",
            "type": "Fungisida",
            "active_ingredient": "Propineb 70%"
        }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
}

```

* * * * *

### GET /api/pestisida/{id}

Mendapatkan detail pestisida berdasarkan ID.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/pestisida/{{ID_PESTISIDA}}`

-   **Otorisasi:** (Publik) Tidak diperlukan token.

-   **Path Parameter:**

    -   `id` (ObjectId, required): ID pestisida.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a80cc27d6d6191ce0486ac",
    "name": "Antracol 70 WP",
    "brand": "Bayer",
    "price": 60000,
    "stock": 250,
    "package_unit": "sachet",
    "net_volume": 250,
    "net_volume_unit": "gram",
    "type": "Fungisida",
    "active_ingredient": "Propineb 70%",
    "target_pest": "Bercak daun, busuk antraknosa",
    "dosage_recommendation": "1.5 - 2 gram per liter air",
    "is_active": true
}

```

* * * * *

### PUT /api/pestisida/{id}

Memperbarui data pestisida berdasarkan ID. Hanya dapat diakses oleh peran "Koperasi".

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/pestisida/{{ID_PESTISIDA}}`

-   **Otorisasi:** Diperlukan **ADMIN_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{ADMIN_TOKEN}}`

    -   `Content-Type: multipart/form-data`

-   **Request Body:** (Semua field bersifat opsional, hanya kirim yang ingin diubah)

    -   `stock` (number): Stok pestisida.

    -   `price` (number): Harga pestisida.

    -   `image` (file): Ganti gambar pestisida yang sudah ada.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a80cc27d6d6191ce0486ac",
    "name": "Antracol 70 WP",
    "stock": 200,
    "price": 65000,
    "updatedAt": "2025-08-23T08:00:00.000Z"
}

```

* * * * *

### DELETE /api/pestisida/{id}

Menghapus data pestisida berdasarkan ID. Hanya dapat diakses oleh peran "Koperasi".

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/pestisida/{{ID_PESTISIDA}}`

-   **Otorisasi:** Diperlukan **ADMIN_TOKEN**

-   **Catatan Penting:** Endpoint ini akan gagal (`409 Conflict`) jika pestisida sudah digunakan dalam catatan `Penyemprotan`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Pestisida berhasil dihapus"
}
```