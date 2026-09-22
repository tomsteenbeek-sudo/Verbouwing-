import { Budgets, BudgetCategories, Tasks, Purchases, Phases } from "../db.js?v=3";
import { renderNav, euro, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js?v=3";
import { computeRollup, computeTotalSummary } from "../finance.js?v=3";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let BUDGET = null, CATEGORIES = [], TASKS = [], PURCHASES = [], PHASES = [];

async function loadAll() {
  [BUDGET, CATEGORIES, TASKS, PURCHASES, PHASES] = await Promise.all([
    Budgets.get(), BudgetCategories.list(), Tasks.list(), Purchases.list(), Phases.list(),
  ]);
}

async function render() {
  const root = document.getElementById("budget-root");
  try {
    await loadAll();
    const summary = computeTotalSummary(BUDGET, CATEGORIES, PURCHASES);
    const warnings = buildWarnings(summary);

    root.innerHTML = `
      <div class="card pad" style="margin-bottom:24px;">
        <div class="budget-bar-row"><div class="label">Vastgesteld budget</div><div></div><div class="amt"><span class="euro-input"><span class="prefix">€</span><input type="number" step="10" id="total-budget-input" class="inline-input num-input" value="${summary.totalBudget}"></span></div></div>
        <div class="budget-bar-row"><div class="label">Toebedeeld</div><div></div><div class="amt">${euro(summary.allocated)}</div></div>
        <div class="budget-bar-row"><div class="label">Nog te verdelen</div><div></div><div class="amt">${euro(summary.unallocated)}</div></div>
        <div class="budget-bar-row"><div class="label">Verplicht</div><div></div><div class="amt">${euro(summary.committed)}</div></div>
        <div class="budget-bar-row"><div class="label">Betaald</div><div></div><div class="amt">${euro(summary.paid)}</div></div>
        <div class="budget-bar-row"><div class="label"><strong>Nog beschikbaar</strong></div><div></div><div class="amt"><strong>${euro(summary.available)}</strong></div></div>
      </div>
      ${warnings.length ? `<ul class="warning-list" style="margin-bottom:24px;">${warnings.map((w) => `<li class="warning-item"><span class="icon">${w.icon}</span><span>${escapeHtml(w.text)}</span></li>`).join("")}</ul>` : ""}
      <div class="table-scroll">
        <table>
          <thead><tr><th>Categorie</th><th>Budget</th><th>Toebedeeld</th><th>Verplicht</th><th>Betaald</th><th>Resterend</th><th></th></tr></thead>
          <tbody>${CATEGORIES.map(categoryRowHtml).join("")}</tbody>
        </table>
      </div>
    `;
    wireInputs();
  } catch (err) {
    reportError(err, "het laden van het budget");
    root.innerHTML = `<p class="empty-state">Kon het budget niet laden.</p>`;
  }
}

function buildWarnings(summary) {
  const warnings = [];
  if (summary.allocated > summary.totalBudget) {
    warnings.push({ icon: "🔴", text: `Budgetoverschrijding: ${euro(summary.allocated - summary.totalBudget)} meer toebedeeld dan vastgesteld.` });
  }
  if (summary.unallocated > 0) {
    warnings.push({ icon: "🟠", text: `${euro(summary.unallocated)} van het totaalbudget nog niet verdeeld.` });
  }
  CATEGORIES.forEach((cat) => {
    const { committed } = computeRollup({ tasks: TASKS, purchases: PURCHASES, categoryId: cat.id });
    const over = committed - Number(cat.allocated_budget || 0);
    if (over > 0) warnings.push({ icon: "🔴", text: `${cat.name}: ${euro(over)} boven budget.` });
  });
  return warnings;
}

function categoryRowHtml(cat) {
  const { assigned, committed, paid } = computeRollup({ tasks: TASKS, purchases: PURCHASES, categoryId: cat.id });
  const remaining = Number(cat.allocated_budget || 0) - committed;
  const pct = cat.allocated_budget ? Math.min(100, Math.round((committed / cat.allocated_budget) * 100)) : 0;
  return `
    <tr data-id="${cat.id}">
      <td>${escapeHtml(cat.name)}</td>
      <td class="num"><span class="euro-input"><span class="prefix">€</span><input type="number" step="10" class="inline-input num-input category-budget-input" value="${cat.allocated_budget}"></span></td>
      <td class="num">${euro(assigned)}</td>
      <td class="num">${euro(committed)}<div class="mini-progress" style="margin-top:4px;"><i style="width:${pct}%"></i></div></td>
      <td class="num">${euro(paid)}</td>
      <td class="num ${remaining < 0 ? "warn" : ""}">${euro(remaining)}</td>
      <td><button type="button" class="btn-icon category-delete-btn">✕</button></td>
    </tr>`;
}

function wireInputs() {
  document.getElementById("total-budget-input").addEventListener("change", async (e) => {
    try {
      await Budgets.update(BUDGET.id, { total_budget: Number(e.target.value) || 0 });
      toast("Budget bijgewerkt.");
      render();
    } catch (err) { reportError(err, "bijwerken budget"); }
  });
  document.querySelectorAll(".category-budget-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = e.target.closest("tr").dataset.id;
      try {
        await BudgetCategories.update(id, { allocated_budget: Number(e.target.value) || 0 });
        render();
      } catch (err) { reportError(err, "bijwerken categorie"); }
    });
  });
  document.querySelectorAll(".category-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("tr").dataset.id;
      const cat = CATEGORIES.find((c) => c.id === id);
      const ok = await confirmDialog(`Categorie "${cat.name}" verwijderen? Gekoppelde werkzaamheden en inkopen verliezen alleen deze koppeling.`);
      if (!ok) return;
      try { await BudgetCategories.remove(id); toast("Categorie verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

document.getElementById("add-category-btn").addEventListener("click", () => {
  const overlay = openModal("Nieuwe budgetcategorie", `
    <form id="category-form">
      <div class="form-field full"><label>Naam</label><input type="text" name="name" required></div>
      <div class="form-field full"><label>Vastgesteld budget (€)</label><input type="number" step="10" name="allocated_budget" value="0"></div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="category-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Toevoegen</button>
      </div>
    </form>`);
  overlay.querySelector("#category-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await BudgetCategories.create({
        name: fd.get("name").trim(),
        allocated_budget: Number(fd.get("allocated_budget") || 0),
        sort_order: CATEGORIES.length + 1,
      });
      toast("Categorie toegevoegd.");
      closeModal();
      render();
    } catch (err) { reportError(err, "toevoegen categorie"); }
  });
});

render();
