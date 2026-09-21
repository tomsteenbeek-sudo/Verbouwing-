import { Rooms, Workdays, People, Tasks, Tools, TaskMaterials, TaskTools } from "../db.js?v=1";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, statusPillClass, checkboxListHtml, peopleBadgesHtml } from "../ui.js?v=1";
import { taskCardHtml, wireTaskCards, openTaskForm, TASK_STATUSES } from "../task-shared.js?v=1";
import { decorateWorkdays, prerequisiteWarning, formatDate } from "../domain.js?v=1";
import { makeSortable } from "../sortable.js?v=1";
import { renderBulkBar, wireSelectCheckboxes } from "../bulk.js?v=1";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let ROOMS = [], WORKDAYS = [], PEOPLE = [], TASKS = [], DEPS = [], TOOLS = [], TASK_MATERIALS = [], TASK_TOOLS = [];
let filters = { workday: "", person: "", room: "", status: "" };
const selectedTaskIds = new Set();

async function loadAll() {
  [ROOMS, WORKDAYS, PEOPLE, TASKS, DEPS, TOOLS, TASK_MATERIALS, TASK_TOOLS] = await Promise.all([
    Rooms.list(), Workdays.list(), People.list(), Tasks.list(), Workdays.dependencies(),
    Tools.list(), TaskMaterials.listAll(), TaskTools.listAll(),
  ]);
}

function matchesFilters(t) {
  if (filters.workday === "unplanned" && t.workday_id) return false;
  if (filters.workday && filters.workday !== "unplanned" && t.workday_id !== filters.workday) return false;
  if (filters.person && !t.people.some((p) => p.id === filters.person)) return false;
  if (filters.room && t.room_id !== filters.room) return false;
  if (filters.status && t.status !== filters.status) return false;
  return true;
}

function materialsForTaskIds(taskIds) {
  const idSet = new Set(taskIds);
  const seen = new Map();
  TASK_MATERIALS.forEach((row) => {
    if (!idSet.has(row.task_id) || !row.materials) return;
    seen.set(row.materials.id, row.materials);
  });
  return Array.from(seen.values());
}

function toolsByPersonForTaskIds(taskIds) {
  const idSet = new Set(taskIds);
  const toolIds = new Set(TASK_TOOLS.filter((row) => idSet.has(row.task_id)).map((row) => row.tool_id));
  const groups = new Map();
  TOOLS.filter((tool) => toolIds.has(tool.id)).forEach((tool) => {
    const label = tool.people ? tool.people.name : "Niet toegewezen";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(tool);
  });
  return groups;
}

