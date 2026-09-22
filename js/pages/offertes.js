import { Quotes, Purchases, Phases, BudgetCategories, People, Tasks } from "../db.js?v=3";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog, checkboxListHtml, peopleBadgesHtml, optionsHtml, euro } from "../ui.js?v=3";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const STATUSES = ["Nog aanvragen", "Aangevraagd", "Ontvangen", "Akkoord", "Afgewezen"];
let QUOTES = [], PURCHASES = [], PHASES = [], CATEGORIES = [], PEOPLE = [], TASKS = [];
let chipFilter = "alle";

async function loadAll() {
  [QUOTES, PURCHASES, PHASES, CATEGORIES, PEOPLE, TASKS] = await Promise.all([
    Quotes.list(), Purchases.list(), Phases.list(), BudgetCategories.list(), People.list(), Tasks.list(),
  ]);
}

async function render() {
  const root = document.getElementById("offertes-root");
  try {
    await loadAll();

    document.getElementById("chip-row").innerHTML = ["alle", ...STATUSES].map((c) =>
      `<button class="filter-btn ${chipFilter === c ? "active" : ""}" data-chip="${c}">${c === "alle" ? "Alle" : c}</button>`
    ).join("");
    document.getElementById("chip-row").querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => { chipFilter = btn.dataset.chip; render(); });
    });

    const filtered = chipFilter === "alle" ? QUOTES : QUOTES.filter((q) => q.status === chipFilter);
    root.innerHTML = filtered.length
      ? `<ul class="action-list">${filtered.map(quoteRowHtml).join("")}</ul>`
      : `<p class="empty-state">Geen offertes in dit filter.</p>`;
    wireRows(root);
  } catch (err) {
    reportError(err, "het laden van de offertes");
    root.innerHTML = `<p class="empty-state">Kon de offertes niet laden.</p>`;
  }
}

function alreadyConverted(quote) {
  return PURCHASES.some((p) => p.quote_id === quote.id);
}

function quoteRowHtml(q) {
  const converted = alreadyConverted(q);
  return `
    <li class="actie-row" data-id="${q.id}">
      <div class="actie-body">
        <div class="actie-title">${escapeHtml(q.supplier)} <span class="pill ${q.status === "Akkoord" ? "gedaan" : q.status === "Afgewezen" ? "open" : "bezig"}">${escapeHtml(q.status)}</span></div>
        <div class="actie-meta">
          ${q.amount != null ? `<span class="meta-item">${euro(q.amount)}</span>` : ""}
          ${q.phases ? `<span class="meta-item" style="color:${q.phases.color};">${escapeHtml(q.phases.name)}</span>` : ""}
          ${q.budget_categories ? `<span class="meta-item">${escapeHtml(q.budget_categories.name)}</span>` : ""}
        </div>
        ${q.description ? `<div class="actie-note">${escapeHtml(q.description)}</div>` : ""}
        ${peopleBadgesHtml(q.people)}
        ${q.tasks.length ? `<div class="actie-note">Gekoppelde werkzaamheden: ${q.tasks.map((t) => escapeHtml(t.title)).join(", ")}</div>` : ""}
        ${converted ? `<div class="actie-note">✓ Al omgezet naar een inkoop</div>` : ""}
        <div class="task-card-actions" style="margin-top:8px;">
          ${q.status === "Akkoord" && !converted ? '<button type="button" class="btn-primary quote-convert-btn">Zet om naar inkoop</button>' : ""}
          <button type="button" class="btn-icon quote-edit-btn">Bewerken</button>
          <button type="button" class="btn-icon quote-delete-btn">Verwijderen</button>
        </div>
      </div>
    </li>`;
}

function wireRows(root) {
  root.querySelectorAll(".quote-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openQuoteForm(QUOTES.find((q) => q.id === btn.closest(".actie-row").dataset.id)));
  });
  root.querySelectorAll(".quote-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".actie-row").dataset.id;
      const quote = QUOTES.find((q) => q.id === id);
      const ok = await confirmDialog(`Offerte "${quote.supplier}" verwijderen?`);
      if (!ok) return;
      try { await Quotes.remove(id); toast("Offerte verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
  root.querySelectorAll(".quote-convert-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".actie-row").dataset.id;
      const quote = QUOTES.find((q) => q.id === id);
      try {
        await Purchases.create({
          product: quote.description || quote.supplier,
          supplier: quote.supplier,
          committed_cost: quote.amount,
          status: "Besteld",
          phase_id: quote.phase_id,
          budget_category_id: quote.budget_category_id,
          task_id: quote.tasks[0]?.id || null,
          quote_id: quote.id,
        });
        toast("Omgezet naar inkoop — bedrag telt vanaf nu als verplicht.");
        render();
      } catch (err) { reportError(err, "omzetten naar inkoop"); }
    });
  });
}

