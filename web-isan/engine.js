/* Mesin inferensi — port 1:1 dari diagnosa_tetelo.pl (Backward Chaining + Certainty Factor). */
const Engine = (function () {
  "use strict";

  const GEJALA = [
    { id: "g1", kode: "G1", tanya: "Ayam tampak lesu?", cf: 0.2, dasar: "[1] Tabel 6" },
    { id: "g2", kode: "G2", tanya: "Nafsu makan berkurang?", cf: 0.2, dasar: "[1] Tabel 6" },
    { id: "g3", kode: "G3", tanya: "Bulu tampak kusam atau berdiri?", cf: 0.3, dasar: "Bobot asumsi tim. [2] Tabel 2 dan R9 memuat bulu kusam" },
    { id: "g4", kode: "G4", tanya: "Ayam sesak napas atau megap-megap?", cf: 0.2, dasar: "[1] Tabel 6" },
    { id: "g5", kode: "G5", tanya: "Ayam bersin-bersin?", cf: 0.6, dasar: "[1] Tabel 6" },
    { id: "g6", kode: "G6", tanya: "Keluar lendir dari hidung atau paruh?", cf: 0.6, dasar: "Bobot dan cakupan gejala asumsi tim" },
    { id: "g7", kode: "G7", tanya: "Jengger atau pial tampak kebiruan?", cf: 0.7, dasar: "Bobot dan pemetaan ke Tetelo asumsi tim" },
    { id: "g8", kode: "G8", tanya: "Tinja encer berwarna kehijauan?", cf: 0.8, dasar: "[1] Tabel 6" },
    { id: "g9", kode: "G9", tanya: "Produksi telur menurun atau kerabang telur lunak?", cf: 0.6, dasar: "Bobot asumsi tim. [2] R9 memuat penurunan produksi telur" },
    { id: "g10", kode: "G10", tanya: "Sayap tampak terkulai?", cf: 0.8, dasar: "Bobot dan pemetaan ke Tetelo asumsi tim" },
    { id: "g11", kode: "G11", tanya: "Satu atau kedua kaki tampak lumpuh?", cf: 0.85, dasar: "Bobot dan pemetaan ke Tetelo asumsi tim" },
    { id: "g12", kode: "G12", tanya: "Leher tampak terpuntir?", cf: 0.6, dasar: "[1] Tabel 6" }
  ];

  const DIAGNOSIS = {
    d1: { kode: "D1", label: "Pola gejala umum", saran: "konsultasi" },
    d2: { kode: "D2", label: "Pola gejala pernapasan, pencernaan, atau produksi", saran: "konsultasi" },
    d3: { kode: "D3", label: "Pola dengan gejala saraf atau gangguan gerak", saran: "konsultasi" },
    d4: { kode: "D4", label: "Belum ada pola aturan yang terpenuhi", saran: "pantau" }
  };

  const SARAN = {
    konsultasi: "Catat gejala yang diamati dan konsultasikan dengan dokter hewan.",
    pantau: "Jawaban saat ini belum memenuhi aturan. Bahas dengan dokter hewan jika gejala menetap atau memburuk."
  };

  const ATURAN = [
    { id: "r1", kode: "R1", kategori: "d1", premis: ["g1", "g2"], bobot: 0.4 },
    { id: "r2", kode: "R2", kategori: "d1", premis: ["g1", "g3"], bobot: 0.4 },
    { id: "r3", kode: "R3", kategori: "d1", premis: ["g2", "g3"], bobot: 0.45 },
    { id: "r4", kode: "R4", kategori: "d1", premis: ["g1", "g2", "g3"], bobot: 0.55 },
    { id: "r5", kode: "R5", kategori: "d1", premis: ["g1", "g5"], bobot: 0.5 },
    { id: "r6", kode: "R6", kategori: "d2", premis: ["g4", "g5", "g6"], bobot: 0.7 },
    { id: "r7", kode: "R7", kategori: "d2", premis: ["g4", "g8"], bobot: 0.75 },
    { id: "r8", kode: "R8", kategori: "d2", premis: ["g2", "g4", "g7"], bobot: 0.75 },
    { id: "r9", kode: "R9", kategori: "d2", premis: ["g6", "g8", "g9"], bobot: 0.8 },
    { id: "r10", kode: "R10", kategori: "d2", premis: ["g4", "g7", "g8"], bobot: 0.8 },
    { id: "r11", kode: "R11", kategori: "d3", premis: ["g8", "g10"], bobot: 0.85 },
    { id: "r12", kode: "R12", kategori: "d3", premis: ["g4", "g11"], bobot: 0.85 },
    { id: "r13", kode: "R13", kategori: "d3", premis: ["g8", "g11", "g12"], bobot: 0.95 },
    { id: "r14", kode: "R14", kategori: "d3", premis: ["g10", "g11", "g12"], bobot: 0.95 },
    { id: "r15", kode: "R15", kategori: "d3", premis: ["g4", "g8", "g12"], bobot: 0.95 }
  ];

  const PRIORITAS = ["d3", "d2", "d1"];

  function kodeGejala(id) {
    const g = GEJALA.find((x) => x.id === id);
    return g ? g.kode : id;
  }

  function skorAturan(jawaban, aturan) {
    let min = Infinity;
    for (const id of aturan.premis) {
      if (jawaban[id] !== "ya") return null;
      const g = GEJALA.find((x) => x.id === id);
      if (!g) return null;
      if (g.cf < min) min = g.cf;
    }
    return min * aturan.bobot;
  }

  function skorKategori(jawaban, kategori) {
    const terpenuhi = [];
    for (const r of ATURAN) {
      if (r.kategori !== kategori) continue;
      const cf = skorAturan(jawaban, r);
      if (cf !== null) terpenuhi.push({ id: r.id, kode: r.kode, cf: cf });
    }
    if (terpenuhi.length === 0) return null;
    let akum = 0;
    for (const t of terpenuhi) akum = akum + t.cf * (1 - akum);
    return { kategori: kategori, cf: akum, aturan: terpenuhi.map((t) => t.kode) };
  }

  function pilihKategori(hasil) {
    if (!hasil || hasil.length === 0) {
      return { kategori: "d4", cf: null, aturan: [] };
    }
    let tertinggi = -Infinity;
    for (const h of hasil) if (h.cf > tertinggi) tertinggi = h.cf;
    for (const k of PRIORITAS) {
      const cocok = hasil.find((h) => h.kategori === k && tertinggi - h.cf <= 0.000001);
      if (cocok) return cocok;
    }
    return hasil[0];
  }

  function diagnosa(jawaban) {
    const hasil = [];
    for (const k of PRIORITAS) {
      const s = skorKategori(jawaban, k);
      if (s) hasil.push(s);
    }
    const pilih = pilihKategori(hasil);
    return { kategori: pilih.kategori, cf: pilih.cf, aturan: pilih.aturan || [], semua: hasil };
  }

  function formatPersen(cf) {
    if (cf === null || cf === undefined) return "—";
    return (cf * 100).toFixed(2).replace(".", ",");
  }

  return {
    GEJALA: GEJALA,
    ATURAN: ATURAN,
    DIAGNOSIS: DIAGNOSIS,
    SARAN: SARAN,
    PRIORITAS: PRIORITAS,
    kodeGejala: kodeGejala,
    skorAturan: skorAturan,
    skorKategori: skorKategori,
    pilihKategori: pilihKategori,
    diagnosa: diagnosa,
    formatPersen: formatPersen
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Engine;
if (typeof globalThis !== "undefined") globalThis.Engine = Engine;
