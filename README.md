# Ámbar Tu Casa — Casa de los objetos

**Álbum publicado:** [https://kentro42.github.io/-mbar-objects/](https://kentro42.github.io/-mbar-objects/)

**Repositorio:** [github.com/kentro42/-mbar-objects](https://github.com/kentro42/-mbar-objects)

Este sitio es un cuaderno digital para recorrer objetos con historia de Ámbar Tu Casa. Presenta un solo álbum, con portada y contraportada, fichas de piezas, fotos, videos, stickers PNG originales, un QR por pieza y una navegación que imita el paso de las hojas. Usa una estética de carta hecha a mano: papel beige, cintas amarillas, anotaciones y acentos de los colores de los stickers. No necesita servidor ni base de datos: los datos y las rutas viven en el código del sitio.

## Empezar en el computador

Se necesita Node.js 22 y npm. La aplicación ahora está agrupada en `site/`; abre la terminal en esa carpeta para instalar dependencias y ejecutar la vista local:

```bash
cd site
npm ci
npm run dev
```

Vite mostrará una dirección local, normalmente `http://localhost:5173/`. Para comprobar la versión de producción:

```bash
npm run build
npm run preview
```

Los cambios de código se hacen en `site/src/`; no edites `site/dist/`, porque esa carpeta se genera al compilar. `package-lock.json` debe conservarse junto a `package.json`: permite instalar las mismas versiones de dependencias en tu computador y en GitHub Actions.

## Editar textos y datos de las piezas

La colección se define en **`site/src/albums/ambar-casa-violeta-azul.js`**, dentro del arreglo `plantillas`. Cada objeto de ese arreglo es la ficha base de una pieza. Un ejemplo reducido:

```js
{
  title: "Reloj antiguo",
  subtitle: "Marcó el ritmo de la casa",
  categoria: "Reloj de pared",
  origen: "Alemania",
  material: "Nogal y latón",
  uso: "Cronometraje doméstico",
  year: "1958",
  foto: "assets/pieces/pieza-001.webp",
  video: "VIDEO_ID",
  p1: "Primera parte de la historia.",
  p2: "Segunda parte de la historia."
}
```

Cambia los valores entre comillas, pero conserva las llaves, comas y nombres de propiedades. Las propiedades principales son:

- `title` y `subtitle`: nombre y frase corta que aparecen en la ficha.
- `categoria`, `origen`, `material`, `uso` y `year`: datos que se muestran como etiquetas y notas.
- `foto`: ruta de la fotografía local, URL HTTPS o identificador de imagen de Cloudinary.
- `video`: ID del video de YouTube; déjalo como cadena vacía (`""`) si no hay video.
- `p1` y `p2`: texto de la historia de la pieza.

Hay algunas fichas con texto o videos que son de demostración. Antes de publicar, reemplaza cualquier texto que no describa la pieza real y los enlaces de video de muestra por la información correcta. No agregues datos históricos que no hayas confirmado.

### Agregar una pieza

Añade un nuevo objeto **al final** de `plantillas`. El programa genera la etiqueta `Pieza 011`, `Pieza 012`, etc., según el orden, y calcula la ruta/QR de la pieza. La página admite cuatro fichas antes de empezar otra hoja; las nuevas páginas reciben stickers de acuerdo con la asignación automática.

Los identificadores numéricos dependen del orden actual. Añadir al final preserva los de las piezas existentes; borrar o reordenar objetos puede cambiar IDs y dejar desactualizados los QR ya impresos o compartidos. Haz una copia antes de reordenar el catálogo.

## Fotos, logos y stickers

Guarda las imágenes locales en **`site/public/assets/pieces/`**. Por ejemplo, si el archivo está en:

```text
site/public/assets/pieces/pieza-011.webp
```

la ficha puede usar:

```js
foto: "assets/pieces/pieza-011.webp"
```

No se pega la imagen dentro del JavaScript: se guarda el archivo y se escribe su ruta. Usa JPG o WebP para fotografías y PNG para logos/stickers con transparencia. Respeta exactamente mayúsculas, espacios y tildes del nombre de archivo. Una foto subida a la carpeta no queda asignada por sí sola: también hay que escribirla en `foto`.

- `branding.logo` enlaza el distintivo circular amarillo de las cubiertas.
- `branding.photoMark` usa `Ambar_logo.png` como marca discreta sobre una Polaroid. El sello se muestra solo si tanto la foto como el logo cargan; ante error, no queda una placa blanca vacía.
- `branding.signatureLogo` usa el logo de Ámbar junto al QR.
- El arreglo `stickers` enumera los PNG originales disponibles. `site/src/utils/pageDecorations.js` reparte hasta cuatro stickers distintos por hoja y no vuelve a asignar un archivo ya usado en páginas anteriores. Cuando se terminan los archivos únicos, se usa una nube dibujada con CSS; no se generan stickers nuevos.

Conserva el nombre y la ruta de los PNG existentes si no quieres cambiar la identidad visual. Los dos logos actualmente configurados son `Ambar_abduccioncirculo.png` y `Ambar_logo.png`.

## Añadir o cambiar un video

El campo `video` espera el **ID de YouTube**, no la URL completa ni el código `<iframe>`. Por ejemplo, de `https://youtu.be/AbCdEf12345` se usa:

```js
video: "AbCdEf12345"
```

También sirve el texto después de `v=` en una URL de YouTube o después de `/shorts/` y `/embed/`. Si no hay video, escribe `video: ""`; la ficha conserva el recuadro oscuro, sin inventar un video.

## Cómo funciona la aplicación

La navegación está ligada al fragmento de la URL, después de `#`. Las rutas usan el ID técnico estable del álbum, el número de página o el ID de pieza. Por eso un QR puede abrir directamente su pieza. Se conservan rutas antiguas como `#pagina-n` y `#pieza-id` para no invalidar enlaces previos.

Al abrir el enlace normal, el libro empieza en la portada. En computador muestra una doble página; en teléfono enseña una hoja. Las flechas del teclado, los botones y el gesto de arrastre permiten recorrerlo. En la contraportada, **“Volver a curiosear”** vuelve al inicio; **“Volver atrás”** regresa a la última página. La animación de giro usa Web Animations API; en móvil omite la iluminación y las sombras que requerían repintado por fotograma. Si el dispositivo tiene `prefers-reduced-motion` activado, se usa un fundido breve en vez del giro 3D.

El flujo principal es:

1. `site/src/main.jsx` monta la aplicación React y carga el CSS.
2. `site/src/app/AlbumApp.jsx` conecta los componentes con los hooks de modo y navegación.
3. `site/src/albums/` contiene el álbum y su catálogo de piezas, textos, logos y stickers.
4. `site/src/hooks/` separa la navegación, las rutas, los gestos, el teclado, las fichas y el cambio de página.
5. `site/src/components/book/` compone el libro, las páginas, las cubiertas, el lomo, las anillas y los botones.
6. `site/src/components/pieces/` presenta las Polaroids, los stickers y las historias individuales.
7. `site/src/utils/` calcula páginas/rutas/QR, distribuye stickers y construye los fotogramas del giro.
8. `site/src/styles/album.css` define papel, colores, composición y comportamiento adaptado al tamaño y orientación de pantalla.
9. `site/public/` guarda imágenes y archivos que se copian sin transformación al sitio compilado.

## Estructura del repositorio

La raíz queda reducida a los elementos que Git y la persona que mantiene el proyecto necesitan encontrar rápidamente. `.github/` se conserva en la raíz para que GitHub Actions detecte el workflow. `.gitignore` excluye dependencias y compilaciones locales. Esta es la estructura principal:

```text
.
├── .github/
│   └── workflows/
│       └── pages.yml       # compila y publica en GitHub Pages
├── .gitignore              # ignora node_modules, dist y archivos temporales
├── README.md               # guía completa del proyecto (este documento)
└── site/
    ├── index.html          # entrada HTML y metadatos
    ├── package.json        # comandos y versiones del proyecto
    ├── package-lock.json   # versiones exactas para instalaciones reproducibles
    ├── vite.config.js      # base relativa compatible con GitHub Pages
    ├── public/
    │   ├── assets/pieces/  # fotos, logos y stickers originales
    │   └── manus-routes.json
    └── src/
        ├── albums/         # configuración y datos de las piezas
        ├── app/            # punto de composición de la aplicación
        ├── components/     # libro, páginas, tarjetas y fichas
        ├── hooks/          # navegación, gestos, teclado y animaciones
        ├── styles/         # estilos y diseño adaptable
        └── utils/          # rutas, QR, paginación, stickers y giros
```

Los nombres técnicos de algunos archivos son `src/` (código fuente), `.gitignore` (reglas de archivos ignorados), `package-lock.json` (bloqueo de dependencias) y `vite.config.js` (configuración de Vite). No existe un archivo `package.config` ni un `package_lock.json`; los nombres anteriores son los que deben conservarse.

## GitHub Pages y publicación

El workflow **`.github/workflows/pages.yml`** instala Node.js 22, usa el lockfile de `site/`, ejecuta `npm ci` y `npm run build` desde esa carpeta, y publica `site/dist/`. Se activa al cambiar la rama `main` o manualmente desde GitHub Actions. Vite usa `base: './'`, así que las imágenes y recursos siguen encontrándose bajo la ruta del repositorio en GitHub Pages.

Los cambios de una rama `review/...` no reemplazan automáticamente la página publicada. Puedes revisarlos localmente con `npm run dev` desde `site/`; solo una integración posterior a `main` dispara la publicación normal. Antes de publicar, comprueba las fotos, las historias y los videos reales, compila el sitio y revisa el cambio en una rama de revisión.

## Referencias de marca

La dirección de diseño mantiene el descriptor “Objetos, sabores y hogar” y el nombre editorial “Casa de los objetos”, usando los logos y stickers proporcionados por la marca. Referencias públicas previamente utilizadas para orientar el texto y la identidad: [Instagram de Ámbar Tu Casa](https://www.instagram.com/ambar.tucasa/?hl=en), [publicación sobre objetos](https://www.instagram.com/p/Desm-eOG-Hw/) y [enlaces oficiales](https://linktr.ee/ambartucasa).
