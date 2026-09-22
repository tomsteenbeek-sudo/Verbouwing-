import { Workdays, Tasks, Decisions, Quotes, Materials, TaskMaterials, Budgets, BudgetCategories, Purchases, Phases } from "../db.js?v=4";
import { renderNav, escapeHtml, reportError, euro } from "../ui.js?v=4";
import { decorateWorkdays, nextUpcomingWorkday, prerequisiteWarning, formatDate, activeTasks, BUITEN_SCOPE_PHASE_NAME } from "../domain.js?v=4";
import { computeTotalSummary, computeRollup } from "../finance.js?v=4";

renderNav();
document.getElementById("year").textContent = new Date().getFullYear();

async function init() {
  const root = document.getElementById("dash-root");
  try {
    const [workdays, deps, allTasks, decisions, quotes, materials, taskMaterials, budget, categories, purchases, phases] = await Promise.all([
      Workdays.list(), Workdays.dependencies(), Tasks.list(), Decisions.list(), Quotes.list(),
      Materials.list(), TaskMaterials.listAll(), Budgets.get(), BudgetCategories.list(), Purchases.list(), Phases.list(),
    ]);
    const buitenScopePhase = phases.find((p) => p.name === BUITEN_SCOPE_PHASE_NAME);
    const tasks = activeTasks(allTasks, phases);
    const decorated = decorateWorkdays(workdays, tasks, deps);
    const next = nextUpcomingWorkday(decorated);
    const summary = computeTotalSummary(budget, purchases);

    renderNextWorkday(next);
    renderVoortgang(tasks);
    renderStats(decisions, quotes, materials, allTasks, buitenScopePhase);
    renderPhases(phases, tasks);
    renderBudget(summary);
    renderUpcoming(decorated);
    renderWarnings(decorated, next, decisions, taskMaterials, summary, categories, tasks, purchases);
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
  const people = new Set(next.tasks.flatMap((t) => t.people).map((p) => p.name));
  el.innerHTML = `
    <div class="eyebrow">Klusdag ${next.number}</div>
    <h2 style="margin-bottom:4px;">${formatDate(next.date)}</h2>
    ${next.presentPeople.length ? `<p style="color:var(--text-muted);margin:0 0 14px;">Aanwezig: ${next.presentPeople.map((p) => escapeHtml(p.name)).join(" · ")}</p>` : ""}
    <div class="stat-row" style="margin-bottom:16px;">
      <div class="stat-card"><div class="n">${next.total}</div><div class="l">Werkzaamheden</div></div>
      <div class="stat-card"><div class="n">${people.size}</div><div class="l">Personen</div></div>
      <div class="stat-card"><div class="n">${next.done}/${next.total}</div><div class="l">Gereed</div></div>
    </div>
    <a class="btn-primary" href="planning.html#dag-${next.number}">Open klusdag</a>`;
}

function renderStats(decisions, quotes, materials, allTasks, buitenScopePhase) {
  const openDecisions = decisions.filter((d) => d.status === "Open").length;
  const openQuotes = quotes.filter((q) => q.status !== "Akkoord" && q.status !== "Afgewezen").length;
  const toBuy = materials.filter((m) => m.status !== "In huis").length;
  const buitenScopeCount = buitenScopePhase ? allTasks.filter((t) => t.phase_id === buitenScopePhase.id).length : 0;

  document.getElementById("stat-besluiten").innerHTML =
    `<div class="big">${openDecisions}</div><div class="sub">openstaande besluiten</div>`;
  document.getElementById("stat-offertes").innerHTML =
    `<div class="big">${openQuotes}</div><div class="sub">lopende offertes</div>`;
  document.getElementById("stat-materialen").innerHTML =
    `<div class="big">${toBuy}</div><div class="sub">materialen nog te kopen</div>`;
  document.getElementById("stat-buitenscope").innerHTML =
    `<div class="big">${buitenScopeCount}</div><div class="sub"><a href="buiten-scope.html">buiten scope / later →</a></div>`;
}

function renderVoortgang(tasks) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "Gereed").length;
  document.getElementById("stat-voortgang").innerHTML =
    `<div class="big">${doneTasks} / ${totalTasks}</div><div class="sub">werkzaamheden gereed</div>`;
}

