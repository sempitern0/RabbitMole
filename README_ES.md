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

Desde la raíz: `npm ci` y `npm run deploy:check`. Para **validar localmente sin GitHub Actions**, instala Chromium una vez con `npx playwright install chromium` y ejecuta `npm run test:local`: comprobaciones estáticas, unitarias y de empaquetado, seguidas de pruebas Chromium para PWA y PDF A4 ejecutivo/técnico. Para conservar ambos PDF, configura `PDF_ACCEPTANCE_DIR` con un directorio local de salida. Superar las pruebas locales no publica automáticamente en Cloudflare. La [guía de Cloudflare](deploy/CLOUDFLARE_PAGES_ES.md) describe el Worker existente, los comandos de build/deploy, el entorno `production` y las pruebas en dispositivos. CI no publica automáticamente.

### Auditoría WiFi desde un dispositivo

El **Diccionario técnico → WiFi** incorpora 20 conceptos y cuatro mini guías para WiFi corporativa, invitados, cobertura y revisión desde móviles/tablets. Incluye referencias oficiales, evidencias recomendadas y limitaciones. Sus comandos son orientativos y de lectura; RabbitMole no ejecuta escaneos radio desde el navegador. Verifica alcance y autorización antes de probar conectividad o segmentación.

### Ayuda técnica contextual durante la auditoría

El icono de información de cada campo abre una ficha superpuesta del diccionario sin sustituir el formulario, cambiar de paso ni modificar el historial. Consulta definiciones, comprobaciones, evidencias y advertencias incluso sin conexión. Ciérrala con **Escape**, «Volver al campo» o el icono de cierre. «Abrir ficha completa» conserva el regreso al paso original mediante el historial del navegador.

### Selección de fabricante y modelo del router

En **Redes → Seguridad del router/gateway**, selecciona fabricante y modelo mediante listas relacionadas. «Otro / escribir…» permite introducir equipos que no figuren en el catálogo offline. Las sugerencias no acreditan el modelo, firmware ni el estado de soporte: confirma siempre la identificación mediante evidencias. Los iconos de ayuda utilizan un SVG uniforme, legible con todas las paletas.

### Informes externos de análisis WiFi en Redes

En **Redes → Análisis WiFi externo** puedes adjuntar primero un informe **PDF de cualquier herramienta**, identificando de forma opcional el programa o procedencia y la fecha del análisis. El PDF queda protegido en el expediente con huella SHA-256 y también figura en **Documentación complementaria**. Los PDFs se entregan separados del informe principal, no se fusionan. El límite es de 2 MiB por PDF, cuatro anexos y 6 MiB en total.

Opcionalmente puedes importar **CSV** con encabezados habituales de SSID/BSSID, equipos o latencia, en español o inglés, con comas o punto y coma. Los CSV de Acrylic ya registrados siguen siendo compatibles. Una herramienta sin CSV reconocible puede documentarse igualmente mediante PDF; no es obligatorio usar Acrylic ni introducir resultados tabulares. El HTML externo no se ejecuta y las observaciones no crean activos ni hallazgos automáticamente.

### Mitigaciones gestionadas y verificables

En **Hallazgos → Plan de mitigación** puedes crear acciones correctivas desde procedimientos locales orientativos o personalizarlas. Cada acción registra objetivo, pasos, impacto, reversión, responsable, fecha, aprobación, referencia de cambio, intervención y evidencia. Los estados (propuesta, autorizada, programada, aplicada, bloqueada o revertida) describen el trabajo ejecutado; **no se realizan comandos ni cambios de infraestructura desde la PWA**. La aplicación exige autorización antes de marcar una acción como aplicada y conserva el expediente en JSON. Una acción aplicada **no cierra el hallazgo**: el auditor debe registrar una verificación independiente en **Seguimiento**. El plan se refleja en el resumen y el PDF técnico.


### Verificación individual, riesgo residual y mantenimiento

Cada acción aplicada puede registrar comprobaciones individuales con fecha, auditor, resultado y evidencia. Estas verificaciones no cierran automáticamente el hallazgo. En **Hallazgos → Riesgo residual** el auditor puede documentar valoraciones justificadas, responsables, fechas y revisiones previstas, preservando el historial. **Calidad** y **Seguimiento** muestran acciones vencidas, eficacia demostrada, comprobaciones fallidas y valoraciones residuales pendientes, sin calcular una reducción automática de riesgo.

