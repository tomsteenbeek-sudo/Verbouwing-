import { Decisions, Phases, Rooms, People, Tasks } from "../db.js?v=4";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, checkboxListHtml, peopleBadgesHtml, optionsHtml } from "../ui.js?v=4";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let DECISIONS = [], PHASES = [], ROOMS = [], PEOPLE = [], TASKS = [];
let chipFilter = "Open";

async function loadAll() {
  [DECISIONS, PHASES, ROOMS, PEOPLE, TASKS] = await Promise.all([
    Decisions.list(), Phases.list(), Rooms.list(), People.list(), Tasks.list(),
  ]);
}

async function render() {
  const root = document.getElementById("besluiten-root");
  try {
    await loadAll();

    document.getElementById("chip-row").innerHTML = ["Open", "Besloten", "alle"].map((c) =>
      `<button class="filter-btn ${chipFilter === c ? "active" : ""}" data-chip="${c}">${c === "alle" ? "Alle" : c}</button>`
    ).join("");
    document.getElementById("chip-row").querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => { chipFilter = btn.dataset.chip; render(); });
    });

    document.getElementById("besluiten-count").textContent =
      `${DECISIONS.filter((d) => d.status === "Open").length} van ${DECISIONS.length} besluiten nog open`;

    const filtered = chipFilter === "alle" ? DECISIONS : DECISIONS.filter((d) => d.status === chipFilter);
    root.innerHTML = filtered.length
      ? `<ul class="action-list">${filtered.map(decisionRowHtml).join("")}</ul>`
      : `<p class="empty-state">Geen besluiten in dit filter.</p>`;
    wireRows(root);
  } catch (err) {
    reportError(err, "het laden van de besluiten");
    root.innerHTML = `<p class="empty-state">Kon de besluiten niet laden.</p>`;
  }
}

function decisionRowHtml(d) {
  const isDone = d.status === "Besloten";
  return `
    <li class="actie-row ${isDone ? "done" : ""}" data-id="${d.id}">
      <input type="checkbox" class="decision-done-cb" ${isDone ? "checked" : ""} aria-label="Besloten">
      <div class="actie-body">
        <div class="actie-title">${escapeHtml(d.title)}${d.phases ? ` <span class="badge" style="background:${d.phases.color}22;color:${d.phases.color};">${escapeHtml(d.phases.name)}</span>` : ""}</div>
        <div class="actie-meta">
          ${d.deadline ? `<span class="meta-item">📅 ${escapeHtml(d.deadline)}</span>` : ""}
          ${d.rooms ? `<span class="meta-item">${escapeHtml(d.rooms.name)}</span>` : ""}
        </div>
        ${d.description ? `<div class="actie-note">${escapeHtml(d.description)}</div>` : ""}
        ${d.options ? `<div class="actie-note"><strong>Opties:</strong> ${escapeHtml(d.options)}</div>` : ""}
        ${d.chosen_option ? `<div class="actie-note"><strong>Gekozen:</strong> ${escapeHtml(d.chosen_option)}</div>` : ""}
        ${!isDone && d.blocks_note ? `<div class="note warn">⚠ ${escapeHtml(d.blocks_note)}</div>` : ""}
        ${peopleBadgesHtml(d.people)}
        ${d.tasks.length ? `<div class="actie-note">Gekoppelde werkzaamheden: ${d.tasks.map((t) => escapeHtml(t.title)).join(", ")}</div>` : ""}
        <div class="task-card-actions" style="margin-top:8px;">
          <button type="button" class="btn-icon decision-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon decision-delete-btn">Verwijderen</button>
        </div>
      </div>
    </li>`;
}

