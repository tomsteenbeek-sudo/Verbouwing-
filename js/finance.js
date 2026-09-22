// Verbouwplan Leliestraat 27 — de financiële keten, berekend uit tasks/purchases
// in plaats van los opgeslagen totalen. Voorkomt dubbele telling: een taak
// telt zijn begrote arbeid+materiaal (handmatig), maar "verplicht"/"werkelijk"
// worden nooit apart op de taak bijgehouden — die komen altijd uit de
// gekoppelde inkopen (purchases.committed_cost/actual_cost). Een inkoop die
// aan een taak hangt, telt dus maar op één plek mee.

export function taskEstimated(task) {
  return (Number(task.estimated_labor_cost) || 0) + (Number(task.estimated_material_cost) || 0);
}
export function taskCommitted(task, purchases) {
  return purchases.filter((p) => p.task_id === task.id).reduce((sum, p) => sum + (Number(p.committed_cost) || 0), 0);
}
export function taskActual(task, purchases) {
  return purchases.filter((p) => p.task_id === task.id).reduce((sum, p) => sum + (Number(p.actual_cost) || 0), 0);
}

// Een inkoop zonder eigen categorie/fase/kamer erft die van zijn gekoppelde
// werkzaamheid (als die er is), zodat je 'm niet dubbel hoeft in te vullen.
export function resolvedCategoryId(purchase, tasksById) {
  if (purchase.budget_category_id) return purchase.budget_category_id;
  const task = purchase.task_id && tasksById.get(purchase.task_id);
  return task?.budget_category_id || null;
}
export function resolvedPhaseId(purchase, tasksById) {
  if (purchase.phase_id) return purchase.phase_id;
  const task = purchase.task_id && tasksById.get(purchase.task_id);
  return task?.phase_id || null;
}
export function resolvedRoomId(purchase, tasksById) {
  if (purchase.room_id) return purchase.room_id;
  const task = purchase.task_id && tasksById.get(purchase.task_id);
  return task?.room_id || null;
}

// Begroot/verplicht/betaald binnen een scope (categorie, fase en/of kamer).
// "Begroot" telt de begrote bedragen van taken in scope, plus alleen de
// inkopen die aan GEEN taak hangen (anders zou het materiaalbedrag van een
// taak dubbel meetellen: eenmaal via de taak, eenmaal via zijn inkopen).
// "Verplicht" en "betaald" tellen altijd alle inkopen in scope, ongeacht of
// ze aan een taak hangen — dat is de enige plek waar die bedragen leven.
export function computeRollup({ tasks, purchases, categoryId, phaseId, roomId }) {
  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  const matchTask = (t) =>
    (categoryId === undefined || t.budget_category_id === categoryId) &&
    (phaseId === undefined || t.phase_id === phaseId) &&
    (roomId === undefined || t.room_id === roomId);
  const matchPurchase = (p) =>
    (categoryId === undefined || resolvedCategoryId(p, tasksById) === categoryId) &&
    (phaseId === undefined || resolvedPhaseId(p, tasksById) === phaseId) &&
    (roomId === undefined || resolvedRoomId(p, tasksById) === roomId);

  const scopedTasks = tasks.filter(matchTask);
  const scopedPurchases = purchases.filter(matchPurchase);
  const standalonePurchases = scopedPurchases.filter((p) => !p.task_id);

  const assigned = scopedTasks.reduce((sum, t) => sum + taskEstimated(t), 0)
    + standalonePurchases.reduce((sum, p) => sum + (Number(p.estimated_cost) || 0), 0);
  const committed = scopedPurchases.reduce((sum, p) => sum + (Number(p.committed_cost) || 0), 0);
  const paid = scopedPurchases.reduce((sum, p) => sum + (Number(p.actual_cost) || 0), 0);

  return { assigned, committed, paid };
}

export function computeTotalSummary(budget, categories, purchases) {
  const totalBudget = Number(budget?.total_budget) || 0;
  const allocated = categories.reduce((sum, c) => sum + (Number(c.allocated_budget) || 0), 0);
  const committed = purchases.reduce((sum, p) => sum + (Number(p.committed_cost) || 0), 0);
  const paid = purchases.reduce((sum, p) => sum + (Number(p.actual_cost) || 0), 0);
  return {
    totalBudget, allocated, unallocated: totalBudget - allocated,
    committed, paid, available: totalBudget - committed,
  };
}

// Financieel overzicht voor één persoon (Personen-detailpagina).
export function computePersonFinance(personId, tasks, purchases, payments) {
  const responsibleTasks = tasks.filter((t) => (t.budgetResponsible || []).some((p) => p.id === personId));
  const responsibleFor = responsibleTasks.reduce((sum, t) => sum + taskEstimated(t), 0);
  const paidBySelf = payments.filter((pay) => pay.person_id === personId).reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);

  const workedTaskIds = new Set(tasks.filter((t) => (t.people || []).some((p) => p.id === personId)).map((t) => t.id));
  const outstandingPurchases = purchases.filter((p) => !p.received && p.task_id && workedTaskIds.has(p.task_id));
  const outstanding = outstandingPurchases.reduce((sum, p) => sum + (Number(p.committed_cost) || Number(p.estimated_cost) || 0), 0);

  return { responsibleFor, paidBySelf, outstanding, responsibleTasks, outstandingPurchases };
}
