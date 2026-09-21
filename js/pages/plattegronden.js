import { renderNav } from "../ui.js";
import { openLightbox } from "../lightbox.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const FLOORPLANS = [
  { slug: "begane-grond", naam: "Begane grond" },
  { slug: "verdieping", naam: "Verdieping" },
  { slug: "zolder", naam: "Zolder" },
];

const grid = document.getElementById("floorplan-grid");
grid.innerHTML = FLOORPLANS.map((f, i) => `
  <div class="floorplan-card card" data-index="${i}">
    <div class="floorplan-thumb">
      <div class="ph-fallback"><div class="ph-icon">📐</div>plattegrond volgt<br>plaats images/plattegronden/${f.slug}.jpg</div>
      <img src="images/plattegronden/${f.slug}.jpg" alt="Plattegrond ${f.naam}" loading="lazy" onerror="this.closest('.floorplan-card').classList.add('no-image');">
    </div>
    <div class="floorplan-name">${f.naam}</div>
  </div>`).join("");

const items = FLOORPLANS.map((f) => ({ url: `images/plattegronden/${f.slug}.jpg`, caption: `Plattegrond ${f.naam}` }));
grid.querySelectorAll(".floorplan-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("no-image")) return;
    openLightbox(items, Number(card.dataset.index));
  });
});
