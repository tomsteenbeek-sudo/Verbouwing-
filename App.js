  document.getElementById("harde-volgorde").innerHTML = UITVOERING.hardeVolgorde.map((r, i) =>
    `<li><span class="num">${i + 1}</span><span>${r}</span></li>`
  ).join("");
  document.getElementById("planning-body").innerHTML = UITVOERING.planning.map(p =>
    `<tr><td><strong>${p.periode}</strong></td><td>${p.werk}</td><td>${p.afhankelijk}</td></tr>`
  ).join("");
  document.getElementById("planning-toelichting").textContent = UITVOERING.toelichting;
}

/* ---------- Besluiten ---------- */
function renderBesluiten() {
  document.getElementById("besluiten-body").innerHTML = BESLUITEN.map(b => {
    const isDone = b.status === "Gedaan";
    return `<tr><td>${b.besluit}</td><td>${b.toelichting}</td><td><span class="pill ${isDone ? 'gedaan' : 'open'}">${b.status}</span></td></tr>`;
  }).join("");
}

/* ---------- Uit te zoeken + acties ---------- */
function renderActielijst() {
  document.getElementById("uit-te-zoeken-list").innerHTML = UIT_TE_ZOEKEN.map((u, i) => {
    const key = `uitzoeken::${i}`;
    const checked = !!STATE[key];
    return `<li class="${checked ? 'checked' : ''}">
      <input type="checkbox" id="uz-${i}" data-key="${key}" ${checked ? 'checked' : ''}>
      <label for="uz-${i}">${u}</label></li>`;
  }).join("");
  document.getElementById("uit-te-zoeken-list").addEventListener("change", (e) => {
    const cb = e.target.closest("input[type=checkbox]");
    if (!cb) return;
    if (cb.checked) STATE[cb.dataset.key] = true; else delete STATE[cb.dataset.key];
    saveState(STATE);
    cb.closest("li").classList.toggle("checked", cb.checked);
  });

  document.getElementById("acties-body").innerHTML = ACTIES.map(a =>
    `<tr><td>${a.actie}</td><td>${a.wie}</td><td>${a.wanneer}</td><td><span class="pill open">${a.status}</span></td></tr>`
  ).join("");
}

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
  renderCorrecties();
  renderRoomGrid();
  renderISDE();
  renderOnderzoek();
  renderBudget();
  renderPlanning();
  renderBesluiten();
  renderActielijst();
  renderRisicos();
  renderOplevering();
  document.getElementById("year").textContent = new Date().getFullYear();
}

renderAll();
handleHash();
