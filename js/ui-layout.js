/* Layout preferences stay local to the device and never touch audit records. */
"use strict";
(() => {
  const app = document.getElementById("app");
  const sidebar = document.getElementById("sidebar");
  const body = document.getElementById("sidebar-body");
  const toggle = document.getElementById("sidebar-toggle");
  if (!app || !sidebar || !body || !toggle) return;
  const KEY = "rabbitmole:ui:sidebar-collapsed:v1";
  let collapsed = false;
  try { collapsed = localStorage.getItem(KEY) === "true"; } catch (_ignored) {}
  const narrow = matchMedia("(max-width: 1000px)");
  const text = toggle.querySelector(".sidebar-toggle-label");
  function update() {
    app.dataset.sidebarCollapsed = String(collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    const description = collapsed ? "Expandir menú lateral" : "Contraer menú lateral";
    toggle.setAttribute("aria-label", description);
    toggle.title = description;
    if (text) text.textContent = collapsed ? "Mostrar menú" : "Contraer menú";
    // Icon rail remains navigable on desktop; mobile/tablet menu is entirely folded.
    body.inert = collapsed && narrow.matches;
    body.setAttribute("aria-hidden", String(collapsed && narrow.matches));
  }
  toggle.addEventListener("click", () => {
    if (!collapsed && sidebar.contains(document.activeElement) && document.activeElement !== toggle)
      toggle.focus({preventScroll:true});
    collapsed = !collapsed;
    update();
    try { localStorage.setItem(KEY, String(collapsed)); } catch (_ignored) {}
  });
  if (narrow.addEventListener) narrow.addEventListener("change", update);
  else if (narrow.addListener) narrow.addListener(update);
  update();
})();
