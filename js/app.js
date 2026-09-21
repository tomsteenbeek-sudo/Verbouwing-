/* Verbouwplan Leliestraat 27 — rendering + interactie
   Voortgang (aangevinkte acties) wordt per bezoeker lokaal onthouden via localStorage. */

const STORAGE_KEY = "verbouwplan-voortgang-v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* privé-modus of vol quotum: negeren */ }
}
let STATE = loadState();

function actionKey(roomSlug, index) {
  return `${roomSlug}::${index}`;
}
function isChecked(roomSlug, index) {
  return !!STATE[actionKey(roomSlug, index)];
}
function setChecked(roomSlug, index, val) {
  const key = actionKey(roomSlug, index);
  if (val) STATE[key] = true; else delete STATE[key];
  saveState(STATE);
}
function roomProgress(room) {
  const total = room.acties.length;
  const done = room.acties.reduce((n, _, i) => n + (isChecked(room.slug, i) ? 1 : 0), 0);
  return { done, total };
}
function totalProgress() {
  let done = 0, total = 0;
  ROOMS.forEach(r => { const p = roomProgress(r); done += p.done; total += p.total; });
  return { done, total };
}

function euro(n) {
  return "€ " + n.toLocaleString("nl-NL");
}

function imgTag(slug, alt) {
  return `<img src="images/rooms/${slug}.jpg" alt="${alt}" loading="lazy" onerror="this.remove();">`;
}

/* ---------- Generieke overrides (bewerkbare velden) ---------- */
function getText(key, fallback) {
  const v = STATE[key];
  return (v === undefined || v === null || v === "") ? fallback : v;
}
function setText(key, value) {
  if (value === "" || value === undefined || value === null) delete STATE[key];
  else STATE[key] = value;
  saveState(STATE);
}
function getList(key) {
  return Array.isArray(STATE[key]) ? STATE[key] : [];
}
function setList(key, arr) {
  if (!arr.length) delete STATE[key]; else STATE[key] = arr;
  saveState(STATE);
}

/* ---------- Hero stats ---------- */
function renderHero() {
  document.getElementById("hero-title").textContent = PROPERTY.naam;
  document.getElementById("hero-place").textContent = PROPERTY.plaats;
  document.getElementById("hero-sub").textContent = PROPERTY.subtitel;

  const stats = [
    { n: ROOMS.length, l: "Ruimtes in scope" },
    { n: euro(BUDGET.totaal), l: "Totaalbudget" },
    { n: KLUSDAGEN.length + " klusdagen", l: "Uitvoeringsplanning" },
    { n: openActiesCount(), l: "Openstaande acties" }
  ];
  document.getElementById("stat-row").innerHTML = stats.map(s =>
    `<div class="stat-card"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`
  ).join("");

  updateProgressBar();
}

function updateProgressBar() {
  const { done, total } = totalProgress();
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progress-label-text").textContent = `${done} van ${total} acties afgevinkt`;
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
}

/* ---------- Profiel ---------- */
function renderProfile() {
  document.getElementById("profile-grid").innerHTML = PROPERTY.kenmerken.map(k =>
    `<div class="profile-item"><div class="k">${k.label}</div><div class="v">${k.waarde}</div></div>`
  ).join("");
  document.getElementById("source-note").innerHTML =
    `Bron: <a href="${PROPERTY.bron.url}" target="_blank" rel="noopener">${PROPERTY.bron.tekst}</a>`;

  document.getElementById("done-grid").innerHTML = BUITEN_SCOPE.map(d =>
    `<div class="done-item"><div class="t">${d.naam}</div><p>${d.omschrijving}</p></div>`
  ).join("");
}

/* ---------- Rooms grid ---------- */
let currentFilter = "alle";

function renderRoomGrid() {
  const grid = document.getElementById("room-grid");
  const rooms = ROOMS.filter(r => currentFilter === "alle" || r.verdieping === currentFilter);
  grid.innerHTML = rooms.map(roomCardHtml).join("");
  grid.querySelectorAll(".room-card").forEach(card => {
    card.addEventListener("click", () => openRoom(card.dataset.slug));
  });
}

function roomCardHtml(room) {
  const { done, total } = roomProgress(room);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `
    <article class="room-card card" data-slug="${room.slug}">
      <div class="room-thumb" id="thumb-${room.slug}">
        <div class="ph-fallback"><div class="ph-icon">🏠</div>afbeelding volgt</div>
        ${imgTag(room.slug, room.naam)}
      </div>
      <div class="room-body">
        <div class="room-floor">${FLOOR_LABELS[room.verdieping]}</div>
        <h3>${room.naam}</h3>
        <p class="room-nu">${room.nu}</p>
        <div class="room-foot">
          <span class="badge ${room.klaar ? 'klaar' : ''}">${room.klaar ? "Klaar" : done + "/" + total + " acties"}</span>
          <div class="mini-progress"><i style="width:${pct}%"></i></div>
        </div>
      </div>
    </article>`;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  renderRoomGrid();
});

