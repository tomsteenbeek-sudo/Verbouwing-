import { renderNav } from "../ui.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const FLOORPLANS = [
  { slug: "begane-grond", naam: "Begane grond" },
  { slug: "verdieping", naam: "Verdieping" },
];

document.getElementById("floorplan-grid").innerHTML = FLOORPLANS.map((f) => `
  <div class="floorplan-card card">
    <div class="floorplan-thumb">
      <div class="ph-fallback"><div class="ph-icon">📐</div>plattegrond volgt<br>plaats images/plattegronden/${f.slug}.jpg</div>
      <img src="images/plattegronden/${f.slug}.jpg" alt="Plattegrond ${f.naam}" loading="lazy" onerror="this.remove();">
    </div>
    <div class="floorplan-name">${f.naam}</div>
  </div>`).join("");
