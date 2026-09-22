import { Purchases, Payments, Rooms, Phases, BudgetCategories, Tasks, People } from "../db.js?v=3";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, optionsHtml, euro, statusPillClass } from "../ui.js?v=3";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const STATUSES = ["Nog bepalen", "Gekozen", "Nog bestellen", "Besteld", "Deels ontvangen", "In huis"];
let PURCHASES = [], PAYMENTS = [], ROOMS = [], PHASES = [], CATEGORIES = [], TASKS = [], PEOPLE = [];
let filters = { status: "", phase: "", category: "", room: "" };

async function loadAll() {
  [PURCHASES, PAYMENTS, ROOMS, PHASES, CATEGORIES, TASKS, PEOPLE] = await Promise.all([
    Purchases.list(), Payments.list(), Rooms.list(), Phases.list(), BudgetCategories.list(), Tasks.list(), People.list(),
  ]);
}

function matches(p) {
  if (filters.status && p.status !== filters.status) return false;
  if (filters.phase && p.phase_id !== filters.phase) return false;
  if (filters.category && p.budget_category_id !== filters.category) return false;
  if (filters.room && p.room_id !== filters.room) return false;
  return true;
}

function paymentsFor(purchaseId) {
  return PAYMENTS.filter((pay) => pay.purchase_id === purchaseId);
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
  const payments = paymentsFor(p.id);
  const paidSum = payments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
  return `
    <div class="task-card" data-id="${p.id}">
      <div class="task-card-head">
        <input type="checkbox" class="task-done-cb" ${p.received ? "checked" : ""} aria-label="Ontvangen" title="Ontvangen">
        <div style="flex:1;min-width:0;">
          <div class="title">${escapeHtml(p.product)} <span class="pill ${statusPillClass(p.status)}">${escapeHtml(p.status)}</span></div>
          <div class="sub">${escapeHtml(meta)}</div>
          <div class="sub">${p.estimated_cost != null ? "Begroot " + euro(p.estimated_cost) + " · " : ""}${p.committed_cost != null ? "Verplicht " + euro(p.committed_cost) + " · " : ""}${p.actual_cost != null ? "Betaald " + euro(p.actual_cost) : ""}</div>
        </div>
      </div>
      <div class="task-card-detail">
        ${p.description ? `<div class="row"><strong>Omschrijving</strong>${escapeHtml(p.description)}</div>` : ""}
        ${p.quantity || p.unit ? `<div class="row"><strong>Hoeveelheid</strong>${escapeHtml([p.quantity, p.unit].filter(Boolean).join(" "))}</div>` : ""}
        ${p.supplier ? `<div class="row"><strong>Leverancier</strong>${escapeHtml(p.supplier)}</div>` : ""}
        ${p.url ? `<div class="row"><strong>Link</strong><a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${escapeHtml(p.url)}</a></div>` : ""}
        ${p.order_date ? `<div class="row"><strong>Besteld op</strong>${escapeHtml(p.order_date)}</div>` : ""}
        ${p.expected_delivery_date ? `<div class="row"><strong>Verwachte levering</strong>${escapeHtml(p.expected_delivery_date)}</div>` : ""}
        ${p.notes ? `<div class="row"><strong>Opmerkingen</strong>${escapeHtml(p.notes)}</div>` : ""}
        <div class="row">
          <strong>Betalingen${paidSum ? " (" + euro(paidSum) + " geregistreerd)" : ""}</strong>
          ${payments.length ? `<ul class="plain-list">${payments.map((pay) => `<li>${euro(pay.amount)} — ${escapeHtml(pay.people?.name || "onbekend")}${pay.payment_date ? " · " + escapeHtml(pay.payment_date) : ""} <button type="button" class="btn-icon payment-delete-btn" data-payment-id="${pay.id}">✕</button></li>`).join("")}</ul>` : '<p class="empty-hint">Nog geen betalingen geregistreerd.</p>'}
          <button type="button" class="btn-icon purchase-add-payment-btn">+ Betaling</button>
        </div>
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
  root.querySelectorAll(".purchase-add-payment-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => openPaymentForm(e.target.closest(".task-card").dataset.id));
  });
  root.querySelectorAll(".payment-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = await confirmDialog("Deze betaling verwijderen?");
      if (!ok) return;
      try { await Payments.remove(btn.dataset.paymentId); toast("Betaling verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen betaling"); }
    });
  });
}

function openPaymentForm(purchaseId) {
  const overlay = openModal("Betaling toevoegen", `
    <form id="payment-form">
      <div class="form-grid">
        <div class="form-field"><label>Bedrag</label><input type="number" step="0.01" name="amount" required></div>
        <div class="form-field"><label>Door</label><select name="person_id">${optionsHtml(PEOPLE, "", { empty: "Onbekend" })}</select></div>
        <div class="form-field"><label>Datum</label><input type="date" name="payment_date"></div>
      </div>
      <div class="form-field full"><label>Opmerkingen</label><input type="text" name="notes"></div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="payment-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Toevoegen</button>
      </div>
    </form>`);
  overlay.querySelector("#payment-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#payment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await Payments.create({
        purchase_id: purchaseId,
        amount: Number(fd.get("amount")),
        person_id: fd.get("person_id") || null,
        payment_date: fd.get("payment_date") || null,
        notes: fd.get("notes") || null,
      });
      toast("Betaling toegevoegd.");
      closeModal();
      render();
    } catch (err) { reportError(err, "toevoegen betaling"); }
  });
}

function openPurchaseForm(purchase) {
  const p = purchase || {
    product: "", category: "", description: "", quantity: "", unit: "", supplier: "", url: "",
    estimated_cost: "", committed_cost: "", actual_cost: "", status: "Nog bepalen",
    order_date: "", expected_delivery_date: "", room_id: "", phase_id: "", task_id: "", budget_category_id: "", notes: "",
  };
  const taskOptions = TASKS.map((t) => ({ id: t.id, name: t.title }));
  const overlay = openModal(purchase ? "Inkoop bewerken" : "Nieuwe inkoop", `
    <form id="purchase-form">
      <div class="form-field full"><label>Product</label><input type="text" name="product" required value="${escapeHtml(p.product)}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Categorie (vrije tekst)</label><input type="text" name="category" value="${escapeHtml(p.category || "")}"></div>
        <div class="form-field"><label>Hoeveelheid</label><input type="text" name="quantity" value="${escapeHtml(p.quantity || "")}"></div>
        <div class="form-field"><label>Eenheid</label><input type="text" name="unit" value="${escapeHtml(p.unit || "")}"></div>
        <div class="form-field"><label>Leverancier/winkel</label><input type="text" name="supplier" value="${escapeHtml(p.supplier || "")}"></div>
        <div class="form-field"><label>Status</label><select name="status">${STATUSES.map((s) => `<option value="${s}" ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="form-field"><label>Geplande prijs</label><input type="number" step="0.01" name="estimated_cost" value="${p.estimated_cost ?? ""}"></div>
        <div class="form-field"><label>Verplicht bedrag</label><input type="number" step="0.01" name="committed_cost" value="${p.committed_cost ?? ""}"></div>
        <div class="form-field"><label>Werkelijk bedrag</label><input type="number" step="0.01" name="actual_cost" value="${p.actual_cost ?? ""}"></div>
        <div class="form-field"><label>Besteld op</label><input type="date" name="order_date" value="${p.order_date || ""}"></div>
        <div class="form-field"><label>Verwachte levering</label><input type="date" name="expected_delivery_date" value="${p.expected_delivery_date || ""}"></div>
        <div class="form-field"><label>Ontvangen</label><div class="checkbox-field"><input type="checkbox" name="received" ${p.received ? "checked" : ""}><span>Ja</span></div></div>
        <div class="form-field"><label>Kamer</label><select name="room_id">${optionsHtml(ROOMS, p.room_id, { empty: "Geen kamer" })}</select></div>
        <div class="form-field"><label>Fase</label><select name="phase_id">${optionsHtml(PHASES, p.phase_id, { empty: "Geen fase" })}</select></div>
        <div class="form-field"><label>Budgetcategorie</label><select name="budget_category_id">${optionsHtml(CATEGORIES, p.budget_category_id, { empty: "Geen categorie" })}</select></div>
        <div class="form-field"><label>Gekoppelde werkzaamheid</label><select name="task_id">${optionsHtml(taskOptions, p.task_id, { empty: "Geen werkzaamheid" })}</select></div>
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
      estimated_cost: num("estimated_cost"),
      committed_cost: num("committed_cost"),
      actual_cost: num("actual_cost"),
      status: fd.get("status"),
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
      toast("Inkoop opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-purchase-btn").addEventListener("click", () => openPurchaseForm(null));

render();
