# RabbitMole · AGENTS.md

## Objetivo y límites
PWA **offline-first** para expedientes de auditoría de infraestructura y ciberseguridad. El expediente JSON v3 y las evidencias pertenecen al auditor. No es un escáner de vulnerabilidades, ni ejecuta los comandos de sus guías. Nunca introducir telemetría, CDNs, ejecución remota implícita ni almacenamiento de expedientes o tokens en CacheStorage.

## Lectura eficiente (abrir solo lo relacionado)
| Cambio | Código propietario | Pruebas y documentación |
| --- | --- | --- |
| Estado, navegación, eventos, informes | `js/app.js` | `tests/test_navigation.cjs`, `tests/test_report_data.cjs` |
| Definiciones, esquema y equipo | `js/app-definitions.js`, `js/app-model.js`, `js/app-team.js` | `tests/test_app_modules.cjs`, `tests/test_json_contract.cjs` |
| Glosario: términos y guías | `js/glossary-terms.js`, `js/glossary-guides.js`, `js/glossary.js` | `tests/test_glossary.cjs`, `tests/test_glossary_guide.cjs`, `tests/test_glossary_data.cjs` |
| UI, paleta, accesibilidad y PDF | `index.html`, `css/styles.css`, `css/glossary.css`, `css/print.css` | `tests/test_pwa_browser.cjs`, `tests/test_contrast.cjs` |
| Shell offline y actualizaciones | `sw.js`, `js/pwa-updates.js`, `js/offline-health.js` | `tests/test_pwa_protocol.cjs`, `tests/test_mobile_pwa.cjs` |
| Importación y almacenamiento local | `js/inventory-import.js`, `js/audit-storage.js` | `tests/test_json_contract.cjs`, pruebas de importación |
| Discovery local y desde tablet | `discovery/`, `js/discovery-bridge.js`, `serve.py` | `tests/test_discovery_service.py`, `tests/test_discovery_bridge.cjs`, `discovery/README_ES.md` |
| Instalación, Cloudflare y empaquetado | `rabbitmole.sh`, `rabbitmole.ps1`, `deploy/` | `deploy/validate.py`, `tests/test_build_bundle.py` |

## Invariantes
1. Preservar JSON v3, claves IndexedDB/localStorage, flujo guardado/importación y preferencias de paleta. No migrar datos implícitamente.
2. Mantener el perfil web público limitado, la PWA instalada completa y los modos local/Cloudflare; una instalación no implica autorización de acceso ni persistencia garantizada.
3. El service worker precarga un shell completo, mantiene fallback utilizable cuando existe y nunca mezcla recursos entre versiones ni borra expedientes. Nuevos recursos JS/CSS requieren alta en **cuatro** lugares: `index.html`, `sw.js`, `rabbitmole.sh`, `rabbitmole.ps1`.
4. Sin scripts inline, trackers, librerías remotas, CSP debilitada, ejecución de comandos desde la PWA ni salidas de secretos en consola.
5. `navigator.storage.persist()` se pide directamente desde interacción del usuario; navegador puede denegarla. Recomendar exportación JSON protegida.
6. Discovery solo con autorización expresa, límites de CIDR privado y HTTPS/origen exacto/token temporal cuando se usa el bridge LAN; no asumir VLAN, aislamiento ni vulnerabilidades.
7. Las guías son **referencias de solo lectura**, deben distinguir prueba observada de hipótesis y facilitar evidencia, interpretación y alcance autorizado.
8. Accesibilidad: semántica, teclado, foco, tamaño táctil, contraste de todas las paletas y modo impresión. Valor de paleta predeterminado interno `rabbitmole` (selector «Predeterminado»), basado en azul noche, acero y marfil del icono; no sobrescribir preferencias existentes.

