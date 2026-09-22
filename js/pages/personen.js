import { People, Tasks, Decisions, Workdays, Tools, Purchases, Payments } from "../db.js?v=3";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, statusPillClass, euro } from "../ui.js?v=3";
import { decorateWorkdays, formatDate } from "../domain.js?v=3";
import { computePersonFinance } from "../finance.js?v=3";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let PEOPLE = [], TASKS = [], DECISIONS = [], WORKDAYS = [], DEPS = [], TOOLS = [], PURCHASES = [], PAYMENTS = [];

async function loadAll() {
  [PEOPLE, TASKS, DECISIONS, WORKDAYS, DEPS, TOOLS, PURCHASES, PAYMENTS] = await Promise.all([
    People.list(), Tasks.list(), Decisions.list(), Workdays.list(), Workdays.dependencies(), Tools.list(), Purchases.list(), Payments.list(),
  ]);
}

function countsFor(personId) {
  const openTasks = TASKS.filter((t) => t.people.some((p) => p.id === personId) && t.status !== "Gereed").length;
  const openDecisions = DECISIONS.filter((d) => d.people.some((p) => p.id === personId) && d.status === "Open").length;
  return { openTasks, openDecisions };
}

async function render() {
  const root = document.getElementById("personen-root");
  try {
    await loadAll();
    const params = new URLSearchParams(location.search);
    const personId = params.get("person");
    if (personId) renderDetail(personId); else renderList();
  } catch (err) {
    reportError(err, "het laden van de personen");
    root.innerHTML = `<p class="empty-state">Kon de personen niet laden.</p>`;
  }
}

function renderList() {
  const root = document.getElementById("personen-root");
  root.innerHTML = `<ul class="action-list" id="people-list">${PEOPLE.map(personRowHtml).join("")}</ul>`;
  wireRows();
}

function personRowHtml(p) {
  const { openTasks, openDecisions } = countsFor(p.id);
  const parts = [];
  if (openTasks) parts.push(`${openTasks} open werkzaamhe${openTasks === 1 ? "id" : "den"}`);
  if (openDecisions) parts.push(`${openDecisions} open besluit${openDecisions === 1 ? "" : "en"}`);
  return `
    <li class="actie-row" data-id="${p.id}">
      <div class="actie-body">
        <div class="actie-title person-open-link">${escapeHtml(p.name)}</div>
        ${parts.length ? `<div class="actie-meta"><span class="meta-item">${parts.join(" · ")}</span></div>` : ""}
        <div class="task-card-actions" style="margin-top:8px;">
          <button type="button" class="btn-icon person-view-btn">Bekijken</button>
          <button type="button" class="btn-icon person-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon person-delete-btn">Verwijderen</button>
        </div>
      </div>
    </li>`;
}

