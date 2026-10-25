/**
 * APLIKASI LAPORAN KEUANGAN GOOGLE APPS SCRIPT
 * Database: Google Spreadsheet
 * -------------------------------------------------------------
 */

const SHEET_TRANSAKSI = 'Transaksi';
const SHEET_KATEGORI = 'Kategori';

/**
 * Handle HTTP GET request untuk Web App
 */
function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Aplikasi Laporan Keuangan')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Menu otomatis saat Spreadsheet dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Laporan Keuangan')
    .addItem('🚀 Setup Template Database', 'setupDatabase')
    .addItem('🌐 Buka Aplikasi Web', 'openWebAppModal')
    .addToUi();
}

/**
 * Tampilkan modal link Web App di dalam spreadsheet
 */
function openWebAppModal() {
  const scriptUrl = ScriptApp.getService().getUrl();
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 15px; text-align: center;">
      <h3 style="color: #1e40af; margin-bottom: 10px;">Aplikasi Web Laporan Keuangan</h3>
      <p style="color: #475569; margin-bottom: 20px;">Klik tombol di bawah ini untuk membuka antarmuka aplikasi:</p>
      ${scriptUrl ? 
        `<a href="${scriptUrl}" target="_blank" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Buka Aplikasi Web</a>` :
        `<p style="color: #ef4444;">Aplikasi belum di-deploy sebagai Web App. Silakan klik Deploy > New Deployment > Web app.</p>`
      }
    </div>
  `;
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(400).setHeight(220), 'Akses Aplikasi');
}

/**
 * Inisialisasi Database Sheet jika belum ada
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet Transaksi
  let sheetTrx = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sheetTrx) {
    sheetTrx = ss.insertSheet(SHEET_TRANSAKSI);
  }
  
  // Format Header Transaksi
  const headerTrx = [['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah (Rp)', 'Keterangan', 'Created At']];
  sheetTrx.getRange(1, 1, 1, 7).setValues(headerTrx)
    .setBackground('#1e293b')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  sheetTrx.setFrozenRows(1);
  sheetTrx.setColumnWidth(1, 140); // ID
  sheetTrx.setColumnWidth(2, 110); // Tanggal
  sheetTrx.setColumnWidth(3, 110); // Tipe
  sheetTrx.setColumnWidth(4, 150); // Kategori
  sheetTrx.setColumnWidth(5, 140); // Jumlah
  sheetTrx.setColumnWidth(6, 250); // Keterangan
  sheetTrx.setColumnWidth(7, 160); // Created At

  // Format kolom Jumlah sebagai mata uang Rupiah
  sheetTrx.getRange('E2:E').setNumberFormat('#,##0');

  // 2. Setup Sheet Kategori
  let sheetKat = ss.getSheetByName(SHEET_KATEGORI);
  if (!sheetKat) {
    sheetKat = ss.insertSheet(SHEET_KATEGORI);
  }
  
  const headerKat = [['Nama Kategori', 'Tipe']];
  sheetKat.getRange(1, 1, 1, 2).setValues(headerKat)
    .setBackground('#334155')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  sheetKat.setFrozenRows(1);

  // Cek apakah data kategori default sudah ada
  if (sheetKat.getLastRow() <= 1) {
    const defaultKategori = [
      ['Gaji', 'Pemasukan'],
      ['Penjualan', 'Pemasukan'],
      ['Investasi & Bunga', 'Pemasukan'],
      ['Bonus / Hadiah', 'Pemasukan'],
      ['Pemasukan Lainnya', 'Pemasukan'],
      ['Makanan & Minuman', 'Pengeluaran'],
      ['Transportasi', 'Pengeluaran'],
      ['Belanja & Kebutuhan', 'Pengeluaran'],
      ['Tagihan & Utilitas (Listrik/Air)', 'Pengeluaran'],
      ['Sewa & Properti', 'Pengeluaran'],
      ['Pendidikan & Kursus', 'Pengeluaran'],
      ['Kesehatan & Medis', 'Pengeluaran'],
      ['Hiburan & Rekreasi', 'Pengeluaran'],
      ['Operasional Bisnis', 'Pengeluaran'],
      ['Pengeluaran Lainnya', 'Pengeluaran']
    ];
    sheetKat.getRange(2, 1, defaultKategori.length, 2).setValues(defaultKategori);
  }

  return { success: true, message: 'Database berhasil diinisialisasi!' };
}

/**
 * Ambil daftar kategori berdasarkan tipe atau semua
 */
function getKategori() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_KATEGORI);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  return data.map(row => ({
    nama: row[0],
    tipe: row[1]
  }));
}

/**
 * Ambil ringkasan dashboard (Total Pemasukan, Total Pengeluaran, Saldo, Grafik)
 */
function getDashboardData(filterBulan, filterTahun) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  
  const result = {
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldo: 0,
    transaksiTerbaru: [],
    pengeluaranPerKategori: {},
    pemasukanPerKategori: {},
    trenBulanan: {}
  };
  
  if (!sheet) return result;
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return result;
  
  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  
  // Inisialisasi 12 bulan untuk tren tahun berjalan
  const tahunTarget = filterTahun ? parseInt(filterTahun) : new Date().getFullYear();
  for (let m = 1; m <= 12; m++) {
    const key = `${tahunTarget}-${m.toString().padStart(2, '0')}`;
    result.trenBulanan[key] = { pemasukan: 0, pengeluaran: 0 };
  }

  data.forEach(row => {
    const id = row[0];
    const rawDate = row[1];
    const tipe = row[2];
    const kategori = row[3];
    const jumlah = Number(row[4]) || 0;
    const keterangan = row[5];
    
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return;
    
    const rowTahun = d.getFullYear();
    const rowBulan = d.getMonth() + 1;
    const bulanKey = `${rowTahun}-${rowBulan.toString().padStart(2, '0')}`;
    
    // Akumulasi tren tahunan
    if (rowTahun === tahunTarget && result.trenBulanan[bulanKey]) {
      if (tipe === 'Pemasukan') {
        result.trenBulanan[bulanKey].pemasukan += jumlah;
      } else if (tipe === 'Pengeluaran') {
        result.trenBulanan[bulanKey].pengeluaran += jumlah;
      }
    }

    // Filter data untuk card & breakdown kategori (opsional filter bulan)
    const matchesFilter = (!filterTahun || rowTahun === parseInt(filterTahun)) &&
                          (!filterBulan || rowBulan === parseInt(filterBulan));

    if (matchesFilter) {
      if (tipe === 'Pemasukan') {
        result.totalPemasukan += jumlah;
        result.pemasukanPerKategori[kategori] = (result.pemasukanPerKategori[kategori] || 0) + jumlah;
      } else if (tipe === 'Pengeluaran') {
        result.totalPengeluaran += jumlah;
        result.pengeluaranPerKategori[kategori] = (result.pengeluaranPerKategori[kategori] || 0) + jumlah;
      }
    }
  });

  result.saldo = result.totalPemasukan - result.totalPengeluaran;
  return result;
}

/**
 * Ambil daftar transaksi dengan filter
 */
function getTransaksi(filter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  
  let list = data.map((row, idx) => {
    const d = new Date(row[1]);
    const formattedDate = !isNaN(d.getTime()) ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd') : row[1];
    return {
      rowIndex: idx + 2,
      id: row[0],
      tanggal: formattedDate,
      tipe: row[2],
      kategori: row[3],
      jumlah: Number(row[4]) || 0,
      keterangan: row[5],
      createdAt: row[6]
    };
  });

  // Urutkan dari transaksi terbaru
  list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Filter opsional
  if (filter) {
    if (filter.tipe) {
      list = list.filter(item => item.tipe === filter.tipe);
    }
    if (filter.kategori) {
      list = list.filter(item => item.kategori === filter.kategori);
    }
    if (filter.bulan) {
      list = list.filter(item => {
        const itemMonth = (new Date(item.tanggal).getMonth() + 1).toString();
        return itemMonth === filter.bulan.toString();
      });
    }
    if (filter.tahun) {
      list = list.filter(item => {
        const itemYear = new Date(item.tanggal).getFullYear().toString();
        return itemYear === filter.tahun.toString();
      });
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(item => 
        (item.keterangan && item.keterangan.toLowerCase().includes(q)) ||
        (item.kategori && item.kategori.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q))
      );
    }
  }

  return list;
}

/**
 * Tambah transaksi baru (Atomic dengan Script Lock)
 */
function simpanTransaksi(formData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Tunggu maksimal 10 detik
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TRANSAKSI);
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName(SHEET_TRANSAKSI);
    }

    // Validasi input
    if (!formData.tanggal || !formData.tipe || !formData.kategori || !formData.jumlah) {
      throw new Error('Harap lengkapi semua kolom yang wajib diisi!');
    }

    const jumlah = parseFloat(formData.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      throw new Error('Jumlah transaksi harus berupa angka positif!');
    }

    // Generate ID Transaksi unik: TRX-YYYYMMDD-XXXX
    const tglStr = formData.tanggal.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const idTransaksi = `TRX-${tglStr}-${randomSuffix}`;
    
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    sheet.appendRow([
      idTransaksi,
      formData.tanggal,
      formData.tipe,
      formData.kategori,
      jumlah,
      formData.keterangan || '',
      now
    ]);

    return {
      success: true,
      message: 'Transaksi berhasil disimpan!',
      id: idTransaksi
    };
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Hapus transaksi berdasarkan ID
 */
function hapusTransaksi(idTransaksi) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TRANSAKSI);
    if (!sheet) throw new Error('Sheet Transaksi tidak ditemukan');

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) throw new Error('Data kosong');

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const targetIdx = ids.indexOf(idTransaksi);

    if (targetIdx === -1) {
      throw new Error('Transaksi dengan ID ' + idTransaksi + ' tidak ditemukan');
    }

    sheet.deleteRow(targetIdx + 2);

    return {
      success: true,
      message: 'Transaksi berhasil dihapus!'
    };
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Tambah Kategori Baru
 */
function simpanKategori(nama, tipe) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_KATEGORI);
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName(SHEET_KATEGORI);
    }
    
    if (!nama || !tipe) throw new Error('Nama dan tipe kategori wajib diisi!');
    
    sheet.appendRow([nama.trim(), tipe]);
    return { success: true, message: 'Kategori baru berhasil ditambahkan!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}