/* ---------- Room overlay ---------- */
function openRoom(slug) {
  const room = ROOMS.find(r => r.slug === slug);
  if (!room) return;
  const overlay = document.getElementById("room-overlay");
  document.getElementById("overlay-content").innerHTML = roomDetailHtml(room);
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  wireChecklist(room);
  wireFurniture(room);
  window.location.hash = "kamer/" + slug;
}
function closeRoom() {
  document.getElementById("room-overlay").classList.remove("open");
  document.body.style.overflow = "";
  if (window.location.hash.startsWith("#kamer/")) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

function roomDetailHtml(room) {
  return `
    <div class="overlay-head">
      <div class="overlay-img" id="overlay-thumb">
        <div class="ph-fallback"><div class="ph-icon">🏠</div>Nog geen ontwerpafbeelding<br>plaats images/rooms/${room.slug}.jpg</div>
        ${imgTag(room.slug, room.naam)}
      </div>
      <button class="overlay-close" id="overlay-close-btn" aria-label="Sluiten">✕</button>
    </div>
    <div class="overlay-body">
      <div class="room-floor">${FLOOR_LABELS[room.verdieping]}</div>
      <h2>${room.naam}</h2>
      <div class="compare">
        <div class="compare-col nu"><div class="lbl">Nu</div><p>${room.nu}</p></div>
        <div class="compare-col wordt"><div class="lbl">Wordt</div><p>${room.wordt}</p></div>
      </div>
      <h3 style="font-size:0.95rem;margin-bottom:8px;">Acties</h3>
      <ul class="action-list" id="detail-action-list">
        ${room.acties.map((a, i) => actionItemHtml(room.slug, i, a)).join("")}
      </ul>

      <h3 style="font-size:0.95rem;margin-bottom:8px;margin-top:22px;">Meubels</h3>
      <ul class="action-list" id="detail-furniture-list">${furnitureListHtml(room.slug)}</ul>
      <form id="detail-furniture-form" class="add-row">
        <input type="text" id="detail-furniture-input" placeholder="Meubel toevoegen…">
        <button type="submit">Toevoegen</button>
      </form>
    </div>`;
}

function actionItemHtml(slug, i, text) {
  const checked = isChecked(slug, i);
  const id = `act-${slug}-${i}`;
  return `<li class="${checked ? "checked" : ""}">
      <input type="checkbox" id="${id}" data-slug="${slug}" data-i="${i}" ${checked ? "checked" : ""}>
      <label for="${id}">${text}</label>
    </li>`;
}

function wireChecklist(room) {
  const list = document.getElementById("detail-action-list");
  list.addEventListener("change", (e) => {
    const cb = e.target.closest("input[type=checkbox]");
    if (!cb) return;
    const slug = cb.dataset.slug, i = Number(cb.dataset.i);
    setChecked(slug, i, cb.checked);
    cb.closest("li").classList.toggle("checked", cb.checked);
    updateProgressBar();
    renderRoomGrid();
  });
  document.getElementById("overlay-close-btn").addEventListener("click", closeRoom);
}

document.getElementById("room-overlay").addEventListener("click", (e) => {
  if (e.target.id === "room-overlay") closeRoom();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeRoom();
});

function handleHash() {
  const h = window.location.hash;
  if (h.startsWith("#kamer/")) {
    openRoom(h.replace("#kamer/", ""));
  }
}
window.addEventListener("hashchange", handleHash);

/* ---------- Budget (bedragen zijn bewerkbaar, doel blijft € 30.000) ---------- */
function getBudgetAmount(section, i) {
  const row = BUDGET[section].rows[i];
  const v = STATE[`budget::${section}::${i}`];
  return (typeof v === "number" && !isNaN(v)) ? v : row.bedrag;
}
function setBudgetAmount(section, i, val) {
  const row = BUDGET[section].rows[i];
  const key = `budget::${section}::${i}`;
  if (isNaN(val) || val === row.bedrag) delete STATE[key]; else STATE[key] = val;
  saveState(STATE);
}
function getOnvoorzien() {
  const v = STATE["budget::onvoorzien"];
  return (typeof v === "number" && !isNaN(v)) ? v : BUDGET.onvoorzien;
}
function setOnvoorzien(val) {
  if (isNaN(val) || val === BUDGET.onvoorzien) delete STATE["budget::onvoorzien"]; else STATE["budget::onvoorzien"] = val;
  saveState(STATE);
}
function subtotalOf(section) {
  return BUDGET[section].rows.reduce((sum, _, i) => sum + getBudgetAmount(section, i), 0);
}
function computeBudgetTotal() {
  return subtotalOf("verduurzaming") + subtotalOf("regulier") + getOnvoorzien();
}

function getWerkelijk(section, i) {
  const v = STATE[`werkelijk::${section}::${i}`];
  return (typeof v === "number" && !isNaN(v)) ? v : 0;
}
function setWerkelijk(section, i, val) {
  const key = `werkelijk::${section}::${i}`;
  if (isNaN(val) || val === 0) delete STATE[key]; else STATE[key] = val;
  saveState(STATE);
}
function werkelijkSubtotaal(section) {
  return BUDGET[section].rows.reduce((sum, _, i) => sum + getWerkelijk(section, i), 0);
}
function getWerkelijkOnvoorzien() {
  const v = STATE["werkelijk::onvoorzien"];
  return (typeof v === "number" && !isNaN(v)) ? v : 0;
}
function setWerkelijkOnvoorzien(val) {
  if (isNaN(val) || val === 0) delete STATE["werkelijk::onvoorzien"]; else STATE["werkelijk::onvoorzien"] = val;
  saveState(STATE);
}
function werkelijkTotaal() {
  return werkelijkSubtotaal("verduurzaming") + werkelijkSubtotaal("regulier") + getWerkelijkOnvoorzien();
}

function budgetRowHtml(section, r, i) {
  return `<tr><td>${r.post}</td><td class="num">
      <span class="euro-input"><span class="prefix">€</span><input type="number" class="inline-input num-input" min="0" step="10"
        data-section="${section}" data-i="${i}" value="${getBudgetAmount(section, i)}"></span>
    </td><td class="num">
      <span class="euro-input"><span class="prefix">€</span><input type="number" class="inline-input num-input werkelijk-input" min="0" step="10"
        data-section="${section}" data-i="${i}" value="${getWerkelijk(section, i) || ""}" placeholder="0"></span>
    </td><td>${r.uitvoering}</td></tr>`;
}

function renderBudget() {
  document.getElementById("budget-verduurzaming-body").innerHTML =
    BUDGET.verduurzaming.rows.map((r, i) => budgetRowHtml("verduurzaming", r, i)).join("") +
    `<tr><td><strong>Subtotaal</strong></td><td class="num"><strong id="subtotal-verduurzaming-amt">${euro(subtotalOf("verduurzaming"))}</strong></td><td class="num"><strong id="werkelijk-verduurzaming-amt">${euro(werkelijkSubtotaal("verduurzaming"))}</strong></td><td></td></tr>`;

  document.getElementById("budget-regulier-body").innerHTML =
    BUDGET.regulier.rows.map((r, i) => budgetRowHtml("regulier", r, i)).join("") +
    `<tr><td><strong>Subtotaal</strong></td><td class="num"><strong id="subtotal-regulier-amt">${euro(subtotalOf("regulier"))}</strong></td><td class="num"><strong id="werkelijk-regulier-amt">${euro(werkelijkSubtotaal("regulier"))}</strong></td><td></td></tr>`;

  document.getElementById("budget-bars").innerHTML = `
    <div class="budget-bar-row" data-bar="reg">
      <div class="label">Regulier</div>
      <div class="budget-bar-track"><div class="budget-bar-fill reg" id="bar-reg"></div></div>
      <div class="amt" id="amt-reg"></div>
    </div>
    <div class="budget-bar-row" data-bar="duur">
      <div class="label">Verduurzaming</div>
      <div class="budget-bar-track"><div class="budget-bar-fill duur" id="bar-duur"></div></div>
      <div class="amt" id="amt-duur"></div>
    </div>
    <div class="budget-bar-row" data-bar="onv">
      <div class="label">Onvoorzien</div>
      <div class="budget-bar-track"><div class="budget-bar-fill onv" id="bar-onv"></div></div>
      <div class="amt"><span class="euro-input"><span class="prefix">€</span><input type="number" class="inline-input num-input" min="0" step="10" id="onvoorzien-input" value="${getOnvoorzien()}"></span></div>
    </div>
    <div class="budget-bar-row" style="margin-top:14px;border-top:1px solid var(--border);padding-top:14px;">
      <div class="label">Doel</div>
      <div></div>
      <div class="amt"><strong>${euro(BUDGET.totaal)}</strong></div>
    </div>
    <div class="budget-bar-row">
      <div class="label"><strong>Berekend totaal</strong></div>
      <div></div>
      <div class="amt"><strong id="budget-total-amt"></strong></div>
    </div>
    <div id="budget-delta" class="note" style="margin-top:10px;"></div>`;

  document.getElementById("budget-werkelijk").innerHTML = `
    <div class="budget-bar-row"><div class="label">Begroot totaal</div><div></div><div class="amt"><strong id="werkelijk-begroot-amt"></strong></div></div>
    <div class="budget-bar-row"><div class="label">Doel</div><div></div><div class="amt"><strong>${euro(BUDGET.totaal)}</strong></div></div>
    <div class="budget-bar-row"><div class="label"><strong>Werkelijk uitgegeven</strong></div><div></div>
      <div class="amt"><span class="euro-input"><span class="prefix">€</span><input type="number" class="inline-input num-input werkelijk-input" min="0" step="10" id="onvoorzien-werkelijk-input" value="${getWerkelijkOnvoorzien() || ""}" placeholder="0"></span></div>
    </div>
    <div class="budget-bar-row" style="font-size:0.78rem;color:var(--text-muted);"><div class="label"></div><div></div><div class="amt">↑ onvoorzien werkelijk</div></div>
    <div class="budget-bar-row" style="margin-top:14px;border-top:1px solid var(--border);padding-top:14px;">
      <div class="label"><strong>Totaal werkelijk</strong></div><div></div>
      <div class="amt"><strong id="werkelijk-total-amt"></strong></div>
    </div>
    <div id="werkelijk-delta" class="note" style="margin-top:10px;"></div>`;

  document.getElementById("budget-verduurzaming-body").addEventListener("input", handleBudgetInput);
  document.getElementById("budget-regulier-body").addEventListener("input", handleBudgetInput);
  document.getElementById("onvoorzien-input").addEventListener("input", (e) => {
    setOnvoorzien(parseFloat(e.target.value));
    updateBudgetTotals();
  });
  document.getElementById("onvoorzien-werkelijk-input").addEventListener("input", (e) => {
    setWerkelijkOnvoorzien(parseFloat(e.target.value));
    updateWerkelijkTotalen();
  });

  document.getElementById("budget-niet-in").textContent = BUDGET.nietInBegroting;
  document.getElementById("budget-onzekerheden").innerHTML = BUDGET.onzekerheden.map(o =>
    `<li><strong>${o.titel}</strong> ${o.tekst}</li>`
  ).join("");

  updateBudgetTotals();
  updateWerkelijkTotalen();
}

function handleBudgetInput(e) {
  const input = e.target.closest(".num-input");
  if (!input) return;
  const section = input.dataset.section, i = Number(input.dataset.i);
  if (input.classList.contains("werkelijk-input")) {
    setWerkelijk(section, i, parseFloat(input.value));
    document.getElementById(`werkelijk-${section}-amt`).textContent = euro(werkelijkSubtotaal(section));
    updateWerkelijkTotalen();
  } else {
    setBudgetAmount(section, i, parseFloat(input.value));
    document.getElementById(`subtotal-${section}-amt`).textContent = euro(subtotalOf(section));
    updateBudgetTotals();
  }
}

function updateWerkelijkTotalen() {
  const begroot = computeBudgetTotal();
  const werkelijk = werkelijkTotaal();
  const target = BUDGET.totaal;
  document.getElementById("werkelijk-begroot-amt").textContent = euro(begroot);
  document.getElementById("werkelijk-total-amt").textContent = euro(werkelijk);
  const delta = document.getElementById("werkelijk-delta");
  const diffTarget = werkelijk - target;
  if (werkelijk === 0) {
    delta.className = "note";
    delta.textContent = "Nog niets ingevuld als werkelijk uitgegeven.";
  } else if (diffTarget > 0) {
    delta.className = "note warn";
    delta.textContent = `${euro(diffTarget)} boven het doel van ${euro(target)}.`;
  } else {
    delta.className = "note";
    delta.textContent = `${euro(-diffTarget)} onder het doel van ${euro(target)} — nog ${euro(target - werkelijk)} over.`;
  }
}

function updateBudgetTotals() {
  const target = BUDGET.totaal;
  const reg = subtotalOf("regulier");
  const duur = subtotalOf("verduurzaming");
  const onv = getOnvoorzien();
  const total = reg + duur + onv;

  [["reg", reg], ["duur", duur], ["onv", onv]].forEach(([key, amt]) => {
    const pct = target ? Math.round((amt / target) * 100) : 0;
    document.getElementById(`bar-${key}`).style.width = Math.min(100, pct) + "%";
    document.getElementById(`bar-${key}`).textContent = pct + "%";
    if (key !== "onv") document.getElementById(`amt-${key}`).textContent = euro(amt);
  });

  document.getElementById("budget-total-amt").textContent = euro(total);
  const delta = document.getElementById("budget-delta");
  const diff = total - target;
  if (diff === 0) {
    delta.className = "note";
    delta.textContent = `Precies op het doel van ${euro(target)}.`;
  } else if (diff > 0) {
    delta.className = "note warn";
    delta.textContent = `${euro(diff)} boven het doel van ${euro(target)}.`;
  } else {
    delta.className = "note";
    delta.textContent = `${euro(-diff)} onder het doel van ${euro(target)}.`;
  }
}

/* ---------- ISDE / verduurzaming ---------- */
function renderISDE() {
  document.getElementById("isde-table-body").innerHTML = ISDE.punten.map(p =>
    `<tr><td>${p.punt}</td><td>${p.betekenis}</td></tr>`
  ).join("");
  document.getElementById("isde-letop").innerHTML = ISDE.letOp.map(l => `<li>${l}</li>`).join("");
}

function renderOnderzoek() {
  document.getElementById("onderzoek-body").innerHTML = ONDERZOEK.map(o =>
    `<tr><td>${o.werk}</td><td>${o.waarom}</td><td>${o.wie}</td></tr>`
  ).join("");
}

/* ---------- Uitvoeringsplanning: klusdagen ---------- */
let klusdagFilter = "alle";

function klusdagStatus(dag) {
  const total = dag.taken.length;
  const done = dag.taken.reduce((n, _, i) => n + (isChecked(`klusdag-${dag.id}`, i) ? 1 : 0), 0);
  if (total > 0 && done === total) return "Gereed";
  const datum = getText(`klusdag::datum::${dag.id}`, "");
  const today = new Date().toISOString().slice(0, 10);
  if (datum && datum === today) return "Vandaag";
  if (done > 0) return "Bezig";
  return "Gepland";
}
function prereqWarning(dag) {
  if (!dag.vereistDagen || !dag.vereistDagen.length) return null;
  const notDone = dag.vereistDagen.filter(id => {
    const prereq = KLUSDAGEN.find(k => k.id === id);
    return prereq && klusdagStatus(prereq) !== "Gereed";
  });
  if (!notDone.length) return null;
  return `Wacht op klusdag ${notDone.join(", ")} — nog niet gereed.`;
}
function filterKlusdagen(dagen) {
  if (klusdagFilter === "alle") return dagen;
  const today = new Date().toISOString().slice(0, 10);
  return dagen.filter(d => {
    const status = klusdagStatus(d);
    if (klusdagFilter === "vandaag") return getText(`klusdag::datum::${d.id}`, "") === today;
    if (klusdagFilter === "komende") return status !== "Gereed";
    if (klusdagFilter === "gereed") return status === "Gereed";
    return true;
  });
}

function klusdagCardHtml(dag) {
  const status = klusdagStatus(dag);
  const statusClass = status === "Gereed" ? "gedaan" : (status === "Vandaag" || status === "Bezig" ? "bezig" : "open");
  const prereqWarn = prereqWarning(dag);
  const datum = getText(`klusdag::datum::${dag.id}`, "");
  const total = dag.taken.length;
  const done = dag.taken.reduce((n, _, i) => n + (isChecked(`klusdag-${dag.id}`, i) ? 1 : 0), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return `
    <article class="klusdag-card card" data-id="${dag.id}">
      <div class="klusdag-head">
        <div>
          <div class="klusdag-nr">Klusdag ${dag.id}${dag.extern ? ' <span class="badge extern">Extern</span>' : ""}</div>
          <h3>${dag.naam}</h3>
          <div class="klusdag-meta">${dag.fase} · ${dag.uitvoerder}${dag.ruimtes.length ? " · " + dag.ruimtes.join(", ") : ""}</div>
        </div>
        <div class="klusdag-status">
          <span class="pill ${statusClass}">${status}</span>
          <input type="date" class="inline-input date-input klusdag-date" data-dagid="${dag.id}" value="${datum}">
        </div>
      </div>
      <div class="mini-progress" style="margin:10px 0;"><i style="width:${pct}%"></i></div>
      ${prereqWarn ? `<div class="note warn">⏳ ${prereqWarn}</div>` : ""}
      ${dag.droogtijd ? `<div class="note">⏳ Droog-/wachttijd: ${dag.droogtijd}</div>` : ""}
      <div class="klusdag-field"><strong>Wat moet vooraf klaar zijn:</strong> ${dag.vereist}</div>
      ${dag.materiaal.length ? `
      <div class="klusdag-field">
        <strong>Benodigd materiaal</strong>
        <ul class="material-list">
          ${dag.materiaal.map((m, i) => `<li>${m.naam} <input type="text" class="inline-input qty-input klusdag-qty" data-key="klusdag-mat::${dag.id}::${i}" value="${getText(`klusdag-mat::${dag.id}::${i}`, m.aantal)}" placeholder="hoeveelheid"></li>`).join("")}
        </ul>
      </div>` : ""}
      <div class="klusdag-field">
        <strong>Werkzaamheden</strong>
        <ul class="action-list klusdag-taken" data-dagid="${dag.id}">
          ${dag.taken.map((t, i) => actionItemHtml(`klusdag-${dag.id}`, i, t)).join("")}
        </ul>
      </div>
      ${dag.opmerkingen ? `<div class="klusdag-field opmerkingen"><strong>Opmerkingen:</strong> ${dag.opmerkingen}</div>` : ""}
    </article>`;
}

function renderKlusdagenList() {
  const container = document.getElementById("klusdagen-list");
  if (!container) return;
  const dagen = filterKlusdagen(KLUSDAGEN);
  const gereedCount = KLUSDAGEN.filter(d => klusdagStatus(d) === "Gereed").length;
  const countEl = document.getElementById("klusdagen-voortgang");
  if (countEl) countEl.textContent = `${gereedCount} van ${KLUSDAGEN.length} klusdagen gereed`;
  container.innerHTML = dagen.length ? dagen.map(klusdagCardHtml).join("") : `<p class="empty-hint">Geen klusdagen in dit filter.</p>`;
  wireKlusdagen();
}

function wireKlusdagen() {
  const container = document.getElementById("klusdagen-list");
  container.querySelectorAll(".klusdag-taken").forEach(list => {
    list.addEventListener("change", (e) => {
      const cb = e.target.closest("input[type=checkbox]");
      if (!cb) return;
      setChecked(cb.dataset.slug, Number(cb.dataset.i), cb.checked);
      renderKlusdagenList();
    });
  });
  container.querySelectorAll(".klusdag-date").forEach(input => {
    input.addEventListener("change", () => {
      setText(`klusdag::datum::${input.dataset.dagid}`, input.value);
      renderKlusdagenList();
    });
  });
  container.querySelectorAll(".klusdag-qty").forEach(input => {
    input.addEventListener("input", () => setText(input.dataset.key, input.value));
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".klusdag-filter-btn");
  if (!btn) return;
  document.querySelectorAll(".klusdag-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  klusdagFilter = btn.dataset.filter;
  renderKlusdagenList();
});

function renderUitvoeringsplanning() {
  document.getElementById("fase-flow").innerHTML = UITVOERING.fases.map((f, i) =>
    (i > 0 ? '<span class="flow-arrow">→</span>' : "") + `<div class="flow-step">${f}</div>`
  ).join("");
  document.getElementById("harde-volgorde").innerHTML = UITVOERING.hardeVolgorde.map((r, i) =>
    `<li><span class="num">${i + 1}</span><span>${r}</span></li>`
  ).join("");
  document.getElementById("planning-toelichting").textContent = UITVOERING.toelichting;
  renderKlusdagenList();
}

/* ---------- Actieplanning: samengevoegde besluiten, uitzoekpunten en acties ---------- */
let actieFilter = "alle";
const ACTIE_CATEGORIEEN = ["Uitzoeken", "Beslissen", "Offerte aanvragen", "Vakman inplannen", "Bestellen / inkopen", "Administratie / subsidie"];

function getActieStatus(i) {
  return getText(`actieplanning::status::${i}`, ACTIEPLANNING[i].status);
}
function toggleActieDone(i, done) {
  const val = done ? "Gedaan" : "Open";
  setText(`actieplanning::status::${i}`, val === ACTIEPLANNING[i].status ? "" : val);
}
function openActiesCount() {
  return ACTIEPLANNING.filter((a, i) => getActieStatus(i) !== "Gedaan").length;
}

function actieRowHtml(a, i) {
  const status = getActieStatus(i);
  const isDone = status === "Gedaan";
  const blokkeert = (!isDone && a.blokkeertDag && a.blokkeertDag.length)
    ? `<span class="badge blokkeert" title="Blokkeert klusdag ${a.blokkeertDag.join(", ")}">Blokkeert planning</span>` : "";
  return `
    <li class="actie-row ${isDone ? "done" : ""}">
      <input type="checkbox" class="actie-done-cb" data-i="${i}" ${isDone ? "checked" : ""} aria-label="Gedaan">
      <div class="actie-body">
        <div class="actie-title">${a.actie} ${blokkeert}</div>
        <div class="actie-meta">
          <span class="meta-item">📅 ${a.deadline}</span>
          <span class="meta-item">👤 <input type="text" class="inline-input text-input actie-wie" data-key="actieplanning::wie::${i}" value="${getText(`actieplanning::wie::${i}`, a.wie)}"></span>
          ${a.afhankelijkVan && a.afhankelijkVan !== "—" ? `<span class="meta-item">⛓ ${a.afhankelijkVan}</span>` : ""}
          ${a.doorlooptijd && a.doorlooptijd !== "—" ? `<span class="meta-item">⏱ ${a.doorlooptijd}</span>` : ""}
        </div>
        ${a.opmerkingen ? `<div class="actie-note">${a.opmerkingen}</div>` : ""}
      </div>
    </li>`;
}

function renderActieplanning() {
  const container = document.getElementById("actieplanning-list");
  if (!container) return;
  const indexed = ACTIEPLANNING.map((a, i) => [a, i]);
  const filtered = actieFilter === "alle" ? indexed : indexed.filter(([a]) => a.categorie === actieFilter);
  const groups = ACTIE_CATEGORIEEN.map(cat => {
    const items = filtered.filter(([a]) => a.categorie === cat);
    if (!items.length) return "";
    return `<div class="actie-group"><h3>${cat}</h3><ul class="action-list actie-list">${items.map(([a, i]) => actieRowHtml(a, i)).join("")}</ul></div>`;
  }).join("");
  container.innerHTML = groups || `<p class="empty-hint">Geen acties in dit filter.</p>`;
  wireActieplanning();

  const countEl = document.getElementById("actieplanning-voortgang");
  if (countEl) countEl.textContent = `${openActiesCount()} van ${ACTIEPLANNING.length} acties nog open`;
}

function wireActieplanning() {
  const container = document.getElementById("actieplanning-list");
  container.querySelectorAll(".actie-done-cb").forEach(cb => {
    cb.addEventListener("change", () => {
      toggleActieDone(Number(cb.dataset.i), cb.checked);
      renderActieplanning();
      renderHero();
    });
  });
  container.querySelectorAll(".actie-wie").forEach(input => {
    input.addEventListener("input", () => setText(input.dataset.key, input.value));
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".actie-filter-btn");
  if (!btn) return;
  document.querySelectorAll(".actie-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  actieFilter = btn.dataset.filter;
  renderActieplanning();
});

/* ---------- Risico's ---------- */
function renderRisicos() {
  document.getElementById("risicos-body").innerHTML = RISICOS.map(r =>
    `<tr><td><strong>${r.risico}</strong></td><td>${r.waarom}</td><td>${r.impact}</td><td>${r.check}</td></tr>`
  ).join("");
  document.getElementById("risico-vuistregel").textContent = RISICO_VUISTREGEL;
}

/* ---------- Oplevering ---------- */
function checklistHtml(prefix, items) {
  return items.map((t, i) => {
    const key = `${prefix}::${i}`;
    const checked = !!STATE[key];
    return `<li class="${checked ? 'checked' : ''}">
      <input type="checkbox" id="${prefix}-${i}" data-key="${key}" ${checked ? 'checked' : ''}>
      <label for="${prefix}-${i}">${t}</label></li>`;
  }).join("");
}
function wirePlainChecklist(listEl) {
  listEl.addEventListener("change", (e) => {
    const cb = e.target.closest("input[type=checkbox]");
    if (!cb) return;
    if (cb.checked) STATE[cb.dataset.key] = true; else delete STATE[cb.dataset.key];
    saveState(STATE);
    cb.closest("li").classList.toggle("checked", cb.checked);
  });
}
function renderOplevering() {
  const technisch = document.getElementById("oplevering-technisch");
  const dossier = document.getElementById("oplevering-dossier");
  technisch.innerHTML = checklistHtml("opl-tech", OPLEVERING.technisch);
  dossier.innerHTML = checklistHtml("opl-doss", OPLEVERING.dossier);
  wirePlainChecklist(technisch);
  wirePlainChecklist(dossier);
}

/* ---------- Gereedschappen ---------- */
function renderTools() {
  const wrap = document.getElementById("tools-list");
  if (!wrap) return;
  const defaultHtml = TOOLS.map((t, i) => {
    const key = `tool::${i}`;
    const checked = !!STATE[key];
    return `<li class="${checked ? "checked" : ""}"><input type="checkbox" id="tool-${i}" data-key="${key}" ${checked ? "checked" : ""}>
      <label for="tool-${i}">${t.naam}</label>
      <input type="text" class="inline-input qty-input" data-key="tool-aantal::${i}" value="${getText(`tool-aantal::${i}`, t.aantal)}" placeholder="hoeveelheid"></li>`;
  }).join("");
  const custom = getList("tools-custom");
  const customHtml = custom.map((t, i) => {
    const key = `tool-custom::${i}`;
    const checked = !!STATE[key];
    return `<li class="${checked ? "checked" : ""}"><input type="checkbox" id="toolc-${i}" data-key="${key}" ${checked ? "checked" : ""}>
      <label for="toolc-${i}">${t}</label>
      <input type="text" class="inline-input qty-input" data-key="tool-aantal-custom::${i}" value="${getText(`tool-aantal-custom::${i}`, "")}" placeholder="hoeveelheid">
      <button type="button" class="item-delete" data-ci="${i}" aria-label="Verwijderen">✕</button></li>`;
  }).join("");
  wrap.innerHTML = defaultHtml + customHtml;
  wrap.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) STATE[cb.dataset.key] = true; else delete STATE[cb.dataset.key];
      saveState(STATE);
      cb.closest("li").classList.toggle("checked", cb.checked);
    });
  });
  wrap.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("input", () => setText(input.dataset.key, input.value));
  });
  wrap.querySelectorAll(".item-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.ci);
      const arr = getList("tools-custom");
      arr.splice(idx, 1);
      setList("tools-custom", arr);
      Object.keys(STATE).filter(k => k.startsWith("tool-custom::") || k.startsWith("tool-aantal-custom::")).forEach(k => delete STATE[k]);
      saveState(STATE);
      renderTools();
    });
  });
}
document.getElementById("add-tool-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("add-tool-input");
  const val = input.value.trim();
  if (!val) return;
  const arr = getList("tools-custom");
  arr.push(val);
  setList("tools-custom", arr);
  input.value = "";
  renderTools();
});

