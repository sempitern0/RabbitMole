# Discovery · motor de reconocimiento desde un equipo auditor

[English](README.md) · **Español**

El motor funciona **desde un dispositivo externo conectado a la red del cliente**, sin instalar agentes en cada activo. No se integra como un escáner dentro del navegador: la PWA importa su JSON local.

## Inicio rápido, sin servicios ni cambios de permisos

El asistente guía al operador para elegir el alcance, el motor disponible y el archivo de salida. Detecta interfaces **sin tráfico de descubrimiento**, propone subredes locales compatibles y **nunca comienza a escanear automáticamente**. Es necesario escribir `AUTORIZO` después de revisar el CIDR.

- **Windows:** doble clic en `discovery/iniciar.cmd` desde la instalación, o `.\\discovery\\run.ps1` desde PowerShell.
- **Linux/macOS:** `bash discovery/run.sh`.
- También puedes ejecutar `python3 discovery/discover.py wizard` directamente.

Al finalizar, abre **Hardware → Captura asistida** en la PWA, importa la captura JSON y valida los equipos. Vuelve a importar **el mismo JSON** en **Redes → Captura asistida** para revisar el segmento. Los registros nunca se insertan automáticamente.

Si la herramienta no detecta interfaces compatibles (o tienes varias subredes), introduce manualmente el CIDR aprobado. No hace falta modificar políticas del navegador, ejecutar servidores locales, desactivar firewalls ni elevar privilegios para abrir el asistente.

## Preparar el equipo auditor

- Windows: PowerShell 5.1+; ejecuta `./discovery/setup.ps1` para diagnosticar. Instala herramientas opcionales con `./discovery/setup.ps1 -InstallTools` (winget). Reinicia la consola para actualizar PATH.
- Linux y macOS: `bash discovery/setup.sh --check`, o `bash discovery/setup.sh --install` para instalar Python 3 y Nmap faltantes con el gestor disponible.
- Python **3.9+** es imprescindible para este motor, pero no requiere paquetes de pip ni entorno virtual: solo biblioteca estándar. `ping` nativo puede sustituir a Nmap para el descubrimiento básico.

```bash
python3 discovery/discover.py doctor
python3 discovery/discover.py scan --cidr 192.168.10.0/24 --authorized --output captura-lan.json
```

En Windows puedes usar `./discovery/run.ps1 doctor` y `./discovery/run.ps1 scan --cidr 192.168.10.0/24 --authorized --output captura-lan.json`. En Linux/macOS se ofrece `bash discovery/run.sh`.

### Límites operativos

- Escanea **solo IPv4 RFC1918**, CIDR alineados y bloques de hasta **1024 direcciones**; no acepta redes públicas ni 0.0.0.0/0.
- Exige autorización expresa mediante `--authorized`; especifica el alcance acordado con el cliente. No implica que el programa pueda verificar dicha autorización.
- Prefiere Nmap instalado (`-sn`, sin escaneo de puertos) y si no existe usa ICMP con `ping` del SO, con concurrencia acotada (máximo 32). Puedes forzar `--backend native` o `--backend nmap`.
- No requiere credenciales, no instala nada en hosts remotos, no consulta vulnerabilidades ni enumera software. Respuesta ICMP/Nmap no equivale a inventario completo. Equipos sin respuesta pueden existir.
- La red incorporada al JSON indica **el alcance observado**, no una VLAN, gateway o DNS confirmado.
- No sobrescribe resultados existentes. Los archivos contienen datos potencialmente sensibles de infraestructura: conservarlos cifrados y borrarlos según la política acordada.

## Llevar resultados a RabbitMole

En el expediente abre **Hardware → Captura asistida**, importa el JSON y confirma las filas nuevas; después cambia a **Redes → Captura asistida** e importa el *mismo archivo* para incorporar el CIDR observado. El importador existente detecta duplicados/conflictos y no sobreescribe filas. Los datos permanecen pendientes de revisión.

