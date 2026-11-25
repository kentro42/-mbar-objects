export const CLOUD_NAME = 'genszcmv';

// PNG aportados por el usuario. Cada archivo se reserva para una sola página.
// Care_chimba.png se conserva en assets, pero no se usa en este álbum.
const stickers = [
  { file: 'assets/pieces/alpinito.png', name: 'Alpinito' },
  { file: 'assets/pieces/Arcoiris.png', name: 'Arcoíris' },
  { file: 'assets/pieces/Avion_papelazul.png', name: 'Avión de papel azul' },
  { file: 'assets/pieces/Barco.png', name: 'Barco' },
  { file: 'assets/pieces/Bici_Hombre.png', name: 'Bicicleta' },
  { file: 'assets/pieces/Caballo2.png', name: 'Caballo' },
  { file: 'assets/pieces/Carro_fantasma.png', name: 'Carro fantasma' },
  { file: 'assets/pieces/Casa_cama.png', name: 'Casa-cama' },
  { file: 'assets/pieces/cena_Patp.png', name: 'Cena' },
  { file: 'assets/pieces/Dragon2.png', name: 'Dragón' },
  { file: 'assets/pieces/Et.png', name: 'ET' },
  { file: 'assets/pieces/Globo terraqueo.png', name: 'Globo terráqueo' },
  { file: 'assets/pieces/Grabadora.png', name: 'Grabadora' },
  { file: 'assets/pieces/Matera3.png', name: 'Matera' },
  { file: 'assets/pieces/Montaña.png', name: 'Montaña' },
  { file: 'assets/pieces/Notas_musicales.png', name: 'Notas musicales' },
  { file: 'assets/pieces/Pato.png', name: 'Pato' },
  { file: 'assets/pieces/Perro_angel.png', name: 'Perro ángel' },
  { file: 'assets/pieces/Pocillo.png', name: 'Pocillo' },
  { file: 'assets/pieces/Sinverguenza.png', name: 'Sinvergüenza' },
  { file: 'assets/pieces/Sticker_casafantasma.png', name: 'Carro de casa fantasma' },
  { file: 'assets/pieces/Sticker_mujer.png', name: 'Mujer' },
  { file: 'assets/pieces/Telefono_publico.png', name: 'Teléfono público' },
  { file: 'assets/pieces/Tv1.png', name: 'Televisor' },
  { file: 'assets/pieces/Ambar_myfriend.png', name: 'Ámbar my friend' }
];