function wireRows() {
  document.querySelectorAll(".person-open-link, .person-view-btn").forEach((el) => {
    el.addEventListener("click", () => { location.href = `personen.html?person=${el.closest(".actie-row").dataset.id}`; });
  });
  document.querySelectorAll(".person-edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openPersonForm(PEOPLE.find((p) => p.id === btn.closest(".actie-row").dataset.id));
    });
  });
  document.querySelectorAll(".person-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.closest(".actie-row").dataset.id;
      const person = PEOPLE.find((p) => p.id === id);
      const { openTasks, openDecisions } = countsFor(id);
      const warn = (openTasks || openDecisions) ? ` Werkzaamheden/besluiten die aan "${person.name}" gekoppeld zijn, blijven bestaan maar verliezen deze koppeling.` : "";
      const ok = await confirmDialog(`"${person.name}" verwijderen?${warn}`);
      if (!ok) return;
      try { await People.remove(id); toast("Persoon verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

function renderDetail(personId) {
  const root = document.getElementById("personen-root");
  const person = PEOPLE.find((p) => p.id === personId);
  if (!person) { root.innerHTML = `<p class="empty-state">Persoon niet gevonden.</p>`; return; }

  const decorated = decorateWorkdays(WORKDAYS, TASKS, DEPS);
  const upcomingTasks = TASKS.filter((t) => t.people.some((p) => p.id === personId) && t.status !== "Gereed");
  const openDecisions = DECISIONS.filter((d) => d.people.some((p) => p.id === personId) && d.status === "Open");
  const upcomingWorkdays = decorated.filter((w) =>
    w.status !== "Gereed" && (w.presentPeople.some((p) => p.id === personId) || w.tasks.some((t) => t.people.some((p) => p.id === personId)))
  );
  const responsibleTools = TOOLS.filter((t) => t.responsible_person_id === personId);
  const finance = computePersonFinance(personId, TASKS, PURCHASES, PAYMENTS);

  root.innerHTML = `
    <a href="personen.html" class="btn-secondary" style="display:inline-block;margin-bottom:18px;">← Terug naar personen</a>
    <h2 style="margin-bottom:20px;">${escapeHtml(person.name)}</h2>

    <div class="stat-row" style="margin-bottom:24px;">
      <div class="stat-card"><div class="n">${euro(finance.responsibleFor)}</div><div class="l">Budgetverantwoordelijk voor</div></div>
      <div class="stat-card"><div class="n">${euro(finance.paidBySelf)}</div><div class="l">Zelf betaald</div></div>
      <div class="stat-card"><div class="n">${euro(finance.outstanding)}</div><div class="l">Openstaande inkopen</div></div>
    </div>

    <h3 style="font-size:1rem;margin-bottom:10px;">Komende werkzaamheden</h3>
    ${upcomingTasks.length ? `<ul class="plain-list">${upcomingTasks.map((t) => `
      <li>${escapeHtml(t.title)} <span class="pill ${statusPillClass(t.status)}">${escapeHtml(t.status)}</span>${t.workdays ? ` · Klusdag ${t.workdays.number}` : ""}</li>`).join("")}</ul>`
      : '<p class="empty-state">Geen openstaande werkzaamheden.</p>'}

    <h3 style="font-size:1rem;margin:24px 0 10px;">Besluiten</h3>
    ${openDecisions.length ? `<ul class="plain-list">${openDecisions.map((d) => `<li>${escapeHtml(d.title)}</li>`).join("")}</ul>`
      : '<p class="empty-state">Geen openstaande besluiten.</p>'}

    <h3 style="font-size:1rem;margin:24px 0 10px;">Komende klusdagen</h3>
    ${upcomingWorkdays.length ? `<ul class="plain-list">${upcomingWorkdays.map((w) => `
      <li><a href="planning.html#dag-${w.number}">Klusdag ${w.number}</a> — ${formatDate(w.date)}</li>`).join("")}</ul>`
      : '<p class="empty-state">Geen komende klusdagen.</p>'}

    <h3 style="font-size:1rem;margin:24px 0 10px;">Gereedschap waarvoor verantwoordelijk</h3>
    ${responsibleTools.length ? `<ul class="plain-list">${responsibleTools.map((t) => `<li>${escapeHtml(t.name)}</li>`).join("")}</ul>`
      : '<p class="empty-state">Geen gereedschap gekoppeld.</p>'}

    <h3 style="font-size:1rem;margin:24px 0 10px;">Openstaande inkopen</h3>
    ${finance.outstandingPurchases.length ? `<ul class="plain-list">${finance.outstandingPurchases.map((p) => `<li>${escapeHtml(p.product)} — ${euro(p.committed_cost ?? p.estimated_cost ?? 0)}</li>`).join("")}</ul>`
      : '<p class="empty-state">Geen openstaande inkopen.</p>'}
  `;
}

function openPersonForm(person) {
  const p = person || { name: "" };
  const overlay = openModal(person ? "Persoon bewerken" : "Nieuwe persoon", `
    <form id="person-form">
      <div class="form-field full"><label>Naam</label><input type="text" name="name" required value="${escapeHtml(p.name)}"></div>
      <div class="modal-actions">
        ${person ? '<button type="button" class="btn-danger" id="person-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="person-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#person-cancel-btn").addEventListener("click", closeModal);
  if (person) {
    overlay.querySelector("#person-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${person.name}" verwijderen?`);
      if (!ok) return;
      try { await People.remove(person.id); toast("Persoon verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#person-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    try {
      if (person) await People.update(person.id, { name });
      else await People.create(name);
      toast("Opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-person-btn").addEventListener("click", () => openPersonForm(null));

render();