## Datos del diccionario: contrato
- `js/glossary-terms.js`: registros posicionales compactos (una entrada por línea), cuyos campos están documentados en su cabecera; referencias `[etiqueta,URL]`.
- `js/glossary-guides.js`: `[termId,symptom,verify,interpret,[[platform,command,lookFor],...]]`.
- `js/glossary.js`: único adaptador que reconstruye la API estable `AuditGlossary`: `TERMS`, `GUIDES`, `PROTOCOLS`, `search`, `byId`, `CONTEXT_HELP`. **No duplicar los datos**, modificar el archivo dueño y conservar IDs.
- Mantener el orden de carga términos → guías → adaptador → `app.js`. Las guías macOS anexadas por el adaptador siguen siendo parte del contrato público. Ejecutar `node tests/test_glossary_data.cjs` tras editar datos.
- No minificar a mano código de interfaz ni mover lógica con estado a tablas. No eliminar ficheros de fuentes, iconos o informes por tamaño sin medir uso real y validar instalación/impresión.

## Procedimiento de cambios
1. Leer HEAD, PR/ramas, este contrato y el mínimo conjunto de archivos afectados. Verificar quién invoca cada función y qué pruebas protegen su contrato.
2. Preferir extracciones pequeñas con interfaces explícitas y sin efectos secundarios. Antes de compactar, medir tamaño y verificar igualdad de resultados con casos positivos y negativos.
3. Ejecutar `npm run check`, `npm run test:browser` y `npm run deploy:check` según disponibilidad; informar exactamente de lo no ejecutado. Para glosario: prueba de datos + búsqueda + empaquetado/offline.
4. Revisar rutas en instaladores, manifiesto, CSP, precache y distribución Cloudflare después de introducir archivos. Actualizar guías ES/EN.
5. PR sobre rama, sin fusión ni despliegue automático sin aprobación explícita.

## Guías de acceso rápido
`README_ES.md`/`README.md`: uso y arquitectura; `INSTALLATION_ES.md`: instalación; `discovery/README_ES.md`: escaneos autorizados y modo Android; `SECURITY_ES.md`: restricciones; `docs/FEATURE_REFERENCE_ES.md`: catálogo funcional; `deploy/validate.py`: puerta de validación.

**Al entregar:** propietarios, cambios, reducción medida, pruebas realmente efectuadas, limitaciones, commit y PR.

## Responsive and palette migration
- `js/palette-preferences.js` is the single owner of migration from auto-saved legacy `ocean` to `rabbitmole`; it never writes the default on first load. `selectPalette(value,true)` marks actual user choices with `rabbitmole:palette:explicit:v1`. **Do not erase localStorage or reset audit records to fix UI themes.**
- `css/styles.css` supplies general workstation layout; `css/workspace-ux.css` is the last screen stylesheet and owns responsive tablet/mobile overrides; `css/android-touch.css` adds Android+coarse-pointer spacing only. Avoid accumulating additional breakpoint collisions or hiding navigation. Test widths 390, 768, 1024 and 1280 px, including dark palettes, keyboard, overflow, PDF and landscape orientation.

## Controles de espacio de trabajo
El menú lateral se pliega desde `#sidebar-toggle` con `js/ui-layout.js` (preferencia `rabbitmole:ui:sidebar-collapsed:v1`), conservando una barra de iconos accesible en escritorio y plegando contenido en móvil/tablet. El navegador sticky de registros se pliega con `#record-nav-toggle` mediante `js/audit-record-navigation.js` (preferencia `rabbitmole:ui:record-filters-collapsed:v1`); `css/layout-collapse.css` es el último CSS de pantalla y rige animaciones/estados. Respetar `aria-expanded`, `inert`, foco, ausencia de scroll horizontal y `prefers-reduced-motion`; ambas preferencias son locales y no pertenecen al expediente JSON.

## Fase 1: estabilidad
El service worker local usa `rabbitmole-shell-v99-assistant-flow` y debe cambiar su nombre en cada release local que altere CORE o lógica SW; el builder Cloudflare ya genera el hash de versión. La marca `.rabbitmole-shell-ready` **no demuestra por sí sola** integridad: validar CORE completo (caché actual) y dependencias HTML (fallback heredado). Reparar únicamente una release idéntica, escribir la marca al final y no mezclar versiones. Probar cache eviction, fallback, inicio offline y shell incompleto. Antes de fusionar ejecutar CI y Playwright y documentar explícitamente las pruebas no ejecutadas.


