# Integraciones de consulta externa de RabbitMole

Todas las integraciones se activan manualmente desde **Conexiones online** de la PWA privada. El expediente sigue funcionando sin conexión. Cada ficha de proveedor indica qué campos necesita y enlaza a su documentación. El botón no comprueba credenciales de forma independiente: ejecuta una **consulta GET real de solo lectura** y devuelve un estado de consulta, o un error de red/CORS/cuota. Ningún resultado se anexa al informe automáticamente.

| Servicio | Campo obligatorio | API key | Dónde obtenerla | Endpoint utilizado |
|---|---|---|---|---|
| CVE Program | ID CVE publicado | No | No hace falta cuenta | `https://cveawg.mitre.org/api/cve/{id}` |
| NVD 2.0 | ID CVE publicado | Opcional | [NVD: solicitar clave](https://nvd.nist.gov/developers/request-an-api-key) | `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=...` |
| GLEIF | Razón social o LEI (20 caracteres) | No | Servicio de consulta pública | `https://api.gleif.org/api/v1/lei-records` |
| Geoapify | Dirección o localidad y clave de proyecto | Sí | [Geoapify MyProjects](https://myprojects.geoapify.com/) | `https://api.geoapify.com/v1/geocode/search` |
| CIF (offline) | CIF español | No | No hay cuenta ni API remota | Comprobación de formato y control local |

## Cómo configurar cada proveedor

### CVE Program
Introduce `CVE-2025-12345` (ejemplo de formato). No se solicita contraseña, correo, token, clave pública o certificado. Se recupera la ficha publicada si existe. Una ficha CVE no garantiza que un activo concreto esté afectado. [API CVE Services](https://cveawg.mitre.org/api-docs/).

### NVD (NIST)
Introduce un CVE. Puedes consultar sin cuenta, dentro de los límites públicos. Si quieres una API key, solicítala a NVD, verifica el correo y activa la clave mediante las instrucciones del servicio. Introdúcela en el campo que solo aparece al seleccionar **NVD**. RabbitMole la envía en la cabecera `apiKey` de la solicitud; nunca en la URL, el expediente ni almacenamiento local. La cabecera puede activar una preflight CORS que el proveedor no admita, por lo que una clave correcta **no garantiza** conectividad directa desde la PWA. Consulta la [documentación API NVD](https://nvd.nist.gov/developers/vulnerabilities).

### GLEIF / LEI
No necesita usuario ni clave. Selecciona **Razón social** para buscar posibles coincidencias o **LEI exacto** para introducir 20 caracteres alfanuméricos. La respuesta contiene datos del registro LEI, cuya vigencia y correspondencia deben contrastarse. GLEIF **no verifica** CIF o NIF español. [Documentación GLEIF](https://www.gleif.org/en/lei-data/gleif-api/).

### Geoapify
Crea una cuenta en **MyProjects**, añade un proyecto, abre **API Keys** y utiliza una clave habilitada para Geocoding. Limita los dominios/orígenes autorizados y la cuota del proyecto. El campo de clave solo aparece al seleccionar Geoapify. El servicio requiere `apiKey` como **parámetro de URL**; por tanto la clave es visible para quien controla el navegador y el proveedor, incluso si RabbitMole no la guarda. **No utilices una clave privada de servidor ni un secreto compartido de alto privilegio** en esta PWA. El resultado abre coordenadas aproximadas en OpenStreetMap; no envíes direcciones personales o instalaciones sensibles sin autorización. [Documentación Geocoding](https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/).

El endpoint público Nominatim no está integrado como geocodificador genérico. Su [política oficial](https://operations.osmfoundation.org/policies/nominatim/) impone condiciones de atribución, identificación, uso razonable y prohíbe integraciones genéricas de determinadas plataformas; se ha escogido Geoapify como proveedor de consulta autenticada.

### CIF y VIES
El verificador integrado comprueba estructura y dígito de control **en memoria, sin red**. No acredita existencia, titularidad, actividad ni situación fiscal. Para números IVA intracomunitarios está el [portal oficial VIES](https://ec.europa.eu/taxation_customs/vies/), que tiene alcance específico. No se ha añadido un supuesto servicio universal de validación fiscal de CIF.

## Seguridad y errores

- Proveedores con origen HTTPS fijo; no se admiten URLs arbitrarias ni credenciales Basic para estas consultas.
- Peticiones únicamente GET, sin cookies, sin guardado automático de respuestas ni datos del expediente.
- NVD recibe su clave en cabecera; Geoapify requiere clave en URL. Ambas se borran al pulsar «Borrar campos y resultado» o abandonar la pantalla. No se envían a otros proveedores.
- La interfaz confirma antes de cada petición qué proveedor recibirá el texto introducido.
- Los errores de CORS, DNS o red pueden presentarse como fallo de conexión. No equivalen necesariamente a credenciales inválidas. Los códigos 401/403, 429 y 5xx tienen causas distintas.
- La PWA no puede eludir CORS. Si un servicio requiere OAuth con client secret o una clave verdaderamente secreta, necesitaría un backend/proxy gestionado expresamente y con autenticación adecuada.
- La consulta es orientativa y su resultado se debe verificar antes de usarlo como evidencia.

## Medir carga inicial

Ejecuta `npm run perf:load`. La tarea crea una build y ejecuta dos navegaciones Chromium (fría y caliente) sobre un servidor local; imprime DOMContentLoaded, load, primer byte, recursos, bytes, fuente y peticiones externas. Las cifras dependen del hardware y la caché, y deben compararse ejecutando ambos commits sobre un entorno equivalente.