/* ---------- Meubels per ruimte ---------- */
function furnitureListHtml(slug) {
  const items = getList(`meubels::${slug}`);
  if (!items.length) return `<li class="empty-hint">Nog geen meubels toegevoegd.</li>`;
  return items.map((item, i) => {
    const key = `meubel-done::${slug}::${i}`;
    const checked = !!STATE[key];
    return `<li class="${checked ? "checked" : ""}"><input type="checkbox" id="meubel-${slug}-${i}" data-key="${key}" ${checked ? "checked" : ""}><label for="meubel-${slug}-${i}">${item}</label><button type="button" class="item-delete" data-mi="${i}" aria-label="Verwijderen">✕</button></li>`;
  }).join("");
}
function wireFurniture(room) {
  const list = document.getElementById("detail-furniture-list");
  list.addEventListener("change", (e) => {
    const cb = e.target.closest("input[type=checkbox]");
    if (!cb) return;
    if (cb.checked) STATE[cb.dataset.key] = true; else delete STATE[cb.dataset.key];
    saveState(STATE);
    cb.closest("li").classList.toggle("checked", cb.checked);
  });
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".item-delete");
    if (!btn) return;
    const idx = Number(btn.dataset.mi);
    const arr = getList(`meubels::${room.slug}`);
    arr.splice(idx, 1);
    setList(`meubels::${room.slug}`, arr);
    Object.keys(STATE).filter(k => k.startsWith(`meubel-done::${room.slug}::`)).forEach(k => delete STATE[k]);
    saveState(STATE);
    list.innerHTML = furnitureListHtml(room.slug);
  });
  document.getElementById("detail-furniture-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("detail-furniture-input");
    const val = input.value.trim();
    if (!val) return;
    const arr = getList(`meubels::${room.slug}`);
    arr.push(val);
    setList(`meubels::${room.slug}`, arr);
    input.value = "";
    list.innerHTML = furnitureListHtml(room.slug);
  });
}

