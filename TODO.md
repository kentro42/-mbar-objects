# Resultados del rediseño

## Identidad visual de carta Ámbar

- [x] Actualizar la estética general del álbum para acercarla a la carta de Ámbar: papel crema, azules de cielo, acentos coral/salmón y tipografía con carácter artesanal.
- [x] Evitar una página genérica o de aspecto sintético; no incorporar fotos de stock ni stickers generados.
- [x] Crear nubes de fondo azules, blancas y coral con CSS, manteniéndolas como decoración y sin estorbar la lectura.

## Logo y stickers auténticos

- [x] Usar el distintivo auténtico cargado por el usuario, centrado en la portada y en tamaño menor en la contraportada.
- [x] Mostrar ese logo discretamente en la esquina inferior izquierda de cada fotografía cargada, sin tapar el objeto.
- [x] Poner stickers PNG distintos como pegatinas de fondo en cada página; no repetir una imagen dentro de una misma hoja ni entre páginas.
- [x] Al crear páginas nuevas por aumento de piezas, asignarles automáticamente recursos únicos disponibles; al agotarse el catálogo, usar variaciones CSS en lugar de reciclar stickers.
- [x] Mantener intactos los archivos originales subidos por el usuario y excluir del conjunto ornamental los recursos marcados como IA.

## Cubiertas, páginas y publicación

- [x] Rediseñar portada y contraportada con una familia de color coherente e integrar PNGs auténticos sin alterar la animación/navegación existente.
- [x] Aplicar el sistema visual en todas las páginas generadas y en las fichas, manteniendo la lectura de fotos y textos.
- [x] Mantener el diseño responsivo, la navegación por teclado/táctil y `prefers-reduced-motion`.
- [x] Permitir rutas de foto locales bajo `public/assets/pieces/` junto a HTTPS y Cloudinary, usando rutas compatibles con GitHub Pages.
- [x] Compilar el sitio, revisar el reparto de stickers sin duplicados y dejar los cambios en una rama de revisión separada de `main`.
