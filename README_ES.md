<p align="center">
  <img src="icons/app.png" width="120" alt="Icono de RabbitMole">
</p>

<h1 align="center">RabbitMole</h1>

<p align="center">
  <strong>Auditorías técnicas. Evidencias estructuradas. Entregas controladas.</strong><br>
  PWA offline-first para evaluar infraestructuras, inventariar activos, documentar hallazgos y preparar informes profesionales.
</p>

<p align="center">
  <a href="https://github.com/sempitern0/RabbitMole/actions/workflows/ci.yml"><img alt="Pruebas de calidad" src="https://github.com/sempitern0/RabbitMole/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <img alt="PWA offline-first" src="https://img.shields.io/badge/PWA-offline--first-356A76">
  <img alt="Almacenamiento local en navegador" src="https://img.shields.io/badge/datos-en%20tu%20navegador-34745B">
  <img alt="JSON esquema v3" src="https://img.shields.io/badge/JSON-esquema%20v3-586F91">
  <img alt="Sin backend obligatorio" src="https://img.shields.io/badge/backend-no%20requerido-596579">
</p>

<p align="center">
  <a href="README.md">English</a> · <strong>Español</strong><br>
  <a href="#inicio-rápido">Inicio rápido</a> · <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#flujo-de-auditoría">Flujo</a> · <a href="#datos-y-seguridad">Datos y seguridad</a> ·
  <a href="#documentación">Documentación</a>
</p>

---

## ¿Qué es RabbitMole?

RabbitMole es un **espacio de trabajo independiente para auditorías técnicas**. Permite documentar **hardware, software y redes**, verificar controles, relacionar hallazgos y evidencias, planificar remediaciones y generar **informes ejecutivos, técnicos y de reevaluación**.

Funciona en el navegador **sin cuentas, base de datos remota ni backend obligatorio**. Los expedientes permanecen en el perfil actual salvo que el auditor decida exportarlos o transferirlos.

> [!IMPORTANT]
> RabbitMole **no escanea vulnerabilidades automáticamente, no certifica conformidad y no administra equipos**. [Discovery](discovery/README_ES.md) es una utilidad independiente que se ejecuta desde el equipo del auditor y únicamente sobre redes autorizadas. Los comandos del diccionario técnico son ejemplos: la PWA no los ejecuta.

## Web pública frente a PWA instalada

