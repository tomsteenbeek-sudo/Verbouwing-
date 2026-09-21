import { Budget } from "../db.js?v=1";
import { renderNav, euro, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js?v=1";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const TARGET = 30000;
const CATEGORIES = ["Verduurzaming", "Regulier", "Onvoorzien"];
let ITEMS = [];

async function load() { ITEMS = await Budget.list(); }

async function render() {
  const root = document.getElementById("budget-root");
  try {
    await load();
    const begrootTotal = ITEMS.reduce((s, i) => s + Number(i.budgeted || 0), 0);
    const werkelijkTotal = ITEMS.reduce((s, i) => s + Number(i.actual || 0), 0);

    root.innerHTML = `
      <div class="two-col" style="margin-bottom:28px;">
        <div class="card pad">
          <div class="budget-bar-row"><div class="label">Doel</div><div></div><div class="amt"><strong>${euro(TARGET)}</strong></div></div>
          <div class="budget-bar-row"><div class="label">Begroot totaal</div><div></div><div class="amt"><strong>${euro(begrootTotal)}</strong></div></div>
          <div class="budget-bar-row"><div class="label">Werkelijk uitgegeven</div><div></div><div class="amt"><strong>${euro(werkelijkTotal)}</strong></div></div>
          <div class="note ${werkelijkTotal > TARGET ? "warn" : ""}">${werkelijkDelta(werkelijkTotal)}</div>
        </div>
        <div class="card pad">
          ${CATEGORIES.map((cat) => {
            const sub = ITEMS.filter((i) => i.category === cat).reduce((s, i) => s + Number(i.budgeted || 0), 0);
            const pct = TARGET ? Math.round((sub / TARGET) * 100) : 0;
            return `<div class="budget-bar-row"><div class="label">${cat}</div><div class="budget-bar-track"><div class="budget-bar-fill reg" style="width:${Math.min(100, pct)}%">${pct}%</div></div><div class="amt">${euro(sub)}</div></div>`;
          }).join("")}
        </div>
      </div>
      ${CATEGORIES.map((cat) => budgetSectionHtml(cat)).join("")}
    `;
    wireInputs();
    wireRowButtons();
  } catch (err) {
    reportError(err, "het laden van het budget");
    root.innerHTML = `<p class="empty-state">Kon het budget niet laden.</p>`;
  }
}

function werkelijkDelta(werkelijk) {
  const diff = werkelijk - TARGET;
  if (werkelijk === 0) return "Nog niets ingevuld als werkelijk uitgegeven.";
  if (diff > 0) return `${euro(diff)} boven het doel van ${euro(TARGET)}.`;
  return `${euro(-diff)} onder het doel van ${euro(TARGET)} — nog ${euro(TARGET - werkelijk)} over.`;
}

function budgetSectionHtml(cat) {
  const rows = ITEMS.filter((i) => i.category === cat);
  const subBegroot = rows.reduce((s, i) => s + Number(i.budgeted || 0), 0);
  const subWerkelijk = rows.reduce((s, i) => s + Number(i.actual || 0), 0);
  return `
    <h3 style="font-size:0.98rem;margin-top:26px;">${cat}</h3>
    <div class="table-scroll">
      <table>
        <thead><tr><th>Post</th><th>Begroot</th><th>Werkelijk</th><th>Uitvoering</th><th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr data-id="${r.id}">
              <td>${escapeHtml(r.post)}</td>
              <td class="num"><span class="euro-input"><span class="prefix">€</span><input type="number" class="inline-input num-input budget-input" min="0" step="10" data-field="budgeted" value="${r.budgeted}"></span></td>
              <td class="num"><span class="euro-input"><span class="prefix">€</span><input type="number" class="inline-input num-input budget-input" min="0" step="10" data-field="actual" value="${r.actual || ""}" placeholder="0"></span></td>
              <td>${escapeHtml(r.execution_note || "")}</td>
              <td><button type="button" class="btn-icon budget-delete-btn">✕</button></td>
            </tr>`).join("")}
          <tr><td><strong>Subtotaal</strong></td><td class="num"><strong>${euro(subBegroot)}</strong></td><td class="num"><strong>${euro(subWerkelijk)}</strong></td><td></td><td></td></tr>
        </tbody>
      </table>
    </div>
    <button type="button" class="btn-secondary add-budget-row-btn" data-cat="${cat}" style="margin-top:10px;">+ Post toevoegen aan ${cat}</button>`;
}

function wireInputs() {
  document.querySelectorAll(".budget-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = e.target.closest("tr").dataset.id;
      const field = e.target.dataset.field;
      try {
        await Budget.update(id, { [field]: e.target.value ? Number(e.target.value) : 0 });
        render();
      } catch (err) { reportError(err, "bijwerken budgetregel"); }
    });
  });
}

function wireRowButtons() {
  document.querySelectorAll(".budget-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("tr").dataset.id;
      const ok = await confirmDialog("Deze budgetregel verwijderen?");
      if (!ok) return;
      try { await Budget.remove(id); toast("Verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
  document.querySelectorAll(".add-budget-row-btn").forEach((btn) => {
    btn.addEventListener("click", () => openBudgetRowForm(btn.dataset.cat));
  });
}

function openBudgetRowForm(category) {
  const overlay = openModal(`Post toevoegen aan ${category}`, `
    <form id="budget-row-form">
      <div class="form-field full"><label>Omschrijving</label><input type="text" name="post" required></div>
      <div class="form-grid">
        <div class="form-field"><label>Begroot (€)</label><input type="number" name="budgeted" step="10" value="0"></div>
        <div class="form-field"><label>Uitvoering</label><input type="text" name="execution_note" placeholder="bv. Zelf, Uitbesteed"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="budget-row-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Toevoegen</button>
      </div>
    </form>`);
  overlay.querySelector("#budget-row-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#budget-row-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await Budget.create({
        category,
        post: fd.get("post").trim(),
        budgeted: Number(fd.get("budgeted") || 0),
        execution_note: fd.get("execution_note") || null,
        sort_order: ITEMS.filter((i) => i.category === category).length + 1,
      });
      toast("Post toegevoegd.");
      closeModal();
      render();
    } catch (err) { reportError(err, "toevoegen"); }
  });
}

render();
