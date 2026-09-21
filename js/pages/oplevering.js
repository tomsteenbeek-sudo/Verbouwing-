import { Handover } from "../db.js?v=1";
import { renderNav, escapeHtml, reportError, toast } from "../ui.js?v=1";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

async function render() {
  try {
    const items = await Handover.list();
    renderSection("oplevering-technisch", items.filter((i) => i.section === "technisch"));
    renderSection("oplevering-dossier", items.filter((i) => i.section === "dossier"));
  } catch (err) {
    reportError(err, "het laden van de opleverchecklist");
  }
}

function renderSection(elId, items) {
  const el = document.getElementById(elId);
  el.innerHTML = items.map((i) => `
    <li class="${i.is_done ? "checked" : ""}">
      <input type="checkbox" id="${elId}-${i.id}" data-id="${i.id}" ${i.is_done ? "checked" : ""}>
      <label for="${elId}-${i.id}">${escapeHtml(i.item)}</label>
    </li>`).join("");
  el.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", async (e) => {
      try {
        await Handover.update(e.target.dataset.id, { is_done: e.target.checked });
        e.target.closest("li").classList.toggle("checked", e.target.checked);
        toast("Bijgewerkt.");
      } catch (err) { reportError(err, "bijwerken"); }
    });
  });
}

render();
