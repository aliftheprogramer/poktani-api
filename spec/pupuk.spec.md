# Pupuk API
Dokumentasi untuk endpoint pengelolaan data master pupuk. Resource ini hanya dapat dikelola (POST, PUT, DELETE) oleh peran **Koperasi**.

---

### POST /api/pupuk
Membuat data pupuk baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/pupuk`
- **Otorisasi:** Diperlukan **ADMIN_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{ADMIN_TOKEN}}`
    - `Content-Type: multipart/form-data`
- **Request Body:**
    - `name` (string, required): Nama pupuk.
    - `brand` (string, required): Merek pupuk.
    - `price` (number, required): Harga pupuk per unit kemasan.
    - `stock` (number, required): Jumlah stok awal.
    - `package_unit` (string, required): Satuan kemasan (enum: "karung", "botol", "sachet", "jerigen", "pack").
    - `net_weight` (number, required): Berat bersih per kemasan.
    - `net_weight_unit` (string, required): Satuan berat bersih (enum: "kg", "gram", "liter", "ml").
    - `type` (string, required): Jenis pupuk (enum: "Anorganik", "Organik", "Hayati").
    - `form` (string, required): Bentuk pupuk (enum: "Padat", "Cair").
    - `composition` (string, optional): Komposisi bahan.
    - `usage_recommendation` (string, optional): Rekomendasi penggunaan.
    - `is_active` (boolean, optional): Status ketersediaan produk.
    - `image` (file, optional): File gambar untuk pupuk.
- **Contoh Respons (201 Created):**
```json
{
    "name": "Pupuk ZA",
    "brand": "Petrokimia Gresik",
    "price": 155000,
    "stock": 50,
    "package_unit": "karung",
    "net_weight": 50,
    "net_weight_unit": "kg",
    "type": "Anorganik",
    "form": "Padat",
    "is_active": true,
    "_id": "68a804f77d6d6191ce048696",
    "createdAt": "2025-08-22T05:49:43.089Z",
    "updatedAt": "2025-08-22T05:49:43.089Z"
}
```

### GET /api/pupuk

Mendapatkan daftar semua pupuk yang tersedia dengan fitur paginasi dan pencarian.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/pupuk`

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
            "_id": "68a804f77d6d6191ce048696",
            "name": "Pupuk ZA",
            "brand": "Petrokimia Gresik",
            "price": 155000,
            "stock": 50,
            "package_unit": "karung",
            "net_weight": 50,
            "net_weight_unit": "kg",
            "type": "Anorganik",
            "form": "Padat"
        }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
}

```

* * * * *

### GET /api/pupuk/{id}

Mendapatkan detail pupuk berdasarkan ID.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/pupuk/{{ID_PUPUK}}`

-   **Otorisasi:** (Publik) Tidak diperlukan token.

-   **Path Parameter:**

    -   `id` (ObjectId, required): ID pupuk.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a804f77d6d6191ce048696",
    "name": "Pupuk ZA",
    "brand": "Petrokimia Gresik",
    "price": 155000,
    "stock": 50,
    "package_unit": "karung",
    "net_weight": 50,
    "net_weight_unit": "kg",
    "type": "Anorganik",
    "form": "Padat",
    "composition": "Amonium Sulfat",
    "usage_recommendation": "Dosis 100-150 kg/ha",
    "is_active": true
}

```

* * * * *

### PUT /api/pupuk/{id}

Memperbarui data pupuk berdasarkan ID. Hanya dapat diakses oleh peran "Koperasi".

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/pupuk/{{ID_PUPUK}}`

-   **Otorisasi:** Diperlukan **ADMIN_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{ADMIN_TOKEN}}`

    -   `Content-Type: multipart/form-data`

-   **Request Body:** (Semua field bersifat opsional, hanya kirim yang ingin diubah)

    -   `stock` (number): Stok pupuk.

    -   `price` (number): Harga pupuk.

    -   `image` (file): Ganti gambar pupuk yang sudah ada.

-   **Contoh Respons (200 OK):**



```JSON
{
    "_id": "68a804f77d6d6191ce048696",
    "name": "Pupuk ZA",
    "stock": 40,
    "price": 160000,
    "updatedAt": "2025-08-23T08:00:00.000Z"
}

```

* * * * *

### DELETE /api/pupuk/{id}

Menghapus data pupuk berdasarkan ID. Hanya dapat diakses oleh peran "Koperasi".

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/pupuk/{{ID_PUPUK}}`

-   **Otorisasi:** Diperlukan **ADMIN_TOKEN**

-   **Catatan Penting:** Endpoint ini akan gagal (`409 Conflict`) jika pupuk sudah digunakan dalam catatan `Pemupukan`.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Pupuk berhasil dihapus"
}
```