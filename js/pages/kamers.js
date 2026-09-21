import { Rooms, Workdays, People, Tasks, Materials } from "../db.js";
import { renderNav, escapeHtml, reportError, toast, openModal, closeModal, confirmDialog } from "../ui.js";
import { taskCardHtml, wireTaskCards, openTaskForm } from "../task-shared.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

const FLOOR_LABELS = { "begane-grond": "Begane grond", "verdieping": "Verdieping", "buiten": "Buiten" };
let ROOMS = [], WORKDAYS = [], PEOPLE = [], TASKS = [], MATERIALS = [];
let currentFloor = "alle";

function imgTag(slug, alt) {
  return `<img src="images/rooms/${slug}.jpg" alt="${alt}" loading="lazy" onerror="this.remove();">`;
}

async function loadAll() {
  [ROOMS, WORKDAYS, PEOPLE, TASKS, MATERIALS] = await Promise.all([
    Rooms.list(), Workdays.list(), People.list(), Tasks.list(), Materials.list(),
  ]);
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
    return `
      <article class="room-card card" data-slug="${r.slug}">
        <div class="room-thumb">
          <div class="ph-fallback"><div class="ph-icon">🏠</div>afbeelding volgt</div>
          ${imgTag(r.slug, r.name)}
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

function renderDetail(slug) {
  const room = ROOMS.find((r) => r.slug === slug);
  if (!room) { document.getElementById("kamers-root").innerHTML = `<p class="empty-state">Kamer niet gevonden.</p>`; return; }
  const tasks = TASKS.filter((t) => t.room_id === room.id);
  const materials = MATERIALS.filter((m) => m.room_id === room.id);
  document.getElementById("kamers-root").innerHTML = `
    <a href="kamers.html" class="btn-secondary" style="display:inline-block;margin-bottom:18px;">← Terug naar kamers</a>
    <div class="overlay-img" style="border-radius:var(--radius);margin-bottom:20px;">
      <div class="ph-fallback"><div class="ph-icon">🏠</div>Nog geen ontwerpafbeelding<br>plaats images/rooms/${room.slug}.jpg</div>
      ${imgTag(room.slug, room.name)}
    </div>
    <div class="room-floor">${FLOOR_LABELS[room.floor]}${room.is_out_of_scope ? ' · <span class="badge klaar">Buiten scope</span>' : ""}</div>
    <h2 style="margin-bottom:14px;">${escapeHtml(room.name)}</h2>
    <div class="compare">
      <div class="compare-col nu"><div class="lbl">Nu</div><p>${escapeHtml(room.current_state || "")}</p></div>
      <div class="compare-col wordt"><div class="lbl">Wordt</div><p>${escapeHtml(room.target_state || "")}</p></div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:24px 0 10px;">
      <h3 style="margin:0;font-size:1rem;">Werkzaamheden</h3>
      <button class="btn-primary" id="add-task-btn">+ Werkzaamheid</button>
    </div>
    <div id="task-list">${tasks.length ? tasks.map((t) => taskCardHtml(t, { showRoom: false })).join("") : '<p class="empty-state">Nog geen werkzaamheden voor deze kamer.</p>'}</div>

    ${materials.length ? `
    <h3 style="font-size:1rem;margin:24px 0 10px;">Materialen voor deze kamer</h3>
    <ul class="plain-list">${materials.map((m) => `<li>${escapeHtml(m.name)} — <span class="pill ${m.status === "In huis" ? "gedaan" : "open"}">${escapeHtml(m.status)}</span></li>`).join("")}</ul>
    <p style="font-size:0.82rem;"><a href="materialen.html">Beheer materialen →</a></p>` : ""}
  `;

  const ctx = { rooms: ROOMS, workdays: WORKDAYS, people: PEOPLE, onChange: render };
  wireTaskCards(document.getElementById("task-list"), tasks, ctx);
  document.getElementById("add-task-btn").addEventListener("click", () => {
    openTaskForm({ task: null, ...ctx, defaults: { room_id: room.id } }, render);
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
