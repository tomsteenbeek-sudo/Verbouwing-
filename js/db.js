// Verbouwplan Leliestraat 27 — CRUD-helpers per tabel.
// Eén bron per soort data; elke pagina haalt hier dezelfde records vandaan.
import { getSupabase } from "./supabase-client.js?v=3";

async function listAll(table, { select = "*", order } = {}) {
  const supabase = await getSupabase();
  let q = supabase.from(table).select(select);
  if (order) q = q.order(order.column, { ascending: order.ascending !== false });
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
async function insertRow(table, row) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return data;
}
async function updateRow(table, id, patch) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from(table).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
async function deleteRow(table, id) {
  const supabase = await getSupabase();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
async function bulkUpdateRows(table, ids, patch) {
  const supabase = await getSupabase();
  const { error } = await supabase.from(table).update(patch).in("id", ids);
  if (error) throw error;
}
async function bulkDeleteRows(table, ids) {
  const supabase = await getSupabase();
  const { error } = await supabase.from(table).delete().in("id", ids);
  if (error) throw error;
}

// Vervangt alle koppelrijen voor één eigenaar (bv. alle personen van één taak)
// door de opgegeven lijst — gebruikt in het bewerkformulier (multi-select).
async function setLinks(joinTable, ownerCol, ownerId, otherCol, otherIds) {
  const supabase = await getSupabase();
  const { error: delErr } = await supabase.from(joinTable).delete().eq(ownerCol, ownerId);
  if (delErr) throw delErr;
  if (otherIds.length) {
    const rows = otherIds.map((id) => ({ [ownerCol]: ownerId, [otherCol]: id }));
    const { error } = await supabase.from(joinTable).insert(rows);
    if (error) throw error;
  }
}

// Voegt één koppeling toe aan meerdere eigenaren tegelijk (bulkbewerking) zonder
// bestaande koppelingen van die eigenaren aan te raken — dus Marcel blijft
// gekoppeld als je Tom via bulkbewerking toevoegt.
async function addLinkToMany(joinTable, ownerCol, ownerIds, otherCol, otherId) {
  const supabase = await getSupabase();
  const rows = ownerIds.map((id) => ({ [ownerCol]: id, [otherCol]: otherId }));
  const { error } = await supabase.from(joinTable).upsert(rows, { onConflict: `${ownerCol},${otherCol}`, ignoreDuplicates: true });
  if (error) throw error;
}

function withPeople(rows, joinKey, outKey = "people") {
  return rows.map((row) => ({ ...row, [outKey]: (row[joinKey] || []).map((j) => j.people).filter(Boolean) }));
}

export const People = {
  list: () => listAll("people", { order: { column: "name" } }),
  create: (name) => insertRow("people", { name }),
  update: (id, patch) => updateRow("people", id, patch),
  remove: (id) => deleteRow("people", id),
};

export const Rooms = {
  list: () => listAll("rooms", { order: { column: "sort_order" } }),
  getBySlug: async (slug) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("rooms").select("*").eq("slug", slug).single();
    if (error) throw error;
    return data;
  },
  create: (row) => insertRow("rooms", row),
  update: (id, patch) => updateRow("rooms", id, patch),
};

export const RoomImages = {
  list: () => listAll("room_images", { order: { column: "sort_order" } }),
  create: (row) => insertRow("room_images", row),
  update: (id, patch) => updateRow("room_images", id, patch),
  remove: (id) => deleteRow("room_images", id),
};

export const Phases = {
  list: () => listAll("phases", { order: { column: "sort_order" } }),
  create: (row) => insertRow("phases", row),
  update: (id, patch) => updateRow("phases", id, patch),
  remove: (id) => deleteRow("phases", id),
};

export const Workdays = {
  list: async () => {
    const rows = await listAll("workdays", { select: "*, workday_persons(people(id,name))", order: { column: "sort_order" } });
    return withPeople(rows, "workday_persons", "presentPeople");
  },
  create: (row) => insertRow("workdays", row),
  update: (id, patch) => updateRow("workdays", id, patch),
  remove: async (id) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("tasks").update({ workday_id: null }).eq("workday_id", id);
    if (error) throw error;
    await deleteRow("workdays", id);
  },
  dependencies: () => listAll("workday_dependencies"),
  setPresent: (workdayId, personIds) => setLinks("workday_persons", "workday_id", workdayId, "person_id", personIds),
};

export const Tasks = {
  list: async () => {
    const rows = await listAll("tasks", {
      select: "*, rooms(id,name,slug), workdays(id,number), phases(id,name,color), task_persons(people(id,name))",
      order: { column: "sort_order" },
    });
    return withPeople(rows, "task_persons");
  },
  create: (row) => insertRow("tasks", row),
  update: (id, patch) => updateRow("tasks", id, patch),
  remove: (id) => deleteRow("tasks", id),
  bulkUpdate: (ids, patch) => bulkUpdateRows("tasks", ids, patch),
  bulkRemove: (ids) => bulkDeleteRows("tasks", ids),
  setPersons: (taskId, personIds) => setLinks("task_persons", "task_id", taskId, "person_id", personIds),
  addPersonToMany: (taskIds, personId) => addLinkToMany("task_persons", "task_id", taskIds, "person_id", personId),
  materialsFor: async (taskId) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("task_materials").select("materials(*)").eq("task_id", taskId);
    if (error) throw error;
    return data.map((d) => d.materials);
  },
  toolsFor: async (taskId) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("task_tools").select("tools(*)").eq("task_id", taskId);
    if (error) throw error;
    return data.map((d) => d.tools);
  },
  linkMaterial: async (taskId, materialId) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("task_materials").insert({ task_id: taskId, material_id: materialId });
    if (error) throw error;
  },
  unlinkMaterial: async (taskId, materialId) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("task_materials").delete().eq("task_id", taskId).eq("material_id", materialId);
    if (error) throw error;
  },
  linkTool: async (taskId, toolId) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("task_tools").insert({ task_id: taskId, tool_id: toolId });
    if (error) throw error;
  },
  unlinkTool: async (taskId, toolId) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("task_tools").delete().eq("task_id", taskId).eq("tool_id", toolId);
    if (error) throw error;
  },
};