## Diagnóstico de errores

`doctor` comprueba versión de Python, SO, ruta de Nmap/ping y presenta sugerencias. Si Nmap no está en PATH, se selecciona ping nativo. Si el auditor tiene políticas restrictivas que impiden ICMP, puede haber falsos negativos. Acceso a otras VLAN/subredes requiere enrutamiento y permiso explícito: estar conectado a una red no otorga alcance a otras.

### Próximas iteraciones

API local autenticada para enviar progreso a la PWA, consulta de SNMPv3 y, solo con autorización/credenciales, SSH o WinRM de solo lectura, conciliación avanzada de identidades y capturas por múltiples segmentos. No se incluyen todavía.


## Servicio Discovery desde tablet por HTTPS

Para una tablet con RabbitMole instalada, inicia en un ordenador auditor conectado a la red autorizada un servicio HTTPS efímero:

```bash
python3 discovery/service.py --bind 192.168.10.20 --host 192.168.10.20 --port 8766 --cert /ruta/cert.pem --key /ruta/key.pem --origin https://origen-exacto-de-tu-pwa
```

El certificado debe ser confiable en la tablet y contener un SAN válido para la IP indicada. Abre la PWA instalada, entra en **Redes → Captura asistida → Discovery local**, introduce URL HTTPS y token temporal mostrado por el servicio, pulsa Conectar, especifica el CIDR privado autorizado (máximo 256 direcciones), escribe `AUTORIZO` y confirma. La captura se ofrece para Hardware o Redes y se incorpora mediante la **revisión previa existente**, sin sobreescribir datos ni asignar automáticamente hallazgos. El token se mantiene únicamente en memoria. El servicio no inicia escaneos por sí solo, solo realiza identificación de hosts sin puertos o credenciales, y no demuestra VLAN ni aislamiento real. Restringe el puerto en firewall, no lo expongas a Internet y detén el proceso después de la auditoría. Algunas plataformas aplican restricciones adicionales al acceso a la red local desde un origen HTTPS externo.


### Consola en Android (Termux)

En la propia tablet o móvil Android, instala Termux desde F-Droid o la página oficial de GitHub. Abre Termux y ejecuta:

```sh
pkg update
pkg install python git nmap
# Descarga primero la rama de esta PR (hasta que se fusione):
git clone --branch feature/pwa-version-offline-fallback-20261018 --single-branch https://github.com/sempitern0/RabbitMole.git
cd RabbitMole
python discovery/discover.py doctor
python discovery/discover.py wizard
```

Termux es opcional y no ejecuta un shell dentro de la PWA. Python en Android no equivale a una instalación Linux estándar: algunas versiones restringen `ip`, sockets ICMP o Nmap y puede no haber interfaces detectables. Si el wizard no sugiere una red, introduce el CIDR privado autorizado manualmente. Un `ping`/Nmap funcional no está garantizado sin permisos adicionales. Importa el JSON generado desde Hardware/Redes → Captura asistida. El navegador por sí solo no puede hacer ARP o ICMP crudos. Evita desactivar las protecciones de Android o exponer servicios de Termux a redes desconocidas.

### Guía de preparación en Android e iOS

La guía de campo [RabbitMole en móviles](../docs/AUDITORIA_MOVIL_ES.md) describe instalación de Termux (Android), preparación de `python discovery/discover.py doctor`, permisos de archivos, uso autorizado del wizard, transporte seguro del JSON y recuperación offline. **iOS/iPadOS no ejecuta Termux**: a-Shell e iSH son terminales auxiliares, sin garantía de compatibilidad con Nmap/ICMP/Discovery. En iPhone/iPad se recomienda producir el JSON desde un PC autorizado y revisarlo mediante Archivos → Hardware/Redes → Captura asistida, o probar el bridge HTTPS con permisos y certificado confiable.

## Discovery guiado desde la PWA de Cloudflare

