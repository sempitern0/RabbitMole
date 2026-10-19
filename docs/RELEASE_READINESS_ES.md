# Preparación de auditoría de campo · 19 de octubre de 2026

Esta revisión refuerza la conservación del expediente y la validación de entrega. Una PR no actualiza la instalación publicada: fusionar y desplegar son pasos posteriores. No borrar datos del navegador para actualizar.

## Correcciones y responsables

- `js/audit-storage.js`: aborta la transacción completa si una escritura lanza una excepción síncrona. Antes, un segundo registro no clonable podía rechazar la importación después de haber sobrescrito el primero. La regresión se reproduce con IndexedDB real en Chromium: antes queda «overwritten»; corregido conserva «original».
- `js/app.js`: contabiliza escrituras en cola/en curso; la actualización no considera segura una recarga hasta terminar. Advierte al abandonar con cambios pendientes o error de almacenamiento, cuando el navegador admite `beforeunload`. El guardado al ocultar la aplicación sigue activo; no garantiza completar escrituras si el sistema mata el proceso.
- `sw.js`: comparte la verificación del shell entre recursos concurrentes y asocia la navegación al nuevo cliente, conservando la comprobación completa en cada navegación. Evita la multiplicación de lecturas de caché que bloqueaba la recarga offline en Chromium. Shell local v98 para distribuir los cambios sin reutilizar la caché anterior. El bundle Cloudflare conserva su versión por contenido.
- `deploy/validate.py` y pruebas: añade almacenamiento y cola de escrituras a la puerta de entrega; corrige referencias a módulos extraídos, dobles de prueba de persistencia/caché y navegación del recorrido Chromium. No cambia JSON v3 ni las claves de almacenamiento.

En la regresión de 20 recursos concurrentes, las lecturas de caché bajan de **1660 a 102** (aproximadamente un **94 %**). Es una medición del escenario de prueba, no una promesa de velocidad para todos los dispositivos.

## Antes de salir

1. Desde la instalación que se vaya a usar, exportar una copia protegida y comprobar su recuperación con **Comprobar archivo**. Conservar la frase de `.rmenc` por separado.
2. Después del despliegue aprobado, buscar/aplicar la actualización con el expediente guardado. Mantener la misma URL, perfil del navegador e icono instalado.
3. En **Dispositivo e instalación**, completar la lista con un expediente ficticio: inventario, fotografía, guardado, exportación y recuperación. Verificar también que el PDF se abre y es legible en el dispositivo.
4. Comprobar recursos offline, cerrar completamente la PWA, activar modo avión y abrirla desde el icono. Revisar los datos y la fotografía, editar y repetir el cierre/reapertura.
5. Durante la visita, exportar copias periódicas fuera del navegador. No actualizar la aplicación en mitad de la captura. El permiso de persistencia no evita el borrado manual ni sustituye las copias.

## Alcance de la validación

La puerta de entrega es `npm run check`; `npm run deploy:check` añade el empaquetado y un dry-run de Wrangler, sin despliegue. `npm run test:browser` cubre los PDF ejecutivo/técnico, perfiles web/instalado simulados, IndexedDB, navegación, paletas, edición, recarga offline y ausencia de peticiones externas. La regresión de escrituras pendientes cubre cola, errores y recuperación.

El repositorio conserva pruebas históricas fuera de `deploy/validate.py`: una ejecución exploratoria detectó aserciones obsoletas sobre formatos, rutas anteriores y extracción de funciones. No se afirma que todos los archivos `tests/test_*` pasen; las pruebas de la puerta de entrega y de navegador son el conjunto de aceptación de esta revisión. Queda pendiente modernizar el resto.

La simulación de modo standalone no instala una PWA real. La instalación, cierre y arranque en frío en Android/iOS, cámara física, impresión nativa y políticas de almacenamiento del dispositivo requieren la comprobación anterior. No se han probado credenciales reales, Nextcloud, Discovery sobre una red de cliente ni el despliegue público.