Los PDF adjuntos se pueden descargar, quitar o editar mediante un formulario desplegable accesible en las secciones de WiFi y Documentación complementaria. Editar nombre, procedencia o fecha no cambia los bytes del PDF ni su SHA-256. Las modificaciones en expedientes confirmados requieren una rectificación. Los paneles abiertos se mantienen durante la actualización de datos en el mismo apartado.

La aplicación utiliza únicamente el esquema JSON v3 actual. Se han retirado rutas de interfaz que ya no se usan, manteniendo las claves de almacenamiento del navegador y el aislamiento de las versiones de caché para proteger los expedientes locales existentes.

### Modularización gradual

Los formularios de riesgo residual, los indicadores de mitigación y los controles de anexos PDF se renderizan ahora desde `js/audit-workflow-views.js`, un módulo sin efectos secundarios que se precarga para trabajar offline. `js/app.js` conserva las responsabilidades de estado, almacenamiento, bloqueo documental, informes y navegación. La validación `npm run check` incluye pruebas específicas del contrato de estas vistas. Se mantienen el esquema JSON vigente y las claves de almacenamiento local.

La gestión de acciones correctivas y adjuntos se delega ahora en `js/audit-actions.js`, con dependencias explícitas y pruebas sobre bloqueos documentales. Se preservan las claves locales y el JSON v3.

La eliminación de evidencias ahora advierte si el registro se utiliza en hallazgos, mitigaciones, reevaluaciones o valoraciones residuales. Control de calidad señala referencias históricas cuyo documento haya desaparecido. Estas comprobaciones no eliminan ni reescriben automáticamente las referencias.

### Almacenamiento y PWA móvil

«Proteger almacenamiento» solicita al navegador persistencia para reducir el riesgo de eliminación automática de los datos; ahora comunica claramente si se concede, se rechaza o no está disponible. **No cifra expedientes ni reemplaza las copias JSON**. Los filtros de registros presentan una barra fija diferenciada en pantallas grandes y una disposición no fija en móviles pequeños. Para instalar en iPhone/iPad utiliza Safari → Compartir → Añadir a pantalla de inicio y abre desde el icono. La instalación y las garantías de almacenamiento dependen del navegador y del sistema operativo; prueba el arranque offline antes de trabajar en campo.

### Gestión CSV WiFi y panel de instalación

Las importaciones CSV nuevas se almacenan por archivo y categoría, con un botón «Quitar CSV» que permite retirar una captura sin afectar al informe PDF ni a los demás CSV. Si se importa otro archivo del mismo tipo, su información pasa a ser la vista activa y la anterior permanece recuperable al quitarlo. Las importaciones anteriores a esta mejora se conservan como grupo histórico, ya que el formato anterior no permitía atribuir filas a cada nombre de archivo. El panel superior de instalación se distingue visualmente de los formularios y mantiene etiquetas, navegación por teclado y contraste por tema.

### Validación táctil previa a auditorías móviles

Se han incorporado comprobaciones de tamaño y desbordamiento del selector de pasos en pantallas de móvil y estilos para evitar el zoom de Safari al enfocar campos pequeños. En dispositivos táctiles se mantienen controles con objetivos de al menos 44 px donde corresponda. Antes de usar un expediente real: instalar y abrir desde el icono, comprobar caché completa, editar y guardar un registro, capturar una evidencia, exportar una copia JSON y verificar el arranque sin conexión. La emulación de Chromium no sustituye una prueba física Android/iOS.

### Ergonomía exclusiva de Android

En móviles y tablets Android con pantalla táctil, RabbitMole aplica una capa de presentación que mejora la alineación de campos, tamaño de etiquetas y controles, distribución de acciones, adjuntos y selector de pasos. No modifica los datos, el flujo offline ni el escritorio/iOS. Esta capa se incluye en la caché PWA y dispone de prueba automatizada de detección de dispositivo; la validación en hardware real sigue siendo necesaria.

### Mantenimiento incremental de la navegación

