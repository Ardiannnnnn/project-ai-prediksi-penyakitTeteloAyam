# PRD Sistem Pakar Diagnosis Dini Tetelo pada Ayam

| Informasi | Keterangan |
|---|---|
| Mata kuliah | MMAI1001 — Kecerdasan Artificial |
| Proyek | Tugas/Proyek 2, kelompok |
| Tenggat | Sabtu, 28 November 2026 pukul 23.59 WIB |
| Implementasi | SWI-Prolog, antarmuka konsol |
| Metode | Backward Chaining dan Certainty Factor (CF) |

## 1. Tujuan dan ruang lingkup

Program menerima pengamatan pengguna atas 12 gejala, mengevaluasi 15 aturan IF–THEN, dan menampilkan satu pola gejala utama beserta skor CF. Sistem mencakup skrining Tetelo pada ayam. Kategori D1–D3 adalah pola aturan proyek. Hasilnya belum divalidasi sebagai stadium klinis atau konfirmasi penyakit. D4 berarti data yang dimasukkan belum memenuhi satu pun pola aturan.

## 2. Basis pengetahuan

### 2.1 Gejala dan bobot

Enam bobot diadopsi dari Tabel 6 Azzahra dkk. [1], dengan CF pakar dihitung sebagai MB − MD. Enam bobot lainnya dipertahankan dari PRD awal sebagai asumsi tim. Rujukan gejala pada Ahsyar dkk. [2] menggunakan kode yang berbeda. Hubungan pada tabel di bawah dibaca melalui nama gejala dan isi aturan, bukan dengan menyamakan kode.

| ID | Gejala yang ditanyakan | CF | Dasar |
|---|---|---:|---|
| G1 | Ayam tampak lesu | 0,20 | [1] Tabel 6 |
| G2 | Nafsu makan berkurang | 0,20 | [1] Tabel 6 |
| G3 | Bulu tampak kusam atau berdiri | 0,30 | Bobot asumsi tim. [2] Tabel 2 dan R9 memuat bulu kusam |
| G4 | Ayam sesak napas atau megap-megap | 0,20 | [1] Tabel 6 |
| G5 | Ayam bersin-bersin | 0,60 | [1] Tabel 6 |
| G6 | Keluar lendir dari hidung atau paruh | 0,60 | Bobot dan cakupan gejala asumsi tim |
| G7 | Jengger atau pial tampak kebiruan | 0,70 | Bobot dan pemetaan ke Tetelo asumsi tim |
| G8 | Tinja encer berwarna kehijauan | 0,80 | [1] Tabel 6 |
| G9 | Produksi telur menurun atau kerabang telur lunak | 0,60 | Bobot asumsi tim. [2] R9 memuat penurunan produksi telur |
| G10 | Sayap tampak terkulai | 0,80 | Bobot dan pemetaan ke Tetelo asumsi tim |
| G11 | Satu atau kedua kaki tampak lumpuh | 0,85 | Bobot dan pemetaan ke Tetelo asumsi tim |
| G12 | Leher tampak terpuntir | 0,60 | [1] Tabel 6 |

### 2.2 Kategori keluaran

| Kode | Kategori |
|---|---|
| D1 | Pola gejala umum |
| D2 | Pola gejala pernapasan, pencernaan, atau produksi |
| D3 | Pola dengan gejala saraf atau gangguan gerak |
| D4 | Belum ada pola aturan yang terpenuhi |

Untuk D1–D3, program menyarankan mencatat gejala yang diamati dan berkonsultasi dengan dokter hewan. Untuk D4, program menjelaskan bahwa jawaban saat ini belum memenuhi aturan dan gejala yang menetap atau memburuk perlu dibahas dengan dokter hewan.

### 2.3 Aturan IF–THEN

Kombinasi dan bobot 15 aturan merupakan rancangan awal tim. Artikel [1] memberi bobot gejala, sedangkan artikel [2] memberikan contoh aturan Tetelo sebagai satu kategori penyakit. Keduanya belum menyediakan bobot untuk aturan R1–R15 di bawah.

