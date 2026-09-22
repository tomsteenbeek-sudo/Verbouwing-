import { Rooms, RoomImages, Workdays, People, Tasks, Materials, Phases, BudgetCategories, Purchases } from "../db.js?v=3";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js?v=3";
import { taskCardHtml, wireTaskCards, openTaskForm, TASK_STATUSES } from "../task-shared.js?v=3";
import { renderBulkBar, wireSelectCheckboxes } from "../bulk.js?v=3";
import { openLightbox } from "../lightbox.js?v=3";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const FLOOR_LABELS = { "begane-grond": "Begane grond", "verdieping": "Verdieping", "buiten": "Buiten" };
let ROOMS = [], IMAGES = [], WORKDAYS = [], PEOPLE = [], TASKS = [], MATERIALS = [], PHASES = [], CATEGORIES = [], PURCHASES = [];
let currentFloor = "alle";
const selectedTaskIds = new Set();

async function loadAll() {
  [ROOMS, IMAGES, WORKDAYS, PEOPLE, TASKS, MATERIALS, PHASES, CATEGORIES, PURCHASES] = await Promise.all([
    Rooms.list(), RoomImages.list(), Workdays.list(), People.list(), Tasks.list(), Materials.list(),
    Phases.list(), BudgetCategories.list(), Purchases.list(),
  ]);
}

function taskCtx() {
  return { rooms: ROOMS, workdays: WORKDAYS, people: PEOPLE, phases: PHASES, budgetCategories: CATEGORIES, onChange: render };
}

function imagesFor(roomId, type) {
  return IMAGES.filter((i) => i.room_id === roomId && i.type === type).sort((a, b) => a.sort_order - b.sort_order);
}
function coverImageFor(roomId) {
  const all = IMAGES.filter((i) => i.room_id === roomId);
  return all.find((i) => i.is_cover)
    || imagesFor(roomId, "desired")[0]
    || imagesFor(roomId, "current")[0]
    || null;
}

async function render() {
  try {
    await loadAll();
    const params = new URLSearchParams(location.search);
    const slug = params.get("room");
    if (slug) renderDetail(slug); else renderGrid();
  } catch (err) {
    reportError(err, "het laden van de kamers");
    document.getElementById("kamers-root").innerHTML = `<p class="empty-state">Kon de kamers niet laden.</p>`;
  }
}

function renderGrid() {
  document.getElementById("kamers-root").innerHTML = `
    <div class="filter-row" id="floor-filter">
      <button class="filter-btn ${currentFloor === "alle" ? "active" : ""}" data-floor="alle">Alle ruimtes</button>
      <button class="filter-btn ${currentFloor === "begane-grond" ? "active" : ""}" data-floor="begane-grond">Begane grond</button>
      <button class="filter-btn ${currentFloor === "verdieping" ? "active" : ""}" data-floor="verdieping">Verdieping</button>
      <button class="filter-btn ${currentFloor === "buiten" ? "active" : ""}" data-floor="buiten">Buiten</button>
    </div>
    <div class="room-grid" id="room-grid"></div>`;
  document.getElementById("floor-filter").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    currentFloor = btn.dataset.floor;
    renderGrid();
  });
  const grid = document.getElementById("room-grid");
  const rooms = ROOMS.filter((r) => currentFloor === "alle" || r.floor === currentFloor);
  grid.innerHTML = rooms.map((r) => {
    const tasks = TASKS.filter((t) => t.room_id === r.id);
    const done = tasks.filter((t) => t.status === "Gereed").length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const cover = coverImageFor(r.id);
    return `
      <article class="room-card card" data-slug="${r.slug}">
        <div class="room-thumb">
          <div class="ph-fallback"><div class="ph-icon">🏠</div>afbeelding volgt</div>
          ${cover ? `<img src="${escapeHtml(cover.image_url)}" alt="${escapeHtml(r.name)}" loading="lazy" onerror="this.remove();">` : ""}
        </div>
        <div class="room-body">
          <div class="room-floor">${FLOOR_LABELS[r.floor]}</div>
          <h3>${escapeHtml(r.name)}</h3>
          <p class="room-nu">${escapeHtml(r.current_state || "")}</p>
          <div class="room-foot">
            <span class="badge ${r.is_out_of_scope ? "klaar" : ""}">${r.is_out_of_scope ? "Klaar" : done + "/" + tasks.length + " werkzaamheden"}</span>
            <div class="mini-progress"><i style="width:${pct}%"></i></div>
          </div>
        </div>
      </article>`;
  }).join("");
  grid.querySelectorAll(".room-card").forEach((card) => {
    card.addEventListener("click", () => { location.href = `kamers.html?room=${card.dataset.slug}`; });
  });
}

