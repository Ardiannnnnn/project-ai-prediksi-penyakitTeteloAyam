/* Antarmuka konsultasi — Pakar Tetelo */
(function () {
  "use strict";

  const E = Engine;
  const alur = document.getElementById("alur");
  const KUNCI = "tetelo.riwayat.v1";

  const state = {
    tab: "konsultasi",
    tampilan: "sapaan",
    langkah: 0,
    jawaban: {},
    hasil: null,
    arah: "depan",
    tersimpan: false
  };

  /* ---------- ikon ---------- */
  const IK = {
    cek: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    silang: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    panah: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    simpan: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    ulang: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    jam: '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    rumah: '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  };

  const AYAM_SVG = `
  <svg class="ayam-besar" viewBox="0 0 240 240" role="img" aria-label="Ilustrasi ayam">
    <ellipse cx="120" cy="214" rx="72" ry="12" fill="rgba(0,0,0,.18)"/>
    <path d="M52 128 C22 108 20 76 34 54 C48 76 60 88 76 96 Z" fill="#0f7a38"/>
    <path d="M58 138 C26 130 14 104 18 80 C38 96 56 106 74 112 Z" fill="#15803d"/>
    <ellipse cx="118" cy="146" rx="70" ry="58" fill="#fbbf24"/>
    <ellipse cx="112" cy="150" rx="44" ry="38" fill="#f59e0b" opacity=".85"/>
    <circle cx="146" cy="74" r="38" fill="#fff"/>
    <path d="M132 44 c2-14 14-16 17-4 c8-10 20-2 16 10" fill="#f43f5e"/>
    <path d="M182 70 l30 10 -30 12 z" fill="#f59e0b"/>
    <path d="M172 94 c10 8 6 20-4 22 c2-8 2-14 4-22 z" fill="#f43f5e"/>
    <circle cx="156" cy="66" r="6" fill="#14231c"/>
    <circle cx="158" cy="64" r="2" fill="#fff"/>
    <path d="M96 196 v26 M132 196 v26" stroke="#f59e0b" stroke-width="9" stroke-linecap="round"/>
    <path d="M84 224 h24 M120 224 h24" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="104" cy="140" rx="26" ry="20" fill="#fde68a" opacity=".7"/>
  </svg>`;

  /* ---------- util ---------- */
  function toast(pesan) {
    const t = document.getElementById("toast");
    t.textContent = pesan;
    t.classList.add("tampil");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => t.classList.remove("tampil"), 2600);
  }

  function muatRiwayat() {
    try { return JSON.parse(localStorage.getItem(KUNCI)) || []; } catch (e) { return []; }
  }
  function simpanRiwayat(list) {
    try { localStorage.setItem(KUNCI, JSON.stringify(list)); } catch (e) { /* penuh/di-block */ }
  }

  function formatWaktu(iso) {
    try {
      return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) { return iso; }
  }

  function hitungAngka(el, target, durasi) {
    const mulai = performance.now();
    function frame(t) {
      const p = Math.min(1, (t - mulai) / durasi);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(2).replace(".", ",");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- konfeti ---------- */
  function ledakanKonfeti() {
    const c = document.getElementById("konfeti");
    const ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const warna = ["#16a34a", "#fbbf24", "#f59e0b", "#34d399", "#f43f5e", "#0ea5e9", "#ffffff"];
    const parts = [];
    for (let i = 0; i < 110; i++) {
      parts.push({
        x: c.width * (0.2 + Math.random() * 0.6),
        y: -30 - Math.random() * c.height * 0.35,
        vx: (Math.random() - 0.5) * 5,
        vy: 2 + Math.random() * 4,
        w: 6 + Math.random() * 7,
        h: 9 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        warna: warna[i % warna.length]
      });
    }
    const t0 = performance.now();
    function step(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.vx *= 0.995; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.warna;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      const masih = parts.some((p) => p.y < c.height + 40);
      if (masih && t - t0 < 5000) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, c.width, c.height);
    }
    requestAnimationFrame(step);
  }

  /* ---------- template ---------- */
  function tplSapaan() {
    return `
    <div class="hero masuk">
      <div>
        <span class="pill">Sistem Pakar · Screening Dini</span>
        <h1>Diagnosis Dini <span class="kilau">Penyakit Tetelo</span> pada Ayam</h1>
        <p>Jawab 12 pertanyaan pengamatan tentang kondisi ayam Anda. Mesin <strong>Backward Chaining</strong> dan <strong>Certainty Factor</strong> akan menilai 15 aturan IF–THEN lalu menampilkan pola gejala beserta skor keyakinannya.</p>
        <div class="chips">
          <span class="chip">12 gejala</span>
          <span class="chip">15 aturan IF–THEN</span>
          <span class="chip">Skor CF 0–100%</span>
          <span class="chip">4 kategori keluaran</span>
        </div>
        <div class="hero-aksi">
          <button class="tombol tombol-hero" type="button" data-aksi="mulai">
            Mulai Konsultasi ${IK.panah}
          </button>
          <span class="petunjuk-ki">atau tekan <kbd>Enter</kbd></span>
        </div>
      </div>
      <div class="hero-gambar">${AYAM_SVG}</div>
    </div>
    <p class="disclaimer masuk" style="--delay:.15s">Hasil bersifat skrining awal dan belum divalidasi sebagai stadium klinis. Selalu konsultasikan dengan dokter hewan.</p>`;
  }

  function tplTanya() {
    const g = E.GEJALA[state.langkah];
    const total = E.GEJALA.length;
    const sudah = Object.keys(state.jawaban).length;
    const persen = Math.round((state.langkah / total) * 100);

    let titik = "";
    for (let i = 0; i < total; i++) {
      const kelas = i === state.langkah ? "aktif" : state.jawaban[E.GEJALA[i].id] ? "selesai" : "";
      titik += `<span class="${kelas}"></span>`;
    }

    return `
    <div class="wizard">
      <div class="atas-wizard">
        <span class="langkah-teks">Pertanyaan <b>${state.langkah + 1}</b> dari ${total}</span>
        <span class="langkah-teks">${persen}% selesai</span>
      </div>
      <div class="progres"><div class="progres-isi" style="width:${persen}%"></div></div>
      <div class="titik">${titik}</div>

      <div class="kartu-tanya">
        <span class="kode-gejala">${g.kode}</span>
        <p class="pertanyaan">${g.tanya}</p>
        <span class="bobot-kecil">Bobot CF gejala ini: ${String(g.cf.toFixed(2)).replace(".", ",")}</span>
        <div class="pilihan">
          <button class="tombol-jwb jwb-ya" type="button" data-aksi="ya">${IK.cek} Ya</button>
          <button class="tombol-jwb jwb-tidak" type="button" data-aksi="tidak">${IK.silang} Tidak</button>
        </div>
      </div>

      <div class="bawah-wizard">
        <button class="tombol tombol-hantu" type="button" data-aksi="kembali">${IK.panah} Kembali</button>
        <span class="hint-ki">Tekan <kbd>Y</kbd> / <kbd>T</kbd> untuk memilih</span>
      </div>
    </div>`;
  }

  function tplRekap() {
    let baris = "";
    let ya = 0, tidak = 0;
    E.GEJALA.forEach((g, i) => {
      const j = state.jawaban[g.id];
      if (j === "ya") ya++; else tidak++;
      baris += `
        <button class="baris-rekap" type="button" style="--i:${i}" data-ubah="${g.id}" aria-label="Ubah jawaban ${g.kode}">
          <span class="baris-kode">${g.kode}</span>
          <span class="baris-teks">${g.tanya}</span>
          <span class="badge-jwb ${j === "ya" ? "ya" : "tidak"}">${j === "ya" ? "Ya" : "Tidak"}</span>
        </button>`;
    });

    return `
    <div class="wizard">
      <div class="judul-kecil masuk">
        <h2>Rekap Jawaban</h2>
        <p>Klik baris mana pun untuk mengubah jawaban sebelum diagnosis dihitung.</p>
      </div>
      <div class="rekap-ringkas masuk" style="--delay:.05s">
        <span class="badge-ringkas ya" id="jumlah-ya">${ya} Ya</span>
        <span class="badge-ringkas tidak" id="jumlah-tidak">${tidak} Tidak</span>
        <span class="badge-ringkas">12 gejala terjawab</span>
      </div>
      <div class="daftar-rekap">${baris}</div>
      <div class="aksi-rekap">
        <button class="tombol tombol-primer" type="button" data-aksi="hitung">
          Hitung Diagnosis ${IK.panah}
        </button>
        <button class="tombol tombol-putih" type="button" data-aksi="ulang">${IK.ulang} Mulai ulang</button>
      </div>
      <p class="disclaimer">Tekan <strong>Enter</strong> untuk langsung menghitung.</p>
    </div>`;
  }

  function tplHasil() {
    const h = state.hasil;
    const info = E.DIAGNOSIS[h.kategori];
    const saran = E.SARAN[info.saran];
    const adaSkor = h.cf !== null;

    let visual, baris = "";
    if (adaSkor) {
      const C = 414.69;
      const offset = C * (1 - h.cf);
      visual = `
        <div class="cincin-bungkus">
          <svg class="cincin" viewBox="0 0 160 160">
            <circle class="cincin-jalur" cx="80" cy="80" r="66"></circle>
            <circle class="cincin-isi" id="cincin-isi" cx="80" cy="80" r="66" data-offset="${offset}"></circle>
          </svg>
          <div class="cincin-tengah">
            <span class="angka-cf"><span id="angka-cf">0,00</span><small>%</small></span>
            <span class="label-cf">Skor CF</span>
          </div>
        </div>`;
      for (const k of ["d1", "d2", "d3"]) {
        const s = h.semua.find((x) => x.kategori === k);
        const cf = s ? s.cf : 0;
        const persen = cf * 100;
        baris += `
          <div class="bar-baris">
            <span>${E.DIAGNOSIS[k].kode}</span>
            <span class="bar-jalur"><span class="bar-isi" data-lebar="${persen}"></span></span>
            <span class="bar-nilai">${E.formatPersen(cf)}%</span>
          </div>`;
      }
    } else {
      visual = `
        <div class="cincin-kosong">
          <div>
            <span class="kode-hasil" style="font-size:34px">D4</span>
            <span class="label-cf">Tanpa skor CF</span>
          </div>
        </div>`;
    }

    const chips = h.aturan.map((r, i) => `<span class="chip-aturan" style="--i:${i}" title="Aturan pendukung">${r}</span>`).join("");
    const aturanBlok = adaSkor && h.aturan.length
      ? `<div class="kartu-bawah masuk" style="--delay:.2s">
           <div class="kartu-judul"><h3>Aturan pendukung</h3><span class="tag">${h.aturan.length} aturan terpenuhi</span></div>
           <div class="aturan-chips">${chips}</div>
           <p class="catatan-model">Persentase merupakan skor model, tanpa interpretasi sebagai peluang klinis.</p>
         </div>`
      : `<div class="kartu-bawah masuk" style="--delay:.2s">
           <div class="kartu-judul"><h3>Aturan pendukung</h3></div>
           <p class="teks-lembut" style="margin:0">Tidak ada aturan yang terpenuhi untuk jawaban saat ini. Ubah rekap jawaban atau konsultasikan gejala yang menetap kepada dokter hewan.</p>
         </div>`;

    const tombolSimpan = state.tersimpan
      ? `<button class="tombol tombol-putih" type="button" disabled>${IK.cek} Tersimpan</button>`
      : `<button class="tombol tombol-emas" type="button" data-aksi="simpan">${IK.simpan} Simpan ke Riwayat</button>`;

    return `
    <div class="wizard" style="max-width:820px">
      <div class="hasil-hero ${h.kategori}">
        ${visual}
        <div>
          <span class="pill">Hasil Diagnosis</span>
          <div class="kode-hasil">${info.kode}</div>
          <div class="label-hasil">${info.label}</div>
          <div class="saran-box">${IK.info}<span>${saran}</span></div>
          ${adaSkor ? `<div class="bar-kategori" id="bar-kategori">${baris}</div>` : ""}
        </div>
      </div>

      ${aturanBlok}

      <div class="aksi-hasil">
        <button class="tombol tombol-primer" type="button" data-aksi="ulang">${IK.ulang} Konsultasi baru</button>
        ${tombolSimpan}
        <button class="tombol tombol-putih" type="button" data-aksi="lihat-riwayat">Lihat riwayat</button>
      </div>
      <p class="disclaimer">Bukan pengganti pemeriksaan dokter hewan. Jika gejala menetap atau memburuk, segera cari bantuan profesional.</p>
    </div>`;
  }

  /* ---------- render ---------- */
  function render() {
    let html = "";
    if (state.tampilan === "sapaan") html = tplSapaan();
    else if (state.tampilan === "tanya") html = tplTanya();
    else if (state.tampilan === "rekap") html = tplRekap();
    else html = tplHasil();

    alur.innerHTML = html;
    alur.classList.remove("depan", "belakang");
    void alur.offsetWidth;
    alur.classList.add(state.arah === "belakang" ? "belakang" : "depan");
    pascaRender();
  }

  function pascaRender() {
    if (state.tampilan !== "hasil" || !state.hasil || state.hasil.cf === null) return;

    const cincin = document.getElementById("cincin-isi");
    const angka = document.getElementById("angka-cf");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cincin) cincin.style.strokeDashoffset = cincin.dataset.offset;
        if (angka) hitungAngka(angka, state.hasil.cf * 100, 1400);
        document.querySelectorAll(".bar-isi").forEach((b, i) => {
          setTimeout(() => { b.style.width = b.dataset.lebar + "%"; }, 250 + i * 120);
        });
      });
    });
    ledakanKonfeti();
  }

  /* ---------- aksi alur ---------- */
  function ganti(tampilan, arah) {
    state.tampilan = tampilan;
    if (arah) state.arah = arah;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function jawab(j) {
    const g = E.GEJALA[state.langkah];
    state.jawaban[g.id] = j;
    state.tersimpan = false;
    if (state.langkah < E.GEJALA.length - 1) {
      state.langkah++;
      state.arah = "depan";
      render();
    } else {
      ganti("rekap", "depan");
    }
  }

  function kembali() {
    if (state.langkah > 0) {
      state.langkah--;
      state.arah = "belakang";
      render();
    } else {
      ganti("sapaan", "belakang");
    }
  }

  function reset() {
    state.langkah = 0;
    state.jawaban = {};
    state.hasil = null;
    state.tersimpan = false;
    ganti("sapaan", "belakang");
  }

  function hitungDiagnosis() {
    state.hasil = E.diagnosa(state.jawaban);
    state.tersimpan = false;
    ganti("hasil", "depan");
  }

  function simpanHasil() {
    const list = muatRiwayat();
    list.unshift({
      id: Date.now(),
      waktu: new Date().toISOString(),
      jawaban: Object.assign({}, state.jawaban),
      hasil: { kategori: state.hasil.kategori, cf: state.hasil.cf, aturan: state.hasil.aturan.slice() }
    });
    simpanRiwayat(list.slice(0, 50));
    state.tersimpan = true;
    render();
    perbaruiLencana();
    renderRiwayat();
    toast("Konsultasi tersimpan ke riwayat");
  }

  alur.addEventListener("click", (ev) => {
    const tgt = ev.target.closest("[data-aksi], [data-ubah]");
    if (!tgt) return;

    if (tgt.dataset.ubah) {
      const id = tgt.dataset.ubah;
      state.jawaban[id] = state.jawaban[id] === "ya" ? "tidak" : "ya";
      state.tersimpan = false;
      const badge = tgt.querySelector(".badge-jwb");
      const j = state.jawaban[id];
      badge.textContent = j === "ya" ? "Ya" : "Tidak";
      badge.className = "badge-jwb " + (j === "ya" ? "ya" : "tidak") + " goyang";
      setTimeout(() => badge.classList.remove("goyang"), 450);
      perbaruiRingkasRekap();
      return;
    }

    switch (tgt.dataset.aksi) {
      case "mulai":
        state.langkah = 0; state.jawaban = {}; state.hasil = null; state.tersimpan = false;
        ganti("tanya", "depan");
        break;
      case "ya": jawab("ya"); break;
      case "tidak": jawab("tidak"); break;
      case "kembali": kembali(); break;
      case "hitung": hitungDiagnosis(); break;
      case "ulang": reset(); break;
      case "simpan": simpanHasil(); break;
      case "lihat-riwayat": pindahTab("riwayat"); break;
    }
  });

  function perbaruiRingkasRekap() {
    let ya = 0;
    for (const g of E.GEJALA) if (state.jawaban[g.id] === "ya") ya++;
    const elYa = document.getElementById("jumlah-ya");
    const elTidak = document.getElementById("jumlah-tidak");
    if (elYa) elYa.textContent = ya + " Ya";
    if (elTidak) elTidak.textContent = E.GEJALA.length - ya + " Tidak";
  }

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", (ev) => {
    if (state.tab !== "konsultasi") return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const t = ev.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (t && t.tagName === "BUTTON" && (ev.key === "Enter" || ev.key === " ")) return;

    if (state.tampilan === "tanya") {
      if (ev.key === "y" || ev.key === "Y" || ev.key === "1") { ev.preventDefault(); jawab("ya"); }
      else if (ev.key === "t" || ev.key === "T" || ev.key === "2") { ev.preventDefault(); jawab("tidak"); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); kembali(); }
    } else if (state.tampilan === "rekap" && ev.key === "Enter") {
      ev.preventDefault(); hitungDiagnosis();
    } else if (state.tampilan === "sapaan" && ev.key === "Enter") {
      ev.preventDefault();
      state.langkah = 0; state.jawaban = {}; state.hasil = null;
      ganti("tanya", "depan");
    }
  });

  /* ---------- tab ---------- */
  const tombolTab = Array.from(document.querySelectorAll(".tab-tombol"));
  const indikator = document.querySelector(".tab-indikator");

  function posisiIndikator() {
    const aktif = document.querySelector(".tab-tombol.aktif");
    if (!aktif || !indikator) return;
    indikator.style.left = aktif.offsetLeft + "px";
    indikator.style.width = aktif.offsetWidth + "px";
  }

  function pindahTab(nama) {
    state.tab = nama;
    tombolTab.forEach((b) => {
      const aktif = b.dataset.tab === nama;
      b.classList.toggle("aktif", aktif);
      b.setAttribute("aria-selected", aktif ? "true" : "false");
    });
    document.querySelectorAll(".panel").forEach((p) => {
      const aktif = p.id === "panel-" + nama;
      p.classList.toggle("aktif", aktif);
      p.hidden = !aktif;
    });
    posisiIndikator();
    if (nama === "riwayat") renderRiwayat();
    if (nama === "basis") renderTabel();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tombolTab.forEach((b) => b.addEventListener("click", () => pindahTab(b.dataset.tab)));
  window.addEventListener("resize", posisiIndikator);

  /* ---------- basis pengetahuan ---------- */
  let tabelSiap = false;
  function renderTabel() {
    if (tabelSiap) return;
    tabelSiap = true;

    const tg = document.getElementById("tabel-gejala");
    tg.innerHTML = E.GEJALA.map((g, i) => `
      <tr style="--i:${i}">
        <td class="td-id">${g.kode}</td>
        <td>${g.tanya}</td>
        <td class="kanan td-bobot">${g.cf.toFixed(2).replace(".", ",")}</td>
        <td class="huruf-kecil">${g.dasar}</td>
      </tr>`).join("");

    const ta = document.getElementById("tabel-aturan");
    ta.innerHTML = E.ATURAN.map((r, i) => `
      <tr style="--i:${i}">
        <td class="td-id">${r.kode}</td>
        <td>${r.premis.map(E.kodeGejala).join(", ")}</td>
        <td><span class="tag">${E.DIAGNOSIS[r.kategori].kode}</span> <span class="huruf-kecil">${E.DIAGNOSIS[r.kategori].label}</span></td>
        <td class="kanan td-bobot">${r.bobot.toFixed(2).replace(".", ",")}</td>
      </tr>`).join("");
  }

  document.getElementById("tombol-uji").addEventListener("click", () => {
    const hasil = UjiTetelo.jalankan();
    const lulus = hasil.filter((h) => h.lulus).length;
    const semua = lulus === hasil.length;

    document.getElementById("tabel-uji").innerHTML = hasil.map((h, i) => `
      <tr style="--i:${i}">
        <td class="td-id">${h.kode}</td>
        <td>${h.ket}</td>
        <td>${h.harapan}</td>
        <td>${h.aktual}</td>
        <td><span class="${h.lulus ? "status-lulus" : "status-gagal"}">${h.lulus ? "LULUS" : "GAGAL"}</span></td>
      </tr>`).join("");

    const wrap = document.getElementById("hasil-uji");
    wrap.hidden = false;
    wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const ring = document.getElementById("ringkasan-uji");
    ring.textContent = `${lulus}/${hasil.length} kasus ${semua ? "lulus" : "gagal"}`;
    ring.className = "ringkasan-uji " + (semua ? "ok" : "gagal");
    if (semua) toast("Semua pengujian lulus — mesin web identik dengan spesifikasi");
  });

  /* ---------- riwayat ---------- */
  function perbaruiLencana() {
    const n = muatRiwayat().length;
    const lencana = document.getElementById("jumlah-riwayat");
    lencana.hidden = n === 0;
    lencana.textContent = n;
    document.getElementById("hapus-semua").hidden = n === 0;
    posisiIndikator();
  }

  function renderRiwayat() {
    const list = muatRiwayat();
    const wrap = document.getElementById("daftar-riwayat");
    perbaruiLencana();

    if (list.length === 0) {
      wrap.innerHTML = `
        <div class="kosong masuk">
          ${IK.rumah}
          <h3>Belum ada riwayat</h3>
          <p>Selesaikan satu sesi konsultasi lalu simpan hasilnya untuk melihatnya di sini.</p>
          <button class="tombol tombol-primer" type="button" id="dari-kosong">Mulai konsultasi</button>
        </div>`;
      const b = document.getElementById("dari-kosong");
      if (b) b.addEventListener("click", () => { pindahTab("konsultasi"); reset(); });
      return;
    }

    wrap.innerHTML = `<div class="daftar-riwayat">` + list.map((r, i) => {
      const info = E.DIAGNOSIS[r.hasil.kategori];
      const ya = E.GEJALA.filter((g) => r.jawaban[g.id] === "ya");
      const chips = ya.length
        ? ya.map((g) => `<span class="mini-chip">${g.kode}</span>`).join("")
        : `<span class="mini-chip kosong-chip">Tidak ada gejala Ya</span>`;
      return `
        <div class="kartu-riwayat" style="--i:${i}">
          <div class="riwayat-atas">
            <span class="lencana-hasil ${r.hasil.kategori}">${info.kode}</span>
            <span class="riwayat-cf">${r.hasil.cf === null ? "—" : E.formatPersen(r.hasil.cf) + "%"}</span>
          </div>
          <span class="riwayat-waktu">${formatWaktu(r.waktu)}</span>
          <span class="riwayat-label">${info.label}</span>
          <div class="riwayat-gejala">${chips}</div>
          <div class="riwayat-aksi">
            <button class="tombol tombol-primer" type="button" data-muat="${r.id}">Muat</button>
            <button class="tombol tombol-merah" type="button" data-hapus="${r.id}">Hapus</button>
          </div>
        </div>`;
    }).join("") + `</div>`;
  }

  document.getElementById("daftar-riwayat").addEventListener("click", (ev) => {
    const muat = ev.target.closest("[data-muat]");
    const hapus = ev.target.closest("[data-hapus]");

    if (muat) {
      const r = muatRiwayat().find((x) => String(x.id) === muat.dataset.muat);
      if (!r) return;
      state.jawaban = Object.assign({}, r.jawaban);
      state.hasil = E.diagnosa(state.jawaban);
      state.langkah = 0;
      state.tersimpan = true;
      pindahTab("konsultasi");
      ganti("hasil", "depan");
      toast("Riwayat dimuat kembali");
    }

    if (hapus) {
      if (hapus.dataset.konfirm !== "1") {
        hapus.dataset.konfirm = "1";
        hapus.textContent = "Yakin?";
        setTimeout(() => {
          if (hapus.isConnected) { hapus.dataset.konfirm = "0"; hapus.textContent = "Hapus"; }
        }, 2600);
        return;
      }
      const sisa = muatRiwayat().filter((x) => String(x.id) !== hapus.dataset.hapus);
      simpanRiwayat(sisa);
      renderRiwayat();
      toast("Riwayat dihapus");
    }
  });

  document.getElementById("hapus-semua").addEventListener("click", (ev) => {
    const b = ev.currentTarget;
    if (b.dataset.konfirm !== "1") {
      b.dataset.konfirm = "1";
      b.textContent = "Yakin? Klik lagi";
      setTimeout(() => {
        if (b.isConnected) { b.dataset.konfirm = "0"; b.textContent = "Hapus semua"; }
      }, 3000);
      return;
    }
    simpanRiwayat([]);
    renderRiwayat();
    toast("Semua riwayat dihapus");
  });

  /* ---------- init ---------- */
  render();
  renderTabel();
  perbaruiLencana();
  requestAnimationFrame(posisiIndikator);
  setTimeout(posisiIndikator, 350);
})();
