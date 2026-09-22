// Verbouwplan Leliestraat 27 — de financiële keten, volledig berekend uit
// Inkopen (purchases). Budget is een overzichtspagina bovenop die data, geen
// aparte administratie: wijzig je een bedrag bij een inkoop, dan verandert
// het budgetoverzicht vanzelf mee. Werkzaamheden en personen dragen geen
// eigen financiële velden — die koppeling is bewust losgelaten.

export function purchaseEstimatedTotal(p) {
  return (Number(p.estimated_material_cost) || 0) + (Number(p.estimated_labor_cost) || 0);
}
export function purchaseActualTotal(p) {
  return (Number(p.actual_material_cost) || 0) + (Number(p.actual_labor_cost) || 0);
}

// Een inkoop zonder eigen fase/kamer erft die van zijn (puur informatieve)
// gekoppelde werkzaamheid, zodat je 'm niet dubbel hoeft in te vullen.
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

// Begroot/werkelijk (materiaal + arbeid) binnen een scope (categorie, fase
// en/of kamer). Telt alleen inkopen die meetellen in het budget
// (count_in_budget) — Buiten-scope-posten staan er standaard buiten.
export function computeRollup({ purchases, tasks = [], categoryId, phaseId, roomId, onlyCounted = true }) {
  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  const scoped = purchases.filter((p) => {
    if (onlyCounted && !p.count_in_budget) return false;
    if (categoryId !== undefined && p.budget_category_id !== categoryId) return false;
    if (phaseId !== undefined && resolvedPhaseId(p, tasksById) !== phaseId) return false;
    if (roomId !== undefined && resolvedRoomId(p, tasksById) !== roomId) return false;
    return true;
  });
  const estimatedMaterial = scoped.reduce((sum, p) => sum + (Number(p.estimated_material_cost) || 0), 0);
  const estimatedLabor = scoped.reduce((sum, p) => sum + (Number(p.estimated_labor_cost) || 0), 0);
  const actualMaterial = scoped.reduce((sum, p) => sum + (Number(p.actual_material_cost) || 0), 0);
  const actualLabor = scoped.reduce((sum, p) => sum + (Number(p.actual_labor_cost) || 0), 0);
  return {
    estimatedMaterial, estimatedLabor, estimatedTotal: estimatedMaterial + estimatedLabor,
    actualMaterial, actualLabor, actualTotal: actualMaterial + actualLabor,
  };
}

export function computeTotalSummary(budget, purchases) {
  const totalBudget = Number(budget?.total_budget) || 0;
  const { estimatedMaterial, estimatedLabor, estimatedTotal, actualMaterial, actualLabor, actualTotal } =
    computeRollup({ purchases });
  return {
    totalBudget,
    estimatedMaterial, estimatedLabor, estimatedTotal,
    actualMaterial, actualLabor, actualTotal,
    unallocated: totalBudget - estimatedTotal,
    available: totalBudget - actualTotal,
  };
}
