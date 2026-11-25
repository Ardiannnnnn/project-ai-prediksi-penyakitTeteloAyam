:- encoding(utf8).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- ensure_loaded('../diagnosa_tetelo.pl').

:- prolog_load_context(directory, Direktori),
   asserta(user:file_search_path(tetelo_web, Direktori)).

:- http_handler(root(.), berkas_web('index.html'), [method(get)]).
:- http_handler(root('app.js'), berkas_web('app.js'), [method(get)]).
:- http_handler(root('style.css'), berkas_web('style.css'), [method(get)]).
:- http_handler(root(api/gejala), daftar_gejala, [method(get)]).
:- http_handler(root(api/diagnosa), diagnosa_web, [method(post)]).

web(Port) :-
    http_server(http_dispatch, [port('127.0.0.1':Port)]),
    format('Web Tetelo tersedia di http://127.0.0.1:~d/~n', [Port]),
    thread_get_message(hentikan_web).

berkas_web(Nama, Request) :-
    http_reply_file(tetelo_web(Nama), [], Request).

daftar_gejala(_) :-
    findall(_{id:Kode, pertanyaan:Teks}, gejala(Kode, gejala(Teks, _)), Gejala),
    reply_json_dict(_{gejala:Gejala}).

diagnosa_web(Request) :-
    (   memberchk(content_length(Ukuran), Request),
        Ukuran =< 4096,
        catch(http_read_json_dict(Request, Data), error(_, _), fail),
        is_dict(Data),
        get_dict(jawaban, Data, Jawaban),
        validasi_jawaban(Jawaban, Fakta)
    ->  setup_call_cleanup(
            retractall(jawaban(_, _)),
            (maplist(assertz, Fakta), hasil_diagnosa(Hasil), hasil_json(Hasil, Json)),
            retractall(jawaban(_, _))
        ),
        reply_json_dict(Json)
    ;   reply_json_dict(_{pesan:"Jawab semua gejala dengan Ya atau Tidak."}, [status(400)])
    ).

validasi_jawaban(Jawaban, Fakta) :-
    is_dict(Jawaban),
    dict_pairs(Jawaban, _, Pasangan),
    findall(Kode, gejala(Kode, _), KodeGejala),
    length(KodeGejala, Jumlah),
    length(Pasangan, Jumlah),
    maplist(jawaban_web(Jawaban), KodeGejala, Fakta).

jawaban_web(Jawaban, Kode, jawaban(Kode, Nilai)) :-
    get_dict(Kode, Jawaban, Teks),
    memberchk(Teks, ["ya", "tidak"]),
    atom_string(Nilai, Teks).

hasil_json(hasil(Kategori, CF, Aturan), Json) :-
    diagnosis(Kategori, diagnosis(Label, JenisSaran)),
    saran(JenisSaran, Saran),
    (CF == tanpa_skor -> Skor = null ; Skor = CF),
    maplist(rincian_aturan(Kategori), Aturan, Rincian),
    Json = _{kategori:Kategori, label:Label, skor:Skor, saran:Saran, aturan:Rincian}.

rincian_aturan(Kategori, Id, Rincian) :-
    menyebabkan(Kategori, aturan(Id, Premis, Bobot)),
    maplist(rincian_gejala, Premis, Gejala, BobotGejala),
    min_list(BobotGejala, Minimum),
    skor_aturan(Kategori, Id, CF),
    Rincian = _{id:Id, gejala:Gejala, minimum:Minimum, bobot:Bobot, skor:CF}.

rincian_gejala(Kode, _{id:Kode, pertanyaan:Teks}, Bobot) :-
    gejala(Kode, gejala(Teks, Bobot)).