| Aturan | Premis (semua harus Ya) | Kesimpulan | Bobot aturan |
|---|---|---|---:|
| R1 | G1, G2 | D1 | 0,40 |
| R2 | G1, G3 | D1 | 0,40 |
| R3 | G2, G3 | D1 | 0,45 |
| R4 | G1, G2, G3 | D1 | 0,55 |
| R5 | G1, G5 | D1 | 0,50 |
| R6 | G4, G5, G6 | D2 | 0,70 |
| R7 | G4, G8 | D2 | 0,75 |
| R8 | G2, G4, G7 | D2 | 0,75 |
| R9 | G6, G8, G9 | D2 | 0,80 |
| R10 | G4, G7, G8 | D2 | 0,80 |
| R11 | G8, G10 | D3 | 0,85 |
| R12 | G4, G11 | D3 | 0,85 |
| R13 | G8, G11, G12 | D3 | 0,95 |
| R14 | G10, G11, G12 | D3 | 0,95 |
| R15 | G4, G8, G12 | D3 | 0,95 |

## 3. Inferensi dan pemilihan kategori

1. Minta jawaban `y.` atau `t.` untuk setiap gejala dan simpan jawaban selama sesi. Ulangi pertanyaan jika input tidak valid.
2. Uji hipotesis D1–D3 dengan Backward Chaining. Untuk setiap kategori, backtracking Prolog mencoba seluruh aturan yang dapat menyimpulkannya. Aturan terpenuhi jika setiap premis dijawab Ya.
3. Hitung CF tiap aturan yang terpenuhi dengan `min(CF semua gejala pada premis) × bobot aturan`. Operasi minimum untuk premis AND adalah keputusan rancangan proyek.
4. Gabungkan CF seluruh aturan yang terpenuhi **dalam kategori yang sama** dengan `CFbaru = CFakumulasi + CFaturan × (1 − CFakumulasi)`, mulai dari 0. Rumus kombinasi positif mengacu pada [1] bagian III.F dan [2] bagian B.5. Aturan dalam kategori dapat berbagi gejala, sehingga skor bisa dipengaruhi oleh bukti yang tumpang tindih.
5. Pilih kategori dengan **CF gabungan tertinggi**. Jika selisih terhadap skor tertinggi paling besar 0,000001 pada skala 0–1, pakai urutan tetap **D3, D2, D1** di antara kategori yang seri. Urutan ini merupakan keputusan proyek untuk membuat keluaran konsisten. Jika tidak ada aturan yang terpenuhi, tampilkan D4 tanpa skor CF.
6. Tampilkan kategori terpilih, skor CF sebagai persentase dengan dua desimal, ID aturan pendukung untuk kategori terpilih, dan saran tindak lanjut. Persentase merupakan skor model, tanpa interpretasi sebagai peluang klinis.

Contoh saat G4, G8, G11, dan G12 dijawab Ya. D2 mendapat **15,00%** dari R7. D3 mendapat **71,09%** dari gabungan R12 (0,17), R13 (0,57), dan R15 (0,19). Kategori yang ditampilkan adalah **D3**.

## 4. Rancangan implementasi dan penggunaan

Berkas `diagnosa_tetelo.pl` memuat basis pengetahuan, mesin inferensi, dan antarmuka konsol.

| Predikat | Peran |
|---|---|
| `gejala/2` | Menyimpan kode serta struktur berisi pertanyaan dan CF |
| `diagnosis/2` | Menyimpan kode serta struktur berisi label dan saran tindak lanjut |
| `menyebabkan/2` | Menghubungkan kategori dengan struktur berisi ID aturan, premis, dan bobot |
| `tanya_gejala/1` | Memvalidasi jawaban dan menyimpannya sebagai fakta sesi |
| `diagnosa/0` | Mengevaluasi seluruh kategori, memilih hasil, dan mencetak keluaran |
| `mulai/0` | Menghapus fakta sesi lama, meminta jawaban, dan menjalankan diagnosis |