function imageGalleryHtml(images, sectionClass) {
  if (!images.length) return "";
  return `<div class="room-image-gallery ${sectionClass}">${images.map((img, i) => `
    <div class="room-image-tile" data-image-id="${img.id}" data-index="${i}">
      <img src="${escapeHtml(img.image_url)}" alt="${escapeHtml(img.caption || "")}" loading="lazy">
      <div class="room-image-tile-actions">
        <button type="button" class="btn-icon image-cover-btn" title="Als hoofdfoto instellen">${img.is_cover ? "★" : "☆"}</button>
        <button type="button" class="btn-icon image-delete-btn" title="Verwijderen">✕</button>
      </div>
    </div>`).join("")}</div>`;
}

function renderDetail(slug) {
  const room = ROOMS.find((r) => r.slug === slug);
  if (!room) { document.getElementById("kamers-root").innerHTML = `<p class="empty-state">Kamer niet gevonden.</p>`; return; }
  const tasks = TASKS.filter((t) => t.room_id === room.id);
  const materials = MATERIALS.filter((m) => m.room_id === room.id);
  const desired = imagesFor(room.id, "desired");
  const current = imagesFor(room.id, "current");

  document.getElementById("kamers-root").innerHTML = `
    <a href="kamers.html" class="btn-secondary" style="display:inline-block;margin-bottom:18px;">← Terug naar kamers</a>
    <div class="room-floor">${FLOOR_LABELS[room.floor]}${room.is_out_of_scope ? ' · <span class="badge klaar">Buiten scope</span>' : ""}</div>
    <h2 style="margin-bottom:14px;">${escapeHtml(room.name)}</h2>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 10px;">
      <h3 style="margin:0;font-size:1rem;">Gewenste situatie</h3>
      <button class="btn-icon" id="add-image-btn">+ Afbeelding</button>
    </div>
    ${desired.length ? imageGalleryHtml(desired, "desired") : '<p class="empty-state">Nog geen ontwerp-/inspiratiefoto voor deze kamer.</p>'}
    <p>${escapeHtml(room.target_state || "")}</p>

    <h3 style="font-size:1rem;margin:24px 0 10px;">Huidige situatie</h3>
    ${current.length ? imageGalleryHtml(current, "current") : '<p class="empty-state">Nog geen foto van de huidige staat.</p>'}
    <p>${escapeHtml(room.current_state || "")}</p>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:24px 0 10px;">
      <h3 style="margin:0;font-size:1rem;">Werkzaamheden</h3>
      <button class="btn-primary" id="add-task-btn">+ Werkzaamheid</button>
    </div>
    <div id="task-list">${tasks.length ? tasks.map((t) => taskCardHtml(t, { showRoom: false, purchases: PURCHASES, selectable: true })).join("") : '<p class="empty-state">Nog geen werkzaamheden voor deze kamer.</p>'}</div>

    ${materials.length ? `
    <h3 style="font-size:1rem;margin:24px 0 10px;">Materialen voor deze kamer</h3>
    <ul class="plain-list">${materials.map((m) => `<li>${escapeHtml(m.name)} — <span class="pill ${m.status === "In huis" ? "gedaan" : "open"}">${escapeHtml(m.status)}</span></li>`).join("")}</ul>
    <p style="font-size:0.82rem;"><a href="materialen.html">Beheer materialen →</a></p>` : ""}
  `;

  wireImageGallery(desired, room);
  wireImageGallery(current, room);
  document.getElementById("add-image-btn").addEventListener("click", () => openImageForm(room));

  const root = document.getElementById("kamers-root");
  const ctx = taskCtx();
  wireTaskCards(document.getElementById("task-list"), tasks, ctx);
  wireSelectCheckboxes(root, ".task-select-cb", () => renderBulk(), selectedTaskIds);
  renderBulk();
  document.getElementById("add-task-btn").addEventListener("click", () => {
    openTaskForm({ task: null, ...ctx, defaults: { room_id: room.id } }, render);
  });
}

