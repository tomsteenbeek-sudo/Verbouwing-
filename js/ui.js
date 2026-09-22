// Verbouwplan Leliestraat 27 — gedeelde UI: navigatie, modal, toast, bevestiging, helpers.
// LocalStorage wordt hier alleen gebruikt voor interfacevoorkeuren (laatste filter,
// open/dicht menu) — nooit voor projectdata zelf; die staat in Supabase (zie db.js).

const NAV_ITEMS = [
  { href: "index.html", label: "Dashboard" },
  { href: "planning.html", label: "Planning" },
  { href: "kamers.html", label: "Kamers" },
  { href: "besluiten.html", label: "Besluiten" },
  { href: "offertes.html", label: "Offertes" },
  { href: "inkopen.html", label: "Inkopen" },
  { href: "budget.html", label: "Budget" },
  { href: "materialen.html", label: "Materialen" },
  { href: "gereedschap.html", label: "Gereedschap" },
  { href: "plattegronden.html", label: "Plattegronden" },
  { href: "risicos.html", label: "Risico's" },
  { href: "oplevering.html", label: "Oplevering" },
  { href: "personen.html", label: "Personen" },
  { href: "buiten-scope.html", label: "Buiten scope" },
];

export function renderNav() {
  const root = document.getElementById("app-nav");
  if (!root) return;
  const here = location.pathname.split("/").pop() || "index.html";
  root.innerHTML = `
    <nav class="site-nav">
      <div class="wrap">
        <a class="brand" href="index.html">Verbouwplan <span>Leliestraat 27</span></a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
        <div class="nav-links">
          ${NAV_ITEMS.map(i => `<a href="${i.href}" class="${i.href === here ? "active" : ""}">${i.label}</a>`).join("")}
        </div>
      </div>
    </nav>`;
  document.getElementById("nav-toggle").addEventListener("click", () => {
    document.querySelector(".site-nav").classList.toggle("nav-open");
  });
}

export function euro(n) {
  const v = Number(n) || 0;
  return "€ " + v.toLocaleString("nl-NL");
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function toast(message, kind = "ok") {
  let wrap = document.getElementById("toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.textContent = message;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

export function reportError(err, context) {
  console.error(context, err);
  toast(`Er ging iets mis${context ? " bij " + context : ""}: ${err.message || err}`, "error");
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    let overlay = document.getElementById("confirm-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "confirm-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="modal-panel small">
        <p>${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="confirm-cancel">Annuleren</button>
          <button type="button" class="btn-danger" id="confirm-ok">Verwijderen</button>
        </div>
      </div>`;
    overlay.classList.add("open");
    const close = (val) => { overlay.classList.remove("open"); resolve(val); };
    overlay.querySelector("#confirm-cancel").addEventListener("click", () => close(false));
    overlay.querySelector("#confirm-ok").addEventListener("click", () => close(true));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); }, { once: true });
  });
}

export function openModal(title, bodyHtml) {
  let overlay = document.getElementById("modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="modal-panel">
      <div class="modal-head">
        <h3>${escapeHtml(title)}</h3>
        <button type="button" class="modal-close" id="modal-close-btn" aria-label="Sluiten">✕</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    </div>`;
  overlay.classList.add("open");
  overlay.querySelector("#modal-close-btn").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  return overlay;
}
export function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.classList.remove("open");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ---------- Interfacevoorkeuren (alleen UI-state, geen projectdata) ----------
const PREF_KEY = "verbouwplan-ui-prefs-v1";
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
}
function savePrefs(p) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* negeren */ }
}
export function getPref(key, fallback) {
  const p = loadPrefs();
  return key in p ? p[key] : fallback;
}
export function setPref(key, value) {
  const p = loadPrefs();
  p[key] = value;
  savePrefs(p);
}

// ---------- Kleine formulier-helpers ----------
export function optionsHtml(items, value, { valueKey = "id", labelKey = "name", empty = "—" } = {}) {
  return `<option value="">${escapeHtml(empty)}</option>` + items.map(i =>
    `<option value="${i[valueKey]}" ${String(i[valueKey]) === String(value) ? "selected" : ""}>${escapeHtml(i[labelKey])}</option>`
  ).join("");
}

export function statusPillClass(status) {
  if (status === "Gereed" || status === "Gedaan" || status === "In huis" || status === "Besteld") return "gedaan";
  if (status === "Bezig" || status === "Te doen" || status === "Bestellen") return "bezig";
  return "open";
}

// Kleine badges voor meerdere gekoppelde personen (werkzaamheid/actie-kaarten).
export function peopleBadgesHtml(people) {
  if (!people || !people.length) return '<span class="people-badges empty">Niet toegewezen</span>';
  return `<span class="people-badges">${people.map((p) => `<span class="person-badge">${escapeHtml(p.name)}</span>`).join("")}</span>`;
}

// Aanvinklijst voor multi-select-formuliervelden ("Toegewezen aan").
export function checkboxListHtml(items, selectedIds, name) {
  const selected = new Set((selectedIds || []).map(String));
  return `<div class="checkbox-list">${items.map((i) => `
    <label class="checkbox-list-item">
      <input type="checkbox" name="${name}" value="${i.id}" ${selected.has(String(i.id)) ? "checked" : ""}>
      <span>${escapeHtml(i.name)}</span>
    </label>`).join("")}</div>`;
}
