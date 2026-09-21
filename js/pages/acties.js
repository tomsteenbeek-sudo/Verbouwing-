import { Actions, People } from "../db.js";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, checkboxListHtml, peopleBadgesHtml } from "../ui.js";
import { renderBulkBar, wireSelectCheckboxes } from "../bulk.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const CATEGORIES = ["Uitzoeken", "Beslissen", "Offerte aanvragen", "Vakman inplannen", "Bestellen / inkopen", "Administratie / subsidie"];
const STATUSES = ["Open", "Gedaan"];
let ACTIONS = [], PEOPLE = [];
let chipFilter = "alle";
let personFilter = "";
const selectedActionIds = new Set();

async function loadAll() {
  [ACTIONS, PEOPLE] = await Promise.all([Actions.list(), People.list()]);
}

function matches(a) {
  if (personFilter && !a.people.some((p) => p.id === personFilter)) return false;
  if (chipFilter === "alle") return true;
  if (chipFilter === "Open") return a.status === "Open";
  if (chipFilter === "Gereed") return a.status === "Gedaan";
  return a.category === chipFilter;
}

async function render() {
  const root = document.getElementById("acties-root");
  try {
    await loadAll();

    document.getElementById("chip-row").innerHTML = ["alle", "Open", "Gereed", ...CATEGORIES].map((c) =>
      `<button class="filter-btn ${chipFilter === c ? "active" : ""}" data-chip="${c}">${c === "alle" ? "Alle" : c}</button>`
    ).join("");
    document.getElementById("chip-row").querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => { chipFilter = btn.dataset.chip; render(); });
    });

    document.getElementById("person-filter").innerHTML = `<option value="">Alle personen</option>${PEOPLE.map((p) => `<option value="${p.id}" ${p.id === personFilter ? "selected" : ""}>${escapeHtml(p.name)}</option>`).join("")}`;
    document.getElementById("person-filter").onchange = (e) => { personFilter = e.target.value; render(); };

    document.getElementById("acties-count").textContent = `${ACTIONS.filter((a) => a.status === "Open").length} van ${ACTIONS.length} acties nog open`;

    const filtered = ACTIONS.filter(matches);
    const groups = CATEGORIES.map((cat) => {
      const items = filtered.filter((a) => a.category === cat);
      if (!items.length) return "";
      return `<div class="actie-group"><h3>${cat}</h3><ul class="action-list actie-list">${items.map(actionRowHtml).join("")}</ul></div>`;
    }).join("");
    root.innerHTML = groups || `<p class="empty-state">Geen acties in dit filter.</p>`;
    wireRows(root);
    wireSelectCheckboxes(root, ".actie-select-cb", () => renderBulk(), selectedActionIds);
    renderBulk();
  } catch (err) {
    reportError(err, "het laden van de acties");
    root.innerHTML = `<p class="empty-state">Kon de acties niet laden.</p>`;
  }
}

function actionRowHtml(a) {
  const isDone = a.status === "Gedaan";
  const blocks = a.workdays && !isDone ? `<span class="badge blokkeert" title="Blokkeert klusdag ${a.workdays.number}">Blokkeert planning</span>` : "";
  return `
    <li class="actie-row ${isDone ? "done" : ""}" data-id="${a.id}">
      <input type="checkbox" class="actie-select-cb" aria-label="Selecteren">
      <input type="checkbox" class="actie-done-cb" ${isDone ? "checked" : ""} aria-label="Gedaan">
      <div class="actie-body">
        <div class="actie-title">${escapeHtml(a.title)} ${blocks}</div>
        <div class="actie-meta">
          <span class="meta-item">📅 ${escapeHtml(a.deadline || "—")}</span>
        </div>
        ${peopleBadgesHtml(a.people)}
        ${a.notes ? `<div class="actie-note">${escapeHtml(a.notes)}</div>` : ""}
        <div class="task-card-actions" style="margin-top:8px;">
          <button type="button" class="btn-icon actie-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon actie-delete-btn">Verwijderen</button>
        </div>
      </div>
    </li>`;
}

