# Dokumentasi Lengkap RijanBox (Bahasa Indonesia)

Selamat datang di RijanBox! Aplikasi ini dirancang untuk membantu Anda mengelola berbagai akun layanan web (seperti WhatsApp, Gmail, Telegram) dalam satu jendela yang terorganisir.

---

## 1. Memulai Aplikasi

Setelah membuka RijanBox, Anda akan disambut dengan layar Beranda yang elegan.

![Homescreen](../docs/img/homescreen.png)

### Navigasi Utama
- **Sidebar**: Terletak di sebelah kiri untuk berpindah antar layanan dengan cepat.
- **Beranda (Home)**: Menampilkan statistik layanan Anda dan akses cepat ke layanan populer.
- **Katalog (+)**: Tombol untuk menambahkan layanan baru.
- **Pengaturan (Gear)**: Untuk mengubah preferensi aplikasi.

---

## 2. Menambahkan Layanan

Untuk menambahkan layanan baru, klik ikon **+** di sidebar atau tombol **Jelajahi Katalog** di beranda.

![Katalog Layanan](../docs/img/catalog.png)

1. Cari layanan yang Anda inginkan di Katalog.
2. Klik kartu layanan tersebut untuk menambahkannya ke sidebar.
3. Jika layanan tidak ada di daftar, Anda bisa menggunakan fitur **URL Kustom** di bagian bawah katalog.

---

## 3. Mengelola Layanan

Setiap layanan yang sudah ditambahkan dapat dikelola melalui klik kanan pada ikonnya di sidebar atau beranda.

![Menu Klik Kanan](../docs/img/services_right_clicked_show_rename_change_icon_mute.png)

Fitur yang tersedia:
- **Ubah Nama**: Mengganti nama tampilan layanan.
- **Ganti Ikon**: Menggunakan emoji atau mengunggah gambar kustom.
- **Bisukan**: Menonaktifkan notifikasi untuk layanan tersebut.
- **Hibernasi**: Memberhentikan proses background untuk menghemat RAM.
- **Hapus**: Menghapus layanan dari RijanBox.

---

## 4. Pengaturan & Tampilan

RijanBox mendukung tema yang sangat fleksibel untuk menyesuaikan mood Anda.

![Pengaturan Tampilan](../docs/img/settings_appreance.png)

- **Mode Tema**: Pilih antara Terang (Light), Gelap (Dark), atau Otomatis mengikuti sistem.
- **Warna Tema**: Tersedia 10 pilihan warna aksen (Blue, Teal, Green, dll).
- **Bahasa**: Tersedia dalam Bahasa Indonesia dan English.

---

## 5. Keamanan PIN

Lindungi privasi Anda dengan mengaktifkan fitur PIN.

1. Masuk ke **Settings > Security**.
2. Klik **Aktifkan PIN**.
3. Buat PIN antara 4 hingga 8 digit.
4. Anda juga bisa mengatur **Kunci Otomatis** jika aplikasi tidak digunakan dalam waktu tertentu.

---

## 6. Pintasan Keyboard

Gunakan keyboard untuk navigasi yang lebih cepat.

![Pintasan Keyboard](../docs/img/settings_shortcut.png)

| Pintasan | Aksi |
|----------|------|
| `Ctrl + L` | Kunci Aplikasi |
| `Ctrl + ,` | Buka Pengaturan |
| `Ctrl + N` | Tambah Layanan Baru |
| `Ctrl + K` | Cari Layanan (Katalog) |
| `Ctrl + 1-9` | Pindah ke Layanan 1 sampai 9 |

---

## 7. Cara Memperbarui Aplikasi

Untuk mendapatkan fitur terbaru (seperti v1.1.0), Anda perlu memperbarui aplikasi secara manual:

### 🪟 Windows
1. Unduh file `.exe` terbaru dari halaman [Releases](https://github.com/Rijanara-Teknologi/RijanBox/releases).
2. Jalankan installer tersebut.
3. Installer akan otomatis menimpa versi lama dan memperbarui aplikasi Anda tanpa menghapus data layanan.

### 🍎 macOS
1. Unduh file `.dmg` terbaru.
2. Buka file `.dmg` dan tarik ikon **RijanBox** ke folder **Applications**.
3. Pilih **Replace** jika muncul peringatan bahwa aplikasi sudah ada.

### 🐧 Linux
- **AppImage**: Unduh file `.AppImage` baru, beri izin eksekusi (`chmod +x`), dan ganti file lama Anda.
- **Debian/Ubuntu**: Unduh file `.deb` terbaru dan jalankan perintah:
  ```bash
  sudo dpkg -i rijanbox_1.x.x_amd64.deb
  ```

