/* Navigation for audit records: search, jump, and keyboard focus.
 * All state and DOM dependencies are injected; no storage or route mutations.
 */
"use strict";
(()=>{
  function create({groups,html,str,byId,getCurrentId,getPage,getState,getWorkspace,getWindow}){
  const recordQueries = new Map();
  const COLLAPSE_KEY = "rabbitmole:ui:record-filters-collapsed:v1";
  let collapsed = false;
  try { collapsed = localStorage.getItem(COLLAPSE_KEY) === "true"; } catch (_ignored) {}
  function syncCollapse() {
    const nav = byId("record-navigator"), toggle = byId("record-nav-toggle"), panel = byId("record-nav-body");
    if (!nav || !toggle || !panel) return;
    nav.dataset.collapsed = String(collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Mostrar filtros" : "Ocultar filtros");
    toggle.title = collapsed ? "Mostrar filtros" : "Ocultar filtros";
    const text = toggle.querySelector("span");
    if (text) text.textContent = collapsed ? "Mostrar filtros" : "Ocultar filtros";
    panel.inert = collapsed;
    panel.setAttribute("aria-hidden", String(collapsed));
  }
  function toggleCollapse() {
    collapsed = !collapsed;
    syncCollapse();
    try { localStorage.setItem(COLLAPSE_KEY, String(collapsed)); } catch (_ignored) {}
  }
  const recordQueryKey = () => String(getCurrentId()) + "/" + getPage();
  const searchText = (value) =>
    str(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  function recordMatches(record, block, query) {
    const text = searchText(
      groups[block].fields.map(([name]) => record[name] || "").join(" "),
    );
    return searchText(query)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .every((term) => text.includes(term));
  }
  function recordLabel(record, index) {
    return [record.id, record.title || record.name || "Registro " + (index + 1)]
      .filter(Boolean)
      .join(" · ");
  }
  function renderRecordNavigator(block) {
    return `<div class="record-navigator" id="record-navigator" aria-label="Buscar y navegar por registros">
      <div class="record-nav-header"><div class="record-nav-heading"><strong>Filtrar registros</strong><span>Buscar y acceder al inventario</span></div>
      <button type="button" id="record-nav-toggle" class="button quiet small record-nav-toggle"
        aria-controls="record-nav-body" aria-expanded="true" aria-label="Ocultar filtros">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg><span>Ocultar filtros</span>
      </button></div>
      <div class="record-nav-body" id="record-nav-body"><div class="record-nav-inner">
      <div><label for="record-search">Buscar en ${html(groups[block].title.toLocaleLowerCase("es"))}</label><input id="record-search" type="search" autocomplete="off" placeholder="Código, nombre, estado o texto…" value="${html(recordQueries.get(recordQueryKey()) || "")}" aria-describedby="record-search-count"></div>
      <div><label for="record-jump">Acceso rápido a un registro</label><select id="record-jump"><option value="">Selecciona un registro…</option></select></div>
      <button type="button" class="button quiet small" id="record-search-clear">Mostrar todos</button>
      <button type="button" class="button accent small" data-add="${block}">+ Añadir registro</button>
      <p id="record-search-count" role="status" aria-live="polite"></p>
      </div></div>
    </div><p id="record-search-empty" class="empty" hidden>No hay registros que coincidan. Prueba otro término o pulsa «Mostrar todos».</p>`;
  }
  function refreshRecordNavigator(filter = true) {
    const search = byId("record-search"),
      jump = byId("record-jump");
    if (!search || !jump || !groups[getPage()]) return;
    const query = search.value;
    recordQueries.set(recordQueryKey(), query);
    const matches = getState()[getPage()]
      .map((record, index) => ({ record, index }))
      .filter(({ record }) => recordMatches(record, getPage(), query));
    const keys = new Set(matches.map(({ record }) => record._key));
    const selected = jump.value;
    jump.innerHTML =
      '<option value="">Selecciona un registro…</option>' +
      matches
        .map(
          ({ record, index }) =>
            `<option value="${html(record._key)}">${html(recordLabel(record, index))}</option>`,
        )
        .join("");
    if (keys.has(selected)) jump.value = selected;
    syncCollapse();
    if (filter) {
      for (const entry of getWorkspace().querySelectorAll(".entry[data-entry-key]"))
        entry.hidden = !keys.has(entry.dataset.entryKey);
      byId("record-search-empty").hidden =
        matches.length > 0 || getState()[getPage()].length === 0;
      byId("record-search-count").textContent =
        matches.length +
        " de " +
        getState()[getPage()].length +
        " registros. La búsqueda no modifica los informes ni las exportaciones.";
    }
  }
  function clearRecordSearch() {
    const search = byId("record-search");
    if (search) {
      search.value = "";
      refreshRecordNavigator();
    }
  }
  function focusAddedRecord(key, {clearSearch = true} = {}) {
    if (clearSearch) clearRecordSearch();
    const entry = [...getWorkspace().querySelectorAll("[data-entry-key]")].find(
      (item) => item.dataset.entryKey === key,
    );
    if (!entry) return;
    const editable = [
      ...entry.querySelectorAll(
        "input[data-field], select[data-field], textarea[data-field]",
      ),
    ].find(
      (field) =>
        !field.disabled &&
        !field.readOnly &&
        !field.hidden &&
        !field.dataset.custom,
    );
    // Focus first for screen-reader feedback, then scroll the entry just below the viewport edge.
    (editable || entry).focus({ preventScroll: true });
    entry.scrollIntoView({
      block: "start",
      // On mobile, WebKit may open the keyboard during focus. Do not combine
      // that viewport resize with smooth scrolling of a newly added record.
      behavior: getWindow().matchMedia("(max-width: 1000px)").matches ||
        getWindow().matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto" : "smooth",
    });
  }

    return Object.freeze({
      render:renderRecordNavigator,
      toggleCollapse,
      refresh:refreshRecordNavigator,
      clear:clearRecordSearch,
      focus:focusAddedRecord
    });
  }
  globalThis.RabbitMoleRecordNavigator=Object.freeze({create});
})();
