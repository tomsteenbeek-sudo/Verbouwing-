import { Purchases, Rooms, Phases, BudgetCategories, Tasks, People } from "../db.js?v=4";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, optionsHtml, euro, statusPillClass } from "../ui.js?v=4";
import { purchaseEstimatedTotal, purchaseActualTotal } from "../finance.js?v=4";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const STATUSES = ["Nog bepalen", "Gekozen", "Nog bestellen", "Besteld", "Deels ontvangen", "In huis"];
let PURCHASES = [], ROOMS = [], PHASES = [], CATEGORIES = [], TASKS = [], PEOPLE = [];
let filters = { status: "", phase: "", category: "", room: "" };

async function loadAll() {
  [PURCHASES, ROOMS, PHASES, CATEGORIES, TASKS, PEOPLE] = await Promise.all([
    Purchases.list(), Rooms.list(), Phases.list(), BudgetCategories.list(), Tasks.list(), People.list(),
  ]);
}

function matches(p) {
  if (filters.status && p.status !== filters.status) return false;
  if (filters.phase && p.phase_id !== filters.phase) return false;
  if (filters.category && p.budget_category_id !== filters.category) return false;
  if (filters.room && p.room_id !== filters.room) return false;
  return true;
}

async function render() {
  const root = document.getElementById("inkopen-root");
  try {
    await loadAll();

    document.getElementById("filter-bar").innerHTML = `
      <select id="f-status"><option value="">Alle statussen</option>${STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
      <select id="f-phase"><option value="">Alle fases</option>${PHASES.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
      <select id="f-category"><option value="">Alle categorieën</option>${CATEGORIES.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}</select>
      <select id="f-room"><option value="">Alle ruimtes</option>${ROOMS.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("")}</select>`;
    document.getElementById("f-status").value = filters.status;
    document.getElementById("f-phase").value = filters.phase;
    document.getElementById("f-category").value = filters.category;
    document.getElementById("f-room").value = filters.room;
    ["status", "phase", "category", "room"].forEach((k) => {
      document.getElementById(`f-${k}`).addEventListener("change", (e) => { filters[k] = e.target.value; render(); });
    });

    const filtered = PURCHASES.filter(matches);
    root.innerHTML = filtered.length
      ? filtered.map(purchaseCardHtml).join("")
      : `<p class="empty-state">Geen inkopen in dit filter.</p>`;
    wireCards(root);
  } catch (err) {
    reportError(err, "het laden van de inkopen");
    root.innerHTML = `<p class="empty-state">Kon de inkopen niet laden.</p>`;
  }
}

