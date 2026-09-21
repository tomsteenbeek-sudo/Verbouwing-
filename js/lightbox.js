// Gedeelde lightbox: grote weergave met vorige/volgende, sluiten (X/Escape),
// swipe op mobiel, en pinch/scroll/drag om in te zoomen en te pannen.
// Gebruikt voor kamerfoto's (js/pages/kamers.js) en plattegronden
// (js/pages/plattegronden.js).
import { escapeHtml } from "./ui.js?v=2";

let state = null;

function ensureOverlay() {
  let overlay = document.getElementById("lightbox-overlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Sluiten">✕</button>
    <button type="button" class="lightbox-nav lightbox-prev" aria-label="Vorige">‹</button>
    <button type="button" class="lightbox-nav lightbox-next" aria-label="Volgende">›</button>
    <div class="lightbox-stage">
      <img class="lightbox-img" alt="">
    </div>
    <div class="lightbox-foot">
      <span class="lightbox-caption"></span>
      <span class="lightbox-counter"></span>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function resetZoom(img) {
  img.dataset.scale = "1";
  img.dataset.x = "0";
  img.dataset.y = "0";
  applyTransform(img);
}
function applyTransform(img) {
  img.style.transform = `translate(${img.dataset.x}px, ${img.dataset.y}px) scale(${img.dataset.scale})`;
}

function renderCurrent() {
  const overlay = ensureOverlay();
  const item = state.items[state.index];
  const img = overlay.querySelector(".lightbox-img");
  img.src = item.url;
  img.alt = item.caption || "";
  resetZoom(img);
  overlay.querySelector(".lightbox-caption").textContent = item.caption || "";
  overlay.querySelector(".lightbox-counter").textContent = state.items.length > 1 ? `${state.index + 1} / ${state.items.length}` : "";
  const showNav = state.items.length > 1;
  overlay.querySelector(".lightbox-prev").style.display = showNav ? "" : "none";
  overlay.querySelector(".lightbox-next").style.display = showNav ? "" : "none";
}

function go(delta) {
  state.index = (state.index + delta + state.items.length) % state.items.length;
  renderCurrent();
}

function close() {
  const overlay = document.getElementById("lightbox-overlay");
  if (overlay) overlay.classList.remove("open");
  document.removeEventListener("keydown", onKeydown);
  state = null;
}

function onKeydown(e) {
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") go(-1);
  if (e.key === "ArrowRight") go(1);
}

// items: [{ url, caption }]
export function openLightbox(items, startIndex = 0) {
  if (!items || !items.length) return;
  state = { items, index: startIndex };
  const overlay = ensureOverlay();
  overlay.classList.add("open");
  renderCurrent();
  document.addEventListener("keydown", onKeydown);
  wireOverlayOnce(overlay);
}

function wireOverlayOnce(overlay) {
  if (overlay.dataset.wired) return;
  overlay.dataset.wired = "1";

  overlay.querySelector(".lightbox-close").addEventListener("click", close);
  overlay.querySelector(".lightbox-prev").addEventListener("click", () => go(-1));
  overlay.querySelector(".lightbox-next").addEventListener("click", () => go(1));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  const img = overlay.querySelector(".lightbox-img");
  resetZoom(img);

  // Zoomen met scrollwiel/trackpad (desktop).
  overlay.querySelector(".lightbox-stage").addEventListener("wheel", (e) => {
    e.preventDefault();
    const scale = Math.min(4, Math.max(1, Number(img.dataset.scale) - e.deltaY * 0.0015));
    img.dataset.scale = scale;
    if (scale === 1) { img.dataset.x = "0"; img.dataset.y = "0"; }
    applyTransform(img);
  }, { passive: false });

  // Pan (slepen) en pinch-to-zoom via Pointer Events — werkt voor muis én touch.
  const pointers = new Map();
  let panStart = null;
  let pinchStartDist = null;
  let pinchStartScale = 1;
  let swipeStartX = null;

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  img.addEventListener("pointerdown", (e) => {
    img.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panStart = { x: e.clientX, y: e.clientY, imgX: Number(img.dataset.x), imgY: Number(img.dataset.y) };
      if (Number(img.dataset.scale) === 1) swipeStartX = e.clientX;
    } else if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      pinchStartDist = dist(a, b);
      pinchStartScale = Number(img.dataset.scale);
    }
  });
  img.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchStartDist) {
      const [a, b] = Array.from(pointers.values());
      const scale = Math.min(4, Math.max(1, pinchStartScale * (dist(a, b) / pinchStartDist)));
      img.dataset.scale = scale;
      applyTransform(img);
    } else if (pointers.size === 1 && panStart && Number(img.dataset.scale) > 1) {
      img.dataset.x = panStart.imgX + (e.clientX - panStart.x);
      img.dataset.y = panStart.imgY + (e.clientY - panStart.y);
      applyTransform(img);
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      if (swipeStartX !== null && Number(img.dataset.scale) === 1) {
        const delta = e.clientX - swipeStartX;
        if (Math.abs(delta) > 60) go(delta > 0 ? -1 : 1);
      }
      panStart = null;
      pinchStartDist = null;
      swipeStartX = null;
    }
  }
  img.addEventListener("pointerup", endPointer);
  img.addEventListener("pointercancel", endPointer);

  img.addEventListener("dblclick", () => resetZoom(img));
}
