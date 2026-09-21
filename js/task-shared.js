// Gedeelde werkzaamheid-kaart en -formulier, gebruikt door Kamers en Planning.
// Eén databronrecord (tasks-tabel) wordt hier gerenderd; wijzig je het op de ene
// pagina, dan is het overal bijgewerkt omdat beide pagina's dezelfde rij ophalen.
import { Tasks } from "./db.js";
import { openModal, closeModal, optionsHtml, toast, reportError, confirmDialog, escapeHtml } from "./ui.js";

export const TASK_CATEGORIES = ["Sloop", "Elektra", "Isolatie", "Herstel", "Schilderwerk", "Vloer", "Afwerking", "Trap", "Installatie", "Interieur", "Buiten", "Tuin", "Controle", "Timmerwerk", "Administratie"];
export const TASK_STATUSES = ["Nog in te plannen", "Te doen", "Bezig", "Gereed"];

export function taskCardHtml(task, opts = {}) {
  const isGereed = task.status === "Gereed";
  const subParts = [];
  if (opts.showRoom !== false) subParts.push(task.rooms ? escapeHtml(task.rooms.name) : "Algemeen");
  if (opts.showWorkday !== false) subParts.push(task.workdays ? "Klusdag " + task.workdays.number : "Nog in te plannen");
  subParts.push(task.people ? escapeHtml(task.people.name) : "Niet toegewezen");
  return `
    <div class="task-card ${isGereed ? "gereed" : ""}" data-id="${task.id}">
      <div class="task-card-head">
        <input type="checkbox" class="task-done-cb" ${isGereed ? "checked" : ""} aria-label="Gereed">
        <div style="flex:1;min-width:0;">
          <div class="title">${escapeHtml(task.title)}</div>
          <div class="sub">${subParts.join(" · ")}${task.is_external ? ' <span class="badge extern">Extern</span>' : ""}</div>
        </div>
      </div>
      <div class="task-card-detail">
        ${task.description ? `<div class="row"><strong>Omschrijving</strong>${escapeHtml(task.description)}</div>` : ""}
        ${task.dependency_note ? `<div class="row"><strong>Afhankelijkheid</strong>${escapeHtml(task.dependency_note)}</div>` : ""}
        ${task.notes ? `<div class="row"><strong>Opmerkingen</strong>${escapeHtml(task.notes)}</div>` : ""}
        <div class="row"><strong>Categorie</strong>${escapeHtml(task.category || "—")}</div>
        ${opts.workdays ? `
        <div class="row">
          <strong>Verplaats naar klusdag</strong>
          <select class="task-move-select">
            <option value="">Nog in te plannen</option>
            ${opts.workdays.map((w) => `<option value="${w.id}" ${task.workday_id === w.id ? "selected" : ""}>Klusdag ${w.number} — ${escapeHtml(w.name)}</option>`).join("")}
          </select>
        </div>` : ""}
        <div class="task-card-actions">
          <button type="button" class="btn-icon task-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon task-delete-btn">Verwijderen</button>
        </div>
      </div>
    </div>`;
}