La búsqueda, los filtros y el acceso rápido a registros se gestionan desde `js/audit-record-navigation.js`. `js/app.js` conserva el estado de la auditoría, el guardado y la navegación general. Se reutilizan los mismos identificadores de interfaz y se mantiene una prueba de búsqueda que cubre acentos, filtros y aislamiento entre expedientes. La capa de estilos Android elimina selectores repetidos sin afectar a escritorio o iOS.

### Refactorización de campos de auditoría

El HTML de los campos (entradas, desplegables, selectores táctiles, datalist, relaciones con evidencias y ayuda del diccionario) se genera desde `js/audit-field-renderer.js`. `app.js` conserva el estado, las validaciones y el autoguardado. Se han comprobado once variantes de campos comparando exactamente el HTML anterior con el nuevo. La integración se precarga para uso offline, cuenta con una prueba de contrato y mantiene el esquema JSON v3 y los flujos Android existentes.

### Auditoría de racks y seguridad física

En **Inventario de hardware** crea un activo de tipo **Rack de servidores** o **Rack de comunicaciones**. Aparecerá una ficha opcional desplegable de **Revisión física y ambiental**, organizada en ocupación, climatización, energía y seguridad física/perímetro. Registra la altura y ocupación U, temperatura medida en entrada, humedad, ventilación, sensores, exposición al agua, PDU, SAI, tierra, incendio, acceso, mantenimiento, cableado y segmentación. Las observaciones manuales no equivalen a conformidad automática.

Desde la ficha puedes abrir las plantillas **Racks, CPD y seguridad física** (10 controles PHY-01 a PHY-10), relacionar evidencias/fotografías, documentar desviaciones y utilizar el flujo existente de mitigación y reevaluación. Las reglas de firewall continúan evaluándose con los controles de **Redes y perímetro**. Contrasta los límites ambientales con el fabricante, las recomendaciones ASHRAE aplicables y la normativa local. No manipules equipos energizados ni registres secretos de acceso.

Se mantiene el esquema JSON v3, el informe técnico y el funcionamiento offline. Los activos que no son racks no muestran el cuestionario.

### Catálogo ampliado de routers, ONT y firewalls · ocupación de racks

En Infraestructura de red selecciona primero el tipo **Router**, **ONT** o **Firewall** para filtrar fabricantes y modelos. Las sugerencias son orientativas y offline: no prueban existencia, firmware, soporte o compatibilidad del hardware. Puedes introducir modelos personalizados, y se mantienen los campos y modelos previos del expediente.

La revisión de racks incorpora un **mapa de ocupación por U**, desde U1 en la parte inferior, a partir de los equipos inventariados con ID de rack asociado, posición inicial U, altura U y vista frontal/posterior. Se detectan posiciones fuera de límites y solapamientos de forma informativa: no se realizan cambios físicos. El rack permite referenciar evidencias de fotografías frontales y posteriores mediante sus ID; las imágenes siguen bajo custodia del apartado Evidencias. Los datos forman parte de los activos y de los informes técnicos sin migrar JSON v3. La evolución futura puede incorporar series temporales ambientales estructuradas, con sensores y fecha de medición.

### Instalación sencilla de servidores

Al registrar un activo de tipo **Servidor físico** o **Servidor virtual**, el campo existente **Sistema operativo / firmware** se presenta como selector táctil agrupado: Windows Server, Ubuntu/Debian, Linux empresarial y plataformas de virtualización. Se conserva «Otro / escribir…» y cualquier valor guardado previamente. El selector vuelve al formato flexible habitual para activos que no sean servidores. La ficha opcional **Instalación y función del servidor** recoge únicamente función, fecha comprobada, modalidad, almacenamiento de arranque, administración remota y observaciones. IP, sede, hardware y ubicación U permanecen en sus campos de inventario para no duplicar información. Ningún dato supone conformidad automática y el esquema JSON v3 permanece intacto.

### Consolidación del inventario

Las listas reutilizables del inventario residen en `js/audit-inventory-presets.js`. El catálogo de sistemas operativos tiene una sola fuente: `js/os-catalog.js`. Sin cambios en expedientes JSON v3, almacenamiento, navegación ni personalizaciones. La prueba de racks se ha ajustado a la firma actual.

