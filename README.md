# Tabla Periódica Interactiva

Aplicación educativa **PWA (Progressive Web App)** que permite explorar los 118 elementos químicos de forma visual, interactiva y offline. Pensada para estudiantes de secundaria.

## Estructura del proyecto

```text
tabla-periodica/
├── index.html
├── style.css
├── script.js
├── manifest.json
├── service-worker.js
├── data/
│   └── elements.json
├── icons/
│   ├── logo-original.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── favicon.png
│   └── apple-touch-icon.png
└── README.md
```

## 1. Cómo ejecutar la aplicación

La app usa `fetch()` para cargar `data/elements.json`, por lo que **no funciona abriendo `index.html` directamente con doble clic** (protocolo `file://`). Debe servirse con un servidor local:

**Opción A — Python (ya viene instalado en la mayoría de sistemas):**
```bash
cd tabla-periodica
python3 -m http.server 8080
```
Luego abre `http://localhost:8080` en el navegador.

**Opción B — Node.js:**
```bash
npx serve tabla-periodica
```

**Opción C — Extensión "Live Server" de VS Code.**

## 2. Cómo instalarla como aplicación

1. Abre la app en Chrome, Edge u otro navegador compatible (Android, Windows, macOS, Linux).
2. Verás el botón **"Instalar"** en la parte superior cuando el navegador lo permita (evento `beforeinstallprompt`).
3. En **iPhone/iPad (Safari)**: no existe `beforeinstallprompt`, así que se debe usar el botón **Compartir → "Agregar a pantalla de inicio"**.
4. En navegadores de escritorio también puedes instalar desde el ícono de instalación en la barra de direcciones.

## 3. Cómo probarla offline

1. Abre la aplicación una vez con conexión a Internet (esto permite que el Service Worker guarde todos los archivos en caché).
2. Desconecta el Wi-Fi o activa el modo avión.
3. Recarga la página: debe seguir funcionando por completo (tabla, búsqueda, filtros, comparador, familias, modo oscuro).
4. También puedes probarlo desde las herramientas de desarrollador del navegador: pestaña **Application → Service Workers → Offline**.

## 4. Cómo modificar los datos químicos

Todos los datos están en `data/elements.json`, como un arreglo de 118 objetos con esta estructura:

```json
{
  "numeroAtomico": 26,
  "simbolo": "Fe",
  "nombre": "Hierro",
  "masaAtomica": 55.845,
  "familia": "Metales de transición",
  "categoria": "Metales de transición",
  "bloque": "d",
  "grupo": 8,
  "periodo": 4,
  "estado": "Sólido",
  "densidad": 7.874,
  "puntoFusion": 1538,
  "puntoEbullicion": 2862,
  "electronegatividad": 1.83,
  "configuracionElectronica": "[Ar] 3d6 4s2",
  "electronesPorNivel": [2, 8, 14, 2],
  "valencias": [2, 3],
  "estadosOxidacion": [3, 2],
  "descubrimiento": "Conocido desde la antigüedad",
  "añoDescubrimiento": "No aplica",
  "descubridor": "Conocido desde la antigüedad",
  "origenNombre": "Del latín 'ferrum'",
  "usos": ["..."],
  "datosCuriosos": ["..."]
}
```

Para editar un dato, busca el elemento por su `numeroAtomico` o `simbolo` y modifica el campo correspondiente. Cuando un dato no aplica o no se conoce con precisión (frecuente en elementos superpesados sintéticos), se usa el texto `"No disponible"` o `"No aplica"` en lugar de inventar valores.

Después de modificar el archivo, incrementa `CACHE_NAME` en `service-worker.js` para forzar una nueva versión de caché y que los usuarios reciban los cambios.

## 5. Cómo cambiar el logo

El logo oficial de la aplicación es la imagen circular con la tarjeta del elemento "Pt" (Platino), guardada como referencia maestra en `icons/logo-original.png`. A partir de ahí se generaron, sin deformar la imagen y manteniéndola centrada, los siguientes tamaños:

- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px
- `apple-touch-icon.png` — 180×180 px
- `favicon.png` — 48×48 px

Para reemplazar el logo en el futuro:

1. Sustituye `icons/logo-original.png` por tu nueva imagen (idealmente cuadrada, mínimo 512×512 px).
2. Regenera los cuatro tamaños anteriores manteniendo la proporción cuadrada. Por ejemplo, con Python/Pillow:
   ```python
   from PIL import Image
   src = Image.open("icons/logo-original.png").convert("RGBA")
   for name, size in {"icon-192.png":192, "icon-512.png":512, "apple-touch-icon.png":180, "favicon.png":48}.items():
       src.resize((size, size), Image.LANCZOS).save(f"icons/{name}")
   ```
3. Actualiza `manifest.json` si cambias los nombres de archivo.
4. Incrementa `CACHE_NAME` en `service-worker.js` para que los usuarios reciban el ícono nuevo en vez del que tienen cacheado.

## 6. Cómo publicar la PWA

Cualquier hosting de archivos estáticos con HTTPS funciona (el Service Worker requiere HTTPS, salvo en `localhost`):

- **GitHub Pages:** sube la carpeta `tabla-periodica/` a un repositorio y activa Pages en la configuración.
- **Netlify / Vercel:** arrastra la carpeta al panel de despliegue o conéctala a un repositorio Git.
- **Cualquier servidor web (Apache/Nginx):** copia la carpeta al directorio público del sitio.

Una vez publicada, los usuarios podrán visitarla desde el navegador y instalarla como aplicación independiente en Android, iOS, Windows, macOS y Linux.

## Créditos de datos

Los valores de masa atómica, densidad, puntos de fusión/ebullición, electronegatividad y configuración electrónica corresponden a valores estándar de referencia química. Para elementos sintéticos superpesados (a partir del número atómico 104), muchas propiedades físicas no se han medido experimentalmente; en esos casos se indica `"No disponible"`.
