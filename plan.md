# Plan: rediseño de Ámbar Casa Violeta Azul

## Dirección visual

- **Movimiento:** carta ilustrada de casa/restaurante local mezclada con cuaderno de recortes hecho a mano; evitar acabados genéricos, renders y recursos de aspecto sintético.
- **Principios:** papel crema cálido; azul cielo y azul tinta como colores principales; coral/salmón y amarillo del distintivo como acentos; ilustraciones PNG auténticas; fotos de objetos siempre legibles y no tapadas.
- **Paleta:** crema de carta para hojas; azul cielo para el lomo, nubes y algunos cuadros; azul profundo para texto; coral para sellos, líneas y controles; amarillo sólo como guiño al distintivo de Ámbar.
- **Composición:** mantener el cuaderno y la paginación existentes. Usar margen editorial, renglones suaves, tarjetas inclinadas de manera mínima y stickers en zonas periféricas; que los elementos decorativos queden detrás de las fotos y del texto.
- **Motivos distintivos:** distintivo circular real de Ámbar Tu Casa; nubes CSS de borde irregular en azul, coral y blanco; PNG del usuario colocados como pegatinas con sombra de papel.
- **Interacción y movimiento:** conservar la navegación táctil, de teclado y el giro 3D ya implementados. Limitar los cambios de estilo a feedback leve; respetar `prefers-reduced-motion`.
- **Tipografía:** Fredoka para titulares con peso y personalidad; Kalam para notas manuscritas; DM Sans para lectura y DM Mono para etiquetas pequeñas. Mantener alternativas locales del sistema.
- **Esencia de marca:** “Objetos, sabores y hogar”; cercana, curiosa y auténtica.
- **Voz:** hablar con calidez y sin solemnidad. Ejemplos: “Objetos que ya tienen casa en nuestras historias.” / “Mira sin afán; cada cosa tiene algo que contar.”
- **Logotipo:** usar el archivo auténtico `Ambar_abduccioncirculo.png`; centrarlo en la portada y reproducirlo pequeño en la esquina inferior izquierda de cada foto, dentro de una placa clara de bajo contraste.
- **Color de marca:** azul cielo de la carta, equilibrado con el amarillo presente en el distintivo original.

## Implementación y estructura

- `src/albums/ambar-casa-violeta-azul.js`: color de cubierta, distintivo auténtico y catálogo explícito de stickers originales.
- `src/utils/albumRoutes.js`: resolver URLs de Cloudinary, HTTPS y rutas de `public/` con la base relativa de Vite/GitHub Pages.
- `src/utils/pageDecorations.js`: repartir stickers de forma determinista por índice de página y no repetir archivos.
- `src/components/pieces/PageStickers.jsx`: capa decorativa accesible que coloca los stickers y nubes detrás del contenido; las páginas nuevas reciben los siguientes recursos únicos.
- `src/components/pieces/AlbumPage.jsx` y `PieceCard.jsx`: integrar la decoración de página y el distintivo no obstructivo de cada fotografía.
- `src/components/book/BookCover.jsx`: portada/contraportada de la misma familia visual, con el logo centrado en portada.
- `src/styles/album.css`: paleta, tipografía, papel, nubes CSS, tarjetas y comportamiento móvil, preservando las clases de transición del libro.
- No generar ni sustituir stickers; los assets PNG del usuario son la fuente decorativa. Si se agota el catálogo único, usar variaciones de nubes CSS en vez de reciclar un sticker.
