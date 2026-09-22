import { Tools, TaskTools, People } from "../db.js?v=4";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, optionsHtml } from "../ui.js?v=4";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const BUCKETS = [
  { key: "bepalen", label: "Nog bepalen", match: (t) => !t.have_it && !t.acquire_method },
  { key: "kopen", label: "Nog kopen", match: (t) => !t.have_it && t.acquire_method === "Kopen" },
  { key: "lenen-huren", label: "Nog lenen/huren", match: (t) => !t.have_it && (t.acquire_method === "Lenen" || t.acquire_method === "Huren") },
  { key: "in-huis", label: "In huis", match: (t) => t.have_it },
];

let TOOLS = [], TASK_TOOLS = [], PEOPLE = [];

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
    root.innerHTML = `<div class="status-columns">${BUCKETS.map((b) => {
      const items = TOOLS.filter(b.match);
      return `
        <div>
          <div class="status-column-head">${b.label} (${items.length})</div>
          ${items.length ? items.map(toolItemHtml).join("") : '<p class="empty-hint">Niets in deze categorie.</p>'}
        </div>`;
    }).join("")}</div>`;
    root.querySelectorAll(".material-item").forEach((el) => {
      el.addEventListener("click", () => openToolForm(TOOLS.find((t) => t.id === el.dataset.id)));
    });
  } catch (err) {
    reportError(err, "het laden van het gereedschap");
    root.innerHTML = `<p class="empty-state">Kon het gereedschap niet laden.</p>`;
  }
}

function toolItemHtml(t) {
  const linkedTasks = tasksForTool(t.id);
  const meta = [t.category || "Algemeen", t.acquire_method, t.people?.name || "Niet toegewezen"].filter(Boolean).join(" · ");
  return `
    <div class="material-item" data-id="${t.id}">
      <div class="name">${escapeHtml(t.name)}${t.quantity ? ` <span style="color:var(--text-muted);font-weight:400;">(${escapeHtml(t.quantity)})</span>` : ""}</div>
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
      ${linkedTasks.length ? `<div class="meta">Nodig voor: ${linkedTasks.map(escapeHtml).join(", ")}</div>` : ""}
    </div>`;
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
