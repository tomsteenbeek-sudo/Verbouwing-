// Lazy-geladen drag-and-drop (muis + touch) via SortableJS vanaf een CDN.
// Zelfde patroon als supabase-client.js: een falende CDN mag nooit de pagina
// blokkeren — als het niet lukt te laden, werkt de rest van de pagina gewoon
// door, alleen zonder sleepfunctionaliteit.
let sortablePromise = null;
function getSortable() {
  if (!sortablePromise) {
    sortablePromise = import("https://cdn.jsdelivr.net/npm/sortablejs@1/modular/sortable.esm.js")
      .then((mod) => mod.default || mod.Sortable || mod)
      .catch((err) => { console.error("Kon sleepfunctionaliteit niet laden", err); return null; });
  }
  return sortablePromise;
}

// Maakt `container` sorteerbaar via de `.drag-handle`-elementen; roept
// onReorder(idsInNieuweVolgorde) aan na elke sleepactie.
export async function makeSortable(container, { handle = ".drag-handle", onReorder } = {}) {
  const Sortable = await getSortable();
  if (!Sortable) return null;
  return Sortable.create(container, {
    handle,
    animation: 150,
    onEnd: () => {
      const ids = Array.from(container.children).map((el) => el.dataset.id).filter(Boolean);
      onReorder(ids);
    },
  });
}
