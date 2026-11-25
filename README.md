# project-ai-prediksi-penyakitTeteloAyam

## Web lokal

Jalankan dari folder proyek dengan SWI-Prolog terpasang.

```sh
swipl -q -s web/server.pl -g 'web(8080)' -t halt
```

Buka http://127.0.0.1:8080/. Pilih Ya atau Tidak pada setiap gejala, lalu tekan
**Lihat hasil**. Jika ada aturan yang terpenuhi, buka **Lihat perhitungan aturan**
untuk melihat gejala pendukung, bobot, dan skor per aturan. Tekan Ctrl+C di
terminal untuk menghentikan server.

## Konsol Prolog

```sh
swipl -s diagnosa_tetelo.pl
```

Ketik `mulai.` pada prompt Prolog. Versi konsol dan web menggunakan basis
pengetahuan, pemilihan kategori, dan rumus CF yang sama.
