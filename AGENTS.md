# RabbitMole — contrato para agentes

> RabbitMole es una PWA offline-first de auditoría de infraestructura y ciberseguridad. No es un escáner de vulnerabilidades ni una herramienta de ejecución remota. La evidencia y los expedientes pertenecen al auditor y se almacenan localmente.

## Inicio obligatorio: CRISP

**Contexto:** comprobar rama, SHA, cambios existentes y alcance autorizado antes de editar o publicar.
**Rol:** actuar como ingeniero senior web/PWA, seguridad, accesibilidad y sistemas; priorizar integridad de datos.
**Inspección:** localizar responsable, consumidores y pruebas antes de crear abstracciones.
**Estándares:** preservar CSP estricta, perfil web limitado frente a PWA instalada, ausencia de dependencias externas en tiempo de ejecución y progresividad offline.
**Prueba:** verificar comportamiento y fallos, no solo coincidencias de texto o sintaxis.

## Mapa mínimo de responsabilidad

| Función | Propietario | Dónde mirar |
| --- | --- | --- |
| Modelo y expediente JSON v3 | `js/app.js`, `js/audit-storage.js` | `tests/test_json_contract.cjs`, pruebas de guardado |
| App shell offline, recuperación y actualizaciones | `sw.js`, `js/pwa-updates.js` | `tests/test_pwa_protocol.cjs`, `tests/test_pwa_browser.cjs` |
| Instalación, persistencia y salud offline | `js/pwa-install.js`, `js/offline-health.js` | `tests/test_mobile_pwa.cjs` |
| Perfil de despliegue | `js/deployment-profile.js`, `deploy/public-profile.js` | `tests/test_pages_demo.cjs` |
| Empaquetado y cabeceras | `deploy/build-pages-demo.py`, `deploy/worker.js`, `deploy/Caddyfile` | `tests/test_build_bundle.py`, `tests/test_cloudflare_worker.cjs` |
| Interfaz y temas | `index.html`, `css/styles.css`, `css/workspace-ux.css` | `tests/test_accessibility.cjs`, navegador |
| Recolección externa autorizada | `discovery/`, `collect-local.*` | guías de seguridad y pruebas específicas |
| Discovery HTTPS LAN | `discovery/service.py`, `js/discovery-bridge.js` | `tests/test_discovery_service.py`, `discovery/README_ES.md` |

## Invariantes de seguridad y datos

1. No introducir endpoints, telemetría, trackers, CDN ni enviar expedientes/evidencias a servicios externos. Las transferencias explícitas requieren aprobación del usuario.
2. La instalación PWA no equivale a permiso o autenticación. Conservar separación entre web pública limitada y aplicación instalada completa incluso sin conexión.
3. No guardar JSON de auditorías, secretos, tokens o datos de clientes en CacheStorage: almacenar únicamente archivos estáticos de aplicación. No borrar IndexedDB ni localStorage al actualizar.
4. Actualizaciones opt-in: instalar una versión completa de manera atómica y reiniciar solo tras guardado y confirmación. Nunca mezclar JS/CSS de releases distintos en una misma sesión.
5. Preservar la versión anterior utilizable para recuperación; límites y cuotas del navegador pueden borrar cachés, por lo que la reserva nunca sustituye exportaciones JSON.
6. Mantener cabeceras y CSP restrictivas, recursos locales, validación de origen, y rutas de Discovery exclusivamente por el helper local.
7. El servicio Discovery de LAN exige TLS confiable, origen exacto, token efímero, CIDR acotado, confirmación explícita y firewall; nunca exponerlo a Internet ni persistir tokens.
8. Accesibilidad: controles con nombre, teclado y foco visibles, estados expresados también en texto, contraste en todos los temas, sin anuncios persistentes de mantenimiento en la UI principal.
8. Evitar modificar esquemas de datos o políticas de migración de forma incidental. Las herramientas de recopilación no deben ejecutar acciones de infraestructura sin autorización.

## Procedimiento de cambios

1. Revisar `git status --short`, HEAD, `AGENTS.md` y el contrato existente en el subsistema afectado; identificar una única fuente de verdad.
2. Leer código, consumidores, tests y los documentos ES/EN relevantes. No depender de snippets parciales o supuestos de ramas antiguas.
3. Preferir parches pequeños compatibles con ambas distribuciones (local/Cloudflare) y ambos perfiles (web/instalada). Sin frameworks o service workers alternativos.
4. Cambios PWA: actualizar `sw.js`/lista CORE, empaquetado, instaladores Bash y PowerShell cuando haya nuevos recursos; revisar versionado y fallback.
5. Añadir pruebas positivas y negativas (offline de inicio, actualización incompleta, caché anterior, red intermitente, datos existentes, perfiles, lectores de pantalla).
6. Ejecutar `npm run check`, `npm run test:browser` (Playwright Chromium instalado) y `npm run deploy:check` para cambios de release. Informar por separado de pruebas no ejecutadas.
7. Publicar por PR sobre una rama nueva, no sobre `main`, salvo autorización expresa; nunca dar por aprobado ni fusionar cambios automáticamente.

## Guía de lectura rápida

- `README_ES.md`, `README.md`: producto y límites.
- `INSTALLATION_ES.md`, `deploy/CLOUDFLARE_PAGES_ES.md`: canales y despliegue.
- `SECURITY_ES.md`, `LEGAL_ES.md`: protección y responsabilidades.
- `deploy/validate.py`: puerta de pruebas, no duplicar suites.
- `.github/workflows/ci.yml`: validación de CI; no implica publicación automática.

**Entrega obligatoria:** propiedad elegida → archivos cambiados → pruebas realmente ejecutadas → riesgos y limitaciones → PR y siguiente acción. No afirmar compatibilidad móvil, accesibilidad, recuperación o despliegue sin pruebas pertinentes.

## Refactorización incremental de app.js

Las definiciones de campos y grupos son propiedad de `js/app-definitions.js`, el modelo de expediente JSON v3 de `js/app-model.js` y las identidades y normalización del equipo de `js/app-team.js`. Son fábricas explícitas para conservar el ciclo de vida original del controlador. `js/app.js` continúa gestionando estado mutable, enrutado, guardado, renderizado y listeners. No introducir inicialización con efectos laterales en estas fábricas ni importar dependencias externas, y no cambiar los identificadores de esquemas o las claves de almacenamiento. Al mover funciones actualizar los consumidores, los tests de contrato y el precache de la PWA.