function wireRows(root) {
  root.querySelectorAll(".decision-done-cb").forEach((cb) => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", async (e) => {
      const id = e.target.closest(".actie-row").dataset.id;
      try { await Decisions.update(id, { status: e.target.checked ? "Besloten" : "Open" }); toast("Status bijgewerkt."); render(); }
      catch (err) { reportError(err, "bijwerken status"); }
    });
  });
  root.querySelectorAll(".decision-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openDecisionForm(DECISIONS.find((d) => d.id === btn.closest(".actie-row").dataset.id)));
  });
  root.querySelectorAll(".decision-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".actie-row").dataset.id;
      const decision = DECISIONS.find((d) => d.id === id);
      const ok = await confirmDialog(`"${decision.title}" verwijderen?`);
      if (!ok) return;
      try { await Decisions.remove(id); toast("Besluit verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

function openDecisionForm(decision) {
  const d = decision || { title: "", description: "", options: "", chosen_option: "", deadline: "", status: "Open", phase_id: "", room_id: "", blocks_note: "", notes: "" };
  const selectedPersonIds = (decision ? decision.people : []).map((p) => p.id);
  const selectedTaskIds = (decision ? decision.tasks : []).map((t) => t.id);
  const overlay = openModal(decision ? "Besluit bewerken" : "Nieuw besluit", `
    <form id="decision-form">
      <div class="form-field full"><label>Titel</label><input type="text" name="title" required value="${escapeHtml(d.title)}"></div>
      <div class="form-field full"><label>Omschrijving</label><textarea name="description">${escapeHtml(d.description || "")}</textarea></div>
      <div class="form-grid">
        <div class="form-field"><label>Mogelijke opties</label><input type="text" name="options" value="${escapeHtml(d.options || "")}" placeholder="bv. optie A, optie B"></div>
        <div class="form-field"><label>Gekozen optie</label><input type="text" name="chosen_option" value="${escapeHtml(d.chosen_option || "")}"></div>
        <div class="form-field"><label>Deadline</label><input type="text" name="deadline" value="${escapeHtml(d.deadline || "")}" placeholder="bv. vóór klusdag 3"></div>
        <div class="form-field"><label>Status</label><select name="status"><option value="Open" ${d.status === "Open" ? "selected" : ""}>Open</option><option value="Besloten" ${d.status === "Besloten" ? "selected" : ""}>Besloten</option></select></div>
        <div class="form-field"><label>Fase</label><select name="phase_id">${optionsHtml(PHASES, d.phase_id, { empty: "Geen fase" })}</select></div>
        <div class="form-field"><label>Kamer</label><select name="room_id">${optionsHtml(ROOMS, d.room_id, { empty: "Geen kamer" })}</select></div>
      </div>
      <div class="form-field full"><label>Blokkeert (optioneel)</label><input type="text" name="blocks_note" value="${escapeHtml(d.blocks_note || "")}" placeholder="bv. Blokkeert: vloer bestellen"></div>
      <div class="form-field full"><label>Betrokken personen</label>${checkboxListHtml(PEOPLE, selectedPersonIds, "person_ids")}</div>
      <div class="form-field full"><label>Gekoppelde werkzaamheden</label>${checkboxListHtml(TASKS.map((t) => ({ id: t.id, name: t.title })), selectedTaskIds, "task_ids")}</div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(d.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${decision ? '<button type="button" class="btn-danger" id="decision-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="decision-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#decision-cancel-btn").addEventListener("click", closeModal);
  if (decision) {
    overlay.querySelector("#decision-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${decision.title}" verwijderen?`);
      if (!ok) return;
      try { await Decisions.remove(decision.id); toast("Besluit verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#decision-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      title: fd.get("title").trim(),
      description: fd.get("description") || null,
      options: fd.get("options") || null,
      chosen_option: fd.get("chosen_option") || null,
      deadline: fd.get("deadline") || null,
      status: fd.get("status"),
      phase_id: fd.get("phase_id") || null,
      room_id: fd.get("room_id") || null,
      blocks_note: fd.get("blocks_note") || null,
      notes: fd.get("notes") || null,
    };
    const personIds = fd.getAll("person_ids");
    const taskIds = fd.getAll("task_ids");
    try {
      const saved = decision ? await Decisions.update(decision.id, patch) : await Decisions.create(patch);
      await Decisions.setPersons(saved.id, personIds);
      await Decisions.setTasks(saved.id, taskIds);
      toast("Besluit opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-decision-btn").addEventListener("click", () => openDecisionForm(null));

render();