## Conexiones online · propietario y contrato
- `js/secure-transfer.js`: WebDAV HTTPS, cifrado JSON, preflight `PROPFIND Depth: 0` sin escritura, subidas con `If-None-Match: *`, comparticiones OCS con contraseña/caducidad y revocación. Exigir `private-full`, CORS explícito y prohibir URL con credenciales o parámetros.
- `js/secure-transfer-ui.js`: respaldo/PDF y enlace temporal; `js/app.js`: perfil cifrado, selector de canal, estado efímero `connectionVerified` y opciones avanzadas. Una comprobación satisfactoria **no acredita escritura**. Resetear verificación al guardar, desbloquear u olvidar perfil.
- No efectuar conexiones automáticamente, no sobrescribir copias existentes, no convertir correo en envío automático ni asumir OAuth para proveedores no implementados. No persistir contraseñas de aplicación sin cifrar, frases, tokens ni enlaces temporales. Probar código 207, 401/403/404, CORS, privacidad de perfiles y autorización antes de entregar.

## Iconografía sensible a paleta
- `css/styles.css` define `--sidebar-active` por paleta; `css/workspace-ux.css` deriva `--sidebar-icon-muted` y `--sidebar-icon-active` para iconos SVG de `#global-navigation` y símbolos dinámicos `.nav-mark` del asistente. **No introducir verdes/turquesas hexadecimales en reglas de iconos**: deben cambiar con `data-palette` sin JavaScript extra.
- Mantener el contraste de iconos activos sobre `--navy` y no recolorear iconos semánticos de error, éxito o alertas. Revisar navegación expandida y contraída, escritorio/tablet y forced-colors. Ejecutar `node tests/test_palette_icons.cjs` y el recorrido Playwright de todas las paletas.

## Auditoría de campo desde móvil
- Guía de operación: `docs/AUDITORIA_MOVIL_ES.md`. La tarjeta `#pwa-install-card` de `index.html` contiene la lista accesible `#mobile-field-check` para la instalación real, guardado, fotografía, JSON y arranque offline. Las casillas no se guardan ni prueban autorización; no introducir terceros ni tráfico de red por usarlas.
- Estilos de lista móvil en `css/workspace-ux.css`, precargados por `sw.js`; subir versión de caché local si cambia el HTML/CSS. No desplegar versiones de rama ni llevar datos de centros escolares a una demo pública por defecto. Probar `tests/test_mobile_pwa.cjs`, empaquetado y cierre/reapertura en móvil real antes de visita.

## Menú de dispositivo e instalación
- `#pwa-install-card` es una vista separada (`device`) accesible desde el menú principal en modo completo o compacto. `js/app.js` controla `hidden`, visibilidad de `#workspace`, foco y navegación sin exigir expediente abierto; `js/pwa-install.js` únicamente actualiza el estado de instalación y gestiona el prompt, sin abrirla automáticamente.
- Conservar controles, checklist offline y semántica. Probar abrir, salir, iconos del lateral contraído, móvil Android, teclado y estado de la PWA en `tests/test_mobile_pwa.cjs` y Playwright.

## Contrato de espaciado de UI (glosario y asistente)
- `css/glossary.css`: `.glossary-section` **solo define `padding-block`**; jamás usar `padding: ... 0` ni `padding-inline-start:0` compartidos, ya que invalidan el inset de `.glossary-example`, `.glossary-evidence`, `.glossary-caution` y `.glossary-audit-steps`. El panel contextual `.glossary-quick-body` debe respetar el mismo contrato.
- Los paneles del resto del asistente (tarjetas, inventario, captura asistida, análisis de red, diagnóstico, aceptación de riesgo y mitigación) mantienen contenedores con padding propio o wrapper con contenido acolchado. Evitar resets globales; comprobar padding computado y ausencia de overflow en 390/768/1280 px, paletas base y oscuras. Test estático: `tests/test_glossary_guide.cjs`; test de navegador: `tests/test_pwa_browser.cjs`.

