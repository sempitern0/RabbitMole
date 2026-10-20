/* Optional LAN Discovery bridge. Never persists tokens or probe results. */
"use strict";
(() => {
 let endpoint="",token="",capture=null,busy=false,connected=false,backend="";
 let message="Servicio sin comprobar; el Worker no ejecuta Discovery.",severity="idle";
 const el=id=>document.getElementById(id);
 function privateEndpoint(raw){
   const parsed=new URL(String(raw||"").trim());
   const loopback=["http:","https:"].includes(parsed.protocol)&&parsed.hostname==="127.0.0.1";
   if((parsed.protocol!=="https:"&&!loopback)||parsed.username||parsed.password||
      parsed.pathname!=="/"||parsed.search||parsed.hash)
     throw Error("Utiliza HTTPS en la LAN o HTTP exclusivamente en 127.0.0.1 en este mismo PC.");
   const parts=parsed.hostname.split(".");
   if(parts.length!==4||parts.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))
     throw Error("Introduce la IPv4 privada de la estación, por ejemplo https://192.168.1.20:8766.");
   const [a,b]=parts.map(Number);
   if(!(loopback||(a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168))))
     throw Error("El servicio debe estar en una IPv4 privada o en 127.0.0.1 local.");
   if(parsed.protocol==="https:"&&parsed.hostname==="127.0.0.1") {
     // HTTPS loopback remains allowed, e.g. for locally trusted certificates.
   }
   return parsed.origin;
 }
 function diagnostic(error){
   const text=String(error?.message||error||"Error desconocido");
   if(error?.name==="TimeoutError"||error?.name==="AbortError")
     return "Tiempo agotado. Comprueba la Wi-Fi, el firewall y que el servicio siga abierto.";
   if(/failed to fetch|networkerror|load failed/i.test(text)||error instanceof TypeError)
     return "No se pudo contactar con el equipo auditor. Revisa IP, puerto, certificado HTTPS confiable en el móvil, permisos del navegador para redes privadas, firewall y aislamiento entre clientes Wi-Fi.";
   if(/token.*incorrecto|token.*ausente/i.test(text))
     return "Token incorrecto: usa la clave temporal impresa en el PC al iniciar Discovery. No es el token de Cloudflare.";
   if(/origen o dirección no autorizados/i.test(text))
     return "El origen de la PWA no está autorizado: arranca el servicio con --origin igual a la URL HTTPS exacta de esta PWA.";
   return text;
 }
 function setStatus(text,level="info"){message=text;severity=level;const node=el("bridge-status");
   if(node){node.textContent=text;node.dataset.state=level;}}
 function refresh(){
   const state=el("bridge-connection-state");
   const connect=el("bridge-connect");if(connect)connect.disabled=busy;
   if(state)state.textContent=busy?"Comprobando…":connected
     ?"Conectado · "+(backend||"No hay Nmap/ping"):"Estación sin comprobar";
   const scan=el("bridge-scan");if(scan)scan.disabled=busy||!connected||!backend;
   const pair=el("bridge-pair-local");if(pair)pair.disabled=busy;
   const results=el("bridge-results");if(results)results.hidden=!capture;
   const totals=el("bridge-capture-summary");
   if(totals)totals.textContent=capture
     ?"Captura recibida: "+(capture.items?.assets?.length||0)+" posibles equipos y "+
       (capture.items?.networks?.length||0)+" segmentos. Todavía no se ha incorporado nada al expediente.":"";
   const notice=el("bridge-status");
   if(notice){notice.textContent=message;notice.dataset.state=severity;}
 }
 async function request(path,body){
   const response=await fetch(endpoint+path,{
     method:body?"POST":"GET",mode:"cors",cache:"no-store",
     headers:{"X-RabbitMole-Token":token,...(body?{"Content-Type":"application/json"}:{})},
     ...(body?{body:JSON.stringify(body)}:{}),
     signal:AbortSignal.timeout(body?190000:12000)
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||"El servicio Discovery rechazó la operación.");
   return data;
 }
 async function pairLocal(){
   if(busy)return;
   const base="http://127.0.0.1:8766";
   try{
     if(globalThis.RabbitMoleDeployment?.profile!=="private-full")
       throw Error("Abre la PWA instalada para conectar el Companion.");
     endpoint=privateEndpoint(base);if(el("bridge-url"))el("bridge-url").value=endpoint;token="";connected=false;backend="";capture=null;busy=true;
     setStatus("Solicitando aprobación al Companion…");refresh();
     const response=await fetch(base+"/pair/request",{method:"POST",mode:"cors",cache:"no-store",signal:AbortSignal.timeout(12000)});
     const initial=await response.json();
     if(!response.ok)throw Error(initial.error||"Error solicitando conexión.");
     if(!/^[A-Za-z0-9_-]{24,128}$/.test(initial.requestId||""))throw Error("Solicitud inválida.");
     let granted="";
     for(let n=0;n<35;n++){
       await new Promise(resolve=>setTimeout(resolve,2000));
       const poll=await fetch(base+"/pair/status?id="+encodeURIComponent(initial.requestId),{mode:"cors",cache:"no-store",signal:AbortSignal.timeout(12000)});
       if(!poll.ok)throw Error("Error comprobando aprobación.");
       const answer=await poll.json();
       if(answer.state==="denied")throw Error("Conexión denegada en Companion.");
       if(answer.state==="expired")throw Error("La solicitud ha caducado.");
       if(answer.state==="approved"){granted=answer.token;break;}
     }
     if(typeof granted!=="string"||!granted||granted.length>160)throw Error("No se recibió aprobación.");
     token=granted;
     const status=await request("/status");
     if(status.api!=="rabbitmole-discovery-bridge-v1"||status.available!==true)throw Error("Servicio incompatible.");
     connected=true;backend=status.backend==="nmap"?"Nmap":status.backend==="native"?"ping":"";
     const list=el("bridge-suggestions"),field=el("bridge-cidr");list?.replaceChildren();
     for(const row of Array.isArray(status.interfaces)?status.interfaces:[]){
       if(typeof row.cidr!=="string")continue;
       const option=document.createElement("option");option.value=row.cidr;
       option.label=String(row.interface||"Red")+" · "+row.cidr;list?.append(option);
     }
     if(field&&!field.value&&status.interfaces?.[0]?.cidr)field.value=status.interfaces[0].cidr;
     setStatus("Equipo conectado. Confirma alcance y autorización antes del escaneo.","success");
   }catch(error){token="";connected=false;backend="";capture=null;setStatus("Emparejamiento: "+diagnostic(error),"error");}
   finally{busy=false;refresh();}
 }
 async function connect(){
   if(busy)return;
   try{
     if(globalThis.RabbitMoleDeployment?.profile!=="private-full")
       throw Error("Abre la PWA instalada desde su icono para utilizar Discovery.");
     endpoint=privateEndpoint(el("bridge-url")?.value);
     token=String(el("bridge-token")?.value||"").trim();
     if(!token||token.length>160)throw Error("Inicia Discovery en un PC y copia su token temporal; no es un token Cloudflare.");
     el("bridge-token").value="";
     busy=true;connected=false;backend="";capture=null;
     setStatus("Comprobando URL, token y herramientas de la estación…");refresh();
     const status=await request("/status");
     if(status.api!=="rabbitmole-discovery-bridge-v1"||status.available!==true)
       throw Error("El servicio remoto no es un bridge Discovery compatible.");
     connected=true;backend=status.backend==="nmap"?"Nmap":status.backend==="native"?"ping":"";
     const list=el("bridge-suggestions"),field=el("bridge-cidr");list?.replaceChildren();
     for(const row of Array.isArray(status.interfaces)?status.interfaces:[]){
       if(typeof row.cidr!=="string")continue;
       const option=document.createElement("option");option.value=row.cidr;
       option.label=String(row.interface||"Red")+" · "+row.cidr;list?.append(option);
     }
     if(field&&!field.value&&status.interfaces?.[0]?.cidr)field.value=status.interfaces[0].cidr;
     setStatus(backend?"Estación lista con "+backend+". Confirma la autorización del CIDR antes de reconocer.":
       "Estación conectada sin Nmap ni ping: instala una herramienta en el equipo auditor y reinicia el servicio.",
       backend?"success":"warning");
   }catch(error){
     endpoint="";token="";connected=false;backend="";capture=null;
     setStatus("Conexión no disponible: "+diagnostic(error),"error");
   }finally{busy=false;refresh();}
 }
 async function scan(){
   if(busy||!connected||!backend)return;
   try{
     if(privateEndpoint(el("bridge-url")?.value)!==endpoint)
       return setStatus("La dirección ha cambiado. Comprueba la conexión antes de escanear.","warning");
   }catch(error){return setStatus(diagnostic(error),"warning");}
   const cidr=String(el("bridge-cidr")?.value||"").trim();
   if(!cidr||String(el("bridge-confirmation")?.value||"").trim()!=="AUTORIZO")
     return setStatus("Indica un CIDR privado aprobado (hasta 256 IP) y escribe AUTORIZO.","warning");
   if(!confirm("¿Tienes autorización expresa para descubrir hosts en "+cidr+
     " desde la estación auditora? No se exploran puertos."))return;
   busy=true;capture=null;setStatus("Discovery se está ejecutando en el equipo auditor. Espera a que termine.");refresh();
   try{
     const response=await request("/scan",{cidr,confirmation:"AUTORIZO"});
     if(response.capture?.kind!=="rabbitmole-discovery-v1")throw Error("Captura incompatible.");
     capture=response.capture;
     setStatus("Finalizado: "+response.hosts+" hosts respondieron en "+response.scope+
       ". Revisa Hardware y Redes con la misma captura o descarga JSON. No se han importado activos automáticamente.",
       response.hosts?"success":"warning");
   }catch(error){setStatus("Discovery no completado: "+diagnostic(error),"error");}
   finally{busy=false;refresh();}
 }
 function downloadCapture(){
   if(!capture)return;
   const url=URL.createObjectURL(new Blob([JSON.stringify(capture,null,2)],{type:"application/json"}));
   const link=document.createElement("a");link.href=url;link.download="rabbitmole-discovery.json";
   document.body.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),30000);
   setStatus("Descarga iniciada. Comprueba el JSON en Archivos antes de utilizarlo.","info");
 }
 async function review(block){
   if(!capture)return;
   if(!capture.items?.[block]?.length)
     return setStatus("No hay candidatos de "+(block==="assets"?"Hardware":"Redes")+" en esta captura.","warning");
   const file=new File([JSON.stringify(capture)],"rabbitmole-discovery.json",{type:"application/json"});
   if(file.size>2*1024*1024)return setStatus("Captura demasiado grande: divide el alcance y utiliza JSON menores.","warning");
   const mode=document.querySelector('[data-intake-mode="file"]');
   if(!mode)return setStatus("Abre Captura asistida para incorporar los datos.","warning");
   mode.click();
   const selector=el("intake-block");
   if(!selector)return setStatus("No se ha encontrado el importador.","error");
   selector.value=block;selector.dispatchEvent(new Event("change",{bubbles:true}));
   const input=el("intake-file");
   if(!input)return;
   try{
     if(typeof DataTransfer==="undefined")throw Error("No disponible");
     const transfer=new DataTransfer();transfer.items.add(file);
     input.files=transfer.files;input.dispatchEvent(new Event("change",{bubbles:true}));
   }catch(error){setStatus("Importación automática no compatible con este navegador: descarga JSON y utiliza «Subir archivo». "+diagnostic(error),"warning");}
 }
 async function copyCommand(idCode){
   try{
     if(!navigator.clipboard?.writeText)throw Error("Sin portapapeles");
     await navigator.clipboard.writeText(el(idCode)?.textContent||"");
     setStatus("Comando copiado. Ejecútalo manualmente en la consola correspondiente.");
   }catch{setStatus("Selecciona y copia manualmente el comando visible.","warning");}
 }
 function mount(){
   const parent=document.querySelector(".local-discovery");
   if(!parent||parent.querySelector("#bridge-panel"))return;
   const panel=document.createElement("section");panel.id="bridge-panel";
   panel.className="bridge-panel";panel.setAttribute("aria-label","Discovery LAN guiado");
   panel.innerHTML=`<h3>Discovery guiado · PWA y equipo auditor</h3>
     <p class="subtle"><strong>Cloudflare aloja la PWA, pero no ejecuta Discovery.</strong> Descarga el Companion en Windows: abre una ventana local, inicia el puente y permite aprobar la conexión sin escribir comandos. También puedes generar JSON en Android con Termux.</p>
     <details class="bridge-setup" open><summary><strong>1. Preparar el equipo auditor</strong></summary>
       <p><a class="button quiet" href="./discovery-windows.zip" download="RabbitMole-Companion-Windows.zip">Companion Windows (cuando esté incluido en esta versión)</a></p><p><a class="button quiet" href="./discovery-android-termux.zip" download="rabbitmole-termux.zip">Android · Kit Termux offline</a></p><p><a class="button quiet" href="./discovery-ios-guide.txt" download="rabbitmole-ios-instrucciones.txt">iOS / iPadOS · Guía de conexión offline</a></p><p><a class="button quiet" href="./discovery-kit.zip" download="rabbitmole-discovery-kit.zip">Kit de respaldo (.zip, requiere Python)</a></p><p class="subtle">El ejecutable se incorpora cuando exista una compilación Windows validada. Los kits se pueden conservar en la caché offline si hay espacio.</p><p>Descomprime el paquete Windows y abre <code>RabbitMole-Companion.exe</code>. Si utilizas el kit de respaldo con Python, abre <code>discovery/iniciar.cmd</code>. En el Companion pulsa «Activar Discovery», después «Conectar este PC» en esta PWA y aprueba la solicitud en el Companion. El kit incluye setup.ps1 y setup.sh para preparar dependencias. No inicia escaneos por sí solo.</p><p><strong>Mismo PC Windows:</strong> puedes usar un puente HTTP limitado a <code>127.0.0.1</code>, sin certificado. La PWA y el proceso Discovery deben estar abiertos en ese <strong>mismo ordenador</strong>. La conexión puede requerir permiso de acceso local del navegador.</p>
       <div class="bridge-stage"><h4>Conectar este PC</h4>
         <p>Abre RabbitMole Companion, pulsa «Activar Discovery» y después «Conectar este PC» aquí. Aprueba la solicitud en el Companion: no tendrás que copiar un token.</p>
         <button type="button" id="bridge-pair-local" class="button accent">Conectar este PC</button>
         <p class="subtle">Solo en el mismo PC. Desde una tablet utiliza HTTPS LAN o una captura JSON.</p>
       </div>
       <div class="intake-command"><div class="intake-command-head"><strong>Windows · PowerShell / CMD</strong><button type="button" class="button quiet small" id="bridge-copy-pc">Copiar comando</button></div>
         <pre><code id="bridge-command-pc"></code></pre></div>
       <button type="button" id="bridge-use-local" class="button quiet">Usar servidor de este PC (127.0.0.1)</button>
       <details><summary>Opción B · PWA en tablet y servicio en otro equipo de la LAN (HTTPS)</summary>
         <p>Solo para dispositivos distintos: requiere un certificado TLS confiable en la tablet con SAN de la IP del PC y reglas restrictivas de firewall.</p>
         <div class="intake-command"><div class="intake-command-head"><strong>Linux / macOS · Terminal · HTTPS LAN</strong><button type="button" class="button quiet small" id="bridge-copy-lan">Copiar comando</button></div>
           <pre><code id="bridge-command-lan"></code></pre></div>
       </details>
       <p class="subtle">Deja abierta la consola: verás la URL y un token nuevo en cada arranque. Restringe el firewall y detén el proceso con Ctrl+C. El Companion se cierra y detiene el puente desde su ventana. La PWA no puede ejecutarlo automáticamente.</p>
       <details><summary>Android / Termux · opción sin servidor intermedio</summary>
         <p>La PWA no puede abrir la consola de Termux ni tiene un directorio de scripts local. Ejecuta Discovery desde Termux y después importa el JSON con «Subir archivo».</p>
         <div class="intake-command"><div class="intake-command-head"><strong>Android · Termux</strong><button type="button" class="button quiet small" id="bridge-copy-android">Copiar comandos</button></div><pre><code id="bridge-command-android">pkg update
pkg install python nmap unzip
termux-setup-storage
unzip ~/storage/downloads/rabbitmole-termux.zip -d ~/rabbitmole-discovery
cd ~/rabbitmole-discovery
python discover.py doctor
python discover.py wizard</code></pre></div>
         <p class="subtle">Guarda el JSON en una carpeta accesible desde Archivos. Android puede limitar Nmap o el ping.</p>
       </details>
       <p class="subtle">En iOS/iPadOS, puedes guardar el kit y las instrucciones para uso offline, pero no ejecutar Termux: utiliza una estación HTTPS confiable o importa JSON. Una web no puede iniciar una shell arbitraria en su supuesto directorio de instalación.</p>
     </details>
     <div class="bridge-stage"><h4>2. Comprobar la estación</h4>
       <p class="subtle">El <strong>token de consola</strong> es una clave temporal que imprime el servicio Python. No es un token Cloudflare y no se guarda en el expediente.</p>
       <div class="fields"><div class="field"><label for="bridge-url">Servidor (HTTP en 127.0.0.1 o HTTPS en LAN)</label><input id="bridge-url" type="url" autocomplete="off" placeholder="http://127.0.0.1:8766"></div>
       <div class="field"><label for="bridge-token">Token temporal mostrado en la consola</label><input id="bridge-token" type="password" autocomplete="off" placeholder="Pega aquí el token del PC"></div></div>
       <button type="button" id="bridge-connect" class="button quiet">Comprobar conexión y herramientas</button>
       <p id="bridge-connection-state" class="subtle">Estación sin comprobar</p>
     </div>
     <div class="bridge-stage"><h4>3. Reconocimiento autorizado</h4>
       <div class="fields"><div class="field"><label for="bridge-cidr">CIDR privado aprobado (máximo 256 direcciones)</label><input id="bridge-cidr" list="bridge-suggestions" placeholder="192.168.10.0/24"><datalist id="bridge-suggestions"></datalist></div>
       <div class="field"><label for="bridge-confirmation">Confirmación expresa</label><input id="bridge-confirmation" placeholder="Escribe AUTORIZO" autocomplete="off"></div></div>
       <button type="button" id="bridge-scan" class="button accent" disabled>Iniciar Discovery autorizado</button>
       <p id="bridge-status" role="status" aria-live="polite" data-state="idle">Sin conectar. No se inicia nada automáticamente.</p>
     </div>
     <div class="bridge-stage"><h4>4. Revisar la captura</h4>
       <p class="subtle">Reutiliza una captura en Hardware y Redes, revisa candidatos nuevos, duplicados y conflictos antes de incorporarlos, y edita los campos manualmente. Discovery no acredita VLAN, fabricantes, licencias ni vulnerabilidades.</p>
       <p id="bridge-capture-summary" class="subtle" role="status"></p>
       <div id="bridge-results" class="action-row" hidden>
         <button class="button quiet" type="button" id="bridge-assets">Revisar Hardware</button>
         <button class="button quiet" type="button" id="bridge-networks">Revisar Redes</button>
         <button class="button quiet" type="button" id="bridge-download">Descargar JSON</button>
       </div>
     </div>`;
   parent.append(panel);
   el("bridge-command-pc").textContent="py -3 discovery\\service.py --loopback-http --origin "+location.origin;
   el("bridge-command-lan").textContent="python3 discovery/service.py --bind <IP_PRIVADA_PC> --port 8766 --cert <CERTIFICADO.pem> --key <CLAVE.pem> --origin "+location.origin;
   el("bridge-url").value=endpoint||"http://127.0.0.1:8766";
   el("bridge-use-local").addEventListener("click",()=>{
     if(busy)return;
     endpoint="";token="";connected=false;backend="";capture=null;
     el("bridge-url").value="http://127.0.0.1:8766";
     el("bridge-token").value="";
     setStatus("Seleccionado este PC. Conecta el Companion antes de iniciar Discovery.");refresh();
   });
   el("bridge-copy-lan").addEventListener("click",()=>void copyCommand("bridge-command-lan"));
   el("bridge-copy-pc").addEventListener("click",()=>void copyCommand("bridge-command-pc"));
   el("bridge-copy-android").addEventListener("click",()=>void copyCommand("bridge-command-android"));
   el("bridge-pair-local").addEventListener("click",()=>void pairLocal());
   el("bridge-connect").addEventListener("click",()=>void connect());
   el("bridge-scan").addEventListener("click",()=>void scan());
   el("bridge-assets").addEventListener("click",()=>void review("assets"));
   el("bridge-networks").addEventListener("click",()=>void review("networks"));
   el("bridge-download").addEventListener("click",downloadCapture);
   refresh();
 }
 new MutationObserver(mount).observe(el("workspace"),{childList:true,subtree:false});
 mount();
 globalThis.RabbitMoleDiscoveryBridge=Object.freeze({privateEndpoint,diagnostic});
})();