### Calidad de instalaciones e informes modulares

Control de calidad revisa ahora la coherencia de los datos **documentados** de racks y servidores: altura/ocupación U, vínculos con racks, posiciones fuera de capacidad, solapamientos en la misma cara, fechas de instalación y fotografías referenciadas que falten. Son **avisos**, nunca evaluaciones automáticas de conformidad; los campos opcionales sin rellenar no bloquean auditorías anteriores. La preparación de estadísticas, revisión documental, cartera de mitigación y reevaluación se ha separado en `js/audit-report-data.js` sin alterar el HTML de los informes ejecutivos, técnicos o de seguimiento. Se mantienen los expedientes JSON v3, la caché offline y la navegación Android.

### Informe ejecutivo, técnico y pruebas de impresión

El **ejecutivo** incluye una síntesis de cobertura física y servidores, sin direcciones IP, versiones de sistemas ni inventario detallado; las decisiones siguen fundamentadas en los hallazgos documentados, nunca en supuestas conformidades. El **técnico** añade ubicación documental en racks, posiciones U, sistemas y funciones de servidores y referencias a evidencias frontal/posterior, además del inventario, los controles y la trazabilidad existentes. Los PDF externos se enumeran por nombre y SHA-256: se entregan aparte, no se fusionan. La impresión conserva la página de firmas y controla títulos, tablas y fotografías al paginar. El conjunto E2E de Chromium verifica los dos perfiles y genera PDF A4 en el entorno CI; `PDF_ACCEPTANCE_DIR` permite guardar las muestras para revisión visual. La impresión real de iOS/Android no se considera validada por esta emulación.

### Versión visible y recuperación offline

El pie de la aplicación muestra la versión del producto (`package.json`: `1.0.0`) de forma discreta y legible en todos los temas. El identificador técnico del shell activo aparece al situar el puntero sobre la versión; no requiere consultar un servidor ni expone datos de la auditoría.

El service worker precarga todos los recursos esenciales antes de aceptar una actualización. Si no puede completarse, se conserva el release instalado. Si la caché más reciente deja de ser utilizable, se selecciona una caché anterior completa cuando el navegador todavía la conserva, sin mezclar archivos estáticos entre versiones. Antes de trabajar sin conexión, utiliza «Mantenimiento y modo offline → Comprobar» y verifica un arranque desde el icono. Los navegadores pueden eliminar cachés por espacio; exporta periódicamente el expediente JSON.


### Persistencia del almacenamiento: por qué puede no concederse

La concesión de `navigator.storage.persist()` depende del navegador y **no puede forzarse desde JavaScript**. Chromium puede rechazarla automáticamente por heurísticas de instalación y uso; Firefox puede mostrar un permiso del sitio. La solicitud se ejecuta directamente desde el botón para conservar la activación del usuario. Una respuesta negativa no significa que IndexedDB o la caché offline estén averiados, ni que el navegador vaya a borrarlos de inmediato. Verifica `Comprobar`, inicia la PWA desde su icono, utiliza el mismo origen y perfil de navegador y conserva copias JSON protegidas fuera de la aplicación. La cuota indicada es estimativa y no constituye un permiso de persistencia. Borrar los datos del sitio, utilizar navegación privada o limpiar el almacenamiento puede eliminar expedientes incluso con persistencia concedida.

### Paleta de marca por defecto

En nuevas instalaciones, RabbitMole utiliza la paleta **RabbitMole · Marca**: azul noche, acero azulado, gris pizarra y marfil cálido para mantener una lectura profesional y diferenciada de «Océano». El selector del menú lateral permite continuar usando todas las paletas anteriores. **La preferencia ya almacenada** en `rabbitmole:palette:v1` no se modifica por una actualización; el nuevo valor solo se utiliza cuando no existe una elección guardada o cuando el valor guardado no está disponible. La portada PDF sigue la paleta seleccionada, manteniendo el cuerpo en papel claro para su lectura e impresión. La paleta se inspira en los tonos de identidad definidos en los estilos actuales y no implica una extracción automática de píxeles del PNG del icono.


## Arquitectura actual y optimización del repositorio