function renderPhases(phases, tasks) {
  const activePhases = phases.filter((p) => p.name !== BUITEN_SCOPE_PHASE_NAME);
  const el = document.getElementById("dash-phases");
  if (!activePhases.length) {
    el.innerHTML = `<p class="empty-state">Nog geen fases aangemaakt.</p>`;
    return;
  }
  el.innerHTML = `<div class="stat-row">${activePhases.map((phase) => {
    const phaseTasks = tasks.filter((t) => t.phase_id === phase.id);
    const done = phaseTasks.filter((t) => t.status === "Gereed").length;
    return `<div class="stat-card"><div class="n" style="color:${phase.color || "inherit"};">${done}/${phaseTasks.length}</div><div class="l">${escapeHtml(phase.name)}</div></div>`;
  }).join("")}</div>`;
}

function renderBudget(summary) {
  document.getElementById("dash-budget").innerHTML = `
    <div class="stat-row">
      <div class="stat-card"><div class="n">${euro(summary.totalBudget)}</div><div class="l">Vastgesteld</div></div>
      <div class="stat-card"><div class="n">${euro(summary.estimatedTotal)}</div><div class="l">Begroot</div></div>
      <div class="stat-card"><div class="n">${euro(summary.unallocated)}</div><div class="l">Nog beschikbaar tov begroot</div></div>
      <div class="stat-card"><div class="n">${euro(summary.actualTotal)}</div><div class="l">Werkelijk uitgegeven</div></div>
      <div class="stat-card"><div class="n">${euro(summary.available)}</div><div class="l">Resterend</div></div>
    </div>
    <p style="font-size:0.82rem;margin:12px 0 0;">Materiaal begroot ${euro(summary.estimatedMaterial)} · Arbeid begroot ${euro(summary.estimatedLabor)} · Materiaal werkelijk ${euro(summary.actualMaterial)} · Arbeid werkelijk ${euro(summary.actualLabor)}</p>
    <p style="font-size:0.82rem;margin:6px 0 0;"><a href="budget.html">Volledig budgetoverzicht →</a></p>`;
}

function renderUpcoming(decorated) {
  const list = decorated
    .filter((w) => w.status !== "Gereed")
    .flatMap((w) => w.tasks.filter((t) => t.status !== "Gereed").map((t) => ({ ...t, workdayNumber: w.number })))
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
        <span style="color:var(--text-muted);font-size:0.82rem;">Klusdag ${t.workdayNumber} · ${escapeHtml(t.rooms?.name || "Algemeen")}${t.people.length ? " · " + t.people.map((p) => escapeHtml(p.name)).join(", ") : ""}</span>
      </label>
    </li>`).join("")}</ul>`;
}

function renderWarnings(decorated, next, decisions, taskMaterials, summary, categories, tasks, purchases) {
  const warnings = [];

  decorated.filter((w) => w.status !== "Gereed").forEach((w) => {
    const warn = prerequisiteWarning(w, new Map(decorated.map((d) => [d.number, d])));
    if (warn) warnings.push(`Klusdag ${w.number}: ${warn}`);
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
    decisions
      .filter((d) => d.status === "Open" && d.phase_id && d.phase_id === next.phase_id)
      .forEach((d) => warnings.push(`Besluit "${d.title}" staat nog open en hoort bij de fase van klusdag ${next.number}.`));
  }

  if (summary.estimatedTotal > summary.totalBudget) {
    warnings.push(`Budgetoverschrijding: ${euro(summary.estimatedTotal - summary.totalBudget)} meer begroot dan vastgesteld.`);
  }
  if (summary.unallocated > 0) {
    warnings.push(`${euro(summary.unallocated)} van het totaalbudget nog niet toegewezen.`);
  }
  categories.forEach((cat) => {
    const { estimatedTotal } = computeRollup({ purchases, tasks, categoryId: cat.id });
    const over = estimatedTotal - Number(cat.allocated_budget || 0);
    if (over > 0) warnings.push(`${cat.name}: ${euro(over)} boven budget.`);
  });

  const el = document.getElementById("dash-warnings");
  const section = document.getElementById("dash-warnings-section");
  if (!warnings.length) { section.style.display = "none"; return; }
  section.style.display = "";
  el.innerHTML = warnings.slice(0, 8).map((w) => `<li class="warning-item"><span class="icon">⚠</span><span>${escapeHtml(w)}</span></li>`).join("");
}

init();
