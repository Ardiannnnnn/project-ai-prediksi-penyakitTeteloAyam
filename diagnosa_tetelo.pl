% Sistem pakar sesuai PRD Tugas 2 MMAI1001.
:- encoding(utf8).
:- use_module(library(readutil)).
:- use_module(library(pairs)).
:- dynamic jawaban/2.

gejala(g1, gejala("Ayam tampak lesu?", 0.20)).
gejala(g2, gejala("Nafsu makan berkurang?", 0.20)).
gejala(g3, gejala("Bulu tampak kusam atau berdiri?", 0.30)).
gejala(g4, gejala("Ayam sesak napas atau megap-megap?", 0.20)).
gejala(g5, gejala("Ayam bersin-bersin?", 0.60)).
gejala(g6, gejala("Keluar lendir dari hidung atau paruh?", 0.60)).
gejala(g7, gejala("Jengger atau pial tampak kebiruan?", 0.70)).
gejala(g8, gejala("Tinja encer berwarna kehijauan?", 0.80)).
gejala(g9, gejala("Produksi telur menurun atau kerabang telur lunak?", 0.60)).
gejala(g10, gejala("Sayap tampak terkulai?", 0.80)).
gejala(g11, gejala("Satu atau kedua kaki tampak lumpuh?", 0.85)).
gejala(g12, gejala("Leher tampak terpuntir?", 0.60)).

diagnosis(d1, diagnosis("Pola gejala umum", konsultasi)).
diagnosis(d2, diagnosis("Pola gejala pernapasan, pencernaan, atau produksi", konsultasi)).
diagnosis(d3, diagnosis("Pola dengan gejala saraf atau gangguan gerak", konsultasi)).
diagnosis(d4, diagnosis("Belum ada pola aturan yang terpenuhi", pantau)).

saran(konsultasi, "Catat gejala yang diamati dan konsultasikan dengan dokter hewan.").
saran(pantau, "Jawaban saat ini belum memenuhi aturan. Bahas dengan dokter hewan jika gejala menetap atau memburuk.").

menyebabkan(d1, aturan(r1, [g1, g2], 0.40)).
menyebabkan(d1, aturan(r2, [g1, g3], 0.40)).
menyebabkan(d1, aturan(r3, [g2, g3], 0.45)).
menyebabkan(d1, aturan(r4, [g1, g2, g3], 0.55)).
menyebabkan(d1, aturan(r5, [g1, g5], 0.50)).
menyebabkan(d2, aturan(r6, [g4, g5, g6], 0.70)).
menyebabkan(d2, aturan(r7, [g4, g8], 0.75)).
menyebabkan(d2, aturan(r8, [g2, g4, g7], 0.75)).
menyebabkan(d2, aturan(r9, [g6, g8, g9], 0.80)).
menyebabkan(d2, aturan(r10, [g4, g7, g8], 0.80)).
menyebabkan(d3, aturan(r11, [g8, g10], 0.85)).
menyebabkan(d3, aturan(r12, [g4, g11], 0.85)).
menyebabkan(d3, aturan(r13, [g8, g11, g12], 0.95)).
menyebabkan(d3, aturan(r14, [g10, g11, g12], 0.95)).
menyebabkan(d3, aturan(r15, [g4, g8, g12], 0.95)).

mulai :-
    setup_call_cleanup(
        retractall(jawaban(_, _)),
        catch(konsultasi, akhir_input,
              writeln("Sesi dihentikan karena input berakhir.")),
        retractall(jawaban(_, _))
    ).

konsultasi :-
    writeln("Sistem Pakar Diagnosis Dini Tetelo pada Ayam"),
    writeln("Jawab setiap pertanyaan dengan y. (Ya) atau t. (Tidak)."),
    forall(gejala(Kode, _), tanya_gejala(Kode)),
    diagnosa.

tanya_gejala(Kode) :-
    gejala(Kode, gejala(Pertanyaan, _)),
    baca_jawaban(Pertanyaan, Jawaban),
    assertz(jawaban(Kode, Jawaban)).

baca_jawaban(Pertanyaan, Jawaban) :-
    format("~s (y./t.): ", [Pertanyaan]),
    flush_output,
    read_line_to_string(user_input, Baris),
    (   Baris == end_of_file
    ->  throw(akhir_input)
    ;   normalize_space(string(Input), Baris),
        (   jawaban_input(Input, Jawaban)
        ->  true
        ;   writeln("Input tidak valid. Masukkan y. atau t."),
            baca_jawaban(Pertanyaan, Jawaban)
        )
    ).

jawaban_input("y.", ya).
jawaban_input("t.", tidak).

diagnosa :-
    findall(hasil(Kategori, CF, Aturan),
            skor_kategori(Kategori, CF, Aturan), Hasil),
    pilih_kategori(Hasil, Terpilih),
    cetak_hasil(Terpilih).

skor_kategori(Kategori, CF, Aturan) :-
    prioritas(Kategori),
    findall(Id-CFAturan, skor_aturan(Kategori, Id, CFAturan), Skor),
    Skor = [_|_],
    pairs_keys(Skor, Aturan),
    foldl(gabung_cf, Skor, 0.0, CF).

% Mulai dari hipotesis kategori, lalu buktikan semua premis setiap aturan.
skor_aturan(Kategori, Id, CF) :-
    menyebabkan(Kategori, aturan(Id, Premis, Bobot)),
    maplist(buktikan_gejala, Premis, CFGejala),
    min_list(CFGejala, Minimum),
    CF is Minimum * Bobot.

buktikan_gejala(Kode, CF) :-
    jawaban(Kode, ya),
    gejala(Kode, gejala(_, CF)).

gabung_cf(_-CFAturan, Akumulasi, CF) :-
    CF is Akumulasi + CFAturan * (1 - Akumulasi).

prioritas(d3).
prioritas(d2).
prioritas(d1).

pilih_kategori([], hasil(d4, tanpa_skor, [])).
pilih_kategori([Hasil|Lainnya], Terpilih) :-
    Kandidat = [Hasil|Lainnya],
    findall(CF, member(hasil(_, CF, _), Kandidat), Skor),
    max_list(Skor, Tertinggi),
    once((prioritas(Kategori),
          member(hasil(Kategori, CF, Aturan), Kandidat),
          Tertinggi - CF =< 0.000001)),
    Terpilih = hasil(Kategori, CF, Aturan).

cetak_hasil(hasil(Kategori, CF, Aturan)) :-
    diagnosis(Kategori, diagnosis(Label, JenisSaran)),
    saran(JenisSaran, Saran),
    upcase_atom(Kategori, Kode),
    nl,
    format("Kategori: ~w — ~s~n", [Kode, Label]),
    cetak_skor(CF, Aturan),
    format("Tindak lanjut: ~s~n", [Saran]).

cetak_skor(tanpa_skor, []) :- !.
cetak_skor(CF, Aturan) :-
    Persen is CF * 100,
    format(string(Angka), "~2f", [Persen]),
    split_string(Angka, ".", "", [Bulat, Desimal]),
    maplist(upcase_atom, Aturan, KodeAturan),
    atomic_list_concat(KodeAturan, ', ', Daftar),
    format("Skor CF: ~s,~s%~nAturan pendukung: ~w~n", [Bulat, Desimal, Daftar]).