RabbitMole utiliza una arquitectura **JavaScript estático, sin dependencias remotas en tiempo de ejecución**, preparada para uso offline. `js/app.js` conserva el estado de la sesión, navegación, eventos y composición de informes; `js/app-definitions.js`, `js/app-model.js` y `js/app-team.js` son fábricas con responsabilidades de campos, JSON v3 e identidades. Las implementaciones de inventario, mitigación, impresión, almacenamiento y conectividad ya se distribuyen entre módulos especializados.

El diccionario de **182 conceptos** mantiene su interfaz pública `AuditGlossary`, ahora con datos separados y compactos:

| Archivo | Responsabilidad |
| --- | --- |
| `js/glossary-terms.js` | Conceptos, sinónimos, ejemplos, evidencias y referencias; registros compactos |
| `js/glossary-guides.js` | Diagnósticos, comandos y criterios de interpretación por sistema |
| `js/glossary.js` | Reconstrucción de objetos públicos, búsqueda, ayuda contextual, protocolos y guías macOS |
| `css/glossary.css` | Presentación adaptable, guía paso a paso y comandos con contraste |
| `js/app.js` | Navegación y renderizado de la vista, sin duplicar el catálogo |

Esta distribución conserva las búsquedas y los identificadores de los términos, y reduce en unos **57 KB (~26 %) el código fuente total del glosario**; no equivale a reducir todo el repositorio en ese porcentaje. Se mantienen scripts separados en el service worker, los instaladores y el despliegue web para su arranque offline.

### Uso del diccionario y sus guías

Desde la PWA, entra en **Diccionario técnico**, busca términos o sinónimos y filtra por temática. Selecciona un concepto para consultar definición, verificaciones, evidencia, cautelas, protocolos de auditoría y, cuando existen, alternativas de consola por plataforma. **Copiar** no ejecuta el comando; revisa siempre el alcance, el equipo y el permiso antes de utilizarlo. Los comandos pueden consultar la red y sus resultados requieren interpretación y corroboración. El acceso contextual desde campos del expediente permite volver al asistente.

### Discovery desde un PC o Android

En una estación de auditoría, ejecuta `python discovery/discover.py doctor` para una comprobación legible (usa `doctor --json` para integraciones) y `python discovery/discover.py wizard` para el asistente con confirmación de CIDR. Una tablet Android puede ejecutar Python y herramientas compatibles mediante **Termux** y después importar el JSON generado; en la PWA instalada también existe un bridge HTTPS opcional ejecutado desde un equipo de la LAN. Consulta [la guía Discovery](discovery/README_ES.md): certificado confiable, token temporal, autorización y limitaciones de Nmap/ping en Android. Discovery no identifica automáticamente políticas de segmentación efectivas.

### Mantenimiento, instalación y validación

Para instalar, consulta [INSTALLATION_ES.md](INSTALLATION_ES.md). Al introducir archivos JavaScript o CSS nuevos, los recursos deben figurar en el HTML, el precache del service worker y ambos instaladores. La PWA instalada ofrece comprobación de recursos offline, actualizaciones confirmadas y recuperación desde el shell anterior disponible. La persistencia de almacenamiento se **solicita**, pero depende del navegador; exporta copias JSON periódicamente.

Validación local recomendada:

```bash
node tests/test_glossary_data.cjs
node tests/test_glossary.cjs
node tests/test_glossary_guide.cjs
npm run check
npm run test:browser
npm run deploy:check
```

Se requiere Node y, para pruebas de navegador, Chromium/Playwright instalado. Una prueba no ejecutada no confirma compatibilidad de dispositivo. Antes de desplegar verifica las comprobaciones de CI, CSP, perfiles público/instalado, instalación y arranque offline.

### Ajustes responsive y actualización de la paleta anterior

«Predeterminado» es la paleta RabbitMole inspirada en el icono. Una edición antigua almacenaba «Océano» automáticamente incluso sin selección del usuario: la primera apertura después de esta actualización lo migra una sola vez a «Predeterminado». Si eliges «Océano» de nuevo, se registra como elección explícita y se mantiene en siguientes aperturas; otras paletas guardadas permanecen intactas. El navegador no permite reconstruir con certeza si un valor antiguo de «Océano» era explícito, de modo que esta migración de compatibilidad es intencionada. No borres datos del sitio ni expedientes para cambiar de tema.