export const Materials = {
  list: () => listAll("materials", { select: "*, rooms(id,name)", order: { column: "sort_order" } }),
  create: (row) => insertRow("materials", row),
  update: (id, patch) => updateRow("materials", id, patch),
  remove: (id) => deleteRow("materials", id),
  tasksFor: async (materialId) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("task_materials").select("tasks(*)").eq("material_id", materialId);
    if (error) throw error;
    return data.map((d) => d.tasks);
  },
};

export const Tools = {
  list: () => listAll("tools", { select: "*, people(id,name)", order: { column: "sort_order" } }),
  create: (row) => insertRow("tools", row),
  update: (id, patch) => updateRow("tools", id, patch),
  remove: (id) => deleteRow("tools", id),
  tasksFor: async (toolId) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("task_tools").select("tasks(*)").eq("tool_id", toolId);
    if (error) throw error;
    return data.map((d) => d.tasks);
  },
};

export const Decisions = {
  list: async () => {
    const rows = await listAll("decisions", {
      select: "*, phases(id,name,color), rooms(id,name), decision_persons(people(id,name)), decision_tasks(tasks(id,title))",
      order: { column: "sort_order" },
    });
    return withPeople(rows, "decision_persons").map((d) => ({ ...d, tasks: (d.decision_tasks || []).map((j) => j.tasks).filter(Boolean) }));
  },
  create: (row) => insertRow("decisions", row),
  update: (id, patch) => updateRow("decisions", id, patch),
  remove: (id) => deleteRow("decisions", id),
  setPersons: (decisionId, personIds) => setLinks("decision_persons", "decision_id", decisionId, "person_id", personIds),
  setTasks: (decisionId, taskIds) => setLinks("decision_tasks", "decision_id", decisionId, "task_id", taskIds),
};

export const Quotes = {
  list: async () => {
    const rows = await listAll("quotes", {
      select: "*, phases(id,name,color), budget_categories(id,name), quote_persons(people(id,name)), quote_tasks(tasks(id,title))",
      order: { column: "sort_order" },
    });
    return withPeople(rows, "quote_persons").map((q) => ({ ...q, tasks: (q.quote_tasks || []).map((j) => j.tasks).filter(Boolean) }));
  },
  create: (row) => insertRow("quotes", row),
  update: (id, patch) => updateRow("quotes", id, patch),
  remove: (id) => deleteRow("quotes", id),
  setPersons: (quoteId, personIds) => setLinks("quote_persons", "quote_id", quoteId, "person_id", personIds),
  setTasks: (quoteId, taskIds) => setLinks("quote_tasks", "quote_id", quoteId, "task_id", taskIds),
};

export const Purchases = {
  list: () => listAll("purchases", {
    select: "*, rooms(id,name), phases(id,name,color), tasks(id,title), budget_categories(id,name), quotes(id,supplier)",
    order: { column: "sort_order" },
  }),
  create: (row) => insertRow("purchases", row),
  update: (id, patch) => updateRow("purchases", id, patch),
  remove: (id) => deleteRow("purchases", id),
  bulkUpdate: (ids, patch) => bulkUpdateRows("purchases", ids, patch),
  bulkRemove: (ids) => bulkDeleteRows("purchases", ids),
};

export const Budgets = {
  get: async () => {
    const rows = await listAll("budgets");
    return rows[0] || null;
  },
  update: (id, patch) => updateRow("budgets", id, patch),
};

export const BudgetCategories = {
  list: () => listAll("budget_categories", { order: { column: "sort_order" } }),
  create: (row) => insertRow("budget_categories", row),
  update: (id, patch) => updateRow("budget_categories", id, patch),
  remove: (id) => deleteRow("budget_categories", id),
};

export const Risks = {
  list: () => listAll("risks", { order: { column: "sort_order" } }),
  create: (row) => insertRow("risks", row),
  update: (id, patch) => updateRow("risks", id, patch),
  remove: (id) => deleteRow("risks", id),
};

export const Handover = {
  list: () => listAll("handover_checklist", { order: { column: "sort_order" } }),
  update: (id, patch) => updateRow("handover_checklist", id, patch),
  create: (row) => insertRow("handover_checklist", row),
  remove: (id) => deleteRow("handover_checklist", id),
};

export const TaskMaterials = {
  listAll: async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("task_materials").select("task_id, materials(*)");
    if (error) throw error;
    return data;
  },
};

export const TaskTools = {
  listAll: async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("task_tools").select("task_id, tool_id, tasks(title)");
    if (error) throw error;
    return data;
  },
};
