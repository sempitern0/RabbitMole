# RabbitMole — Cloudflare Pages

Guía de despliegue de la edición pública, que permite probar la aplicación e instalarla sin conexión. NO usar datos reales de clientes.

## Estado y requisitos

- [x] Renombrada la interfaz, título y manifest de la PWA.
- [x] Conservados los identificadores internos de almacenamiento para compatibilidad.
- [x] Creado perfil private-full para despliegues locales y perfil public-demo para Cloudflare.
- [x] Creado generador estático por lista positiva: sin Discovery, ejecutables ni módulos de transferencia.
- [x] Añadidos controles en app.js y política CSP exclusivamente same-origin en el artefacto público.
- [x] Caché offline de recursos completos y tests de distribución en CI.
- [ ] Verificar CI verde y comprobar funcionamiento en un navegador y tablet reales.
- [ ] Crear y proteger la rama pages-production con un commit aprobado.
- [ ] Vincular GitHub a Cloudflare Pages y desplegar por HTTPS.

## Compilación local previa

Desde la raíz del repositorio:

    python3 deploy/build-pages-demo.py
    node tests/test_pages_demo.cjs

Solo se publica dist-pages; esa carpeta se ignora en Git. Nunca publiques el repositorio entero.

## Configuración en Cloudflare

En Workers & Pages, crea un proyecto Pages conectado al repositorio sempitern0/RabbitMole.

| Configuración          | Valor                                           |
| ---------------------- | ----------------------------------------------- |
| Nombre sugerido        | rabbitmole (sujeto a disponibilidad) |
| Framework              | None                                            |
| Production branch      | pages-production                                |
| Root directory | (vacío; raíz del repositorio) |
| Build command          | python3 deploy/build-pages-demo.py              |
| Build output directory | dist-pages                                      |
| Variables/secretos     | Ninguna                                         |
| Preview branches       | None (deshabilitadas)                           |

El script impide builds desde otras ramas cuando Cloudflare establece CF_PAGES=1. No conectes main directamente a producción.

Para crear la rama aprobada después de comprobar CI:

    git fetch origin
    git switch main
    git pull --ff-only
    git switch -c pages-production
    git push -u origin pages-production

Protege pages-production en GitHub con reglas de revisión y comprobaciones. Promueve nuevas versiones solo tras pruebas y aprobación.

## Pruebas finales

- [ ] HTTPS válido y cabeceras CSP de \_headers presentes.
- [ ] PWA instalable y sin conexiones Nextcloud, WebDAV, correo, share ni consultas CVE online.
- [ ] Las rutas deploy/, tests/, discovery/ y los scripts de administración devuelven 404.
- [ ] Crear un expediente ficticio, exportar/importar JSON y generar PDF.
- [ ] Instalar la PWA; poner el dispositivo en modo avión; reabrir y verificar que funciona.
- [ ] El botón Buscar actualización funciona manualmente. El navegador puede comprobar internamente actualizaciones del Service Worker.
- [ ] Revisar backups: IndexedDB no se sincroniza entre dispositivos y puede ser eliminado por el navegador.

Una app instalada no desbloquea ninguna función restringida. Public-demo es un perfil de compilación, no un estado de conectividad.

Consulta documentación oficial: https://developers.cloudflare.com/pages/configuration/build-configuration/ y https://developers.cloudflare.com/pages/configuration/headers/ .
