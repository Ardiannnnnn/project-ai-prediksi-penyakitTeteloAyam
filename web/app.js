const form = document.querySelector('#form');
const list = document.querySelector('#soal');
const status = document.querySelector('#status');
const summary = document.querySelector('#ringkasan');
const title = document.querySelector('#judul-hasil');
const retry = document.querySelector('#retry');
const submit = form.querySelector('[type=submit]');
const reset = document.querySelector('#hapus-jawaban');
const percent = new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 2 });
const decimal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 });
let total = 0;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('Permintaan gagal');
  return response.json();
}

function question({ id, pertanyaan }) {
  const row = element('fieldset');
  const legend = element('legend');
  legend.append(element('span', id.toUpperCase(), 'code'), pertanyaan);
  const options = element('div', undefined, 'options');
  for (const [value, text] of [['ya', 'Ya'], ['tidak', 'Tidak']]) {
    const label = element('label');
    const input = element('input');
    Object.assign(input, { type: 'radio', name: id, value, id: id + '-' + value, required: true });
    label.htmlFor = input.id;
    label.append(input, text);
    options.append(label);
  }
  row.append(legend, options);
  return row;
}

function showProgress() {
  const answered = Array.from(new FormData(form).keys()).length;
  status.textContent = `${answered} dari ${total} gejala dijawab.`;
}

function emptyResult() {
  summary.replaceChildren(element('p', 'Hasil akan muncul setelah semua gejala dijawab.'));
}

async function loadQuestions() {
  retry.hidden = true;
  status.textContent = 'Memuat daftar gejala…';
  try {
    const { gejala } = await json('/api/gejala');
    total = gejala.length;
    list.replaceChildren(...gejala.map(question));
    form.hidden = false;
    showProgress();
  } catch {
    status.textContent = 'Daftar gejala gagal dimuat.';
    retry.hidden = false;
  }
}

function renderResult(result) {
  const heading = element('p');
  heading.append(element('strong', `${result.kategori.toUpperCase()} · ${result.label}`));
  summary.replaceChildren(heading);
  if (result.skor !== null) {
    summary.append(element('p', 'Skor CF'), element('strong', percent.format(result.skor), 'score'));
    const details = element('details');
    details.append(element('summary', 'Lihat perhitungan aturan'));
    const rules = element('ul');
    for (const rule of result.aturan) {
      const item = element('li');
      const premises = rule.gejala.map(g => `${g.id.toUpperCase()} ${g.pertanyaan.replace(/\?$/, '')}`);
      item.append(element('strong', rule.id.toUpperCase()),
        element('p', premises.join(' · ')),
        element('p', `${decimal.format(rule.minimum)} × ${decimal.format(rule.bobot)} = ${percent.format(rule.skor)}`));
      rules.append(item);
    }
    details.append(rules);
    if (result.aturan.length > 1) details.append(element('p', 'CF aturan digabung bertahap dengan CF gabungan + CF aturan × (1 − CF gabungan).'));
    summary.append(details);
  }
  summary.append(element('p', result.saran));
}

retry.addEventListener('click', loadQuestions);
form.addEventListener('change', () => {
  showProgress();
  emptyResult();
});
reset.addEventListener('click', () => {
  form.reset();
  emptyResult();
  showProgress();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const jawaban = Object.fromEntries(new FormData(form));
  form.querySelectorAll('fieldset').forEach(field => { field.disabled = true; });
  submit.disabled = reset.disabled = true;
  status.textContent = 'Menghitung hasil skrining…';
  summary.replaceChildren(element('p', 'Menghitung hasil skrining…'));
  try {
    const result = await json('/api/diagnosa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jawaban }),
    });
    renderResult(result);
    title.focus();
  } catch {
    summary.replaceChildren(element('p', 'Hasil gagal dihitung. Jawaban masih tersedia. Coba tekan Lihat hasil lagi.'));
    title.focus();
  } finally {
    form.querySelectorAll('fieldset').forEach(field => { field.disabled = false; });
    submit.disabled = reset.disabled = false;
    showProgress();
  }
});

loadQuestions();
