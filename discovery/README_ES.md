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
