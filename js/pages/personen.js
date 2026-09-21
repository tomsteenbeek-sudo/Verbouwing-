import { People, Tasks, Actions } from "../db.js";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let PEOPLE = [], TASKS = [], ACTIONS = [];

async function loadAll() {
  [PEOPLE, TASKS, ACTIONS] = await Promise.all([People.list(), Tasks.list(), Actions.list()]);
}

function countsFor(personId) {
  const openTasks = TASKS.filter((t) => t.person_id === personId && t.status !== "Gereed").length;
  const openActions = ACTIONS.filter((a) => a.person_id === personId && a.status !== "Gereed").length;
  return { openTasks, openActions };
}

async function render() {
  const root = document.getElementById("personen-root");
  try {
    await loadAll();
    root.innerHTML = `<ul class="action-list" id="people-list">${PEOPLE.map(personRowHtml).join("")}</ul>`;
    wireRows();
  } catch (err) {
    reportError(err, "het laden van de personen");
    root.innerHTML = `<p class="empty-state">Kon de personen niet laden.</p>`;
  }
}

function personRowHtml(p) {
  const { openTasks, openActions } = countsFor(p.id);
  const parts = [];
  if (openTasks) parts.push(`${openTasks} open werkzaamhe${openTasks === 1 ? "id" : "den"}`);
  if (openActions) parts.push(`${openActions} open acti${openActions === 1 ? "e" : "es"}`);
  return `
    <li class="actie-row" data-id="${p.id}">
      <div class="actie-body">
        <div class="actie-title">${escapeHtml(p.name)}</div>
        ${parts.length ? `<div class="actie-meta"><span class="meta-item">${parts.join(" · ")}</span></div>` : ""}
        <div class="task-card-actions" style="margin-top:8px;">
          <button type="button" class="btn-icon person-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon person-delete-btn">Verwijderen</button>
        </div>
      </div>
    </li>`;
}

function wireRows() {
  document.querySelectorAll(".person-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openPersonForm(PEOPLE.find((p) => p.id === btn.closest(".actie-row").dataset.id)));
  });
  document.querySelectorAll(".person-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".actie-row").dataset.id;
      const person = PEOPLE.find((p) => p.id === id);
      const { openTasks, openActions } = countsFor(id);
      const warn = (openTasks || openActions) ? ` Werkzaamheden/acties die aan "${person.name}" gekoppeld zijn, komen te staan op "niet toegewezen".` : "";
      const ok = await confirmDialog(`"${person.name}" verwijderen?${warn}`);
      if (!ok) return;
      try { await People.remove(id); toast("Persoon verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
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