// Una entrada por pieza. `video` recibe un ID de YouTube o una cadena vacía;
// `p2` es opcional y se omite si no hay una segunda nota real.
const plantillas = [
  {
    title: 'Singer de pedal, modelo 66',
    subtitle: 'La pieza que abrió el taller de la abuela',
    categoria: 'Máquina de coser',
    origen: 'Alemania',
    material: 'Hierro fundido y roble',
    uso: 'Confección textil',
    year: '1932',
    video: 'LdzSFBtqLks',
    p1: 'Esta máquina llegó al local hace más de una década, traída por una clienta que la heredó de su abuela.'
  },
  {
    title: 'Reloj de péndulo Junghans',
    subtitle: 'Marcó el ritmo del local por 18 años',
    categoria: 'Reloj de pared',
    origen: 'Alemania',
    material: 'Nogal y latón',
    uso: 'Cronometraje doméstico',
    year: '1958',
    video: '',
    p1: 'Su péndulo de latón todavía marca la hora con precisión.'
  },
  {
    title: 'Underwood No. 5',
    subtitle: 'Escribió cartas que nunca se enviaron',
    categoria: 'Máquina de escribir',
    origen: 'Estados Unidos',
    material: 'Acero y baquelita',
    uso: 'Escritura mecánica',
    year: '1925',
    video: '',
    p1: 'Sus teclas conservan el desgaste de años de uso diario.'
  },
  {
    title: 'Radio de válvulas Philips',
    subtitle: 'La voz de la casa en tardes de lluvia',
    categoria: 'Radio',
    origen: 'Países Bajos',
    material: 'Baquelita y madera',
    uso: 'Recepción de radio AM',
    year: '1948',
    video: '',
    p1: 'Todavía enciende y sintoniza estaciones AM.'
  },
  {
    title: "Gramófono His Master's Voice",
    subtitle: 'Suena igual que en 1920',
    categoria: 'Gramófono',
    origen: 'Reino Unido',
    material: 'Latón y madera',
    uso: 'Reproducción de discos',
    year: '1920',
    video: '',
    p1: 'La bocina amplifica el sonido sin electricidad.'
  },
  {
    title: 'Mecedora vienesa Thonet',
    subtitle: 'El asiento favorito de tres generaciones',
    categoria: 'Mecedora',
    origen: 'Austria',
    material: 'Madera curvada y mimbre',
    uso: 'Mobiliario',
    year: '1910',
    video: '',
    p1: 'Su técnica de madera curvada la hizo famosa mundialmente.'
  },
  {
    title: 'Baúl de viaje Louis Vuitton (réplica)',
    subtitle: 'Guardó secretos de otros tiempos',
    categoria: 'Baúl',
    origen: 'Francia',
    material: 'Lona y madera',
    uso: 'Almacenaje de viaje',
    year: '1905',
    video: '',
    p1: 'Sus refuerzos metálicos aún resisten golpes de traslado.'
  },
  {
    title: 'Cámara Kodak Brownie',
    subtitle: 'Capturó los primeros retratos familiares',
    categoria: 'Cámara fotográfica',
    origen: 'Estados Unidos',
    material: 'Baquelita',
    uso: 'Fotografía',
    year: '1957',
    video: '',
    p1: 'Usaba rollo 620, hoy difícil de conseguir.'
  },
  {
    title: 'Candelabro de bronce',
    subtitle: 'Iluminó cenas de tres generaciones',
    categoria: 'Candelabro',
    origen: 'España',
    material: 'Bronce',
    uso: 'Iluminación',
    year: '1900',
    video: '',
    p1: 'Cada brazo conserva marcas de cera derretida.'
  },
  {
    title: 'Máquina registradora National',
    subtitle: 'Sonaba en cada venta del mostrador',
    categoria: 'Caja registradora',
    origen: 'Estados Unidos',
    material: 'Hierro y níquel',
    uso: 'Cobro en tienda',
    year: '1915',
    video: '',
    p1: 'Su timbre metálico anunciaba cada venta del día.'
  }
];

export const objetos = plantillas.map((plantilla, index) => {
  const num = String(index + 1).padStart(3, '0');
  return {
    id: index + 1,
    tag: `Pieza ${num}`,
    title: plantilla.title,
    subtitle: plantilla.subtitle,
    categoria: plantilla.categoria,
    origen: plantilla.origen,
    material: plantilla.material,
    uso: plantilla.uso,
    year: `año ${plantilla.year}`,
    procedencia: 'Colección del local',
    estado: 'Exhibición',
    foto: plantilla.foto || '',
    video: plantilla.video || '',
    p1: plantilla.p1 || '',
    p2: plantilla.p2 || ''
  };
});

// La fotografía propia de la primera ficha sustituye el recurso de muestra.
objetos[0].foto = '80e09bd1d6fec9dab31e192f8f0c9004.jpg';

const album = {
  id: 'ambar-tu-casa',
  legacyRouteIds: ['ambar-casa-violeta-azul'],
  cloudName: CLOUD_NAME,
  brand: 'Ámbar Tu Casa',
  title: 'Ámbar Tu Casa',
  subtitle: 'Objetos, sabores y hogar',
  itemsPerPage: 6,
  pieces: objetos,
  coverColor: '#dfc266',
  branding: {
    logo: 'assets/pieces/Ambar_abduccioncirculo.png',
    signatureLogo: 'assets/pieces/Ambar_logo.png'
  },
  stickers,
  cover: {
    front: {
      eyebrow: 'Objetos, sabores y hogar',
      title: 'Casa de los objetos',
      note: 'Cada objeto guarda una historia. Mire sin afán; todavía tiene algo que contar.'
    },
    back: {
      note: 'Gracias por mirar sin afán. Cada objeto guarda recuerdos que siguen aquí.',
      signature: 'Ámbar Tu Casa'
    }
  }
};

export default album;