async function render() {
  const root = document.getElementById("planning-root");
  try {
    await loadAll();
    const decorated = decorateWorkdays(WORKDAYS, TASKS, DEPS);
    const byNumber = new Map(decorated.map((d) => [d.number, d]));

    document.getElementById("filter-bar").innerHTML = `
      <select id="f-workday">
        <option value="">Alle klusdagen</option>
        <option value="unplanned">Nog in te plannen</option>
        ${WORKDAYS.map((w) => `<option value="${w.id}">Klusdag ${w.number}</option>`).join("")}
      </select>
      <select id="f-person"><option value="">Alle personen</option>${PEOPLE.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
      <select id="f-room"><option value="">Alle ruimtes</option>${ROOMS.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("")}</select>
      <select id="f-status">
        <option value="">Alle statussen</option>
        ${TASK_STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("")}
      </select>`;
    document.getElementById("f-workday").value = filters.workday;
    document.getElementById("f-person").value = filters.person;
    document.getElementById("f-room").value = filters.room;
    document.getElementById("f-status").value = filters.status;
    ["workday", "person", "room", "status"].forEach((k) => {
      document.getElementById(`f-${k}`).addEventListener("change", (e) => { filters[k] = e.target.value; render(); });
    });

    const ctx = { rooms: ROOMS, workdays: WORKDAYS, people: PEOPLE, onChange: render };

    const showUnplanned = !filters.workday || filters.workday === "unplanned";
    const unplanned = TASKS.filter((t) => !t.workday_id && matchesFilters(t));
    const unplannedHtml = !showUnplanned ? "" : `
      <div class="unplanned-block">
        <div class="workday-block-head"><h3>Nog in te plannen</h3><span class="workday-block-meta">${unplanned.length} werkzaamheden</span></div>
        ${unplanned.length ? `<div id="unplanned-tasks">${unplanned.map((t) => taskCardHtml(t, { workdays: WORKDAYS, selectable: true })).join("")}</div>` : '<p class="empty-state">Alles is aan een klusdag gekoppeld.</p>'}
      </div>`;

    const workdayBlocks = filters.workday === "unplanned" ? "" : decorated.map((w) => {
      const visibleTasks = w.tasks.filter(matchesFilters);
      if (filters.workday && filters.workday !== w.id) return "";
      if ((filters.person || filters.room || filters.status) && !visibleTasks.length && !filters.workday) return "";
      const warn = w.status !== "Gereed" ? prerequisiteWarning(w, byNumber) : null;
      const pct = w.total ? Math.round((w.done / w.total) * 100) : 0;
      const dayTaskIds = w.tasks.map((t) => t.id);
      const dayMaterials = materialsForTaskIds(dayTaskIds);
      const toolGroups = toolsByPersonForTaskIds(dayTaskIds);
      const showOrderLabels = !filters.person && !filters.room && !filters.status;
      return `
        <div class="workday-block" id="dag-${w.number}" data-workday-id="${w.id}">
          <div class="workday-block-head">
            <div>
              <div class="klusdag-nr">Klusdag ${w.number} <span class="pill ${statusPillClass(w.status)}">${w.status}</span></div>
              <div class="workday-block-meta">${formatDate(w.date)} · ${w.done}/${w.total} gereed</div>
              <div class="workday-present">
                <strong>Aanwezig:</strong> ${w.presentPeople.length ? w.presentPeople.map((p) => escapeHtml(p.name)).join(" · ") : "—"}
                <button type="button" class="btn-icon workday-present-btn" data-id="${w.id}">Bewerken</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="date" class="inline-input date-input workday-date-input" data-id="${w.id}" value="${w.date || ""}">
              <button type="button" class="btn-icon workday-delete-btn" data-id="${w.id}">Verwijderen</button>
            </div>
          </div>
          <div class="mini-progress" style="margin-bottom:10px;"><i style="width:${pct}%"></i></div>
          ${warn ? `<div class="note warn">⏳ ${warn}</div>` : ""}
          ${w.drying_time ? `<div class="note">⏳ Droog-/wachttijd: ${escapeHtml(w.drying_time)}</div>` : ""}
          <div class="task-list-for-day" data-workday-id="${w.id}">${visibleTasks.length ? visibleTasks.map((t, i) => taskCardHtml(t, { showWorkday: false, workdays: WORKDAYS, selectable: true, sortable: showOrderLabels, sortOrderLabel: showOrderLabels ? i + 1 : null })).join("") : '<p class="empty-state">Geen werkzaamheden in dit filter.</p>'}</div>
          ${dayMaterials.length ? `
          <h4 class="day-subhead">Materialen voor deze dag</h4>
          <ul class="plain-list">${dayMaterials.map((m) => `<li>${escapeHtml(m.name)} <span class="pill ${m.status === "In huis" ? "gedaan" : "open"}">${escapeHtml(m.status)}</span></li>`).join("")}</ul>` : ""}
          ${toolGroups.size ? `
          <h4 class="day-subhead">Gereedschap nodig</h4>
          <div class="tools-by-person">${Array.from(toolGroups.entries()).map(([person, tools]) => `
            <div class="tools-by-person-group"><strong>${escapeHtml(person)}</strong><ul class="plain-list">${tools.map((tool) => `<li>${escapeHtml(tool.name)}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
        </div>`;
    }).join("");

    root.innerHTML = unplannedHtml + workdayBlocks;
    wireTaskCards(root, TASKS, ctx);
    wireBulk(root);

    root.querySelectorAll(".task-list-for-day").forEach((list) => {
      makeSortable(list, {
        onReorder: async (ids) => {
          try {
            await Promise.all(ids.map((id, i) => Tasks.update(id, { sort_order: i + 1 })));
            toast("Volgorde opgeslagen.");
            render();
          } catch (err) { reportError(err, "volgorde opslaan"); }
        },
      });
    });

    root.querySelectorAll(".workday-date-input").forEach((input) => {
      input.addEventListener("change", async (e) => {
        try { await Workdays.update(e.target.dataset.id, { date: e.target.value || null }); toast("Datum bijgewerkt."); render(); }
        catch (err) { reportError(err, "datum bijwerken"); }
      });
    });
    root.querySelectorAll(".workday-present-btn").forEach((btn) => {
      btn.addEventListener("click", () => openPresentForm(WORKDAYS.find((w) => w.id === btn.dataset.id)));
    });
    root.querySelectorAll(".workday-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const wd = WORKDAYS.find((w) => w.id === btn.dataset.id);
        const ok = await confirmDialog(`Klusdag ${wd.number} verwijderen? De werkzaamheden blijven bestaan en gaan naar "Nog in te plannen".`);
        if (!ok) return;
        try { await Workdays.remove(wd.id); toast("Klusdag verwijderd, werkzaamheden staan bij Nog in te plannen."); render(); }
        catch (err) { reportError(err, "verwijderen klusdag"); }
      });
    });

    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (err) {
    reportError(err, "het laden van de planning");
    root.innerHTML = `<p class="empty-state">Kon de planning niet laden.</p>`;
  }
}

function wireBulk(root) {
  wireSelectCheckboxes(root, ".task-select-cb", () => renderBulk(), selectedTaskIds);
  renderBulk();
}

function renderBulk() {
  const bar = document.getElementById("bulk-bar");
  renderBulkBar(bar, {
    selectedIds: Array.from(selectedTaskIds),
    people: PEOPLE,
    workdays: WORKDAYS,
    statuses: TASK_STATUSES,
    onAssignPerson: async (personId) => {
      try { await Tasks.addPersonToMany(Array.from(selectedTaskIds), personId); toast("Toegewezen."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "toewijzen"); }
    },
    onMoveWorkday: async (workdayId) => {
      try { await Tasks.bulkUpdate(Array.from(selectedTaskIds), { workday_id: workdayId }); toast("Verplaatst."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "verplaatsen"); }
    },
    onSetStatus: async (status) => {
      try { await Tasks.bulkUpdate(Array.from(selectedTaskIds), { status }); toast("Status bijgewerkt."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "status wijzigen"); }
    },
    onDelete: async () => {
      const ok = await confirmDialog(`${selectedTaskIds.size} werkzaamheden verwijderen? Dit kan niet ongedaan worden gemaakt.`);
      if (!ok) return;
      try { await Tasks.bulkRemove(Array.from(selectedTaskIds)); toast("Verwijderd."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    },
    onCancel: () => { selectedTaskIds.clear(); render(); },
  });
}

function openPresentForm(workday) {
  const selectedIds = workday.presentPeople.map((p) => p.id);
  const overlay = openModal(`Aanwezig op klusdag ${workday.number}`, `
    <form id="present-form">
      <div class="form-field full">${checkboxListHtml(PEOPLE, selectedIds, "person_ids")}</div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="present-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#present-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#present-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await Workdays.setPresent(workday.id, fd.getAll("person_ids"));
      toast("Aanwezigheid opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan aanwezigheid"); }
  });
}

function openWorkdayForm() {
  const nextNumber = Math.max(0, ...WORKDAYS.map((w) => w.number)) + 1;
  const overlay = openModal("Nieuwe klusdag", `
    <form id="workday-form">
      <div class="form-grid">
        <div class="form-field"><label>Nummer</label><input type="number" name="number" required value="${nextNumber}"></div>
        <div class="form-field"><label>Datum</label><input type="date" name="date"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="workday-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#workday-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#workday-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const number = Number(fd.get("number"));
    try {
      await Workdays.create({ number, date: fd.get("date") || null, sort_order: number });
      toast("Klusdag opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan klusdag"); }
  });
}

document.getElementById("add-workday-btn").addEventListener("click", openWorkdayForm);
document.getElementById("add-task-btn").addEventListener("click", () => {
  openTaskForm({ task: null, rooms: ROOMS, workdays: WORKDAYS, people: PEOPLE }, render);
});

render();