## Agilidad móvil: campos con listas editables
Los catálogos breves de `js/audit-inventory-presets.js` se consumen desde `js/app-definitions.js`; `js/audit-field-renderer.js` utiliza `<select data-preset>` nativo con «Otro / escribir…» y entrada de valor personalizado, mientras que OS/software siguen con búsqueda. `js/field-assist.js` propone valores ya usados dentro del expediente, sin telemetría ni inferencias. Jamás introducir por defecto un valor que aparente una verificación, ni cerrar campos de identificadores, rutas, IP, series y narrativas. Mantener JSON v3 (cadenas), eventos `data-custom`, foco y compatibilidad de importación. Validar `tests/test_mobile_choices.cjs` y navegador Android.


## Sugerencias desde una fotografía
El módulo `js/photo-code-hints.js` usa `BarcodeDetector` y opcionalmente `TextDetector` cuando el navegador los expone; no se incorporan OCR remoto, librerías ni tráfico de red. `js/camera-capture.js` solo marca las fotos realmente obtenidas de cámara; `js/app.js` **primero incorpora la imagen a Evidencias y persiste**, después ofrece propuesta en un diálogo. Cancelar o no detectar información no modifica ni revierte la fotografía. Solo se escriben campos de Hardware `vendor/model/serial/name` vacíos, con confirmación explícita y revisión manual. No ejecutar QR como enlaces, comandos o credenciales. Módulos nuevos precargados en HTML, SW e instaladores; prueba `tests/test_photo_hints.cjs`.

## Preparación móvil opcional (Android/iOS)
- Propietario: `index.html#mobile-terminal-setup`, con Android `#mobile-terminal-android` e iOS `#mobile-terminal-ios`; estilos en `css/workspace-ux.css`. Se integra en `device` después de `#mobile-field-check`, sin alterar las siete casillas ni guardar preferencias.
- Android usa Termux externo, sin ejecución desde JavaScript; el comando `doctor` es pasivo. El `wizard` exige alcance privado y confirmación literal `AUTORIZO`. iOS no admite Termux; no prometer que a-Shell/iSH puedan escanear con ICMP/Nmap ni acceder a interfaces.
- Las instrucciones deben funcionar offline como texto, sin scripts inline ni dependencias CDN; los enlaces externos son solo referencias opcionales. Documentación: `docs/AUDITORIA_MOVIL_ES.md`, `discovery/README_ES.md` y `discovery/README.md`. Al cambiar HTML/CSS, subir CACHE_NAME de `sw.js` y validar en `tests/test_mobile_pwa.cjs` y Playwright.

## Diccionario: servidores, software y licencias
- Entradas `term-183` a `term-212` en `js/glossary-terms.js`: categorías Servidores, Almacenamiento, Operación de software y Licencias. `js/glossary-guides.js` contiene diagnósticos de lectura; las licencias se verifican contra documentos del editor, nunca por activación automática.
- Mantener IDs y contratos de datos, `CONTEXT_HELP` enlazado con los campos existentes de Software y Hardware, sin alteración de esquema JSON v3. Ejecutar `tests/test_glossary_data.cjs`, `tests/test_glossary.cjs`, `tests/test_glossary_guide.cjs` y navegador; actualizar versión de SW si cambia el catálogo.

## Preparación de auditoría de campo
- `js/audit-storage.js`: si `action(objectStore)` lanza una excepción síncrona, abortar la transacción antes de rechazar; una Promise rechazada no revierte IndexedDB por sí sola. Mantener la regresión real de lote parcial en `tests/test_pwa_browser.cjs`.
- `js/app.js`: `pendingWrites` cuenta todas las operaciones en cola y se decrementa en `finally`. La recarga por actualización exige cero escrituras pendientes además de los controles dirty/error/timer. `tests/test_pending_writes.cjs` pertenece a la puerta de entrega.
- `sw.js`: navegación y salud verifican integridad completa; recursos concurrentes comparten la verificación y se asocian al `resultingClientId` de la navegación. Mantener regresiones de eviction/fallback y límite de lecturas en `tests/test_pwa_protocol.cjs`.
- Aceptación real de campo y limitaciones de las pruebas históricas: `docs/RELEASE_READINESS_ES.md` / `docs/RELEASE_READINESS.md`.

