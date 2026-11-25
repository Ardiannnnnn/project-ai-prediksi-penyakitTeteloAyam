/* Pengujian black-box PRD §5 (U1–U7) + uji seri prioritas kategori. */
const UjiTetelo = (function () {
  "use strict";

  const E = typeof globalThis.Engine !== "undefined" ? globalThis.Engine : require("./engine.js");

  function jawabanDari(daftarYa) {
    const j = {};
    for (const g of E.GEJALA) j[g.id] = daftarYa.indexOf(g.id) >= 0 ? "ya" : "tidak";
    return j;
  }

  function persen(cf) {
    return Math.round(cf * 10000) / 100;
  }

  const KASUS = [
    { kode: "U1", ket: "G1, G2, G3", ya: ["g1", "g2", "g3"], harapan: { kategori: "d1", persen: 31.45 } },
    { kode: "U2", ket: "G4, G5, G6", ya: ["g4", "g5", "g6"], harapan: { kategori: "d2", persen: 14.0 } },
    { kode: "U3", ket: "G4, G7, G8", ya: ["g4", "g7", "g8"], harapan: { kategori: "d2", persen: 28.6 } },
    { kode: "U4", ket: "G8, G11, G12", ya: ["g8", "g11", "g12"], harapan: { kategori: "d3", persen: 57.0 } },
    { kode: "U5", ket: "G10, G11, G12", ya: ["g10", "g11", "g12"], harapan: { kategori: "d3", persen: 57.0 } },
    { kode: "U6a", ket: "Hanya G1", ya: ["g1"], harapan: { kategori: "d4", persen: null } },
    { kode: "U6b", ket: "Semua Tidak", ya: [], harapan: { kategori: "d4", persen: null } },
    {
      kode: "U7",
      ket: "G4, G8, G11, G12",
      ya: ["g4", "g8", "g11", "g12"],
      harapan: { kategori: "d3", persen: 71.09 },
      tambahan: function (hasil) {
        const d2 = hasil.semua.find((s) => s.kategori === "d2");
        return d2 && persen(d2.cf) === 15.0;
      },
      tambahanKet: "D2 = 15,00%"
    }
  ];

  const KASUS_SERI = [
    { nama: "Seri D1/D2/D3", masukan: [{ kategori: "d1", cf: 0.5, aturan: [] }, { kategori: "d2", cf: 0.5, aturan: [] }, { kategori: "d3", cf: 0.5, aturan: [] }], harapan: "d3" },
    { nama: "Seri D1/D2", masukan: [{ kategori: "d1", cf: 0.5, aturan: [] }, { kategori: "d2", cf: 0.5, aturan: [] }], harapan: "d2" },
    { nama: "Seri D1/D3", masukan: [{ kategori: "d1", cf: 0.5, aturan: [] }, { kategori: "d3", cf: 0.5, aturan: [] }], harapan: "d3" },
    { nama: "D3 sedikit di bawah D2 (dalam toleransi)", masukan: [{ kategori: "d2", cf: 0.5, aturan: [] }, { kategori: "d3", cf: 0.4999995, aturan: [] }], harapan: "d3" }
  ];

  function jalankan() {
    const hasilUji = [];

    for (const k of KASUS) {
      const hasil = E.diagnosa(jawabanDari(k.ya));
      const persenAktual = hasil.cf === null ? null : persen(hasil.cf);
      const cocokKategori = hasil.kategori === k.harapan.kategori;
      const cocokPersen =
        k.harapan.persen === null ? persenAktual === null : persenAktual === k.harapan.persen;
      const cocokTambahan = k.tambahan ? k.tambahan(hasil) === true : true;
      hasilUji.push({
        kode: k.kode,
        ket: k.ket,
        harapan:
          E.DIAGNOSIS[k.harapan.kategori].kode +
          (k.harapan.persen === null ? ", tanpa skor" : ", " + String(k.harapan.persen).replace(".", ",") + "%") +
          (k.tambahanKet ? " · " + k.tambahanKet : ""),
        aktual:
          E.DIAGNOSIS[hasil.kategori].kode +
          (persenAktual === null ? ", tanpa skor" : ", " + E.formatPersen(hasil.cf) + "%"),
        lulus: cocokKategori && cocokPersen && cocokTambahan
      });
    }

    for (const s of KASUS_SERI) {
      const pilih = E.pilihKategori(s.masukan);
      hasilUji.push({
        kode: "Seri",
        ket: s.nama,
        harapan: E.DIAGNOSIS[s.harapan].kode,
        aktual: E.DIAGNOSIS[pilih.kategori].kode,
        lulus: pilih.kategori === s.harapan
      });
    }

    return hasilUji;
  }

  return { jalankan: jalankan, KASUS: KASUS, KASUS_SERI: KASUS_SERI };
})();

if (typeof module !== "undefined" && module.exports) module.exports = UjiTetelo;
if (typeof globalThis !== "undefined") globalThis.UjiTetelo = UjiTetelo;
