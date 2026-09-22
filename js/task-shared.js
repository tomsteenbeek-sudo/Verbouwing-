// Gedeelde werkzaamheid-kaart en -formulier, gebruikt door Kamers en Planning.
// Eén databronrecord (tasks-tabel) wordt hier gerenderd; wijzig je het op de ene
// pagina, dan is het overal bijgewerkt omdat beide pagina's dezelfde rij ophalen.
// Werkzaamheden zijn puur planning — budget loopt uitsluitend via Inkopen.
import { Tasks } from "./db.js?v=4";
import { openModal, closeModal, optionsHtml, checkboxListHtml, peopleBadgesHtml, toast, reportError, confirmDialog, escapeHtml, euro } from "./ui.js?v=4";

export const TASK_CATEGORIES = ["Sloop", "Elektra", "Isolatie", "Herstel", "Schilderwerk", "Vloer", "Afwerking", "Trap", "Installatie", "Interieur", "Buiten", "Tuin", "Controle", "Timmerwerk", "Administratie"];
export const TASK_STATUSES = ["Nog in te plannen", "Te doen", "Bezig", "Gereed"];
export const TASK_TYPES = ["Werkzaamheid", "Voorbereidende actie"];
export const TASK_REASONS = ["Budget", "Later uitvoeren", "Niet noodzakelijk", "Eerst ervaring opdoen", "Afhankelijk van andere verbouwing", "Vervallen"];