El Worker sirve la aplicación estática, pero **no** ejecuta Python ni mantiene un servidor Discovery. Para conectar la PWA instalada directamente con un escáner de la LAN, prepara una estación auditora autorizada y arranca `discovery/service.py` en una terminal local con una IP privada, un certificado TLS confiable en el móvil y `--origin` idéntico al origen HTTPS de la PWA. El servicio imprime un **token efímero** que cambia en cada arranque y **no es un token de Cloudflare**. Solo funciona mientras la terminal siga abierta; nunca abras el puerto a Internet.

En **Redes → Captura asistida → Discovery local** aparece ahora un asistente de cuatro pasos: preparar el PC o Termux, comprobar la conexión HTTPS/token y motor Nmap/ping, confirmar un CIDR privado autorizado de hasta 256 direcciones escribiendo `AUTORIZO`, y revisar los registros detectados. Se reutiliza un único JSON para las vistas previas de Hardware y Redes y puede descargarse el JSON si el navegador no permite pasarlo directamente al importador (especialmente WebKit/iOS). Los candidatos no se guardan hasta que los seleccionas y confirmas en el asistente; cada campo puede revisarse o editarse manualmente después.

**Limitaciones reales:** compartir Wi-Fi no garantiza alcance entre dispositivos si hay aislamiento AP, filtros de red o problemas de certificado. Una PWA no puede abrir una shell ni navegar a la supuesta carpeta de scripts de su instalación; Cloudflare tampoco puede escanear las IP privadas del centro. En Android, Termux es una alternativa independiente para generar JSON. Discovery realiza descubrimiento de hosts con ping/Nmap sin reconocimiento de puertos y no verifica firmware, contraseñas, VLAN, SSID ni controles de seguridad.

## Discovery sin certificados en el mismo PC (loopback)

Si RabbitMole se ejecuta como PWA en **el mismo Windows** en el que vas a capturar la red, no necesitas HTTPS propio ni clonar la interfaz de RabbitMole en otro servidor. Desde la carpeta que contenga los scripts `discovery`, abre PowerShell y ejecuta:

```powershell
py -3 discovery\\service.py --loopback-http --origin https://rabbitmole.danieldigitalspace.workers.dev
```

El servidor escucha **exclusivamente en 127.0.0.1:8766**, imprime un token efímero en la consola y no es accesible desde otros dispositivos. En la PWA instalada en ese mismo PC entra en **Redes → Captura asistida → Discovery local**, elige «Usar servidor de este PC», introduce el token y comprueba la conexión. Algunos navegadores piden permiso para acceso a redes locales y ciertos entornos corporativos podrían bloquearlo. Si no funciona, exporta un JSON con `py -3 discovery\\discover.py wizard` e impórtalo manualmente. No desactives protecciones de CORS ni de seguridad para hacerlo funcionar.

Si la PWA corre en **Android, iOS o una tablet** y Discovery en el PC, `127.0.0.1` apunta al dispositivo móvil, no al PC: debes emplear el modo **HTTPS LAN** con certificado confiable o transferir el JSON. El modo `--loopback-http` rechaza bind/host LAN y los parámetros de certificado. Nunca expongas HTTP a la Wi-Fi de un cliente.


## Companion Windows por doble clic (kit PWA)

Descarga «Discovery kit» desde la PWA y extrae el ZIP. Abre `discovery/iniciar.cmd`: aparece la ventana **RabbitMole Companion** (Python 3.9+ con Tkinter). Revisa el origen HTTPS exacto de tu PWA, pulsa **Iniciar puente**, luego **Copiar token temporal**; en la PWA selecciona `http://127.0.0.1:8766`, pega el token y pulsa **Comprobar conexión**. El servicio escucha únicamente en loopback y se detiene al cerrar la ventana. **Nunca inicia reconocimiento sin confirmar un CIDR autorizado en la PWA.**

