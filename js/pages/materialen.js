import { Materials, Rooms } from "../db.js?v=1";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, optionsHtml, euro } from "../ui.js?v=1";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const BUCKETS = [
  { key: "uitzoeken", label: "Nog uitzoeken", statuses: ["Nog bepalen", "Uitzoeken"] },
  { key: "kopen", label: "Nog kopen", statuses: ["Bestellen"] },
  { key: "besteld", label: "Besteld", statuses: ["Besteld"] },
  { key: "in-huis", label: "In huis", statuses: ["In huis"] },
];

let MATERIALS = [], ROOMS = [];

async function loadAll() {
  [MATERIALS, ROOMS] = await Promise.all([Materials.list(), Rooms.list()]);
}

async function render() {
  const root = document.getElementById("materialen-root");
  try {
    await loadAll();
    root.innerHTML = `<div class="status-columns">${BUCKETS.map((b) => {
      const items = MATERIALS.filter((m) => b.statuses.includes(m.status));
      return `
        <div>
          <div class="status-column-head">${b.label} (${items.length})</div>
          ${items.length ? items.map(materialItemHtml).join("") : '<p class="empty-hint">Niets in deze categorie.</p>'}
        </div>`;
    }).join("")}</div>`;
    root.querySelectorAll(".material-item").forEach((el) => {
      el.addEventListener("click", () => openMaterialForm(MATERIALS.find((m) => m.id === el.dataset.id)));
    });
  } catch (err) {
    reportError(err, "het laden van de materialen");
    root.innerHTML = `<p class="empty-state">Kon de materialen niet laden.</p>`;
  }
}

function materialItemHtml(m) {
  const qty = [m.quantity_needed, m.unit].filter(Boolean).join(" ");
  const meta = [m.rooms?.name, qty].filter(Boolean).join(" · ");
  return `
    <div class="material-item" data-id="${m.id}">
      <div class="name">${escapeHtml(m.name)}</div>
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
      ${m.price ? `<div class="meta">${euro(m.price)}</div>` : ""}
    </div>`;
}

function openMaterialForm(material) {
  const m = material || {
    name: "", category: "", room_id: "", quantity_needed: "", unit: "", quantity_purchased: "",
    store: "", price: "", url: "", status: "Nog bepalen", notes: "",
  };
  const overlay = openModal(material ? "Materiaal bewerken" : "Nieuw materiaal", `
    <form id="material-form">
      <div class="form-field full"><label>Naam</label><input type="text" name="name" required value="${escapeHtml(m.name)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Categorie</label><input type="text" name="category" value="${escapeHtml(m.category || "")}"></div>
        <div class="form-field"><label>Nodig voor kamer</label><select name="room_id">${optionsHtml(ROOMS, m.room_id, { empty: "Hele woning / geen kamer" })}</select></div>
        <div class="form-field"><label>Hoeveelheid</label><input type="text" name="quantity_needed" value="${escapeHtml(m.quantity_needed || "")}" placeholder="bv. 10"></div>
        <div class="form-field"><label>Eenheid</label><input type="text" name="unit" value="${escapeHtml(m.unit || "")}" placeholder="bv. L, m, m², stuks"></div>
        <div class="form-field"><label>Aantal gekocht</label><input type="text" name="quantity_purchased" value="${escapeHtml(m.quantity_purchased || "")}"></div>
        <div class="form-field"><label>Status</label>
          <select name="status">
            <option value="Nog bepalen" ${m.status === "Nog bepalen" ? "selected" : ""}>Nog bepalen</option>
            <option value="Uitzoeken" ${m.status === "Uitzoeken" ? "selected" : ""}>Uitzoeken</option>
            <option value="Bestellen" ${m.status === "Bestellen" ? "selected" : ""}>Bestellen</option>
            <option value="Besteld" ${m.status === "Besteld" ? "selected" : ""}>Besteld</option>
            <option value="In huis" ${m.status === "In huis" ? "selected" : ""}>In huis</option>
          </select>
        </div>
        <div class="form-field"><label>Winkel/leverancier</label><input type="text" name="store" value="${escapeHtml(m.store || "")}"></div>
        <div class="form-field"><label>Prijs (€)</label><input type="number" step="0.01" name="price" value="${m.price ?? ""}"></div>
      </div>
      <div class="form-field full"><label>Link</label><input type="url" name="url" value="${escapeHtml(m.url || "")}"></div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(m.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${material ? '<button type="button" class="btn-danger" id="material-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="material-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#material-cancel-btn").addEventListener("click", closeModal);
  if (material) {
    overlay.querySelector("#material-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${material.name}" verwijderen?`);
      if (!ok) return;
      try { await Materials.remove(material.id); toast("Materiaal verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#material-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      name: fd.get("name").trim(),
      category: fd.get("category") || null,
      room_id: fd.get("room_id") || null,
      quantity_needed: fd.get("quantity_needed") || null,
      unit: fd.get("unit") || null,
      quantity_purchased: fd.get("quantity_purchased") || null,
      status: fd.get("status"),
      store: fd.get("store") || null,
      price: fd.get("price") ? Number(fd.get("price")) : null,
      url: fd.get("url") || null,
      notes: fd.get("notes") || null,
    };
    try {
      if (material) await Materials.update(material.id, patch);
      else await Materials.create(patch);
      toast("Materiaal opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-material-btn").addEventListener("click", () => openMaterialForm(null));

render();