/* ---------- Plattegronden ---------- */
function renderFloorplans() {
  const grid = document.getElementById("floorplan-grid");
  if (!grid) return;
  grid.innerHTML = FLOORPLANS.map(f => `
    <div class="floorplan-card card">
      <div class="floorplan-thumb">
        <div class="ph-fallback"><div class="ph-icon">📐</div>plattegrond volgt<br>plaats images/plattegronden/${f.slug}.jpg</div>
        <img src="images/plattegronden/${f.slug}.jpg" alt="Plattegrond ${f.naam}" loading="lazy" onerror="this.remove();">
      </div>
      <div class="floorplan-name">${f.naam}</div>
    </div>`).join("");
}

/* ---------- Mobiel menu ---------- */
document.getElementById("nav-toggle")?.addEventListener("click", () => {
  document.querySelector(".site-nav").classList.toggle("nav-open");
});
document.querySelectorAll(".nav-links a").forEach(a => {
  a.addEventListener("click", () => document.querySelector(".site-nav").classList.remove("nav-open"));
});

/* ---------- Reset ---------- */
document.getElementById("reset-progress")?.addEventListener("click", () => {
  if (!confirm("Alle afgevinkte voortgang op dit apparaat wissen?")) return;
  STATE = {};
  saveState(STATE);
  renderAll();
});

/* ---------- Init ---------- */
function renderAll() {
  renderHero();
  renderProfile();
  renderRoomGrid();
  renderISDE();
  renderOnderzoek();
  renderBudget();
  renderUitvoeringsplanning();
  renderActieplanning();
  renderRisicos();
  renderOplevering();
  renderTools();
  renderFloorplans();
  document.getElementById("year").textContent = new Date().getFullYear();
}

renderAll();
handleHash();
