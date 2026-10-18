/* Stateless audit field markup: persistence, field validation and navigation remain in app.js.
 * Markup deliberately retains existing IDs, data-* hooks, labels and glossary help actions.
 */
"use strict";
(()=>{
  function render(obj,block,def,index,{html,str,identifiers,assist,state,osCatalog,vendorModels,routerModels,networkDevices,glossary,glossaryHelpIcon}) {
    const [name, label, type, choices] = def;
    const attrs =
      `data-block="${html(block)}" data-field="${html(name)}"` +
      (index === undefined ? "" : ` data-index="${index}"`);
    const value = str(obj[name]),
      id =
        "f-" +
        block +
        "-" +
        (index === undefined ? "main" : index) +
        "-" +
        name;
    const key = /^(vlan|cvss|serial)$/.test(name) ? "decimal" : "text";
    let control;
    if (identifiers.isLockedField(block, name)) {
      control = `<input id="${id}" type="text" value="${html(value)}" readonly aria-readonly="true" class="identifier-readonly" title="Código generado por la aplicación; no editable" autocomplete="off"><small class="identifier-hint">Identificador asignado automáticamente · solo lectura</small>`;
    } else if (type === "textarea")
      control = `<textarea id="${id}" ${attrs} maxlength="20000">${html(value)}</textarea>`;
    else if(block==="assets"&&name==="os"&&/^(servidor\b|hypervisor\b|hipervisor\b)/i.test(String(obj.type||"").trim())){
      const groups=osCatalog?.SERVER_GROUPS||{};
      const options=Object.values(groups).flat();
      const custom=Boolean(value)&&!options.includes(value);
      control=`<select id="${id}" ${attrs} data-preset="true" aria-label="${html(label)}"><option value="">Seleccionar sistema operativo…</option>${Object.entries(groups).map(([group,systems])=>`<optgroup label="${html(group)}">${systems.map(system=>`<option value="${html(system)}"${system===value?" selected":""}>${html(system)}</option>`).join("")}</optgroup>`).join("")}<option value="__custom__"${custom?" selected":""}>Otro / escribir…</option></select><input ${attrs} data-custom="true" aria-label="Sistema operativo personalizado" placeholder="Escribe sistema y versión" value="${custom?html(value):""}" maxlength="20000" ${custom?"":"hidden"}>`;
    }
        else if (type === "select")
      control = `<select id="${id}" ${attrs}>${choices.map((x) => `<option value="${html(x)}"${x === value ? " selected" : ""}>${html(x)}</option>`).join("")}</select>`;
    else if (
      block === "networks" &&
      ["gateway", "dns", "firewall"].includes(name)
    ) {
      const known = assist.suggestions(state, block, name);
      const listId = "suggest-" + block + "-" + index + "-" + name;
      control = `<input id="${id}" type="text" ${attrs} list="${listId}" value="${html(value)}" maxlength="20000" autocomplete="off"><datalist id="${listId}">${known.map((x) => `<option value="${html(x)}"></option>`).join("")}</datalist>`;
    } else if (
      type === "picker" &&
      // Large OS/software catalogues stay searchable; finite field presets
      // use a native touch-friendly select with a reversible custom value.
      (name === "os" || (name === "name" && block === "software"))
    ) {
      const options =
        name === "os"
          ? osCatalog?.ALL || choices
          : assist.suggestions(state, block, name, choices);
      const listId =
        "suggest-" +
        block +
        "-" +
        (index === undefined ? "main" : index) +
        "-" +
        name;
      control = `<input id="${id}" ${attrs} list="${listId}" autocomplete="off" value="${html(value)}" maxlength="20000" placeholder="Escribe para buscar o introduce otro valor"><datalist id="${listId}">${options.map((x) => `<option value="${html(x)}"></option>`).join("")}</datalist>`;
    } else if (type === "picker") {
      // A native select is easier on touchscreens; unlisted values remain editable.
      const options =
        name === "asset"
          ? [
              ...new Set([
                "Todo el alcance",
                ...assist.assetChoices(state).map((a) => a.value),
              ]),
            ]
          : block === "assets" && name === "model"
            ? vendorModels[obj.vendor] || []
            : block === "networks" && name === "routerVendor"
              ? (networkDevices?.vendors(obj.networkDeviceType)||Object.keys(routerModels))
              : block === "networks" && name === "routerModel"
                ? (networkDevices?.models(obj.networkDeviceType,obj.routerVendor)||routerModels[obj.routerVendor]||[])
                : assist.suggestions(state, block, name, choices);
      const custom = Boolean(value) && !options.includes(value);
      control = `<select id="${id}" ${attrs} data-preset="true" aria-label="${html(label)}"><option value="">${(block === "assets" && name === "model" && !obj.vendor) || (block === "networks" && name === "routerModel" && !obj.routerVendor) ? "Selecciona primero un fabricante…" : "Seleccionar…"}</option>${options.map((x) => `<option value="${html(x)}"${x === value ? " selected" : ""}>${html(x)}</option>`).join("")}<option value="__custom__"${custom ? " selected" : ""}>Otro / escribir…</option></select><input ${attrs} data-custom="true" aria-label="${html(label)} personalizado" placeholder="Especifica el valor" value="${custom ? html(value) : ""}" maxlength="20000" ${custom ? "" : "hidden"}>`;
    } else
      control = `<input id="${id}" type="${type === "date" ? "date" : type === "time" ? "time" : "text"}" ${attrs} value="${html(value)}" maxlength="20000"${key === "decimal" ? ' inputmode="decimal"' : ""}>`;
    if (["controls", "findings"].includes(block) && name === "evidenceIds") {
      const available = assist.candidates(state, "evidence", value);
      if (available.length)
        control += `<div class="field-assist"><label for="assist-${id}">Vincular evidencia existente</label><select id="assist-${id}" data-assist-ref="evidence" data-assist-block="${html(block)}" data-assist-index="${index}" aria-label="Selecciona una evidencia del expediente"><option value="">Seleccionar evidencia…</option>${available.map((ref) => `<option value="${html(ref.id)}">${html(ref.id + " · " + (ref.title || "Sin título"))}</option>`).join("")}</select><small>No crea ni verifica evidencias; solo reutiliza identificadores existentes.</small></div>`;
    }
    const termId = glossary?.CONTEXT_HELP?.fields?.[block]?.[name];
    const term = termId ? glossary.byId(termId) : null;
    const help = term
      ? `<button type="button" class="glossary-help" data-glossary-term="${html(term.id)}" data-glossary-field="${html(id)}" aria-label="Consultar ${html(term.title)} y volver a este campo">${glossaryHelpIcon}</button>`
      : "";
    return `<div class="field${type === "textarea" ? " full" : ""}"><div class="field-heading"><label for="${id}">${html(label)}</label>${help}</div>${control}</div>`;
  }
  globalThis.RabbitMoleFieldRenderer=Object.freeze({render});
})();
