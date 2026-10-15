# RabbitMole · Publicación e instalación desde Cloudflare Workers

**URL:** https://rabbitmole.danieldigitalspace.workers.dev/

## Experiencia según el modo de apertura

- **Web en pestaña:** modo `public-web`, con formularios, inventarios, controles, evidencias y exportaciones locales; conexiones externas limitadas.
- **PWA instalada:** modo `private-full`, detectado mediante `display-mode: standalone` o `navigator.standalone` en iOS, con todas las funcionalidades. Las conexiones externas siguen necesitando Internet y consentimiento.
- La política no depende de `navigator.onLine` y no es una barrera de seguridad: se publica JavaScript inspeccionable. No incluir secretos, claves ni datos reales en archivos de distribución.

## Validación y compilación

```bash
python3 deploy/build-pages-demo.py
node tests/test_pages_demo.cjs
```

Solo publica `dist-pages/`, nunca la raíz del repositorio. El builder genera un `release.json`, un Service Worker versionado y el perfil dinámico `js/deployment-profile.js`; la versión local es completa sin restricciones web.

## Workers y CI/CD

`wrangler.toml` configura el Worker y sus recursos estáticos. El workflow `.github/workflows/ci.yml` valida y adjunta un artefacto versionado. El workflow `.github/workflows/deploy-cloudflare.yml` permite desplegar manualmente una revisión aprobada de `main`.

En GitHub Actions configura `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como secretos, y protege el entorno `production`. Ejecutar desde un terminal autorizado:

```bash
python3 deploy/build-pages-demo.py
npx --yes wrangler@4 deploy
```

Antes de desplegar confirma que `rabbitmole.danieldigitalspace.workers.dev` pertenece a ese Worker. Si actualmente lo gestiona otro proyecto de Pages/Workers, revisa su integración GitHub y elimina rutas de publicación antiguas para no sobrescribir releases.

## Aceptación

1. Pestaña pública: sin conexiones externas y sin credenciales.
2. PWA instalada desde icono: funcionalidades completas, incluso con Wi-Fi desactivado salvo servicios externos.
3. Descarga/carga JSON local y generación de PDF conservadas en ambos modos.
4. `release.json` coincide con el commit desplegado; `/deploy/`, `/discovery/`, `/tests/` y scripts .sh/.ps1 no son públicos.
5. Service Worker nuevo, caché completa, actualizaciones controladas y backup antes de actualizar.

**Advertencia:** el navegador y el sistema determinan si `display-mode` refleja una instalación; prueba Chrome/Edge, Android y Safari/iPadOS específicamente. 
