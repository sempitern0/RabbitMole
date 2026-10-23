# Consultas externas de apoyo a la auditoría

RabbitMole mantiene el expediente **offline**. Las consultas de **Conexiones online** requieren una acción del auditor y no incorporan automáticamente los resultados al expediente.

| Servicio | Uso | Observaciones |
|---|---|---|
| CVE Program | Consultar CVE por ID | La referencia publicada no demuestra afectación |
| NIST NVD | Consultar CVE por ID | Clave API opcional en memoria; CORS y cuota dependen del proveedor |
| GLEIF | Buscar posibles entidades por razón social o LEI | **No verifica CIF** |
| OpenStreetMap Nominatim | Buscar dirección o localidad y abrir resultado en un mapa | Uso limitado, CORS y política comunitaria; no introducir localizaciones sensibles |
| CIF español (local) | Revisar formato y dígito de control | **No verifica existencia, titularidad ni situación fiscal** |

## Seguridad y privacidad

- URLs de API fijas en `js/online-lookups.js`: no hay endpoint arbitrario ni proxy transparente.
- Todas las solicitudes son explícitas, HTTPS, GET, sin cookies, sin referer ni datos del expediente.
- La clave NVD es temporal y se envía solo en una cabecera al servicio NVD; no aparece en la URL, JSON del expediente ni LocalStorage. El campo puede limpiarse pulsando **Limpiar**.
- No usar una clave de cliente confidencial de OAuth en frontend. Un secreto compartido en JavaScript no es secreto.
- Respuestas presentadas como resultados **orientativos**, sin escritura automática ni declaración de cumplimiento.
- VIES permite verificar identificadores IVA intracomunitarios mediante su **sitio oficial**; no hay validación VIES universal integrada por CORS.
- CORS, cuotas, límites de uso, precisión de resultados y disponibilidad deben contrastarse con el proveedor. Nominatim requiere moderación de solicitudes; RabbitMole establece una separación de 1,2 segundos.
- No enviar datos personales, secretos, direcciones privadas o identificadores internos a proveedores de consulta sin autorización.

## Comprobar carga inicial

Ejecuta `npm run perf:load`: construye el paquete público y lanza Chromium para medir dos navegaciones en un mismo perfil.

Se reportan `domContentLoadedMs`, `loadMs`, `firstByteMs`, número de recursos CSS y JS, bytes transferidos, bytes decodificados, estado de fuente y peticiones externas. Las cifras dependen del hardware, caché y navegador. El informe de medida no es por sí solo un objetivo de rendimiento ni sustituye pruebas reales en tablet.