## Flujo rápido del asistente
`js/app.js` conserva el último paso por expediente en `rabbitmole:ui:last-step:v1:<id>`: preferencia local validada contra `nav`, jamás progreso verificado ni parte del JSON. Eliminar el expediente elimina esa preferencia. `#wizard-step-top` debe seguir habilitado en expedientes confirmados. Los botones `[data-entry-next]` solo navegan por fichas visibles y usan `recordNavigation.focus(key,{clearSearch:false})`; los botones `data-add` reutilizan límites, identificadores y bloqueos existentes. No copiar observaciones o estados entre registros. CSS en `workspace-ux.css`; E2E en `test_pwa_browser.cjs`.

## Mobile/tablet wizard scroll
- `js/app.js` tracks transitions between `nav` steps, and after rendering aligns the fresh `.wizard-fast-nav` within a viewport up to 1000px. General navigation and desktop still go to page top. `heading.focus({preventScroll:true})` avoids a second jump.
- Do not alter audit JSON, active record or last-step persistence. Test real phone/tablet scrolling in `tests/test_pwa_browser.cjs` and the source contract in `tests/test_mobile_pwa.cjs`. Increment SW cache when updating JS.

## Compact navigation and iOS safe areas
- `js/ui-layout.js` auto-closes the expanded menu on compact (< =1000px) destination buttons in `#global-navigation` and `#navigation`, without changing saved manual preference. Navigation closure uses `data-navigation-instant` so the collapsing menu does not shift the new wizard after scrolling.
- `js/android-touch.js` sets generic `touch-device` for coarse pointer Android/iOS (retains `android-touch` for Android-only detection). Shared CSS in `css/android-touch.css`; `css/layout-collapse.css` maintains viewport safe-area padding and 16px menu inputs, without fixed root containers. `index.html` uses viewport-fit=cover.
- Phone/tablet record navigation avoids smooth scrolling while software keyboard may resize viewport. Tests: `tests/test_android_touch.cjs`, `tests/test_mobile_pwa.cjs`, `tests/test_pwa_browser.cjs` (iOS UA emulation explicitly not native WebKit). Do not assume iOS parity without real-device acceptance.

## Wi-Fi and VLAN inventory design
- One Wi-Fi logical SSID or segment per `networks` record. Optional fields `networkKind`, `site`, and `segmentationState` preserve JSON v3 and the existing importer. Do not equate BSSID/AP observations to distinct SSIDs.
- `js/network-overview.js` groups declared site+VLAN only and is deliberately read-only: it cannot infer network isolation, VLAN routing rules, DHCP correctness or vulnerabilities. No automated scan/finding. `renderNetworkOverview` displays the mapping in the assistant and technical report.
- Keep installer and SW resource parity and run `tests/test_network_overview.cjs`, `tests/test_app_modules.cjs`, browser audit workflow, `npm run check` before merge. Confirmed documents must reject adding rows.

## Router security data-loss regression
- Never clear `networks.routerVendor` or `networks.routerModel` as a side effect of changing `networkDeviceType` or `routerVendor`. Models may be custom and valid even if absent from the new catalogue; preserve and show as `Otro / escribir` for explicit revision.
- Render `networkDeviceType` first in `router-security-review`; do not display it a second time in the extended group. The `app-model.js` JSON v3 validator must roundtrip router details and reportRows(networks) should render every populated field.
- Regression: `tests/test_router_catalog.cjs`, `tests/test_app_modules.cjs`, `tests/test_pwa_browser.cjs` including offline reload after changing type/vendor. Do not infer missing values from external sources.
