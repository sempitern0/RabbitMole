# Guía de campo · RabbitMole en un móvil

> Auditoría de servidor y red en un centro académico. Preparación y uso **sin depender de una tablet**.
> No sustituye la autorización del titular, el alcance contratado ni las políticas de protección de datos.

## Hoy, antes de salir (10–20 minutos)

1. Abre la URL de producción HTTPS de RabbitMole en **Chrome o Edge (Android)**, o **Safari (iPhone)**. Instala desde el menú (Android: «Instalar app»; iPhone: Compartir → «Añadir a pantalla de inicio»). **Ábrela desde el icono**. No asumas que la rama de una PR está publicada: verifica la versión desplegada.
2. En **Protección del trabajo offline → Comprobar**, espera a «Recursos offline completos». La persistencia de almacenamiento no está garantizada y no es requisito para funcionar sin conexión.
3. Crea un **expediente ficticio**, rellena datos de muestra en Hardware y Redes, prueba guardar, tomar una fotografía no sensible desde Evidencias, y generar/exportar un JSON. Localiza el archivo desde el gestor de archivos.
4. Cierra completamente la PWA, activa **modo avión**, abre desde su icono y verifica que el expediente y la navegación siguen disponibles. Prueba también guardar una pequeña modificación. Recupera conectividad.
5. Mantén suficiente batería, cargador, almacenamiento y el método de acceso a una red de auditoría **expresamente autorizada**. Protege el móvil mediante bloqueo de pantalla y no sincronices capturas sensibles automáticamente con nubes personales.

La tarjeta superior de instalación incluye una **lista previa plegable** que puedes consultar sin conexión: no envía datos, no guarda las casillas y no concede autorización de red.

## Mañana: orden mínimo de auditoría

| Momento | Sección RabbitMole | Qué registrar |
| --- | --- | --- |
| Inicio | Cliente y alcance | Responsable, sede, horario, autorización, sistemas permitidos y exclusiones |
| Servidor | Hardware / Software | Equipo, ubicación, fabricante/modelo, SO y versión, roles, discos, parches, respaldo y administración (según evidencia) |
| Red | Redes | IP/máscara, gateway, DNS, VLAN declarada, topología, firewall, switches/AP y reglas comunicadas |
| Verificaciones | Controles / Hallazgos | Control probado, método, resultado, riesgo, severidad justificada, evidencia y limitaciones |
| Cierre | Evidencias / Calidad / Informe | Fotos permitidas, notas técnicas, pendientes, respaldo JSON y resumen de resultados |

**No marques como comprobado algo que no pudiste observar.** No atribuyas VLAN, aislamiento, versiones o vulnerabilidades a un host solo por responder a un ping. Para un centro con alumnado, evita fotografías de estudiantes, nombres, pantallas con datos personales, contraseñas, tokens o listas de usuarios. Documenta cualquier restricción de acceso como limitación.

## Preparar Android con Termux (opcional)