function purchaseCardHtml(p) {
  const meta = [p.rooms?.name, p.phases?.name, p.budget_categories?.name, p.tasks?.title].filter(Boolean).join(" · ");
  const estimatedTotal = purchaseEstimatedTotal(p);
  const actualTotal = purchaseActualTotal(p);
  const diff = estimatedTotal - actualTotal;
  let diffLine = "";
  if (estimatedTotal && actualTotal) {
    if (diff > 0.005) diffLine = `<div class="sub" style="color:var(--ok, #3a7d44);">Verschil: ${euro(diff)} goedkoper dan begroot</div>`;
    else if (diff < -0.005) diffLine = `<div class="sub" style="color:var(--danger, #a33);">Verschil: ${euro(-diff)} duurder dan begroot</div>`;
  }
  return `
    <div class="task-card" data-id="${p.id}">
      <div class="task-card-head">
        <input type="checkbox" class="task-done-cb" ${p.received ? "checked" : ""} aria-label="Ontvangen" title="Ontvangen">
        <div style="flex:1;min-width:0;">
          <div class="title">${escapeHtml(p.product)} <span class="pill ${statusPillClass(p.status)}">${escapeHtml(p.status)}</span>${!p.count_in_budget ? ' <span class="badge">Telt niet mee in budget</span>' : ""}</div>
          <div class="sub">${escapeHtml(meta)}</div>
          <div class="sub">Begroot: materiaal ${euro(p.estimated_material_cost || 0)} · arbeid ${euro(p.estimated_labor_cost || 0)} · totaal ${euro(estimatedTotal)}</div>
          <div class="sub">Werkelijk: materiaal ${euro(p.actual_material_cost || 0)} · arbeid ${euro(p.actual_labor_cost || 0)} · totaal ${euro(actualTotal)}</div>
          ${diffLine}
        </div>
      </div>
      <div class="task-card-detail">
        ${p.description ? `<div class="row"><strong>Omschrijving</strong>${escapeHtml(p.description)}</div>` : ""}
        ${p.quantity || p.unit ? `<div class="row"><strong>Hoeveelheid</strong>${escapeHtml([p.quantity, p.unit].filter(Boolean).join(" "))}</div>` : ""}
        ${p.supplier ? `<div class="row"><strong>Leverancier/uitvoerder</strong>${escapeHtml(p.supplier)}</div>` : ""}
        ${p.url ? `<div class="row"><strong>Link</strong><a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${escapeHtml(p.url)}</a></div>` : ""}
        ${p.order_date ? `<div class="row"><strong>Besteld op</strong>${escapeHtml(p.order_date)}</div>` : ""}
        ${p.expected_delivery_date ? `<div class="row"><strong>Verwachte levering</strong>${escapeHtml(p.expected_delivery_date)}</div>` : ""}
        ${p.notes ? `<div class="row"><strong>Opmerkingen</strong>${escapeHtml(p.notes)}</div>` : ""}
        <div class="row"><strong>Meetellen in huidig verbouwbudget</strong>${p.count_in_budget ? "Ja" : "Nee"}</div>
        <div class="task-card-actions">
          <button type="button" class="btn-icon purchase-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon purchase-delete-btn">Verwijderen</button>
        </div>
      </div>
    </div>`;
}

