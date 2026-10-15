# RabbitMole · Publicación controlada e instalación offline

Esta guía sustituye a la antigua checklist de Audit Workbench en Sysadmin.
El repositorio es **sempitern0/RabbitMole**, la aplicación está en la raíz y el
servicio existente es **Cloudflare Workers con Static Assets**, no un proyecto
Pages: <https://rabbitmole.danieldigitalspace.workers.dev/>.

## Qué distingue la web de la aplicación instalada

| Apertura | Funciones locales | Integraciones HTTPS externas |
| --- | --- | --- |
| Pestaña del sitio público | Inventario, auditorías, evidencias, JSON y PDF | Bloqueadas en la interfaz y en las operaciones |
| PWA abierta desde su icono | Todas las funciones de la aplicación | Disponibles con configuración, Internet y consentimiento |
| Edición local con los instaladores del repositorio | Todas | Disponibles con las mismas condiciones |

Desconectar Wi-Fi no convierte una pestaña en la aplicación instalada. El modo
instalado usa `display-mode: standalone`, `minimal-ui` o `navigator.standalone`
en iOS. Pantalla completa por sí sola no concede ese modo. La detección es una
**política de uso del cliente, no autenticación**: no puede demostrar una
instalación frente a alguien que altere su propio navegador. No distribuyas
secretos ni uses este indicador para proteger recursos privados de un servidor.

La CSP compartida permite conexiones HTTPS para que la PWA instalada pueda usar
Nextcloud/CVE. No es posible convertir la misma CSP en una barrera distinta y
fiable según una señal de instalación enviada por el cliente. El Worker solo
sirve archivos autorizados, rechaza escritura y no actúa como proxy ni recibe
expedientes como parte de su funcionalidad. Los proveedores de alojamiento pueden
registrar metadatos HTTP; los datos enviados voluntariamente a Nextcloud u otro
servicio se rigen por la configuración y permisos de ese destino.

## Preparar y verificar una revisión

Requisitos: Git, Node.js 22 o posterior, npm y Python 3.12. Desde la raíz:

```bash
npm ci
npm run deploy:check
npx playwright install chromium
npm run test:browser
```

`deploy:check` ejecuta la misma validación que CI y hace un dry-run de Wrangler,
sin desplegar. `npm run build` genera `dist-pages/`. El nombre del generador
`deploy/build-pages-demo.py` se conserva para no romper comandos de build ya
configurados; ahora genera web limitada y PWA completa, no una demo permanente.

El paquete contiene solo HTML, manifiesto, Service Worker, JS/CSS, fuentes e
iconos, además de metadatos de distribución. Excluye scripts, tests, configuración
y datos de clientes. `release.json` identifica el commit y la versión;
`checksums.json` contiene las huellas de los archivos publicados. La huella de
versión también cambia al modificar el Worker, las cabeceras o el Service Worker.
Wrangler y Playwright tienen versiones exactas en `package-lock.json`.

## Publicar: elige un único mecanismo

### Recomendado: GitHub Actions manual con revisión aprobada

1. En GitHub, protege el entorno **production** y restringe quién puede aprobarlo.
2. Configura allí los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
   Usa un token con permiso de despliegue de Workers limitado a la cuenta necesaria;
   no lo escribas en archivos del repositorio ni en variables del frontend.
3. Espera a que **RabbitMole quality and Cloudflare release** pase en el commit.
4. Ejecuta **Deploy RabbitMole to Cloudflare Workers**, seleccionando `main` en
   ese momento. El workflow usa el SHA de esa ejecución, repite las validaciones,
   prueba offline y después despliega al entorno protegido.
5. El paso final comprueba HTTPS, recursos, protocolo offline y archivos excluidos.
   Si falla tras desplegar, investiga el servicio: un error de comprobación no
   revierte automáticamente el despliegue.

Desactiva el despliegue automático del mismo Worker desde Workers Builds si usas
este flujo. Así un push de desarrollo no publica una versión sin tu aprobación.
El workflow de CI solo construye y adjunta un artefacto; **no despliega**.

### Si conservas la integración Git de Cloudflare Workers Builds

