/* Optional HTTPS LAN Discovery integration. No audit state, token or capture is persisted. */
"use strict";
(() => {
  let bridge = "", token = "", capture = null, busy = false;
  const id = value => document.getElementById(value);
  const privateEndpoint = raw => {
    const parsed = new URL(String(raw || "").trim());
    if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
        parsed.pathname !== "/" || parsed.search || parsed.hash)
      throw Error("Introduce solo la URL HTTPS del equipo auditor.");
    const octets = parsed.hostname.split(".");
    if (octets.length !== 4 || octets.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255))
      throw Error("Utiliza la dirección IPv4 privada del equipo auditor.");
    const [a, b] = octets.map(Number);
    if (!(a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)))
      throw Error("El servicio debe encontrarse en una red privada RFC1918.");
    return parsed.origin;
  };
  const request = async (path, body) => {
    const response = await fetch(bridge + path, {
      method: body ? "POST" : "GET", mode: "cors", cache: "no-store",
      headers: { "X-RabbitMole-Token": token, ...(body ? {"Content-Type":"application/json"} : {}) },
      ...(body ? {body: JSON.stringify(body)} : {}),
      signal: AbortSignal.timeout(190000)
    });
    const payload = await response.json();
    if (!response.ok) throw Error(payload.error || "El servicio Discovery rechazó la operación.");
    return payload;
  };
  const setStatus = text => { const element=id("bridge-status"); if(element) element.textContent=text; };
  function renderResults() {
    const buttons = id("bridge-results");
    if (!buttons) return;
    buttons.hidden = !capture;
  }
  async function connect() {
    if (busy) return;
    try {
      if (globalThis.RabbitMoleDeployment?.profile !== "private-full")
        throw Error("Instala y abre la PWA para utilizar Discovery en la red local.");
      bridge = privateEndpoint(id("bridge-url")?.value);
      token = String(id("bridge-token")?.value || "").trim();
      if (!token || token.length > 160) throw Error("Introduce el token temporal de la consola.");
      id("bridge-token").value = "";
      busy = true;
      setStatus("Comprobando el servicio autorizado…");
      const data = await request("/status");
      if (data.api !== "rabbitmole-discovery-bridge-v1" || data.available !== true)
        throw Error("La respuesta no pertenece a un bridge Discovery compatible.");
      const choice = id("bridge-cidr");
      const choices = id("bridge-suggestions");
      choices.replaceChildren();
      for (const item of data.interfaces || []) {
        const option = document.createElement("option");
        option.value = item.cidr;
        option.textContent = item.interface + " · " + item.cidr;
        choices.append(option);
      }
      id("bridge-scan").disabled = !data.backend;
      setStatus("Servicio listo. Selecciona o escribe una red privada autorizada (máximo 256 direcciones).");
    } catch (error) {
      bridge = ""; token = "";
      setStatus("Conexión no disponible: " + error.message);
    } finally { busy = false; }
  }
  async function scan() {
    if (busy || !bridge || !token) return;
    const cidr = String(id("bridge-cidr")?.value || "").trim();
    if (!cidr || id("bridge-confirmation")?.value.trim() !== "AUTORIZO") {
      setStatus("Indica el CIDR aprobado y escribe AUTORIZO antes de iniciar.");
      return;
    }
    if (!confirm("¿Dispones de autorización expresa para reconocer " + cidr + " desde el equipo auditor?")) return;
    busy = true;
    id("bridge-scan").disabled = true;
    setStatus("Reconocimiento en curso. No cierres esta ventana.");
    try {
      const result = await request("/scan", {cidr, confirmation:"AUTORIZO"});
      if (result.capture?.kind !== "rabbitmole-discovery-v1") throw Error("Captura no compatible.");
      capture = result.capture;
      renderResults();
      setStatus("Finalizado: " + result.hosts + " equipos observados en " + result.scope +
        ". Selecciona Hardware o Redes para revisar los nuevos registros; no se incorporan automáticamente.");
    } catch(error) {
      setStatus("No se pudo completar Discovery: " + error.message);
    } finally {
      busy = false;
      if (id("bridge-scan")) id("bridge-scan").disabled = false;
    }
  }
  async function review(block) {
    if (!capture) return;
    const file = new File([JSON.stringify(capture)], "rabbitmole-discovery.json", {type:"application/json"});
    if (file.size > 2 * 1024 * 1024) return setStatus("Captura demasiado grande para importar.");
    const mode = document.querySelector('[data-intake-mode="file"]');
    if (!mode) return setStatus("Abre Captura asistida para incorporar resultados.");
    mode.click();
    const selector = id("intake-block");
    const input = id("intake-file");
    if (!selector || !input) return setStatus("El importador no está disponible.");
    selector.value = block;
    selector.dispatchEvent(new Event("change", {bubbles:true}));
    // Changing the block re-renders the intake form. Read the fresh input, not a detached node.
    const current = id("intake-file");
    if (!current) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    current.files = transfer.files;
    current.dispatchEvent(new Event("change", {bubbles:true}));
  }
  function mount() {
    const container = document.querySelector(".local-discovery");
    if (!container || container.querySelector("#bridge-panel")) return;
    const section = document.createElement("section");
    section.id = "bridge-panel";
    section.className = "bridge-panel";
    section.setAttribute("aria-label","Servicio Discovery HTTPS");
    section.innerHTML = `<h3>Discovery desde la tablet · Servicio HTTPS LAN</h3>
      <p class="subtle">Un equipo auditor de la red ejecuta el servicio autorizado. La tablet solo solicita y revisa los resultados. Se necesita certificado HTTPS confiable.</p>
      <div class="fields">
        <div class="field"><label for="bridge-url">Dirección HTTPS de la estación auditora</label>
          <input id="bridge-url" type="url" inputmode="url" autocomplete="off" placeholder="https://192.168.10.20:8766"></div>
        <div class="field"><label for="bridge-token">Token temporal de emparejamiento</label>
          <input id="bridge-token" type="password" autocomplete="off" placeholder="Copia el token de la consola"></div>
      </div>
      <button type="button" id="bridge-connect" class="button quiet">Conectar equipo auditor</button>
      <div class="fields"><div class="field"><label for="bridge-cidr">CIDR privado autorizado</label>
        <input id="bridge-cidr" list="bridge-suggestions" inputmode="text" placeholder="192.168.10.0/24">
        <datalist id="bridge-suggestions"></datalist></div>
        <div class="field"><label for="bridge-confirmation">Confirmación: escribe AUTORIZO</label>
          <input id="bridge-confirmation" autocomplete="off" placeholder="AUTORIZO"></div>
      </div>
      <button type="button" id="bridge-scan" class="button accent" disabled>Ejecutar reconocimiento autorizado</button>
      <p id="bridge-status" role="status" aria-live="polite" class="subtle">Sin conectar. Ningún reconocimiento se inicia automáticamente.</p>
      <div id="bridge-results" class="action-row" hidden>
        <button class="button quiet" type="button" id="bridge-assets">Revisar Hardware</button>
        <button class="button quiet" type="button" id="bridge-networks">Revisar Redes</button>
      </div>`;
    container.append(section);
    id("bridge-connect").addEventListener("click", () => void connect());
    id("bridge-scan").addEventListener("click", () => void scan());
    id("bridge-assets").addEventListener("click", () => void review("assets"));
    id("bridge-networks").addEventListener("click", () => void review("networks"));
    renderResults();
  }
  // Existing SPA owns navigation and inventory writes; only mount a UI adapter.
  new MutationObserver(mount).observe(document.getElementById("workspace"), {childList:true,subtree:false});
  mount();
  globalThis.RabbitMoleDiscoveryBridge = Object.freeze({privateEndpoint});
})();