export function taskCardHtml(task, opts = {}) {
  const isGereed = task.status === "Gereed";
  const subParts = [];
  if (opts.showRoom !== false) subParts.push(task.rooms ? escapeHtml(task.rooms.name) : "Algemeen");
  if (opts.showWorkday !== false) subParts.push(task.workdays ? "Klusdag " + task.workdays.number : "Nog in te plannen");
  if (task.phases) subParts.push(`<span style="color:${task.phases.color};">${escapeHtml(task.phases.name)}</span>`);
  return `
    <div class="task-card ${isGereed ? "gereed" : ""}" data-id="${task.id}">
      <div class="task-card-head">
        ${opts.sortable ? '<span class="drag-handle" title="Sleep om te herordenen">≡</span>' : ""}
        ${opts.selectable ? '<input type="checkbox" class="task-select-cb" aria-label="Selecteren">' : ""}
        <input type="checkbox" class="task-done-cb" ${isGereed ? "checked" : ""} aria-label="Gereed">
        <div style="flex:1;min-width:0;">
          <div class="title">${opts.sortOrderLabel != null ? `<span class="order-nr">${opts.sortOrderLabel}.</span> ` : ""}${escapeHtml(task.title)}${task.type === "Voorbereidende actie" ? ' <span class="badge">Voorbereidende actie</span>' : ""}</div>
          <div class="sub">${subParts.join(" · ")}${task.is_external ? ' <span class="badge extern">Extern</span>' : ""}</div>
          ${peopleBadgesHtml(task.people)}
        </div>
      </div>
      <div class="task-card-detail">
        ${task.description ? `<div class="row"><strong>Omschrijving</strong>${escapeHtml(task.description)}</div>` : ""}
        ${task.dependency_note ? `<div class="row"><strong>Afhankelijkheid</strong>${escapeHtml(task.dependency_note)}</div>` : ""}
        ${task.notes ? `<div class="row"><strong>Opmerkingen</strong>${escapeHtml(task.notes)}</div>` : ""}
        <div class="row"><strong>Categorie</strong>${escapeHtml(task.category || "—")}</div>
        ${task.reason ? `<div class="row"><strong>Reden</strong>${escapeHtml(task.reason)}</div>` : ""}
        ${task.desired_date ? `<div class="row"><strong>Gewenste uitvoerdatum later</strong>${escapeHtml(task.desired_date)}</div>` : ""}
        ${task.scope_estimated_cost != null ? `<div class="row"><strong>Geschatte kosten</strong>${euro(task.scope_estimated_cost)} (indicatief, telt niet mee in Budget)</div>` : ""}
        ${opts.workdays ? `
        <div class="row">
          <strong>Verplaats naar klusdag</strong>
          <select class="task-move-select">
            <option value="">Nog in te plannen</option>
            ${opts.workdays.map((w) => `<option value="${w.id}" ${task.workday_id === w.id ? "selected" : ""}>Klusdag ${w.number}</option>`).join("")}
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
      if (e.target.closest(".task-done-cb, .task-select-cb, .drag-handle")) return;
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

export function openTaskForm({ task, rooms, workdays, people, phases = [], defaults = {}, showReasonFields = false }, onSaved) {
  const t = task || {
    title: "", description: "", room_id: defaults.room_id || "", workday_id: defaults.workday_id || "",
    category: "", status: "Nog in te plannen", dependency_note: "", notes: "", is_external: false,
    type: defaults.type || "Werkzaamheid", phase_id: defaults.phase_id || "",
    reason: "", desired_date: "", scope_estimated_cost: "",
  };
  const selectedPersonIds = (task ? task.people : []).map((p) => p.id);
  const workdayOptions = workdays.map((w) => ({ id: w.id, name: `Klusdag ${w.number}` }));
  const overlay = openModal(task ? "Werkzaamheid bewerken" : "Nieuwe werkzaamheid", `
    <form id="task-form">
      <div class="form-field full"><label>Titel</label><input type="text" name="title" required value="${escapeHtml(t.title)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Type</label><select name="type">${TASK_TYPES.map((ty) => `<option value="${ty}" ${ty === t.type ? "selected" : ""}>${ty}</option>`).join("")}</select></div>
        <div class="form-field"><label>Fase</label><select name="phase_id">${optionsHtml(phases, t.phase_id, { empty: "Geen fase" })}</select></div>
        <div class="form-field"><label>Kamer</label><select name="room_id">${optionsHtml(rooms, t.room_id, { empty: "Algemeen / geen kamer" })}</select></div>
        <div class="form-field"><label>Klusdag</label><select name="workday_id">${optionsHtml(workdayOptions, t.workday_id, { empty: "Nog in te plannen" })}</select></div>
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
        ${showReasonFields ? `
        <div class="form-field"><label>Reden</label><select name="reason">${optionsHtml(TASK_REASONS.map((r) => ({ id: r, name: r })), t.reason, { empty: "—" })}</select></div>
        <div class="form-field"><label>Gewenste uitvoerdatum later</label><input type="text" name="desired_date" value="${escapeHtml(t.desired_date || "")}" placeholder="bv. 2027 of 'na verhuizing'"></div>
        <div class="form-field"><label>Geschatte kosten indien bekend (€)</label><input type="number" step="0.01" name="scope_estimated_cost" value="${t.scope_estimated_cost ?? ""}" placeholder="puur indicatief, telt niet mee in Budget"></div>` : ""}
      </div>
      <div class="form-field full"><label>Toegewezen aan (uitvoerders)</label>${checkboxListHtml(people, selectedPersonIds, "person_ids")}</div>
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
      type: fd.get("type"),
      phase_id: fd.get("phase_id") || null,
      room_id: fd.get("room_id") || null,
      workday_id: fd.get("workday_id") || null,
      category: fd.get("category") || null,
      status: fd.get("status"),
      is_external: fd.get("is_external") === "on",
      description: fd.get("description") || null,
      dependency_note: fd.get("dependency_note") || null,
      notes: fd.get("notes") || null,
    };
    if (showReasonFields) {
      patch.reason = fd.get("reason") || null;
      patch.desired_date = fd.get("desired_date") || null;
      patch.scope_estimated_cost = fd.get("scope_estimated_cost") ? Number(fd.get("scope_estimated_cost")) : null;
    }
    const personIds = fd.getAll("person_ids");
    try {
      const saved = task ? await Tasks.update(task.id, patch) : await Tasks.create(patch);
      await Tasks.setPersons(saved.id, personIds);
      toast("Werkzaamheid opgeslagen.");
      closeModal();
      onSaved();
    } catch (err) { reportError(err, "opslaan"); }
  });
}