export function wireTaskCards(container, tasksArray, ctx) {
  container.querySelectorAll(".task-card-head").forEach((head) => {
    head.addEventListener("click", (e) => {
      if (e.target.closest(".task-done-cb")) return;
      head.closest(".task-card").classList.toggle("expanded");
    });
  });
  container.querySelectorAll(".task-done-cb").forEach((cb) => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", async (e) => {
      const id = e.target.closest(".task-card").dataset.id;
      try {
        await Tasks.update(id, { status: e.target.checked ? "Gereed" : "Te doen" });
        toast("Status bijgewerkt.");
        ctx.onChange();
      } catch (err) { reportError(err, "bijwerken status"); }
    });
  });
  container.querySelectorAll(".task-edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest(".task-card").dataset.id;
      const task = tasksArray.find((t) => t.id === id);
      openTaskForm({ task, ...ctx }, ctx.onChange);
    });
  });
  container.querySelectorAll(".task-move-select").forEach((sel) => {
    sel.addEventListener("click", (e) => e.stopPropagation());
    sel.addEventListener("change", async (e) => {
      const id = e.target.closest(".task-card").dataset.id;
      try {
        await Tasks.update(id, { workday_id: e.target.value || null });
        toast("Verplaatst.");
        ctx.onChange();
      } catch (err) { reportError(err, "verplaatsen"); }
    });
  });
  container.querySelectorAll(".task-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".task-card").dataset.id;
      const task = tasksArray.find((t) => t.id === id);
      const ok = await confirmDialog(`"${task.title}" verwijderen? Dit kan niet ongedaan worden gemaakt.`);
      if (!ok) return;
      try { await Tasks.remove(id); toast("Werkzaamheid verwijderd."); ctx.onChange(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

export function openTaskForm({ task, rooms, workdays, people, defaults = {} }, onSaved) {
  const t = task || {
    title: "", description: "", room_id: defaults.room_id || "", workday_id: defaults.workday_id || "",
    person_id: "", category: "", status: "Nog in te plannen", dependency_note: "", notes: "", is_external: false,
  };
  const workdayOptions = workdays.map((w) => ({ id: w.id, name: `Klusdag ${w.number} — ${w.name}` }));
  const overlay = openModal(task ? "Werkzaamheid bewerken" : "Nieuwe werkzaamheid", `
    <form id="task-form">
      <div class="form-field full"><label>Titel</label><input type="text" name="title" required value="${escapeHtml(t.title)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Kamer</label><select name="room_id">${optionsHtml(rooms, t.room_id, { empty: "Algemeen / geen kamer" })}</select></div>
        <div class="form-field"><label>Klusdag</label><select name="workday_id">${optionsHtml(workdayOptions, t.workday_id, { empty: "Nog in te plannen" })}</select></div>
        <div class="form-field"><label>Toegewezen aan</label><select name="person_id">${optionsHtml(people, t.person_id, { empty: "Nog niet toegewezen" })}</select></div>
        <div class="form-field"><label>Categorie</label>
          <select name="category">
            <option value="" ${!t.category ? "selected" : ""}>Overig</option>
            ${TASK_CATEGORIES.map((c) => `<option value="${c}" ${c === t.category ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="form-field"><label>Status</label>
          <select name="status">${TASK_STATUSES.map((s) => `<option value="${s}" ${s === t.status ? "selected" : ""}>${s}</option>`).join("")}</select>
        </div>
        <div class="form-field"><label>Uitvoering</label><div class="checkbox-field"><input type="checkbox" name="is_external" ${t.is_external ? "checked" : ""}><span>Extern (bv. elektricien, vloerlegger)</span></div></div>
      </div>
      <div class="form-field full"><label>Omschrijving</label><textarea name="description">${escapeHtml(t.description || "")}</textarea></div>
      <div class="form-field full"><label>Afhankelijkheid (optioneel)</label><input type="text" name="dependency_note" value="${escapeHtml(t.dependency_note || "")}" placeholder="bv. moet drogen vóór volgende stap"></div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(t.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${task ? '<button type="button" class="btn-danger" id="task-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="task-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);

  overlay.querySelector("#task-cancel-btn").addEventListener("click", closeModal);
  if (task) {
    overlay.querySelector("#task-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${task.title}" verwijderen? Dit kan niet ongedaan worden gemaakt.`);
      if (!ok) return;
      try { await Tasks.remove(task.id); toast("Werkzaamheid verwijderd."); closeModal(); onSaved(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      title: fd.get("title").trim(),
      room_id: fd.get("room_id") || null,
      workday_id: fd.get("workday_id") || null,
      person_id: fd.get("person_id") || null,
      category: fd.get("category") || null,
      status: fd.get("status"),
      is_external: fd.get("is_external") === "on",
      description: fd.get("description") || null,
      dependency_note: fd.get("dependency_note") || null,
      notes: fd.get("notes") || null,
    };
    try {
      if (task) await Tasks.update(task.id, patch);
      else await Tasks.create(patch);
      toast("Werkzaamheid opgeslagen.");
      closeModal();
      onSaved();
    } catch (err) { reportError(err, "opslaan"); }
  });
}