function wireImageGallery(images, room) {
  images.forEach((img, i) => {
    const tile = document.querySelector(`.room-image-tile[data-image-id="${img.id}"]`);
    if (!tile) return;
    tile.querySelector("img").addEventListener("click", () => {
      openLightbox(images.map((im) => ({ url: im.image_url, caption: im.caption })), i);
    });
    tile.querySelector(".image-cover-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await Promise.all(IMAGES.filter((im) => im.room_id === room.id && im.is_cover).map((im) => RoomImages.update(im.id, { is_cover: false })));
        await RoomImages.update(img.id, { is_cover: true });
        toast("Hoofdfoto ingesteld.");
        render();
      } catch (err) { reportError(err, "instellen hoofdfoto"); }
    });
    tile.querySelector(".image-delete-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = await confirmDialog("Deze afbeelding verwijderen?");
      if (!ok) return;
      try { await RoomImages.remove(img.id); toast("Afbeelding verwijderd."); render(); }
      catch (err) { reportError(err, "verwijderen afbeelding"); }
    });
  });
}

function openImageForm(room) {
  const overlay = openModal("Afbeelding toevoegen", `
    <form id="image-form">
      <div class="form-field full"><label>Afbeelding-URL of bestandspad</label><input type="text" name="image_url" required placeholder="images/rooms/${room.slug}-3.jpg"></div>
      <div class="form-field full"><label>Type</label>
        <select name="type">
          <option value="desired">Gewenste situatie</option>
          <option value="current">Huidige situatie</option>
        </select>
      </div>
      <div class="form-field full"><label>Bijschrift (optioneel)</label><input type="text" name="caption"></div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="image-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Toevoegen</button>
      </div>
    </form>`);
  overlay.querySelector("#image-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#image-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const type = fd.get("type");
    const existingCount = imagesFor(room.id, type).length;
    try {
      await RoomImages.create({
        room_id: room.id,
        image_url: fd.get("image_url").trim(),
        type,
        caption: fd.get("caption") || null,
        sort_order: existingCount + 1,
        is_cover: false,
      });
      toast("Afbeelding toegevoegd.");
      closeModal();
      render();
    } catch (err) { reportError(err, "toevoegen afbeelding"); }
  });
}

function renderBulk() {
  const bar = document.getElementById("bulk-bar");
  renderBulkBar(bar, {
    selectedIds: Array.from(selectedTaskIds),
    people: PEOPLE,
    workdays: WORKDAYS,
    statuses: TASK_STATUSES,
    onAssignPerson: async (personId) => {
      try { await Tasks.addPersonToMany(Array.from(selectedTaskIds), personId); toast("Toegewezen."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "toewijzen"); }
    },
    onMoveWorkday: async (workdayId) => {
      try { await Tasks.bulkUpdate(Array.from(selectedTaskIds), { workday_id: workdayId }); toast("Verplaatst."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "verplaatsen"); }
    },
    onSetStatus: async (status) => {
      try { await Tasks.bulkUpdate(Array.from(selectedTaskIds), { status }); toast("Status bijgewerkt."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "status wijzigen"); }
    },
    onDelete: async () => {
      const ok = await confirmDialog(`${selectedTaskIds.size} werkzaamheden verwijderen? Dit kan niet ongedaan worden gemaakt.`);
      if (!ok) return;
      try { await Tasks.bulkRemove(Array.from(selectedTaskIds)); toast("Verwijderd."); selectedTaskIds.clear(); render(); }
      catch (err) { reportError(err, "verwijderen"); }
    },
    onCancel: () => { selectedTaskIds.clear(); render(); },
  });
}

document.getElementById("add-room-btn")?.addEventListener("click", () => {
  const overlay = openModal("Nieuwe kamer", `
    <form id="room-form">
      <div class="form-field full"><label>Naam</label><input type="text" name="name" required></div>
      <div class="form-field full"><label>Verdieping</label>
        <select name="floor">
          <option value="begane-grond">Begane grond</option>
          <option value="verdieping">Verdieping</option>
          <option value="buiten">Buiten</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="room-cancel-btn">Annuleren</button>
        <button type="submit" class="btn-primary">Toevoegen</button>
      </div>
    </form>`);
  overlay.querySelector("#room-cancel-btn").addEventListener("click", closeModal);
  overlay.querySelector("#room-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      await Rooms.create({ name, slug, floor: fd.get("floor"), sort_order: ROOMS.length + 1 });
      toast("Kamer toegevoegd.");
      closeModal();
      render();
    } catch (err) { reportError(err, "toevoegen kamer"); }
  });
});

render();
