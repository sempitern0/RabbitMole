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
El service worker local usa `rabbitmole-shell-v88-palette-icons` y debe cambiar su nombre en cada release local que altere CORE o lógica SW; el builder Cloudflare ya genera el hash de versión. La marca `.rabbitmole-shell-ready` **no demuestra por sí sola** integridad: validar CORE completo (caché actual) y dependencias HTML (fallback heredado). Reparar únicamente una release idéntica, escribir la marca al final y no mezclar versiones. Probar cache eviction, fallback, inicio offline y shell incompleto. Antes de fusionar ejecutar CI y Playwright y documentar explícitamente las pruebas no ejecutadas.


## Conexiones online · propietario y contrato
- `js/secure-transfer.js`: WebDAV HTTPS, cifrado JSON, preflight `PROPFIND Depth: 0` sin escritura, subidas con `If-None-Match: *`, comparticiones OCS con contraseña/caducidad y revocación. Exigir `private-full`, CORS explícito y prohibir URL con credenciales o parámetros.
- `js/secure-transfer-ui.js`: respaldo/PDF y enlace temporal; `js/app.js`: perfil cifrado, selector de canal, estado efímero `connectionVerified` y opciones avanzadas. Una comprobación satisfactoria **no acredita escritura**. Resetear verificación al guardar, desbloquear u olvidar perfil.
- No efectuar conexiones automáticamente, no sobrescribir copias existentes, no convertir correo en envío automático ni asumir OAuth para proveedores no implementados. No persistir contraseñas de aplicación sin cifrar, frases, tokens ni enlaces temporales. Probar código 207, 401/403/404, CORS, privacidad de perfiles y autorización antes de entregar.

## Iconografía sensible a paleta
- `css/styles.css` define `--sidebar-active` por paleta; `css/workspace-ux.css` deriva `--sidebar-icon-muted` y `--sidebar-icon-active` para iconos SVG de `#global-navigation` y símbolos dinámicos `.nav-mark` del asistente. **No introducir verdes/turquesas hexadecimales en reglas de iconos**: deben cambiar con `data-palette` sin JavaScript extra.
- Mantener el contraste de iconos activos sobre `--navy` y no recolorear iconos semánticos de error, éxito o alertas. Revisar navegación expandida y contraída, escritorio/tablet y forced-colors. Ejecutar `node tests/test_palette_icons.cjs` y el recorrido Playwright de todas las paletas.
