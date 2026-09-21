// Verbouwplan Leliestraat 27 — CRUD-helpers per tabel.
// Eén bron per soort data; elke pagina haalt hier dezelfde records vandaan.
import { getSupabase } from "./supabase-client.js";

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

export const Workdays = {
  list: () => listAll("workdays", { order: { column: "sort_order" } }),
  create: (row) => insertRow("workdays", row),
  update: (id, patch) => updateRow("workdays", id, patch),
  remove: async (id) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("tasks").update({ workday_id: null }).eq("workday_id", id);
    if (error) throw error;
    await deleteRow("workdays", id);
  },
  dependencies: () => listAll("workday_dependencies"),
};

export const Tasks = {
  list: () => listAll("tasks", {
    select: "*, rooms(id,name,slug), workdays(id,number,name), people(id,name)",
    order: { column: "sort_order" },
  }),
  create: (row) => insertRow("tasks", row),
  update: (id, patch) => updateRow("tasks", id, patch),
  remove: (id) => deleteRow("tasks", id),
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
  list: () => listAll("tools", { order: { column: "sort_order" } }),
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

export const Actions = {
  list: () => listAll("actions", {
    select: "*, people(id,name), workdays(id,number)",
    order: { column: "sort_order" },
  }),
  create: (row) => insertRow("actions", row),
  update: (id, patch) => updateRow("actions", id, patch),
  remove: (id) => deleteRow("actions", id),
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
    const { data, error } = await supabase.from("task_tools").select("tool_id, tasks(title)");
    if (error) throw error;
    return data;
  },
};

export const Budget = {
  list: () => listAll("budget_items", { order: { column: "sort_order" } }),
  create: (row) => insertRow("budget_items", row),
  update: (id, patch) => updateRow("budget_items", id, patch),
  remove: (id) => deleteRow("budget_items", id),
};