function wireRows(root) {
  root.querySelectorAll(".actie-done-cb").forEach((cb) => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", async (e) => {
      const id = e.target.closest(".actie-row").dataset.id;
      try { await Actions.update(id, { status: e.target.checked ? "Gedaan" : "Open" }); toast("Status bijgewerkt."); render(); }
      catch (err) { reportError(err, "bijwerken status"); }
    });
  });
  root.querySelectorAll(".actie-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".actie-row").dataset.id;
      openActionForm(ACTIONS.find((a) => a.id === id));
    });
  });
  root.querySelectorAll(".actie-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".actie-row").dataset.id;
      const action = ACTIONS.find((a) => a.id === id);
      const ok = await confirmDialog(`"${action.title}" verwijderen?`);
      if (!ok) return;
      try { await Actions.remove(id); toast("Actie verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

function renderBulk() {
  const bar = document.getElementById("bulk-bar");
  renderBulkBar(bar, {
    selectedIds: Array.from(selectedActionIds),
    people: PEOPLE,
    workdays: null,
    statuses: STATUSES,
    onAssignPerson: async (personId) => {
      try { await Actions.addPersonToMany(Array.from(selectedActionIds), personId); toast("Toegewezen."); selectedActionIds.clear(); render(); }
      catch (err) { reportError(err, "toewijzen"); }
    },
    onSetStatus: async (status) => {
      try { await Actions.bulkUpdate(Array.from(selectedActionIds), { status }); toast("Status bijgewerkt."); selectedActionIds.clear(); render(); }
      catch (err) { reportError(err, "status wijzigen"); }
    },
    onDelete: async () => {
      const ok = await confirmDialog(`${selectedActionIds.size} acties verwijderen?`);
      if (!ok) return;
      try { await Actions.bulkRemove(Array.from(selectedActionIds)); toast("Verwijderd."); selectedActionIds.clear(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    },
    onCancel: () => { selectedActionIds.clear(); render(); },
  });
}

function openActionForm(action) {
  const a = action || { title: "", category: CATEGORIES[0], deadline: "", status: "Open", notes: "" };
  const selectedPersonIds = (action ? action.people : []).map((p) => p.id);
  const overlay = openModal(action ? "Actie bewerken" : "Nieuwe actie", `
    <form id="action-form">
      <div class="form-field full"><label>Titel</label><input type="text" name="title" required value="${escapeHtml(a.title)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Categorie</label><select name="category">${CATEGORIES.map((c) => `<option value="${c}" ${c === a.category ? "selected" : ""}>${c}</option>`).join("")}</select></div>
        <div class="form-field"><label>Deadline</label><input type="text" name="deadline" placeholder="bv. vóór klusdag 3" value="${escapeHtml(a.deadline || "")}"></div>
        <div class="form-field"><label>Status</label><select name="status"><option value="Open" ${a.status === "Open" ? "selected" : ""}>Open</option><option value="Gedaan" ${a.status === "Gedaan" ? "selected" : ""}>Gedaan</option></select></div>
      </div>
      <div class="form-field full"><label>Toegewezen aan</label>${checkboxListHtml(PEOPLE, selectedPersonIds, "person_ids")}</div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(a.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${action ? '<button type="button" class="btn-danger" id="action-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="action-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#action-cancel-btn").addEventListener("click", closeModal);
  if (action) {
    overlay.querySelector("#action-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${action.title}" verwijderen?`);
      if (!ok) return;
      try { await Actions.remove(action.id); toast("Actie verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#action-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      title: fd.get("title").trim(),
      category: fd.get("category"),
      deadline: fd.get("deadline") || null,
      status: fd.get("status"),
      notes: fd.get("notes") || null,
    };
    const personIds = fd.getAll("person_ids");
    try {
      const saved = action ? await Actions.update(action.id, patch) : await Actions.create(patch);
      await Actions.setPersons(saved.id, personIds);
      toast("Actie opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-action-btn").addEventListener("click", () => openActionForm(null));

render();
