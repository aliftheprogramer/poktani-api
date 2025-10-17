# Lahan API
Dokumentasi untuk endpoint pengelolaan data lahan oleh petani. Resource ini hanya dapat diakses oleh peran **Petani**.

---

### POST /api/lahan
Membuat data lahan baru.

- **Metode:** `POST`
- **URL:** `{{BASE_URL}}/api/lahan`
- **Otorisasi:** Diperlukan **USER_TOKEN**
- **Headers:**
    - `Authorization: Bearer {{USER_TOKEN}}`
    - `Content-Type: application/json`
- **Request Body:**
    - `name` (string, required): Nama lahan.
    - `landArea` (number, required): Luas lahan dalam meter persegi.
    - `soilType` (string, required): Jenis tanah.
    - `hamlet` (string, required): Dusun.
    - `village` (string, required): Desa.
    - `district` (string, required): Kecamatan.
    - `latitude` (number, required): Koordinat latitude lahan.
    - `longitude` (number, required): Koordinat longitude lahan.
    - `gambar` (string, optional): URL gambar lahan.
- **Contoh Respons (201 Created):**
```json
{
    "userId": "68a966a6d813d4caa5db0687",
    "name": "Sawah Cepat Panen",
    "landArea": 500,
    "soilType": "Latosol",
    "hamlet": "Dusun A",
    "village": "Desa B",
    "district": "Kecamatan C",
    "latitude": -7.2575,
    "longitude": 112.7521,
    "gambar": "https://example.com/images/lahan1.jpg",
    "plantingHistory": [],
    "_id": "68a966a6d813d4caa5db0686",
    "createdAt": "2025-08-23T08:00:00.000Z",
    "updatedAt": "2025-08-23T08:00:00.000Z"
}
```

### GET /api/lahan

Mendapatkan daftar semua lahan milik user dengan fitur paginasi dan pencarian.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/lahan`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Query Parameters:**

    -   `page` (number, optional, default: 1): Nomor halaman.

    -   `limit` (number, optional, default: 10): Jumlah item per halaman.

    -   `search` (string, optional): Kata kunci untuk mencari berdasarkan nama, desa, atau kecamatan.

-   **Contoh Respons (200 OK):**



```JSON
{
    "data": [
        {
            "_id": "68a966a6d813d4caa5db0686",
            "name": "Sawah Cepat Panen",
            "landArea": 500,
            "village": "Desa B",
            "district": "Kecamatan C"
        }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
}

```

* * * * *

### GET /api/lahan/{id}

Mendapatkan detail lahan berdasarkan ID.

-   **Metode:** `GET`

-   **URL:** `{{BASE_URL}}/api/lahan/{{ID_LAHAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Path Parameter:**

    -   `id` (ObjectId, required): ID lahan.

-   **Contoh Respons (200 OK):**



```JSON
```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "name": "Sawah Cepat Panen",
    "landArea": 500,
    "soilType": "Latosol",
    "hamlet": "Dusun A",
    "village": "Desa B",
    "district": "Kecamatan C",
    "latitude": -7.2575,
    "longitude": 112.7521,
    "gambar": "https://example.com/images/lahan1.jpg",
    "plantingHistory": ["68a966a6d813d4caa5db0688"],
    "_id": "68a966a6d813d4caa5db0686"
}
```

```

* * * * *

### PUT /api/lahan/{id}

Memperbarui data lahan berdasarkan ID.

-   **Metode:** `PUT`

-   **URL:** `{{BASE_URL}}/api/lahan/{{ID_LAHAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{USER_TOKEN}}`

    -   `Content-Type: application/json`

-   **Request Body:** (Semua field bersifat opsional, hanya kirim yang ingin diubah)

    -   `name` (string): Nama lahan.

    -   `landArea` (number): Luas lahan.

    -   `soilType` (string): Jenis tanah.

    -   `hamlet` (string): Dusun.

    -   `village` (string): Desa.

    -   `district` (string): Kecamatan.

    -   `latitude` (number): Koordinat latitude lahan.

    -   `longitude` (number): Koordinat longitude lahan.

    -   `gambar` (string): URL gambar lahan.

-   **Contoh Respons (200 OK):**



```JSON
{
    "userId": "68a966a6d813d4caa5db0687",
    "name": "Sawah Cepat Panen (Barat)",
    "landArea": 500,
    "soilType": "Latosol",
    "hamlet": "Dusun A",
    "village": "Desa B",
    "district": "Kecamatan C",
    "plantingHistory": ["68a966a6d813d4caa5db0688"]
}

```

* * * * *

### DELETE /api/lahan/{id}

Menghapus data lahan berdasarkan ID.

-   **Metode:** `DELETE`

-   **URL:** `{{BASE_URL}}/api/lahan/{{ID_LAHAN}}`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Catatan Penting:** Endpoint ini akan gagal (`409 Conflict`) jika lahan sudah pernah digunakan dalam `KegiatanTanam`. Logika ini menggunakan transaksi untuk mencegah penghapusan yang tidak konsisten.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Lahan berhasil dihapus"
}

```

* * * * *

### POST /api/lahan/{id}/clear-history

Menghapus seluruh riwayat kegiatan tanam dan data terkait (panen, pemupukan, dll.) dari sebuah lahan.

-   **Metode:** `POST`

-   **URL:** `{{BASE_URL}}/api/lahan/{{ID_LAHAN}}/clear-history`

-   **Otorisasi:** Diperlukan **USER_TOKEN**

-   **Headers:**

    -   `Authorization: Bearer {{USER_TOKEN}}`

-   **Catatan Penting:** Aksi ini melakukan **cascading delete** secara transaksional. Semua dokumen `KegiatanTanam` yang terkait, beserta semua `Panen`, `Pemupukan`, dan `Penyemprotan` akan ikut terhapus.

-   **Contoh Respons (200 OK):**



```JSON
{
    "message": "Riwayat kegiatan tanam untuk lahan 'Sawah Cepat Panen' berhasil dibersihkan."
}
```