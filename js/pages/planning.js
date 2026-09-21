import { Rooms, Workdays, People, Tasks } from "../db.js";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, statusPillClass } from "../ui.js";
import { taskCardHtml, wireTaskCards, openTaskForm } from "../task-shared.js";
import { decorateWorkdays, prerequisiteWarning } from "../domain.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let ROOMS = [], WORKDAYS = [], PEOPLE = [], TASKS = [], DEPS = [];
let filters = { workday: "", person: "", room: "", status: "" };

async function loadAll() {
  [ROOMS, WORKDAYS, PEOPLE, TASKS, DEPS] = await Promise.all([
    Rooms.list(), Workdays.list(), People.list(), Tasks.list(), Workdays.dependencies(),
  ]);
}

function matchesFilters(t) {
  if (filters.workday === "unplanned" && t.workday_id) return false;
  if (filters.workday && filters.workday !== "unplanned" && t.workday_id !== filters.workday) return false;
  if (filters.person && t.person_id !== filters.person) return false;
  if (filters.room && t.room_id !== filters.room) return false;
  if (filters.status && t.status !== filters.status) return false;
  return true;
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
        ${WORKDAYS.map((w) => `<option value="${w.id}">Klusdag ${w.number} — ${escapeHtml(w.name)}</option>`).join("")}
      </select>
      <select id="f-person"><option value="">Alle personen</option>${PEOPLE.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
      <select id="f-room"><option value="">Alle ruimtes</option>${ROOMS.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("")}</select>
      <select id="f-status">
        <option value="">Alle statussen</option>
        <option value="Nog in te plannen">Nog in te plannen</option>
        <option value="Te doen">Te doen</option>
        <option value="Bezig">Bezig</option>
        <option value="Gereed">Gereed</option>
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
        ${unplanned.length ? `<div id="unplanned-tasks">${unplanned.map((t) => taskCardHtml(t, { workdays: WORKDAYS })).join("")}</div>` : '<p class="empty-state">Alles is aan een klusdag gekoppeld.</p>'}
      </div>`;

    const workdayBlocks = filters.workday === "unplanned" ? "" : decorated.map((w) => {
      const visibleTasks = w.tasks.filter(matchesFilters);
      if (filters.workday && filters.workday !== w.id) return "";
      if ((filters.person || filters.room || filters.status) && !visibleTasks.length && !filters.workday) return "";
      const warn = w.status !== "Gereed" ? prerequisiteWarning(w, byNumber) : null;
      const pct = w.total ? Math.round((w.done / w.total) * 100) : 0;
      return `
        <div class="workday-block" id="dag-${w.number}" data-workday-id="${w.id}">
          <div class="workday-block-head">
            <div>
              <div class="klusdag-nr">Klusdag ${w.number} <span class="pill ${statusPillClass(w.status)}">${w.status}</span></div>
              <h3 style="margin-bottom:2px;">${escapeHtml(w.name)}</h3>
              <div class="workday-block-meta">${w.description ? escapeHtml(w.description) + " · " : ""}${w.done}/${w.total} gereed</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="date" class="inline-input date-input workday-date-input" data-id="${w.id}" value="${w.date || ""}">
              <button type="button" class="btn-icon workday-edit-btn" data-id="${w.id}">Bewerken</button>
              <button type="button" class="btn-icon workday-delete-btn" data-id="${w.id}">Verwijderen</button>
            </div>
          </div>
          <div class="mini-progress" style="margin-bottom:10px;"><i style="width:${pct}%"></i></div>
          ${warn ? `<div class="note warn">⏳ ${warn}</div>` : ""}
          ${w.drying_time ? `<div class="note">⏳ Droog-/wachttijd: ${escapeHtml(w.drying_time)}</div>` : ""}
          <div class="task-list-for-day">${visibleTasks.length ? visibleTasks.map((t) => taskCardHtml(t, { showWorkday: false, workdays: WORKDAYS })).join("") : '<p class="empty-state">Geen werkzaamheden in dit filter.</p>'}</div>
        </div>`;
    }).join("");

    root.innerHTML = unplannedHtml + workdayBlocks;
    wireTaskCards(root, TASKS, ctx);

    root.querySelectorAll(".workday-date-input").forEach((input) => {
      input.addEventListener("change", async (e) => {
        try { await Workdays.update(e.target.dataset.id, { date: e.target.value || null }); toast("Datum bijgewerkt."); render(); }
        catch (err) { reportError(err, "datum bijwerken"); }
      });
    });
    root.querySelectorAll(".workday-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openWorkdayForm(WORKDAYS.find((w) => w.id === btn.dataset.id)));
    });
    root.querySelectorAll(".workday-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const wd = WORKDAYS.find((w) => w.id === btn.dataset.id);
        const ok = await confirmDialog(`Klusdag ${wd.number} — ${wd.name} verwijderen? De werkzaamheden blijven bestaan en gaan naar "Nog in te plannen".`);
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

function openWorkdayForm(workday) {
  const w = workday || { number: (Math.max(0, ...WORKDAYS.map((x) => x.number)) + 1), name: "", date: "", description: "" };
  const overlay = openModal(workday ? "Klusdag bewerken" : "Nieuwe klusdag", `
    <form id="workday-form">
      <div class="form-grid">
        <div class="form-field"><label>Nummer</label><input type="number" name="number" required value="${w.number}"></div>
        <div class="form-field"><label>Datum</label><input type="date" name="date" value="${w.date || ""}"></div>
      </div>
      <div class="form-field full"><label>Naam</label><input type="text" name="name" required value="${escapeHtml(w.name)}"></div>
      <div class="form-field full"><label>Omschrijving</label><input type="text" name="description" value="${escapeHtml(w.description || "")}"></div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="workday-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#workday-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#workday-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      number: Number(fd.get("number")),
      name: fd.get("name").trim(),
      date: fd.get("date") || null,
      description: fd.get("description") || null,
    };
    try {
      if (workday) await Workdays.update(workday.id, patch);
      else await Workdays.create({ ...patch, sort_order: patch.number });
      toast("Klusdag opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan klusdag"); }
  });
}

document.getElementById("add-workday-btn").addEventListener("click", () => openWorkdayForm(null));
document.getElementById("add-task-btn").addEventListener("click", () => {
  openTaskForm({ task: null, rooms: ROOMS, workdays: WORKDAYS, people: PEOPLE }, render);
});

render();