El botón **Capturar inventario de este Windows** utiliza `collect-local.ps1` incluido en el ZIP, solicita una ruta de salida JSON nueva y no sobrescribe archivos. Importa esa captura desde la PWA y revisa cada elemento. La captura local no obtiene información de equipos remotos; las licencias y el estado de Defender requieren validaciones adicionales específicas y no se afirman automáticamente.

El Companion inicial no es un EXE autocontenido: requiere Python y Tkinter. Si faltan, usa `discovery/setup.ps1` (opcional `-InstallTools`) o el asistente de consola. El modo tablet sigue siendo HTTPS con certificado confiable, o transferencia de JSON. El token se mantiene en memoria y el botón copiar utiliza el portapapeles del propio Windows: evita dejar secretos en equipos compartidos.


## Companion Windows portable: uso y retirada

El workflow manual **Build portable Windows Companion** genera un ZIP de ejecutable autocontenido con Python integrado. Una versión solo debe ofrecerse tras revisar pruebas y publicarla expresamente en [GitHub Releases](https://github.com/sempitern0/RabbitMole/releases). Cloudflare únicamente publica la PWA y el kit Python de respaldo; **no instala ni publica automáticamente el EXE**.

Extrae el ZIP, abre RabbitMole-Companion.exe, pulsa **Activar Discovery**. En la PWA instalada del **mismo PC**, pulsa **Conectar este PC** y acepta la solicitud en Companion. No se escanea sin revisar el CIDR y confirmar AUTORIZO. Los datos se revisan antes de incorporarlos a Hardware y Redes.

Para desinstalar, pulsa **Desactivar**, cierra la aplicación y borra la carpeta extraída. Los JSON exportados se retienen o eliminan aparte. No se crea servicio persistente ni requiere elevar permisos. En tablets continúa siendo necesario HTTPS con certificado confiable o importar JSON. Un EXE sin firma puede mostrar advertencias de reputación: verifica procedencia y SHA-256, sin desactivar la protección del sistema.


## Kits incluidos en la PWA y trabajo sin conexión

El build Cloudflare produce `discovery-kit.zip` y `discovery-android-termux.zip`. El despliegue manual de producción compila primero el ejecutable Windows en GitHub Actions, verifica su ZIP y lo añade como `discovery-windows.zip` antes de desplegar. El sistema no necesita GitHub Releases para descargarlo desde la propia PWA. Los paquetes disponibles se guardan oportunistamente en CacheStorage durante la instalación y en su primera descarga. **La caché no es almacenamiento permanente garantizado**: antes de visitar una sede sin red, verifica el paquete descargado en Archivos/Descargas y guárdalo fuera del almacenamiento efímero del navegador.

Android: descarga `discovery-android-termux.zip` desde RabbitMole, instala Termux por un canal confiable (por separado) y su paquete Python/Nmap mientras tengas acceso a los repositorios necesarios; ejecuta el script localmente. Un navegador no concede ejecución de Termux ni acceso a Android fuera de su sandbox. iOS/iPadOS: descarga las instrucciones o prepara un equipo auditor por HTTPS; las shells de iOS no garantizan ICMP/Nmap y el flujo portable no promete Discovery nativo.


En iOS la PWA incluye también un documento descargable de instrucciones sin conexión (`discovery-ios-guide.txt`), disponible desde Discovery. Este modo no instala binarios nativos ni promete escanear iPhone/iPad directamente; conecta con un equipo auditor por HTTPS certificado o importa una captura en Archivos.

### Cambiar de estación y reintentar
La dirección mostrada al volver al asistente corresponde a la conexión activa. «Usar servidor de este PC» desconecta la estación anterior y descarta su captura temporal: vuelve a conectar antes de escanear. Navegar a otra pantalla mientras llega la respuesta de conexión no invalida la sesión. Tras recibir una aprobación o denegación puedes solicitar otra conexión, respetando el intervalo de cinco segundos entre solicitudes; no se inicia ningún escaneo automáticamente.
