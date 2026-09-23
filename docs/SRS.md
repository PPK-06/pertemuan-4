# SRS — Aplikasi Expense Tracker Pribadi

## 1. Ringkasan Sistem
Aplikasi ini adalah expense tracker berbasis web yang memungkinkan seorang pengguna mencatat dan memantau kondisi keuangan pribadinya sendiri. Sistem ditujukan untuk individu yang ingin melihat gambaran keuangan mereka secara ringkas — saldo saat ini, riwayat transaksi, serta total pemasukan dan pengeluaran — tanpa perlu mencatat manual di kertas atau spreadsheet. Setiap pengguna memiliki akun sendiri dan hanya dapat mengakses data transaksi miliknya sendiri. Fokus utama sistem adalah pencatatan transaksi (pemasukan/pengeluaran) yang aman dan personal, bukan analisis keuangan lanjutan.

## 2. Aktor
| Aktor | Peran |
|---|---|
| Pengguna | Individu yang memiliki akun, login ke sistem, serta mencatat dan meninjau transaksi keuangannya sendiri. |

## 3. Entitas & Relasi
Sistem ini berpusat pada dua entitas: **Pengguna** dan **Transaksi**. Satu Pengguna dapat memiliki banyak Transaksi (one-to-many), sementara setiap Transaksi hanya dimiliki oleh satu Pengguna. Relasi ini menjadi dasar pembatasan akses: sebuah Transaksi hanya boleh dibaca atau diubah oleh Pengguna yang menjadi pemiliknya.

## 4. Functional Requirements
| ID | Requirement | Aktor | Prioritas |
|---|---|---|---|
| FR-01 | Sebagai pengguna, saya bisa membuat akun dengan email dan password sehingga saya punya identitas sendiri untuk menyimpan data keuangan pribadi. | Pengguna | Core |
| FR-02 | Sebagai pengguna, saya bisa login dan logout menggunakan email dan password sehingga hanya saya sendiri yang bisa mengakses data keuangan saya. | Pengguna | Core |
| FR-03 | Sebagai pengguna, saya bisa menambahkan transaksi baru berupa pemasukan atau pengeluaran sehingga setiap perubahan keuangan saya tercatat saat terjadi. | Pengguna | Core |
| FR-04 | Sebagai pengguna, saya bisa mengubah dan menghapus transaksi yang sudah saya catat sehingga saya bisa memperbaiki data yang keliru atau sudah tidak relevan. | Pengguna | Core |
| FR-05 | Sebagai pengguna, saya bisa melihat ringkasan akun berupa saldo, riwayat transaksi, total pemasukan, dan total pengeluaran sehingga saya bisa memahami kondisi keuangan saya secara cepat. | Pengguna | Core |
| FR-06 | Sebagai pengguna, saya bisa memfilter riwayat transaksi berdasarkan jenis (pemasukan/pengeluaran) dan pilihan filter terakhir saya diingat sehingga saya tidak perlu mengatur ulang tampilan setiap kali membuka aplikasi. | Pengguna | Core |

## 5. Daftar Halaman
| Nama Halaman | Siapa yang Mengakses | FR yang Ditampilkan | Butuh Login |
|---|---|---|---|
| Halaman Registrasi | Pengguna belum login | FR-01 | Tidak |
| Halaman Login | Pengguna belum login | FR-02 | Tidak |
| Halaman Dashboard | Pengguna sudah login | FR-04 (hapus), FR-05, FR-06 | Ya |
| Halaman Form Transaksi | Pengguna sudah login | FR-03, FR-04 (ubah) | Ya |

## 6. Asumsi & Keputusan
1. Nama "Bramantyo" dan detail pengeluarannya pada catatan hanya berfungsi sebagai ilustrasi use case (contoh pengguna), bukan kebutuhan sistem, sehingga tidak diterjemahkan menjadi requirement teknis apa pun seperti limit transaksi atau kategori kekayaan.
2. Frasa "menggunakan cookies untuk menyimpan preferensi pengguna" diputuskan diwujudkan sebagai satu preferensi konkret saja, yaitu jenis filter transaksi terakhir yang dipilih pengguna, dan disimpan pada cookie terpisah dari session. Pilihan ini diambil karena filter jenis transaksi adalah satu-satunya preferensi tampilan yang benar-benar muncul di catatan, sehingga catatan tetap terpenuhi tanpa menambah fitur baru di luar lingkup.
3. Preferensi filter pada poin 2 melekat pada FR-06 dan tidak dipecah menjadi requirement tersendiri, karena keduanya dikerjakan pada halaman dan potongan kode yang sama sehingga lebih masuk akal dinilai sebagai satu unit kerja oleh satu programmer.
4. "Membuat akun" pada catatan dijadikan requirement registrasi tersendiri (FR-01), terpisah dari login/logout (FR-02), agar masing-masing tetap atomik dan bisa dikerjakan satu programmer, sekaligus menjaga agar requirement auth Core (FR-02) hanya mencakup login, logout, session cookie, dan proteksi halaman sesuai batasan lingkup.
5. Registrasi diputuskan cukup berisi email dan password, dan akun langsung aktif begitu dibuat tanpa konfirmasi email atau langkah verifikasi lain. Alasannya, catatan hanya menyebut login dengan email dan password, dan menambah verifikasi akan menuntut pengiriman email yang jelas berada di luar lingkup praktikum.
6. Jenis transaksi diputuskan hanya dua, yaitu pemasukan dan pengeluaran, tanpa sub-kategori seperti gaji atau belanja. Catatan tidak pernah menyebut sub-kategori, dan membatasi pada dua jenis membuat perhitungan saldo serta filter pada FR-05 dan FR-06 tetap sederhana dan tidak saling bergantung.
7. "Mengubah" dan "menghapus" transaksi digabung menjadi satu requirement (FR-04) karena keduanya beroperasi pada data transaksi yang sama dan cukup ringan untuk satu orang, sementara "menambah transaksi" dipisah (FR-03) supaya beban kerja tiga programmer tetap seimbang, dua requirement per orang.
8. Saldo, riwayat transaksi, total pemasukan, dan total pengeluaran digabung menjadi satu requirement (FR-05) karena semuanya tampil di satu halaman dashboard yang sama dan diambil dari sumber data transaksi yang sama, sehingga tetap bisa dinilai selesai/belum sebagai satu unit kerja.
9. Filter transaksi (FR-06) ditetapkan sebagai Core, bukan Stretch, karena disebutkan eksplisit di catatan sebagai bagian manajemen transaksi; menjadikannya Stretch akan membuat pembagian kerja timpang, yaitu tiga requirement untuk dua programmer dan hanya dua untuk programmer ketiga.

## 7. Di Luar Lingkup
- Reset password, verifikasi email, dan fitur remember me.
- Sistem role atau permission berlapis (admin, dsb.).
- Notifikasi, laporan/export data, pencarian, dan pagination.
- Dashboard analitik lanjutan (grafik, statistik, tren).
- Preferensi pengguna selain filter jenis transaksi (tema, layout, bahasa, dsb.).
- Sub-kategori transaksi di luar pemasukan dan pengeluaran.
- Audit log dan soft delete transaksi.

## 8. Perlu Dikonfirmasi
Tidak ada. Seluruh ambiguitas pada catatan sudah diputuskan dan didokumentasikan pada bagian Asumsi & Keputusan.
