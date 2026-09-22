import { Rooms, Workdays, People, Tasks, Phases } from "../db.js?v=4";
import { renderNav, escapeHtml, reportError } from "../ui.js?v=4";
import { taskCardHtml, wireTaskCards, openTaskForm, TASK_REASONS } from "../task-shared.js?v=4";
import { BUITEN_SCOPE_PHASE_NAME } from "../domain.js?v=4";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let ROOMS = [], WORKDAYS = [], PEOPLE = [], TASKS = [], PHASES = [];
let filters = { reason: "", room: "" };

async function loadAll() {
  [ROOMS, WORKDAYS, PEOPLE, TASKS, PHASES] = await Promise.all([
    Rooms.list(), Workdays.list(), People.list(), Tasks.list(), Phases.list(),
  ]);
}

function buitenScopePhase() {
  return PHASES.find((p) => p.name === BUITEN_SCOPE_PHASE_NAME);
}

function taskCtx() {
  return { rooms: ROOMS, workdays: WORKDAYS, people: PEOPLE, phases: PHASES, onChange: render, showReasonFields: true };
}

function matchesFilters(t) {
  if (filters.reason && t.reason !== filters.reason) return false;
  if (filters.room && t.room_id !== filters.room) return false;
  return true;
}

async function render() {
  const root = document.getElementById("buiten-scope-root");
  try {
    await loadAll();
    const phase = buitenScopePhase();
    if (!phase) {
      root.innerHTML = `<p class="empty-state">De fase "Buiten scope / later" bestaat nog niet. Draai eerst de migratie.</p>`;
      return;
    }
    const items = TASKS.filter((t) => t.phase_id === phase.id);

    document.getElementById("filter-bar").innerHTML = `
      <select id="f-reason"><option value="">Alle redenen</option>${TASK_REASONS.map((r) => `<option value="${r}">${r}</option>`).join("")}</select>
      <select id="f-room"><option value="">Alle ruimtes</option>${ROOMS.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("")}</select>`;
    document.getElementById("f-reason").value = filters.reason;
    document.getElementById("f-room").value = filters.room;
    ["reason", "room"].forEach((k) => {
      document.getElementById(`f-${k}`).addEventListener("change", (e) => { filters[k] = e.target.value; render(); });
    });

    const visible = items.filter(matchesFilters);
    root.innerHTML = visible.length
      ? visible.map((t) => taskCardHtml(t, { showWorkday: false })).join("")
      : `<p class="empty-state">Geen buiten-scope items in dit filter.</p>`;
    wireTaskCards(root, TASKS, taskCtx());
  } catch (err) {
    reportError(err, "het laden van buiten scope");
    root.innerHTML = `<p class="empty-state">Kon buiten scope niet laden.</p>`;
  }
}

document.getElementById("add-item-btn").addEventListener("click", () => {
  const phase = buitenScopePhase();
  if (!phase) return;
  openTaskForm({ task: null, ...taskCtx(), defaults: { phase_id: phase.id, type: "Werkzaamheid" } }, render);
});

render();