En **tabletas (hasta 1000 px)**, la navegación deja de ocupar una columna lateral fija, el selector de paleta se adapta al panel superior y las tablas de red se desplazan dentro de su propia sección. En **móviles (hasta 720 px)**, el menú global se organiza en cuadrícula, la navegación de auditoría se desplaza horizontalmente, los formularios pasan a una columna y los botones tienen objetivos táctiles suficientes. El modo Android conserva sus ajustes específicos cuando hay puntero táctil. Estos cambios afectan a la pantalla, no al PDF impreso. Antes de auditar en campo comprueba accesibilidad, arranque offline y la vista de formularios a 390 y 768 px.

### Aprovechar el espacio de pantalla

Usa **Contraer menú** en la cabecera lateral para dejar en escritorio una barra estrecha de iconos o plegar la navegación en tablet y móvil. Los iconos conservan nombre accesible y título; pulsa el mismo control para expandir. En inventarios largos, **Ocultar filtros** pliega el navegador sticky a una cabecera, manteniendo el botón para reabrir la búsqueda y el salto entre registros. Ambos estados se guardan solo en este dispositivo, no afectan a expedientes, PDF o exportaciones y respetan la preferencia de movimiento reducido del sistema.

### Fase 1: integridad y recuperación offline

RabbitMole verifica que el shell actual conserve la marca de instalación y los recursos esenciales; la marca sola no basta. Si pierde archivos puede elegir una caché anterior completa que permanezca en el navegador. El service worker local utiliza una versión de caché propia, mientras que Cloudflare la genera a partir del contenido del bundle. No borres manualmente CacheStorage para intentar recuperar un expediente: los datos de auditoría se almacenan aparte y deben exportarse regularmente en JSON. Valida actualización, arranque sin conexión y recuperación antes de desplegar.


## Guía práctica: Conexiones online (Nextcloud, correo y compartir)

**Conexiones online es opcional.** No sincroniza expedientes ni funciona como almacenamiento remoto automático. En la **PWA instalada** abre una auditoría y entra en **Conexiones online**. En la vista web pública permanecen desactivadas las credenciales y las transferencias.

### Nextcloud en cuatro pasos

1. En Nextcloud, crea una **contraseña de aplicación revocable** para el auditor y una carpeta destinada a sus entregas. Copia la URL WebDAV HTTPS de esa carpeta, por ejemplo `https://nube.example/remote.php/dav/files/usuario/Auditorias/`. Evita parámetros o credenciales en la URL. El certificado debe ser confiable y el servidor permitir CORS para el origen exacto de la PWA, incluidas las cabeceras de autorización y el método `PROPFIND`.
2. En RabbitMole selecciona **Nextcloud**, introduce URL, usuario, contraseña de aplicación y frase de paso local (mínimo 12 caracteres). Pulsa **Guardar perfil cifrado**. La configuración queda cifrada mediante AES-256-GCM/PBKDF2 en el dispositivo; la frase no se conserva y se necesitará para **Desbloquear perfil** en futuras sesiones.
3. Pulsa **Comprobar conexión (sin subir)**. Se hace una petición `PROPFIND Depth: 0` al directorio configurado. HTTP 207 o 200 confirma acceso de lectura a la carpeta, **no** permiso de escritura ni éxito de una futura transferencia. Un error 401 apunta a credenciales; 403 a permisos; 404 a ruta incorrecta; un error de red puede deberse a certificado, VPN, DNS o CORS. No se envía ningún expediente durante la comprobación.
4. Elige la operación: **Subir copia cifrada** (recomendado para respaldo) cifra el expediente localmente; **Subir PDF** requiere seleccionar y revisar un PDF ya generado; opcionalmente crea un enlace de lectura con contraseña y caducidad de 1–7 días. Todas las subidas requieren confirmación manual. El JSON legible queda bajo **Opciones avanzadas**, usa nombres únicos y no sobrescribe archivos ya existentes. La subida no garantiza por sí misma que el archivo sea una copia restaurable: verifica las entregas en Nextcloud.

