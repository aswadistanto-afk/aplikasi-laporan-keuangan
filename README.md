# 📊 Aplikasi Laporan Keuangan Google Apps Script

Aplikasi pencatatan dan laporan keuangan modern berbasis **Google Apps Script** dan **Google Spreadsheet** sebagai databasenya. Dilengkapi dengan antarmuka Web App yang bersih, interaktif, dan responsif (dapat diakses lewat HP / Laptop).

---

## 🌟 Fitur Utama

1. **Dashboard Ringkasan Realtime**:
   - Total Pemasukan (*Income*)
   - Total Pengeluaran (*Expense*)
   - Saldo Akhir / *Net Cashflow*
2. **Visualisasi Data Interaktif**:
   - **Grafik Tren Bulanan**: Perbandingan arus kas masuk vs keluar 12 bulan (Chart.js Bar Chart).
   - **Distribusi Pengeluaran**: Diagram donat kategori pengeluaran terbesar.
3. **Pencatatan Transaksi Cepat**:
   - Input Tanggal, Jenis (Pemasukan/Pengeluaran), Kategori, Nominal (Format Rupiah otomatis), dan Catatan.
   - Penomoran otomatis ID Transaksi (`TRX-YYYYMMDD-XXXX`).
   - Fitur hapus transaksi dengan konfirmasi.
4. **Filter & Pencarian Lengkap**:
   - Filter berdasarkan Bulan dan Tahun.
   - Filter berdasarkan Tipe (Pemasukan/Pengeluaran).
   - Pencarian instan berdasarkan teks / nama kategori / ID transaksi.
5. **Manajemen Kategori Kustom**:
   - Tambah kategori pengeluaran atau pemasukan baru langsung dari aplikasi.
6. **Integrasi Google Spreadsheet**:
   - Semua data tersimpan aman di Google Drive Anda.
   - Menu custom di Spreadsheet untuk setup otomatis dan akses web.

---

## 🚀 Panduan Pemasangan (Setup Langkah demi Langkah)

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet Anda, misalnya: **"Sistem Keuangan Pribadi / Usaha"**.

### Langkah 2: Buka Editor Apps Script
1. Pada menu atas Google Sheets, klik menu **Ekstensi** (*Extensions*) > **Apps Script**.
2. Anda akan diarahkan ke halaman editor kode Apps Script.

### Langkah 3: Masukkan Kode Aplikasi
1. **File `Code.gs`**:
   - Hapus semua kode default di file `Code.gs`.
   - Buka file [Code.gs](file:///C:/Users/HYPE/.gemini/antigravity/scratch/aplikasi-laporan-keuangan/Code.gs), salin semua kodenya, dan tempelkan ke editor Apps Script.
2. **File `Index.html`**:
   - Di sisi kiri editor Apps Script, klik tombol **+ (Tambahkan file)** > pilih **HTML**.
   - Beri nama file: `Index` (sehingga menjadi `Index.html`).
   - Buka file [Index.html](file:///C:/Users/HYPE/.gemini/antigravity/scratch/aplikasi-laporan-keuangan/Index.html), salin semua isinya, lalu tempelkan ke editor.
3. Klik tombol **Simpan** (ikon disket / `Ctrl + S`).

---

### Langkah 4: Inisialisasi Database Sheet
1. Kembali ke tab **Google Spreadsheet** Anda lalu **Refresh (F5)** halaman spreadsheet.
2. Anda akan melihat menu baru di bagian atas bernama **"📊 Laporan Keuangan"**.
3. Klik **📊 Laporan Keuangan** > **🚀 Setup Template Database**.
4. Google akan meminta **Otorisasi Izin** (*Authorization Required*):
   - Klik **Lanjutkan** (*Continue*).
   - Pilih akun Google Anda.
   - Klik **Lanjutan** (*Advanced*) di bagian kiri bawah > klik **Buka Untitled project (tidak aman)** / nama project Anda.
   - Klik **Izinkan** (*Allow*).
5. Tunggu beberapa detik; sheet **`Transaksi`** dan **`Kategori`** akan otomatis dibuat dan diformat rapi beserta data kategori default.

---

### Langkah 5: Deploy sebagai Web App
Agar aplikasi bisa dibuka sebagai situs web di HP maupun laptop:
1. Kembali ke tab editor **Apps Script**.
2. Klik tombol biru **Terapkan** (*Deploy*) di pojok kanan atas > pilih **Penerapan baru** (*New deployment*).
3. Klik ikon gear/roda gigi di samping "Pilih jenis" (*Select type*) > pilih **Aplikasi web** (*Web app*).
4. Konfigurasikan pengaturannya:
   - **Deskripsi**: `Versi 1.0`
   - **Jalankan sebagai** (*Execute as*): **Saya** (*Me*)
   - **Yang memiliki akses** (*Who has access*): 
     - Pilih **Hanya saya** (*Only myself*) jika untuk keperluan pribadi, ATAU
     - Pilih **Siapa saja** (*Anyone*) jika ingin diakses dari link publik tanpa login.
5. Klik **Terapkan** (*Deploy*).
6. Salin **URL Aplikasi Web** yang diberikan. Buka URL tersebut di tab baru browser atau simpan di bookmark ponsel Anda!

---

## 📁 Struktur File Proyek

```text
aplikasi-laporan-keuangan/
├── Code.gs             # Backend logic: CRUD, LockService, agregasi data, menu spreadsheet
├── Index.html          # Frontend modern: Tailwind CSS, Chart.js, Modal, Form Masking
├── appsscript.json     # Konfigurasi manifest Apps Script (Timezone Asia/Jakarta)
└── README.md           # Petunjuk instalasi dan dokumentasi
```

---

## 💡 Tips Penggunaan
- Anda tetap bisa mengedit atau menambahkan data langsung dari Google Sheet jika dibutuhkan; aplikasi web akan otomatis membaca data terbaru saat halaman di-refresh.
- Format nominal pada input form otomatis menggunakan titik pemisah ribuan Rupiah untuk mencegah kesalahan ketik.
