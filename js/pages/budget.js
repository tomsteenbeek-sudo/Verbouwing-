import { Budgets, BudgetCategories, Purchases, Tasks } from "../db.js?v=4";
import { renderNav, euro, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js?v=4";
import { computeRollup, computeTotalSummary } from "../finance.js?v=4";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let BUDGET = null, CATEGORIES = [], TASKS = [], PURCHASES = [];

async function loadAll() {
  [BUDGET, CATEGORIES, TASKS, PURCHASES] = await Promise.all([
    Budgets.get(), BudgetCategories.list(), Tasks.list(), Purchases.list(),
  ]);
}

async function render() {
  const root = document.getElementById("budget-root");
  try {
    await loadAll();
    const summary = computeTotalSummary(BUDGET, PURCHASES);
    const warnings = buildWarnings(summary);

    root.innerHTML = `
      <div class="card pad" style="margin-bottom:24px;">
        <div class="budget-bar-row"><div class="label"><strong>Vastgesteld budget</strong></div><div></div><div class="amt"><span class="euro-input"><span class="prefix">€</span><input type="number" step="10" id="total-budget-input" class="inline-input num-input" value="${summary.totalBudget}"></span></div></div>
        <div class="budget-bar-row"><div class="label">Materiaal begroot</div><div></div><div class="amt">${euro(summary.estimatedMaterial)}</div></div>
        <div class="budget-bar-row"><div class="label">Arbeid begroot</div><div></div><div class="amt">${euro(summary.estimatedLabor)}</div></div>
        <div class="budget-bar-row"><div class="label">Totaal begroot</div><div></div><div class="amt">${euro(summary.estimatedTotal)}</div></div>
        <div class="budget-bar-row"><div class="label">Nog niet toegewezen</div><div></div><div class="amt">${euro(summary.unallocated)}</div></div>
        <div class="budget-bar-row"><div class="label">Werkelijk materiaal</div><div></div><div class="amt">${euro(summary.actualMaterial)}</div></div>
        <div class="budget-bar-row"><div class="label">Werkelijk arbeid</div><div></div><div class="amt">${euro(summary.actualLabor)}</div></div>
        <div class="budget-bar-row"><div class="label">Werkelijk uitgegeven</div><div></div><div class="amt">${euro(summary.actualTotal)}</div></div>
        <div class="budget-bar-row"><div class="label"><strong>Resterend t.o.v. vastgesteld budget</strong></div><div></div><div class="amt"><strong>${euro(summary.available)}</strong></div></div>
      </div>
      ${warnings.length ? `<ul class="warning-list" style="margin-bottom:24px;">${warnings.map((w) => `<li class="warning-item"><span class="icon">${w.icon}</span><span>${escapeHtml(w.text)}</span></li>`).join("")}</ul>` : ""}
      <p class="note">Dit overzicht wordt volledig berekend uit Inkopen. Wijzig je een bedrag bij een inkoop, dan verandert dit overzicht automatisch mee.</p>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Categorie</th><th>Vastgesteld</th><th>Begroot</th><th>Werkelijk</th><th>Resterend</th><th></th></tr></thead>
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
  if (summary.estimatedTotal > summary.totalBudget) {
    warnings.push({ icon: "🔴", text: `Budgetoverschrijding: ${euro(summary.estimatedTotal - summary.totalBudget)} meer begroot dan vastgesteld.` });
  }
  if (summary.unallocated > 0) {
    warnings.push({ icon: "🟠", text: `${euro(summary.unallocated)} van het totaalbudget nog niet toegewezen.` });
  }
  CATEGORIES.forEach((cat) => {
    const { estimatedTotal } = computeRollup({ purchases: PURCHASES, tasks: TASKS, categoryId: cat.id });
    const over = estimatedTotal - Number(cat.allocated_budget || 0);
    if (over > 0) warnings.push({ icon: "🔴", text: `${cat.name}: ${euro(over)} boven budget.` });
  });
  return warnings;
}

function categoryRowHtml(cat) {
  const { estimatedMaterial, estimatedLabor, estimatedTotal, actualMaterial, actualLabor, actualTotal } =
    computeRollup({ purchases: PURCHASES, tasks: TASKS, categoryId: cat.id });
  const remaining = Number(cat.allocated_budget || 0) - estimatedTotal;
  const pct = cat.allocated_budget ? Math.min(100, Math.round((estimatedTotal / cat.allocated_budget) * 100)) : 0;
  return `
    <tr data-id="${cat.id}">
      <td>${escapeHtml(cat.name)}</td>
      <td class="num"><span class="euro-input"><span class="prefix">€</span><input type="number" step="10" class="inline-input num-input category-budget-input" value="${cat.allocated_budget}"></span></td>
      <td class="num">${euro(estimatedTotal)}<div class="sub">materiaal ${euro(estimatedMaterial)} · arbeid ${euro(estimatedLabor)}</div><div class="mini-progress" style="margin-top:4px;"><i style="width:${pct}%"></i></div></td>
      <td class="num">${euro(actualTotal)}<div class="sub">materiaal ${euro(actualMaterial)} · arbeid ${euro(actualLabor)}</div></td>
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
      const ok = await confirmDialog(`Categorie "${cat.name}" verwijderen? Gekoppelde inkopen verliezen alleen deze koppeling.`);
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
