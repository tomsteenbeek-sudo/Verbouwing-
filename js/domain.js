// Verbouwplan Leliestraat 27 — gedeelde afgeleide logica (geen eigen opslag).
// Klusdag-status wordt altijd berekend uit de gekoppelde werkzaamheden, nooit apart
// opgeslagen — zo kan het nooit uit sync raken met de echte voortgang.

export function tasksByWorkday(tasks) {
  const map = new Map();
  for (const t of tasks) {
    const key = t.workday_id || "unplanned";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return map;
}

export function computeWorkdayStatus(workday, tasksForDay) {
  const total = tasksForDay.length;
  if (total === 0) return "Gepland";
  const done = tasksForDay.filter((t) => t.status === "Gereed").length;
  if (done === total) return "Gereed";
  const today = new Date().toISOString().slice(0, 10);
  if (workday.date === today) return "Vandaag";
  if (done > 0 || tasksForDay.some((t) => t.status === "Bezig")) return "Bezig";
  return "Gepland";
}

export function decorateWorkdays(workdays, tasks, dependencies) {
  const grouped = tasksByWorkday(tasks);
  return workdays
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((w) => {
      const dayTasks = (grouped.get(w.id) || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      const status = computeWorkdayStatus(w, dayTasks);
      const done = dayTasks.filter((t) => t.status === "Gereed").length;
      const depNumbers = dependencies
        .filter((d) => d.workday_id === w.id)
        .map((d) => workdays.find((x) => x.id === d.depends_on_workday_id))
        .filter(Boolean);
      return { ...w, tasks: dayTasks, status, done, total: dayTasks.length, dependsOn: depNumbers };
    });
}

export function prerequisiteWarning(decoratedWorkday, decoratedWorkdaysByNumber) {
  const notDone = decoratedWorkday.dependsOn
    .map((d) => decoratedWorkdaysByNumber.get(d.number))
    .filter((d) => d && d.status !== "Gereed");
  if (!notDone.length) return null;
  return `Wacht op klusdag ${notDone.map((d) => d.number).join(", ")} — nog niet gereed.`;
}

export function nextUpcomingWorkday(decoratedWorkdays) {
  return decoratedWorkdays.find((w) => w.status !== "Gereed" && w.total > 0)
    || decoratedWorkdays.find((w) => w.status !== "Gereed")
    || null;
}

export function formatDate(dateStr) {
  if (!dateStr) return "Nog geen datum";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// Items in de "Buiten scope / later"-fase mogen de actieve planning, voortgang
// en waarschuwingen niet vervuilen — ze blijven bewaard maar tellen nergens mee
// totdat ze weer naar een actieve fase worden verplaatst.
export const BUITEN_SCOPE_PHASE_NAME = "Buiten scope / later";

export function activeTasks(tasks, phases) {
  const buitenScope = phases.find((p) => p.name === BUITEN_SCOPE_PHASE_NAME);
  if (!buitenScope) return tasks;
  return tasks.filter((t) => t.phase_id !== buitenScope.id);
}