**Termux solo existe en Android.** No forma parte de RabbitMole ni modifica la PWA. Consulta las instrucciones oficiales de [Termux](https://github.com/termux/termux-app) y obtén la app desde [F-Droid](https://f-droid.org/packages/com.termux/) o las [versiones de GitHub](https://github.com/termux/termux-app/releases). No mezcles versiones de Termux y complementos firmados por diferentes proveedores.

1. Conéctate a Internet **antes** de salir al campo, abre Termux y actualiza paquetes. Python 3.9+ y Git son suficientes para obtener el motor; Nmap es opcional, y se utiliza para detección de hosts sin puertos.
2. Si necesitas sacar la captura por el gestor de archivos de Android, ejecuta `termux-setup-storage`, acepta el permiso del sistema y comprueba `~/storage/downloads`. No es necesario dar acceso al almacenamiento compartido si vas a conservar el archivo en el espacio privado de Termux.
3. Descarga el código de RabbitMole; usa `main` para la versión disponible en la rama estable. Mientras esta PR siga sin fusionar, para probarla sustitúyelo por `git clone --branch feature/pwa-version-offline-fallback-20261018 --depth 1 https://github.com/sempitern0/RabbitMole.git` en un directorio vacío.

```sh
pkg update
pkg upgrade
pkg install python git nmap
termux-setup-storage
git clone --depth 1 https://github.com/sempitern0/RabbitMole.git
cd RabbitMole
python discovery/discover.py doctor
```

`doctor` es **pasivo**: muestra la versión de Python y los motores disponibles sin escanear. Si indica que no hay Nmap ni ping funcional, la PWA seguirá siendo utilizable y podrás capturar observaciones manualmente. Android puede restringir Nmap, ICMP, interfaces de red o procesos en segundo plano, sobre todo sin root; **no** eludas estas protecciones.

### Ejecutar Discovery únicamente en redes autorizadas

Antes de realizar tráfico de descubrimiento, documenta el titular, las restricciones y el **CIDR IPv4 RFC1918 alineado** autorizado (máximo 1024 direcciones en el CLI). Ya conectado a la red permitida:

```sh
python discovery/discover.py wizard
```

El asistente solicita CIDR, motor, archivo `.json` nuevo (por ejemplo `~/storage/downloads/captura-lan-AAAAMMDD.json`) y confirmación literal `AUTORIZO`. No instala agentes ni escanea puertos. **No se ejecuta ningún reconocimiento sin esa confirmación.** La salida puede contener direcciones IP de infraestructura y debe tratarse como dato sensible: no se cifra automáticamente al dejarla en Descargas.

Abre RabbitMole desde el icono: primero **Hardware → Captura asistida**, selecciona el archivo JSON y revisa los registros; después **Redes → Captura asistida**, importa el mismo archivo para revisar el segmento. El navegador no ejecuta Python, ping o Nmap, y ninguna fila entra automáticamente sin revisión. La falta de respuesta no demuestra que un host no exista ni acredita VLAN, políticas de firewall o vulnerabilidades.

Para operaciones adicionales de administración, utiliza SSH **solo con permiso específico**, cuenta de mínimo privilegio y comprobación de huella del servidor. No copies credenciales en JSON ni en notas.

## Preparar iPhone/iPad (iOS/iPadOS): sin Termux

No existe **Termux para iOS**. Puedes utilizar [a-Shell](https://github.com/holzschu/a-shell) como terminal con herramientas Unix/Python, o [iSH](https://github.com/ish-app/ish) como entorno Linux emulado, siempre desde canales oficiales. Son **alternativas para tareas locales, no equivalentes a una instalación Linux/Termux**; no prometemos que puedan ejecutar Nmap, detectar interfaces o emitir ICMP desde iOS. En a-Shell puedes comprobar de forma pasiva:

```sh
help -l
python3 --version
```

La ruta recomendada en iPhone/iPad es instalar RabbitMole desde Safari (Compartir → Añadir a pantalla de inicio), comprobar la apertura offline y **utilizar el motor Discovery en un PC de auditoría autorizado**. Guarda su captura JSON en la app **Archivos** del iPhone/iPad por un canal aprobado (sin adjuntarlo a servicios personales). Luego importa y revisa el mismo archivo desde Hardware y Redes → Captura asistida.

Opcionalmente, un PC puede servir el puente de Discovery mediante HTTPS LAN y token efímero con certificado TLS confiable y origen exacto de la PWA; la compatibilidad de Safari, CORS y permisos de red local debe probarse **antes** de usarlo en campo. [Apple documenta el permiso de red local](https://support.apple.com/en-us/102229). Las terminales iOS están aisladas por sandbox; usa Archivos o el selector de documentos, no rutas de Termux.

## Verificación conjunta antes de salir

- En Android: confirma que `doctor` funciona y que un JSON de prueba **no sensible** puede abrirse desde el selector de archivos de la PWA. En iOS: confirma el intercambio mediante Archivos, sin depender de ejecutar Discovery en el terminal.
- Importa el JSON de prueba con revisión previa en Hardware y Redes; verifica que los registros existentes no se sobrescriben sin aprobación.
- Cierra la PWA, activa modo avión, ábrela desde el icono y confirma que el expediente de prueba sigue accesible. La terminal y Discovery pueden requerir red para ejecutar reconocimiento; **la consulta y edición de la PWA** son lo que se verifica offline.
- Conserva copias de seguridad cifradas fuera del navegador. Borra capturas temporales de red o ficheros compartidos de acuerdo con la política de retención, nunca antes de completar la entrega aprobada.

## Cierre y contingencias

- Exporta el expediente JSON **antes de abandonar el centro** y verifica que existe el archivo; si debes compartirlo, usa únicamente un canal aprobado por el cliente.
- No dependas de **Conexiones online/Nextcloud** salvo que hayas probado antes el servidor, CORS y permisos.
- Si pierdes cobertura, sigue tomando notas en la PWA ya probada offline. Si falla el arranque, no borres «datos del sitio», no desinstales y no limpies cachés antes de exportar o recuperar el trabajo.
- Cuando regreses a un PC, importa una copia del JSON en el mismo esquema y prepara el informe final con calma; el móvil no tiene que resolver todas las pruebas durante la visita.

## Estado de entrega

La aplicación móvil instalada muestra la **versión publicada**, no necesariamente la última rama de desarrollo. Revisa `release.json` de la distribución y valida el comportamiento de la instalación real antes de recopilar datos de un cliente.