function wireCards(root) {
  root.querySelectorAll(".task-card-head").forEach((head) => {
    head.addEventListener("click", (e) => {
      if (e.target.closest(".task-done-cb")) return;
      head.closest(".task-card").classList.toggle("expanded");
    });
  });
  root.querySelectorAll(".task-done-cb").forEach((cb) => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", async (e) => {
      const id = e.target.closest(".task-card").dataset.id;
      try {
        await Purchases.update(id, { received: e.target.checked, status: e.target.checked ? "In huis" : "Besteld" });
        toast("Bijgewerkt.");
        render();
      } catch (err) { reportError(err, "bijwerken"); }
    });
  });
  root.querySelectorAll(".purchase-edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => openPurchaseForm(PURCHASES.find((p) => p.id === e.target.closest(".task-card").dataset.id)));
  });
  root.querySelectorAll(".purchase-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".task-card").dataset.id;
      const purchase = PURCHASES.find((p) => p.id === id);
      const ok = await confirmDialog(`"${purchase.product}" verwijderen?`);
      if (!ok) return;
      try { await Purchases.remove(id); toast("Inkoop verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

function openPurchaseForm(purchase) {
  const p = purchase || {
    product: "", category: "", description: "", quantity: "", unit: "", supplier: "", url: "",
    estimated_material_cost: "", estimated_labor_cost: "", actual_material_cost: "", actual_labor_cost: "",
    status: "Nog bepalen", count_in_budget: true,
    order_date: "", expected_delivery_date: "", room_id: "", phase_id: "", task_id: "", budget_category_id: "", notes: "",
  };
  const taskOptions = TASKS.map((t) => ({ id: t.id, name: t.title }));
  const overlay = openModal(purchase ? "Inkoop bewerken" : "Nieuwe inkoop", `
    <form id="purchase-form">
      <div class="form-field full"><label>Naam</label><input type="text" name="product" required value="${escapeHtml(p.product)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Categorie (vrije tekst)</label><input type="text" name="category" value="${escapeHtml(p.category || "")}"></div>
        <div class="form-field"><label>Hoeveelheid</label><input type="text" name="quantity" value="${escapeHtml(p.quantity || "")}"></div>
        <div class="form-field"><label>Eenheid</label><input type="text" name="unit" value="${escapeHtml(p.unit || "")}"></div>
        <div class="form-field"><label>Leverancier/uitvoerder</label><input type="text" name="supplier" value="${escapeHtml(p.supplier || "")}"></div>
        <div class="form-field"><label>Status</label><select name="status">${STATUSES.map((s) => `<option value="${s}" ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="form-field"><label>Materiaal begroot (€)</label><input type="number" step="0.01" name="estimated_material_cost" value="${p.estimated_material_cost ?? ""}"></div>
        <div class="form-field"><label>Arbeid begroot (€)</label><input type="number" step="0.01" name="estimated_labor_cost" value="${p.estimated_labor_cost ?? ""}"></div>
        <div class="form-field"><label>Materiaal werkelijk (€)</label><input type="number" step="0.01" name="actual_material_cost" value="${p.actual_material_cost ?? ""}"></div>
        <div class="form-field"><label>Arbeid werkelijk (€)</label><input type="number" step="0.01" name="actual_labor_cost" value="${p.actual_labor_cost ?? ""}"></div>
        <div class="form-field"><label>Besteld op</label><input type="date" name="order_date" value="${p.order_date || ""}"></div>
        <div class="form-field"><label>Verwachte levering</label><input type="date" name="expected_delivery_date" value="${p.expected_delivery_date || ""}"></div>
        <div class="form-field"><label>Ontvangen</label><div class="checkbox-field"><input type="checkbox" name="received" ${p.received ? "checked" : ""}><span>Ja</span></div></div>
        <div class="form-field"><label>Meetellen in huidig verbouwbudget</label><div class="checkbox-field"><input type="checkbox" name="count_in_budget" ${p.count_in_budget !== false ? "checked" : ""}><span>Ja</span></div></div>
        <div class="form-field"><label>Kamer</label><select name="room_id">${optionsHtml(ROOMS, p.room_id, { empty: "Geen kamer" })}</select></div>
        <div class="form-field"><label>Fase</label><select name="phase_id">${optionsHtml(PHASES, p.phase_id, { empty: "Geen fase" })}</select></div>
        <div class="form-field"><label>Budgetcategorie</label><select name="budget_category_id">${optionsHtml(CATEGORIES, p.budget_category_id, { empty: "Geen categorie" })}</select></div>
        <div class="form-field"><label>Gekoppelde werkzaamheid (informatief)</label><select name="task_id">${optionsHtml(taskOptions, p.task_id, { empty: "Geen werkzaamheid" })}</select></div>
      </div>
      <div class="form-field full"><label>Link</label><input type="url" name="url" value="${escapeHtml(p.url || "")}"></div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(p.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${purchase ? '<button type="button" class="btn-danger" id="purchase-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="purchase-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#purchase-cancel-btn").addEventListener("click", closeModal);
  if (purchase) {
    overlay.querySelector("#purchase-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`"${purchase.product}" verwijderen?`);
      if (!ok) return;
      try { await Purchases.remove(purchase.id); toast("Inkoop verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#purchase-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const num = (key) => (fd.get(key) ? Number(fd.get(key)) : null);
    const patch = {
      product: fd.get("product").trim(),
      category: fd.get("category") || null,
      description: fd.get("description") || null,
      quantity: fd.get("quantity") || null,
      unit: fd.get("unit") || null,
      supplier: fd.get("supplier") || null,
      url: fd.get("url") || null,
      estimated_material_cost: num("estimated_material_cost"),
      estimated_labor_cost: num("estimated_labor_cost"),
      actual_material_cost: num("actual_material_cost"),
      actual_labor_cost: num("actual_labor_cost"),
      status: fd.get("status"),
      count_in_budget: fd.get("count_in_budget") === "on",
      order_date: fd.get("order_date") || null,
      expected_delivery_date: fd.get("expected_delivery_date") || null,
      received: fd.get("received") === "on",
      room_id: fd.get("room_id") || null,
      phase_id: fd.get("phase_id") || null,
      task_id: fd.get("task_id") || null,
      budget_category_id: fd.get("budget_category_id") || null,
      notes: fd.get("notes") || null,
    };
    try {
      if (purchase) await Purchases.update(purchase.id, patch);
      else await Purchases.create(patch);
      toast("Inkoop opgeslagen — Budget is automatisch bijgewerkt.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-purchase-btn").addEventListener("click", () => openPurchaseForm(null));

render();