[Instala RabbitMole](https://rabbitmole.danieldigitalspace.workers.dev/) desde un navegador compatible y **ábrela desde su icono**. Al visitar la misma URL en una pestaña normal se ofrecen deliberadamente menos funcionalidades. El modo instalado se detecta en el navegador: **no es autenticación ni una barrera de seguridad del servidor**.

| Característica | URL pública en pestaña | PWA instalada (ventana propia) |
| --- | --- | --- |
| Auditorías, inventarios, evidencias, controles, diccionario | Disponible en local | Disponible en local |
| Importación/exportación JSON, PDF, CSV/XLSX | Disponible en local | Disponible en local |
| Integraciones HTTPS autorizadas (Nextcloud/WebDAV, transferencias) | Desactivadas | Disponibles bajo petición, con conexión y permisos |
| Icono y ventana de aplicación | No | Sí |
| Arranque sin red con recursos descargados | Depende del navegador; no es la modalidad prevista | Sí, previa verificación |
| Comprobación de actualizaciones | Limitada | Se busca al abrir/recuperar foco con red; el usuario confirma su aplicación |

**Ventajas de la PWA:** usar RabbitMole en redes aisladas, disponer de una ventana separada de las pestañas y conservar expedientes en el dispositivo sin una cuenta ni sincronización obligatoria. Antes de una auditoría sin Internet, pulsa **Protección del trabajo offline → Comprobar**, cierra la aplicación, desconecta la red y vuelve a abrirla desde su icono. Exporta copias JSON periódicamente: el navegador puede eliminar datos locales. La PWA no ejecuta comandos del sistema ni conecta con servicios remotos sin los permisos y la conectividad pertinentes.

## Inicio rápido

### Evaluación local

\`\`\`bash
git clone https://github.com/sempitern0/RabbitMole.git
cd RabbitMole
python3 -m http.server 8765 --bind 127.0.0.1
\`\`\`

Abre **http://127.0.0.1:8765**. En Windows también puedes usar \`py -m http.server 8765 --bind 127.0.0.1\`. Se inicia un **servidor estático local**, no un backend.

### Instalar en local o como PWA

| Entorno | Comando o acceso | Detalles |
| --- | --- | --- |
| Linux / macOS | \`bash ./rabbitmole.sh\` | Admite \`--update\`, \`--dir\` y \`--no-open\` |
| Windows / PowerShell | \`.\rabbitmole.ps1\` | Admite \`-Update\` y \`-NoOpen\` |
| Android / iOS / iPadOS | Despliegue **HTTPS** de confianza | Instala desde el navegador y verifica el uso sin conexión |

Los instaladores son propios de RabbitMole. Instala la PWA completa desde https://rabbitmole.danieldigitalspace.workers.dev/. Consulta [Instalación](INSTALLATION_ES.md).

> [!TIP]
> Trabaja siempre con **la misma URL y perfil de navegador**. \`localhost\` y \`127.0.0.1\`, distintos puertos o navegadores pueden tener bases de datos separadas. Abrir \`file://\` no equivale a instalar una PWA desde un origen estable.

## Funcionalidades

| Área | Qué incluye |
| --- | --- |
| **Expedientes** | Clientes, alcance, consultora, auditores, autorización, biblioteca e identificadores estables |
| **Inventarios** | Hardware, redes, software, revisión de situación inicial, catálogos, ayuda contextual e importaciones CSV/JSON supervisadas |
| **Controles** | Plantillas, evidencias esperadas, estados de verificación y referencias técnicas |
| **Hallazgos y evidencias** | Riesgos, recomendaciones, relaciones con activos y controles, imágenes y hashes cuando están disponibles |
| **Calidad y revisiones** | Comprobaciones previas, borradores, confirmación, historial de cambios y rectificaciones excepcionales |
| **Informes** | PDF ejecutivo, técnico y de reevaluación desde el navegador; exportaciones JSON, CSV y XLSX |
| **Guías offline** | Diccionario técnico, comprobaciones de seguridad y diagnósticos ilustrativos de solo lectura |
| **Conexiones opcionales** | Recopiladores, Discovery autorizado, consultas CVE y Nextcloud/WebDAV con backup JSON cifrado opcional |

El almacenamiento persistente, el acceso a carpetas, la función Compartir y las conexiones CORS/HTTPS dependen del navegador y del servidor. Consulta la [referencia detallada](docs/FEATURE_REFERENCE_ES.md) para conocer comportamientos y limitaciones.

## Flujo de auditoría

1. **Preparar:** registrar consultora, auditores, cliente, alcance, autorizaciones y exclusiones.
2. **Inventariar:** documentar equipos, software y redes o revisar las capturas antes de importarlas.
3. **Verificar:** incorporar controles; todos comienzan **Pendientes** hasta su revisión.
4. **Documentar:** vincular hallazgos con activos, controles y evidencias; definir acciones y criterios de cierre.
5. **Revisar:** resolver bloqueos de calidad y comprobar evidencias y vista previa del informe.
6. **Entregar:** generar un **borrador** o confirmar y emitir un **PDF definitivo ejecutivo/técnico**.
7. **Reevaluar:** registrar correcciones verificadas sin sobrescribir informes entregados.

Empieza con **datos ficticios**, exporta un backup JSON completo, comprueba su restauración y revisa la impresión PDF antes de usar expedientes reales.

## Datos y seguridad

| Operación | Dónde se guardan o envían los datos | Límite importante |
| --- | --- | --- |
| Edición de expedientes | **IndexedDB**; alternativa \`localStorage\` | La base local **no se cifra automáticamente** |
| Exportación JSON | Archivo descargado desde el navegador | Restaurable; puede contener datos confidenciales |
| PDF / CSV / XLSX | Descarga o impresión local | **No** son backups restaurables |
| Diccionario y ayuda | Recursos incluidos en la PWA | Los comandos no se ejecutan desde el navegador |
| Discovery y recopiladores | Herramientas independientes del auditor | Ejecución explícita, no escaneo web automático |
| CVE o Nextcloud/WebDAV | Servicio remoto autorizado, **bajo petición** | Pueden requerir Internet, HTTPS y CORS |

> [!WARNING]
> **El almacenamiento del navegador no sustituye a las copias de seguridad.** Antes de actualizar, cambiar de dispositivo, perfil u origen, utiliza **Copias y exportaciones → Descargar backup JSON completo** y comprueba el archivo. Guárdalo en almacenamiento protegido. El contrato actual es **JSON v3**. Los identificadores históricos \`rabbitmole-*\` permanecen por compatibilidad.
>
> **Los hashes y firmas gráficas locales no constituyen firmas electrónicas validadas ni un registro inmutable.** Conserva las evidencias originales y las entregas aprobadas fuera de la aplicación, con control de acceso.

Consulta [Seguridad](SECURITY_ES.md) y [Notas legales](LEGAL_ES.md).

## Modalidades de despliegue

| Modalidad | Uso recomendado | Instrucciones |
| --- | --- | --- |
| HTTP local en \`127.0.0.1\` | Desarrollo, evaluación y trabajo individual | [Instalación](INSTALLATION_ES.md) |
| HTTPS con Docker Compose + Caddy | URL estable, expedientes independientes por navegador | [Despliegue HTTPS](deploy/README_ES.md) |
| Web Cloudflare / PWA instalada | **Solo datos ficticios**; vista web limitada y PWA instalada completa | [Publicación e instalación](deploy/CLOUDFLARE_PAGES_ES.md) |

Una URL HTTPS compartida **no sincroniza navegadores, crea cuentas ni guarda auditorías en el servidor**.

## Estructura del repositorio

\`\`\`text
RabbitMole/
├── index.html                  # Entrada de la aplicación
├── manifest.webmanifest        # Manifiesto PWA
├── sw.js                       # Caché offline versionada
├── js/                         # Flujos, almacenamiento y exportación
├── css/                        # Temas accesibles e impresión A4
├── fonts/                      # Atkinson Hyperlegible local
├── icons/app.png               # Identidad visual
├── discovery/                  # Inventario autorizado independiente
├── deploy/                     # HTTPS y paquete web/PWA
├── tests/                      # Pruebas offline y de navegador
├── rabbitmole.sh          # Instalador Linux/macOS (RabbitMole installer)
└── rabbitmole.ps1         # Instalador PowerShell (RabbitMole installer)
\`\`\`

## Validación

El [workflow de calidad](.github/workflows/ci.yml) comprueba enlaces documentales, recursos de la PWA y sintaxis de scripts. Ejecuta las comprobaciones básicas:

\`\`\`bash
python3 -m unittest discover -s tests -p 'test_readme.py'
python3 tests/test_static.py
node tests/test_shell_resources.cjs
bash -n rabbitmole.sh collect-local.sh discovery/run.sh discovery/setup.sh
\`\`\`

Python y Node.js se usan para **desarrollo y validación**, no son requisitos de la PWA alojada. Las pruebas estáticas no sustituyen las de navegador sobre accesibilidad, exportaciones, informes PDF y funcionamiento offline.

## Documentación

| Necesitas… | Referencia |
| --- | --- |
| Instalar, actualizar o recuperar auditorías | [Instalación](INSTALLATION_ES.md) · [Installation (EN)](INSTALLATION.md) |
| Consultar todas las funciones y sus límites | [Referencia detallada](docs/FEATURE_REFERENCE_ES.md) · [Reference (EN)](docs/FEATURE_REFERENCE.md) |
| Proteger datos y configurar conexiones | [Seguridad](SECURITY_ES.md) · [Security (EN)](SECURITY.md) |
| Adaptar cláusulas legales de los informes | [Notas legales](LEGAL_ES.md) · [Legal (EN)](LEGAL.md) |
| Desplegar una instancia HTTPS | [Docker / Caddy](deploy/README_ES.md) · [Deployment (EN)](deploy/README.md) |
| Publicar una demostración limitada | [Cloudflare Pages](deploy/CLOUDFLARE_PAGES_ES.md) |
| Recoger información de red autorizada | [Guía Discovery](discovery/README_ES.md) |
| Comunicar incidencias o mejoras | [GitHub Issues](https://github.com/sempitern0/RabbitMole/issues) |

---

<p align="center">
  <strong>RabbitMole — tus evidencias, tu alcance, tus decisiones.</strong><br>
  <a href="#inicio-rápido">Empezar</a> · <a href="README.md">Read in English</a>
</p>

## Publicar una versión controlada

Desde la raíz: `npm ci` y `npm run deploy:check`. La [guía de Cloudflare](deploy/CLOUDFLARE_PAGES_ES.md) describe el Worker existente, los comandos de build/deploy, el entorno `production` y las pruebas en dispositivos. CI no publica automáticamente.

### Auditoría WiFi desde un dispositivo

El **Diccionario técnico → WiFi** incorpora 20 conceptos y cuatro mini guías para WiFi corporativa, invitados, cobertura y revisión desde móviles/tablets. Incluye referencias oficiales, evidencias recomendadas y limitaciones. Sus comandos son orientativos y de lectura; RabbitMole no ejecuta escaneos radio desde el navegador. Verifica alcance y autorización antes de probar conectividad o segmentación.

### Ayuda técnica contextual durante la auditoría

El icono de información de cada campo abre una ficha superpuesta del diccionario sin sustituir el formulario, cambiar de paso ni modificar el historial. Consulta definiciones, comprobaciones, evidencias y advertencias incluso sin conexión. Ciérrala con **Escape**, «Volver al campo» o el icono de cierre. «Abrir ficha completa» conserva el regreso al paso original mediante el historial del navegador.

### Selección de fabricante y modelo del router

En **Redes → Seguridad del router/gateway**, selecciona fabricante y modelo mediante listas relacionadas. «Otro / escribir…» permite introducir equipos que no figuren en el catálogo offline. Las sugerencias no acreditan el modelo, firmware ni el estado de soporte: confirma siempre la identificación mediante evidencias. Los iconos de ayuda utilizan un SVG uniforme, legible con todas las paletas.