| Ajuste | Valor |
| --- | --- |
| Repositorio | `sempitern0/RabbitMole` |
| Worker | `rabbitmole` |
| Directorio raíz | `/` (raíz del repositorio) |
| Comando de build | `npm ci && npm run check` |
| Comando de despliegue | `npm run deploy` |
| Configuración | `wrangler.toml` |
| Assets | `./dist-pages`, binding `ASSETS` |
| Rama | Una rama de publicación que controles, o `main` solo si aceptas publicar cada push |
| Previews no aprobadas | Desactivadas |

No uses la raíz antigua `audit-workbench`, ni un campo de salida de Pages como
sustituto de la configuración de Workers. No uses `wrangler pages deploy` para
este Worker. El bloque `[build]` de Wrangler reconstruye el paquete incluso si
se ejecuta `wrangler deploy` directamente. El build es posible en cualquier rama;
la aprobación corresponde al mecanismo de publicación, no a una variable de build.
No mantengas ambos mecanismos publicando simultáneamente.

Desde un terminal ya autenticado en la cuenta correcta:

```bash
npm ci
npm run deploy
python3 deploy/smoke_https.py https://rabbitmole.danieldigitalspace.workers.dev
```

## Instalar y probar en cada dispositivo

1. Abre la URL HTTPS con conexión. En Chrome/Edge usa **Instalar RabbitMole** si
   aparece, o el menú del navegador. En Safari/iPhone/iPad: **Compartir → Añadir a
   pantalla de inicio** y, si aparece, **Abrir como app web**.
2. Abre RabbitMole desde su icono; la tarjeta superior debe indicar aplicación
   completa. La pestaña original puede seguir limitada.
3. Pulsa **Comprobar** en **Protección del trabajo offline**. Espera a ver que
   está preparada y solicita persistencia si el navegador lo admite.
4. Crea una auditoría de prueba, desactiva la red, cierra y vuelve a abrir desde
   el icono. Comprueba edición, recuperación de datos, exportación y PDF.
5. Exporta y restaura un JSON en otro dispositivo. No hay sincronización automática.

No todos los navegadores o sistemas ofrecen instalación PWA. En los que no la
ofrecen, usa la web limitada o un navegador compatible. Tener todas las funciones
de la PWA no significa que pueda ejecutar scripts Bash/PowerShell, hacer tareas de
sistema sin permisos ni consultar servicios remotos sin red. Discovery sigue
siendo una herramienta local independiente.

## Actualizaciones, recuperación y límites

La aplicación guarda antes de aplicar una actualización y no recarga sin
confirmación. El diagnóstico y la reparación usan el mismo protocolo RabbitMole
que el Service Worker. La reparación rechaza mezclar archivos de otra release:
si el servidor ofrece una versión distinta, busca y aplica esa actualización.

El almacenamiento depende del dispositivo, navegador/perfil y origen. Conserva
la misma URL y realiza backups externos: borrar datos del sitio o desinstalar
puede perder expedientes. Un rollback de código no es un rollback de datos.
Conserva el SHA de cada release y comprueba compatibilidad antes de volver atrás.

Si la URL devuelve **403**, revisa en Cloudflare el despliegue activo y las reglas
de acceso/WAF correspondientes. No desactives controles a ciegas: el fallo puede
ser una restricción del cliente que realiza la prueba. La instalación exige que
los navegadores previstos puedan obtener el HTML, manifiesto, SW y todos los
recursos de caché, sin una página de bloqueo en su lugar.

## Estado de aceptación

- [x] Paquete limitado por rutas/tipos, cabeceras y bloqueo de métodos de escritura.
- [x] Web limitada y apertura instalada completa, sin depender de la conectividad.
- [x] Pruebas de protocolo, integridad del paquete y actualización sin perder guardados.
- [x] Prueba Chromium local de caché, recarga sin red y persistencia de un registro;
  el modo instalado se simula en esa prueba.
- [ ] Confirmar secretos, entorno y mecanismo único de publicación en tu cuenta.
- [ ] Confirmar `release.json` y la comprobación HTTPS en la URL de producción.
- [ ] Probar instalación real desde el menú/icono en PC y tablet/teléfono.

Fuentes: [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/),
[cabeceras](https://developers.cloudflare.com/workers/static-assets/headers/),
[builds de Wrangler](https://developers.cloudflare.com/workers/wrangler/custom-builds/),
[instalación PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).
