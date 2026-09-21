import { Risks } from "../db.js";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

let RISKS = [];

async function render() {
  const root = document.getElementById("risicos-root");
  try {
    RISKS = await Risks.list();
    root.innerHTML = `
      <div class="table-scroll">
        <table>
          <thead><tr><th>Risico</th><th>Waarom hier</th><th>Impact als het misgaat</th><th>Check</th><th></th></tr></thead>
          <tbody>${RISKS.map((r) => `
            <tr data-id="${r.id}">
              <td><strong>${escapeHtml(r.title)}</strong></td>
              <td>${escapeHtml(r.why || "")}</td>
              <td>${escapeHtml(r.impact || "")}</td>
              <td>${escapeHtml(r.check_text || "")}</td>
              <td style="white-space:nowrap;">
                <button type="button" class="btn-icon risk-edit-btn">Bewerken</button>
                <button type="button" class="btn-icon risk-delete-btn">✕</button>
              </td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="note warn" style="margin-top:16px;">De vuistregel: niets afwerken voordat deze risico's zijn afgevinkt/gecheckt. Verf en vloer zijn het goedkoopst om nu uit te stellen en het duurst om later opnieuw te doen.</div>`;
    wireRows();
  } catch (err) {
    reportError(err, "het laden van de risico's");
    root.innerHTML = `<p class="empty-state">Kon de risico's niet laden.</p>`;
  }
}

function wireRows() {
  document.querySelectorAll(".risk-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openRiskForm(RISKS.find((r) => r.id === btn.closest("tr").dataset.id)));
  });
  document.querySelectorAll(".risk-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("tr").dataset.id;
      const ok = await confirmDialog("Dit risico verwijderen?");
      if (!ok) return;
      try { await Risks.remove(id); toast("Verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  });
}

function openRiskForm(risk) {
  const r = risk || { title: "", why: "", impact: "", check_text: "" };
  const overlay = openModal(risk ? "Risico bewerken" : "Nieuw risico", `
    <form id="risk-form">
      <div class="form-field full"><label>Risico</label><input type="text" name="title" required value="${escapeHtml(r.title)}"></div>
      <div class="form-field full"><label>Waarom hier</label><input type="text" name="why" value="${escapeHtml(r.why || "")}"></div>
      <div class="form-field full"><label>Impact als het misgaat</label><input type="text" name="impact" value="${escapeHtml(r.impact || "")}"></div>
      <div class="form-field full"><label>Check</label><input type="text" name="check_text" value="${escapeHtml(r.check_text || "")}"></div>
      <div class="modal-actions">
        ${risk ? '<button type="button" class="btn-danger" id="risk-delete-btn">Verwijderen</button>' : ""}
        <button type="button" class="btn-secondary" id="risk-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Opslaan</button>
      </div>
    </form>`);
  overlay.querySelector("#risk-cancel-btn").addEventListener("click", closeModal);
  if (risk) {
    overlay.querySelector("#risk-delete-btn").addEventListener("click", async () => {
      const ok = await confirmDialog("Dit risico verwijderen?");
      if (!ok) return;
      try { await Risks.remove(risk.id); toast("Verwijderd."); closeModal(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    });
  }
  overlay.querySelector("#risk-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = { title: fd.get("title").trim(), why: fd.get("why") || null, impact: fd.get("impact") || null, check_text: fd.get("check_text") || null };
    try {
      if (risk) await Risks.update(risk.id, patch);
      else await Risks.create({ ...patch, sort_order: RISKS.length + 1 });
      toast("Opgeslagen.");
      closeModal();
      render();
    } catch (err) { reportError(err, "opslaan"); }
  });
}

document.getElementById("add-risk-btn").addEventListener("click", () => openRiskForm(null));

render();