function openQuoteForm(quote) {
  const q = quote || { supplier: "", description: "", category: "", amount: "", requested_date: "", received_date: "", valid_until: "", status: "Nog aanvragen", document_url: "", notes: "", phase_id: "", budget_category_id: "" };
  const selectedPersonIds = (quote ? quote.people : []).map((p) => p.id);
  const selectedTaskIds = (quote ? quote.tasks : []).map((t) => t.id);
  const overlay = openModal(quote ? "Offerte bewerken" : "Nieuwe offerte", `
    <form id="quote-form">
      <div class="form-field full"><label>Leverancier / vakman</label><input type="text" name="supplier" required value="${escapeHtml(q.supplier)}"></div>
      <div class="form-field full"><label>Omschrijving</label><input type="text" name="description" value="${escapeHtml(q.description || "")}"></div>
      <div class="form-grid">
        <div class="form-field"><label>Categorie (vrije tekst)</label><input type="text" name="category" value="${escapeHtml(q.category || "")}"></div>
        <div class="form-field"><label>Bedrag</label><input type="number" step="0.01" name="amount" value="${q.amount ?? ""}"></div>
        <div class="form-field"><label>Status</label><select name="status">${STATUSES.map((s) => `<option value="${s}" ${s === q.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="form-field"><label>Fase</label><select name="phase_id">${optionsHtml(PHASES, q.phase_id, { empty: "Geen fase" })}</select></div>
        <div class="form-field"><label>Budgetcategorie</label><select name="budget_category_id">${optionsHtml(CATEGORIES, q.budget_category_id, { empty: "Geen categorie" })}</select></div>
        <div class="form-field"><label>Datum aangevraagd</label><input type="date" name="requested_date" value="${q.requested_date || ""}"></div>
        <div class="form-field"><label>Datum ontvangen</label><input type="date" name="received_date" value="${q.received_date || ""}"></div>
        <div class="form-field"><label>Geldig tot</label><input type="date" name="valid_until" value="${q.valid_until || ""}"></div>
        <div class="form-field"><label>Document/link</label><input type="text" name="document_url" value="${escapeHtml(q.document_url || "")}"></div>
      </div>
      <div class="form-field full"><label>Betrokken personen</label>${checkboxListHtml(PEOPLE, selectedPersonIds, "person_ids")}</div>
      <div class="form-field full"><label>Gekoppelde werkzaamheden</label>${checkboxListHtml(TASKS.map((t) => ({ id: t.id, name: t.title })), selectedTaskIds, "task_ids")}</div>
      <div class="form-field full"><label>Opmerkingen</label><textarea name="notes">${escapeHtml(q.notes || "")}</textarea></div>
      <div class="modal-actions">
        ${quote ? '<button type="button" class="btn-danger" id="quote-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="quote-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#quote-cancel-btn").addEventListener("click", closeModal);
  if (quote) {
    overlay.querySelector("#quote-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog(`Offerte "${quote.supplier}" verwijderen?`);
      if (!ok) return;
      try { await Quotes.remove(quote.id); toast("Offerte verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#quote-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      supplier: fd.get("supplier").trim(),
      description: fd.get("description") || null,
      category: fd.get("category") || null,
      amount: fd.get("amount") ? Number(fd.get("amount")) : null,
      status: fd.get("status"),
      phase_id: fd.get("phase_id") || null,
      budget_category_id: fd.get("budget_category_id") || null,
      requested_date: fd.get("requested_date") || null,
      received_date: fd.get("received_date") || null,
      valid_until: fd.get("valid_until") || null,
      document_url: fd.get("document_url") || null,
      notes: fd.get("notes") || null,
    };
    const personIds = fd.getAll("person_ids");
    const taskIds = fd.getAll("task_ids");
    try {
      const saved = quote ? await Quotes.update(quote.id, patch) : await Quotes.create(patch);
      await Quotes.setPersons(saved.id, personIds);
      await Quotes.setTasks(saved.id, taskIds);
      toast("Offerte opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-quote-btn").addEventListener("click", () => openQuoteForm(null));

render();