El correo abre el cliente con un borrador: los adjuntos se añaden **manualmente**. **Compartir con el sistema** usa la función nativa del navegador cuando existe. Ninguno de esos canales requiere configurar Nextcloud. Google Drive/OneDrive/Microsoft 365 no cuentan todavía con un conector OAuth funcional; no introduzcas tokens ni claves de estos servicios.

**Seguridad y límites:** una copia cifrada protege el contenido antes del envío; un PDF o un JSON legible solo están protegidos durante el transporte HTTPS y quedan legibles en el destino. Entrega las contraseñas por un canal distinto. El botón de prueba no configura CORS ni comprueba que el destino tenga espacio. No se realizan sincronizaciones automáticas ni se almacenan tokens de compartición entre sesiones.

### Iconos coherentes con la paleta

Los iconos del menú principal y los símbolos de navegación de las fases de auditoría adoptan automáticamente el acento de cada paleta, también al pasar el ratón y en la sección activa. «Predeterminado» utiliza marfil sobre azul noche; otros temas mantienen su identidad (azul, grafito, verde bosque, violeta, etc.). Las barras de progreso del asistente usan el color principal del tema. Los colores semánticos de éxito, advertencia y error se conservan para evitar ambigüedades.

### Auditoría presencial desde un móvil

Antes de trabajar en un centro académico o empresa, consulta la [guía de campo para móvil](docs/AUDITORIA_MOVIL_ES.md): instalación Android/iPhone, prueba real de arranque offline, comprobación de guardado/fotografía/JSON, itinerario servidor + red, privacidad y Terminal Termux opcional. La tarjeta de instalación incorpora una lista previa plegable y utilizable sin conexión. La PR no publica automáticamente la versión en Cloudflare.

### Pantalla separada «Dispositivo e instalación»

La instalación y lista previa a auditorías móviles están disponibles en **Menú lateral → Dispositivo e instalación** (icono de móvil con el lateral contraído). No se muestra encima de las auditorías, pero mantiene la instalación desde Android/iOS, instrucciones offline y el checklist. Regresa a «Biblioteca de auditorías» para trabajar.

### Legibilidad y espaciado del diccionario

Las fichas del diccionario (incluidos «Ejemplo», evidencias, advertencias, mini-guías y el panel de ayuda contextual) mantienen márgenes interiores adaptados a la pantalla en todas las paletas. El espaciado vertical de las secciones ya no elimina el padding de sus recuadros. También se han revisado los contenedores de controles, formularios, comandos, análisis de red y aceptación de riesgo para conservar su separación sin añadir elementos de interfaz.

### Selectores ágiles en móvil y tablet

Para reducir escritura, Inventario ofrece listas nativas para CPU, RAM, almacenamiento, ubicación y antivirus/EDR; Redes, para canal y estándar Wi-Fi; Controles, para el marco de referencia; CVE y Evidencias, para la fuente de información. La opción **«Otro / escribir…»** acepta cualquier valor documentado, también valores procedentes de importaciones anteriores. Se sugieren primero valores ya utilizados en el expediente, pero nunca se rellenan comprobaciones automáticamente. IP, CIDR, gateway, hostname, número de serie, versiones y observaciones siguen admitiendo texto libre. No cambia el formato JSON v3 ni las exportaciones.


### Foto con sugerencias opcionales de identificación
Al tomar una fotografía desde **Evidencias**, la imagen se guarda primero. Si Chrome/Android dispone de la API nativa de lectura de códigos (`BarcodeDetector`) o reconocimiento local de texto (`TextDetector`, poco extendida) y se extrae una etiqueta identificable, RabbitMole puede mostrar una pequeña propuesta editable con número de serie, modelo, fabricante o hostname. El auditor elige un activo existente o crear uno nuevo y debe pulsar **Confirmar datos**. Un código aislado se muestra sin clasificar y requiere elegir campo manualmente. **Omitir** conserva la fotografía sin añadir datos; nunca se sobrescriben campos completos y el reconocimiento no acredita la identificación. No hay OCR en nube, rastreos, peticiones ni dependencia nueva; si el navegador no dispone de detector, sigue funcionando la captura normal. Fotografías adjuntas por cualquier otra vía conservan el flujo habitual.
