// Gedeelde bulkselectiebalk voor werkzaamheden en acties: "N geselecteerd" +
// toewijzen aan persoon / (werkzaamheden) verplaatsen naar klusdag / status
// wijzigen / verwijderen. Eén implementatie, hergebruikt op Kamers, Planning
// en Acties.
import { escapeHtml } from "./ui.js?v=4";

export function renderBulkBar(container, {
  selectedIds, people, workdays, statuses,
  onAssignPerson, onMoveWorkday, onSetStatus, onDelete, onCancel,
}) {
  if (!selectedIds.length) {
    container.innerHTML = "";
    container.classList.remove("open");
    return;
  }
  container.classList.add("open");
  container.innerHTML = `
    <div class="bulk-bar-inner">
      <strong>${selectedIds.length} geselecteerd</strong>
      <div class="bulk-actions">
        <select class="bulk-assign-select">
          <option value="">Toewijzen aan…</option>
          ${people.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}
        </select>
        ${workdays ? `
        <select class="bulk-move-select">
          <option value="">Verplaatsen naar…</option>
          <option value="__unplanned">Nog in te plannen</option>
          ${workdays.map((w) => `<option value="${w.id}">Klusdag ${w.number}</option>`).join("")}
        </select>` : ""}
        <select class="bulk-status-select">
          <option value="">Status wijzigen…</option>
          ${statuses.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
        <button type="button" class="btn-danger bulk-delete-btn">Verwijderen</button>
        <button type="button" class="btn-secondary bulk-cancel-btn">Annuleren</button>
      </div>
    </div>`;

  const assignSel = container.querySelector(".bulk-assign-select");
  assignSel.addEventListener("change", (e) => {
    const value = e.target.value;
    e.target.value = "";
    if (value) onAssignPerson(value);
  });

  const moveSel = container.querySelector(".bulk-move-select");
  if (moveSel) {
    moveSel.addEventListener("change", (e) => {
      const value = e.target.value;
      e.target.value = "";
      if (value) onMoveWorkday(value === "__unplanned" ? null : value);
    });
  }

  const statusSel = container.querySelector(".bulk-status-select");
  statusSel.addEventListener("change", (e) => {
    const value = e.target.value;
    e.target.value = "";
    if (value) onSetStatus(value);
  });

  container.querySelector(".bulk-delete-btn").addEventListener("click", onDelete);
  container.querySelector(".bulk-cancel-btn").addEventListener("click", onCancel);
}

// Beheert de selectie-Set voor een lijst kaarten met een `.xxx-select-cb`
// checkbox; roept onChange(selectedIdsArray) aan bij elke wijziging.
export function wireSelectCheckboxes(root, selector, onChange, selected) {
  root.querySelectorAll(selector).forEach((cb) => {
    const id = cb.closest("[data-id]").dataset.id;
    cb.checked = selected.has(id);
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", (e) => {
      if (e.target.checked) selected.add(id); else selected.delete(id);
      onChange(Array.from(selected));
    });
  });
}
