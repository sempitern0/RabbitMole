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

## Android: terminal opcional (Termux)

Termux es un **complemento**, no parte de la PWA. Instálalo desde su distribución oficial en F-Droid o GitHub; no mezcles fuentes de firma. En Termux:

```sh
pkg update
pkg install python git openssh nmap
termux-setup-storage
git clone --branch feature/pwa-version-offline-fallback-20261018 --single-branch \
  https://github.com/sempitern0/RabbitMole.git
cd RabbitMole
python discovery/discover.py doctor
```

Solo si la organización ha autorizado un **CIDR concreto** y hay conectividad en la red prevista, puedes usar el asistente:

```sh
python discovery/discover.py wizard
```

Escribe el CIDR aprobado, selecciona el motor compatible, elige un nombre nuevo en `~/storage/downloads/captura-centro-AAAAMMDD.json` y confirma `AUTORIZO` únicamente después de revisar el alcance. El asistente no realiza escaneo de puertos; descubre hosts que responden. Android puede bloquear operaciones Nmap/ICMP o impedir detectar interfaces sin root. **No intentes eludir esas restricciones ni escanees desde la Wi-Fi de invitados si no está incluida en el alcance.**

Importa el JSON en **Hardware → Captura asistida** y luego en **Redes → Captura asistida**, revisando cada incorporación. Si Discovery no funciona, usa captura manual: la auditoría de servidor y red puede continuar con evidencias autorizadas y observación directa.

Para administración de un servidor, utiliza **SSH solo si se ha autorizado**, idealmente con cuenta de lectura y verificación de huella de host. No guardes contraseñas en notas, capturas o archivos compartidos.

## Cierre y contingencias

- Exporta el expediente JSON **antes de abandonar el centro** y verifica que existe el archivo; si debes compartirlo, usa únicamente un canal aprobado por el cliente.
- No dependas de **Conexiones online/Nextcloud** salvo que hayas probado antes el servidor, CORS y permisos.
- Si pierdes cobertura, sigue tomando notas en la PWA ya probada offline. Si falla el arranque, no borres «datos del sitio», no desinstales y no limpies cachés antes de exportar o recuperar el trabajo.
- Cuando regreses a un PC, importa una copia del JSON en el mismo esquema y prepara el informe final con calma; el móvil no tiene que resolver todas las pruebas durante la visita.

## Estado de entrega

La aplicación móvil instalada muestra la **versión publicada**, no necesariamente la última rama de desarrollo. Revisa `release.json` de la distribución y valida el comportamiento de la instalación real antes de recopilar datos de un cliente.
