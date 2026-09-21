import { Workdays, Tasks, Actions, Materials, TaskMaterials } from "../db.js";
import { renderNav, escapeHtml, reportError } from "../ui.js";
import { decorateWorkdays, nextUpcomingWorkday, prerequisiteWarning, formatDate } from "../domain.js";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

async function init() {
  const root = document.getElementById("dash-root");
  try {
    const [workdays, deps, tasks, actions, materials, taskMaterials] = await Promise.all([
      Workdays.list(), Workdays.dependencies(), Tasks.list(), Actions.list(), Materials.list(), TaskMaterials.listAll(),
    ]);
    const decorated = decorateWorkdays(workdays, tasks, deps);
    const next = nextUpcomingWorkday(decorated);

    renderNextWorkday(next);
    renderStats(decorated, tasks, actions, materials);
    renderUpcoming(decorated);
    renderWarnings(decorated, next, actions, taskMaterials);
    root.classList.remove("loading-state");
  } catch (err) {
    reportError(err, "het laden van het dashboard");
    root.innerHTML = `<p class="empty-state">Kon de gegevens niet laden. Controleer de internetverbinding en probeer het opnieuw.</p>`;
  }
}

function renderNextWorkday(next) {
  const el = document.getElementById("next-workday");
  if (!next) {
    el.innerHTML = `<p class="empty-state">Alle klusdagen zijn gereed 🎉</p>`;
    return;
  }
  const people = new Set(next.tasks.map((t) => t.people?.name).filter(Boolean));
  el.innerHTML = `
    <div class="eyebrow">Klusdag ${next.number}</div>
    <h2 style="margin-bottom:4px;">${escapeHtml(next.name)}</h2>
    <p style="color:var(--text-muted);margin:0 0 14px;">${formatDate(next.date)}</p>
    <div class="stat-row" style="margin-bottom:16px;">
      <div class="stat-card"><div class="n">${next.total}</div><div class="l">Werkzaamheden</div></div>
      <div class="stat-card"><div class="n">${people.size}</div><div class="l">Personen</div></div>
      <div class="stat-card"><div class="n">${next.done}/${next.total}</div><div class="l">Gereed</div></div>
    </div>
    <a class="btn-primary" href="planning.html#dag-${next.number}">Open klusdag</a>`;
}

function renderStats(decorated, tasks, actions, materials) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "Gereed").length;
  const openActions = actions.filter((a) => a.status === "Open");
  const upcomingNumbers = new Set(decorated.filter((w) => w.status !== "Gereed").slice(0, 2).map((w) => w.number));
  const urgent = openActions.filter((a) => a.workdays && upcomingNumbers.has(a.workdays.number));
  const toBuy = materials.filter((m) => m.status !== "In huis").length;

  document.getElementById("stat-voortgang").innerHTML =
    `<div class="big">${doneTasks} / ${totalTasks}</div><div class="sub">werkzaamheden gereed</div>`;
  document.getElementById("stat-acties").innerHTML =
    `<div class="big">${openActions.length}</div><div class="sub">openstaande acties</div>`;
  document.getElementById("stat-urgent").innerHTML =
    `<div class="big">${urgent.length}</div><div class="sub">urgente acties</div>`;
  document.getElementById("stat-materialen").innerHTML =
    `<div class="big">${toBuy}</div><div class="sub">materialen nog te kopen</div>`;
}

function renderUpcoming(decorated) {
  const list = decorated
    .filter((w) => w.status !== "Gereed")
    .flatMap((w) => w.tasks.filter((t) => t.status !== "Gereed").map((t) => ({ ...t, workdayNumber: w.number, workdayName: w.name })))
    .slice(0, 8);
  const el = document.getElementById("upcoming-tasks");
  if (!list.length) {
    el.innerHTML = `<p class="empty-state">Geen openstaande werkzaamheden gepland.</p>`;
    return;
  }
  el.innerHTML = `<ul class="action-list">${list.map((t) => `
    <li>
      <label style="flex:1;">
        <strong>${escapeHtml(t.title)}</strong><br>
        <span style="color:var(--text-muted);font-size:0.82rem;">Klusdag ${t.workdayNumber} · ${escapeHtml(t.rooms?.name || "Algemeen")}${t.people ? " · " + escapeHtml(t.people.name) : ""}</span>
      </label>
    </li>`).join("")}</ul>`;
}

function renderWarnings(decorated, next, actions, taskMaterials) {
  const warnings = [];

  decorated.filter((w) => w.status !== "Gereed").forEach((w) => {
    const warn = prerequisiteWarning(w, new Map(decorated.map((d) => [d.number, d])));
    if (warn) warnings.push(`Klusdag ${w.number} (${w.name}): ${warn}`);
  });

  const soonWorkdays = decorated.filter((w) => w.status !== "Gereed").slice(0, 2);
  const soonTaskIds = new Set(soonWorkdays.flatMap((w) => w.tasks.map((t) => t.id)));
  const seenMaterials = new Set();
  taskMaterials.forEach((row) => {
    if (!soonTaskIds.has(row.task_id) || !row.materials) return;
    if (row.materials.status === "In huis") return;
    const key = row.materials.id;
    if (seenMaterials.has(key)) return;
    seenMaterials.add(key);
    const wd = soonWorkdays.find((w) => w.tasks.some((t) => t.id === row.task_id));
    warnings.push(`${row.materials.name} nog niet in huis, nodig voor klusdag ${wd?.number ?? "?"}.`);
  });

  if (next) {
    actions
      .filter((a) => a.status === "Open" && a.workdays && a.workdays.number === next.number)
      .forEach((a) => warnings.push(`Actie "${a.title}" blokkeert klusdag ${next.number} en staat nog open.`));
  }

  const el = document.getElementById("dash-warnings");
  const section = document.getElementById("dash-warnings-section");
  if (!warnings.length) { section.style.display = "none"; return; }
  section.style.display = "";
  el.innerHTML = warnings.slice(0, 6).map((w) => `<li class="warning-item"><span class="icon">⚠</span><span>${escapeHtml(w)}</span></li>`).join("");
}

init();