```prolog
?- consult('diagnosa_tetelo.pl').
?- mulai.
```

Contoh keluaran untuk G8, G11, dan G12 = Ya dengan gejala lain = Tidak.

```text
Kategori: D3 — Pola dengan gejala saraf atau gangguan gerak
Skor CF: 57,00%
Aturan pendukung: R13
Tindak lanjut: Catat gejala yang diamati dan konsultasikan dengan dokter hewan.
```

## 5. Pengujian dan kriteria penerimaan

Lakukan pengujian black-box dan walkthrough. Seluruh gejala yang tidak tercantum pada kolom Ya dijawab Tidak. Skor berikut dihitung dari spesifikasi dan akan dibandingkan dengan keluaran aktual setelah implementasi.

| Kasus | Gejala Ya | Seluruh aturan yang terpenuhi | Hasil yang diharapkan |
|---|---|---|---|
| U1 | G1, G2, G3 | R1, R2, R3, R4 | D1, 31,45% |
| U2 | G4, G5, G6 | R6 | D2, 14,00% |
| U3 | G4, G7, G8 | R7, R10 | D2, 28,60% |
| U4 | G8, G11, G12 | R13 | D3, 57,00% |
| U5 | G10, G11, G12 | R14 | D3, 57,00% |
| U6 | G1 saja, lalu ulangi dengan semua jawaban Tidak | — | D4 pada kedua sesi, tanpa skor CF |
| U7 | G4, G8, G11, G12 | R7, R12, R13, R15 | D3, 71,09%. D2 memiliki 15,00% |

Uji juga fungsi pemilihan secara terpisah dengan skor seri untuk memastikan urutan yang ditetapkan berjalan, serta jalankan konsultasi berulang dan masukkan jawaban tidak valid untuk memeriksa perilaku terminal. Catat keluaran aktual dan status lulus/gagal.

Untuk analisis akurasi, siapkan kasus dengan hasil rujukan dari literatur atau penilaian dokter hewan. Laporkan jumlah kecocokan, jumlah kasus, dan hasil yang berbeda. Penilaian kategori D1–D3 memerlukan acuan yang mendefinisikan ketiga pola itu. Jika acuan yang tersedia hanya menilai Tetelo, laporkan kecocokan skrining secara terpisah dan jelaskan keterbatasannya. Jika kasus berlabel belum tersedia, batasi kesimpulan pada hasil uji fungsi dan perhitungan CF.

## 6. Luaran proyek

- Kode sumber `diagnosa_tetelo.pl` yang dapat dijalankan di SWI-Prolog.
- Laporan Bab I–V sesuai template tugas, termasuk diagram arsitektur, penjelasan predikat dan backtracking, tangkapan layar konsol, hasil pengujian, analisis, dan kesimpulan.
- Lampiran A berisi kode lengkap. Lampiran B berisi panduan penggunaan.

## Referensi

[1] Azzahra, D., Kaniawulan, I., & Rezmi, M. G. (2026). *Sistem Pakar Diagnosis Penyakit pada Ayam Menggunakan Metode Certainty Factor Berbasis Website*. JUSTIN, 14(1), 128–135. DOI 10.26418/justin.v14i1.96548. [PDF lokal](<opjustin,+96548-75676780476-1-CE (1).pdf>)

[2] Ahsyar, T. K., Raharjo, T. D., & Syaifullah. (2021). *Sistem Pakar Diagnosa Penyakit pada Ayam dengan Metode Certainty Factor Berbasis Android*. Jurnal Ilmiah Rekayasa dan Manajemen Sistem Informasi, 7(2), 166–172. [PDF lokal](01KDZ5VR1YDY1VDJCDX6DCEA8E.pdf)
