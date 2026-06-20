/**
 * bastia.js — carica data.json e popola le pagine dinamicamente.
 * Ogni pagina HTML include questo script e definisce le funzioni
 * che vuole usare tramite window.bastiaInit.
 */

async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Impossibile caricare data.json');
  return res.json();
}

function fillText(selector, value) {
  document.querySelectorAll(selector).forEach(el => el.textContent = value);
}

function fillHTML(selector, value) {
  document.querySelectorAll(selector).forEach(el => el.innerHTML = value);
}

/** Costruisce le righe orario per una giornata */
function buildOrari(orari) {
  return orari.map(o => `
    <div class="prog-item">
      <span class="prog-time">${o.ora}</span>
      <span class="prog-desc">${o.desc}</span>
    </div>`).join('');
}

/** Costruisce la griglia sponsor — usa il logo se presente, altrimenti solo il nome */
function buildSponsor(lista) {
  return lista.map(s => {
    const content = s.logo
      ? `<img src="${s.logo}" alt="${s.nome}" loading="lazy">`
      : s.nome;
    if (s.url) {
      return `<span class="sponsor-pill"><a href="${s.url}" target="_blank" rel="noopener">${content}</a></span>`;
    }
    return `<span class="sponsor-pill">${content}</span>`;
  }).join('');
}

/** Aggiorna banner e titoli comuni a tutte le pagine */
function fillCommon(d) {
  fillText('[data-anno]',         d.anno);
  fillText('[data-edizione]',     d.edizione);
  fillText('[data-date]',         d.date_complete);
  fillText('[data-date-breve]',   d.date_breve);
  fillText('[data-banner]',       '🗓️ ' + d.banner);
}

/** Entry point: chiamato da ogni pagina con le proprie funzioni extra */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const d = await loadData();
    fillCommon(d);
    if (typeof window.bastiaInit === 'function') {
      window.bastiaInit(d);
    }
  } catch (e) {
    console.error('Errore caricamento dati:', e);
  }
});
