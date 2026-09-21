import { Tools, TaskTools, People } from "../db.js";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, optionsHtml } from "../ui.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let TOOLS = [];
let TASK_TOOLS = [];
let PEOPLE = [];

async function loadAll() {
  [TOOLS, TASK_TOOLS, PEOPLE] = await Promise.all([Tools.list(), TaskTools.listAll(), People.list()]);
}

function tasksForTool(toolId) {
  return TASK_TOOLS.filter((t) => t.tool_id === toolId).map((t) => t.tasks?.title).filter(Boolean);
}

async function render() {
  const root = document.getElementById("gereedschap-root");
  try {
    await loadAll();
    root.innerHTML = `<ul class="action-list" id="tools-list">${TOOLS.map(toolRowHtml).join("")}</ul>`;
    wireRows();
  } catch (err) {
    reportError(err, "het laden van het gereedschap");
    root.innerHTML = `<p class="empty-state">Kon het gereedschap niet laden.</p>`;
  }
}

function toolRowHtml(t) {
  const linkedTasks = tasksForTool(t.id);
  return `
    <li class="actie-row" data-id="${t.id}">
      <input type="checkbox" class="tool-have-cb" ${t.have_it ? "checked" : ""} aria-label="Heb ik al">
      <div class="actie-body">
        <div class="actie-title">${escapeHtml(t.name)}${t.quantity ? ` <span style="color:var(--text-muted);font-weight:400;">(${escapeHtml(t.quantity)})</span>` : ""}</div>
        <div class="actie-meta">
          <span class="meta-item">${escapeHtml(t.category || "Algemeen")}</span>
          ${t.acquire_method ? `<span class="meta-item">${escapeHtml(t.acquire_method)}</span>` : ""}
          <span class="meta-item">👤 ${escapeHtml(t.people?.name || "Niet toegewezen")}</span>
        </div>
        ${linkedTasks.length ? `<div class="actie-note">Nodig voor: ${linkedTasks.map(escapeHtml).join(", ")}</div>` : ""}
        <div class="task-card-actions" style="margin-top:8px;">
          <button type="button" class="btn-icon tool-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon tool-delete-btn">Verwijderen</button>
        </div>
      </div>
    </li>`;
}

function wireRows() {
  document.querySelectorAll(".tool-have-cb").forEach((cb) => {
    cb.addEventListener("change", async (e) => {
      const id = e.target.closest(".actie-row").dataset.id;
      try { await Tools.update(id, { have_it: e.target.checked }); toast("Bijgewerkt."); render(); }
      catch (err) { reportError(err, "bijwerken"); }
    });
  });
  document.querySelectorAll(".tool-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openToolForm(TOOLS.find((t) => t.id === btn.closest(".actie-row").dataset.id)));
  });
  document.querySelectorAll(".tool-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".actie-row").dataset.id;
      const tool = TOOLS.find((t) => t.id === id);
      const ok = await confirmDialog(`"${tool.name}" verwijderen?`);
      if (!ok) return;
      try { await Tools.remove(id); toast("Gereedschap verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

function openToolForm(tool) {
  const t = tool || { name: "", category: "", have_it: false, acquire_method: "", quantity: "", notes: "", responsible_person_id: "" };
  const overlay = openModal(tool ? "Gereedschap bewerken" : "Nieuw gereedschap", `
    <form id="tool-form">
      <div class="form-field full"><label>Naam</label><input type="text" name="name" required value="${escapeHtml(t.name)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Categorie</label><input type="text" name="category" value="${escapeHtml(t.category || "")}"></div>
        <div class="form-field"><label>Hoeveelheid</label><input type="text" name="quantity" value="${escapeHtml(t.quantity || "")}"></div>
        <div class="form-field"><label>Kopen / lenen / huren</label>
          <select name="acquire_method">
            <option value="" ${!t.acquire_method ? "selected" : ""}>—</option>
            <option value="Kopen" ${t.acquire_method === "Kopen" ? "selected" : ""}>Kopen</option>
            <option value="Lenen" ${t.acquire_method === "Lenen" ? "selected" : ""}>Lenen</option>
            <option value="Huren" ${t.acquire_method === "Huren" ? "selected" : ""}>Huren</option>
          </select>
        </div>
        <div class="form-field"><label>Verantwoordelijk</label><select name="responsible_person_id">${optionsHtml(PEOPLE, t.responsible_person_id, { empty: "Niet toegewezen" })}</select></div>
        <div class="form-field"><label>Heb ik al</label><div class="checkbox-field"><input type="checkbox" name="have_it" ${t.have_it ? "checked" : ""}><span>Ja</span></div></div>
      </div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(t.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${tool ? '<button type="button" class="btn-danger" id="tool-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="tool-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#tool-cancel-btn").addEventListener("click", closeModal);
  if (tool) {
    overlay.querySelector("#tool-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${tool.name}" verwijderen?`);
      if (!ok) return;
      try { await Tools.remove(tool.id); toast("Gereedschap verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#tool-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      name: fd.get("name").trim(),
      category: fd.get("category") || null,
      quantity: fd.get("quantity") || null,
      acquire_method: fd.get("acquire_method") || null,
      responsible_person_id: fd.get("responsible_person_id") || null,
      have_it: fd.get("have_it") === "on",
      notes: fd.get("notes") || null,
    };
    try {
      if (tool) await Tools.update(tool.id, patch);
      else await Tools.create(patch);
      toast("Gereedschap opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-tool-btn").addEventListener("click", () => openToolForm(null));

render();
