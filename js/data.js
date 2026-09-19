const CLOUD_NAME = "tu_cloud_name_aqui"; 'genszcmv'

const plantillas = [
  {title:"Singer de pedal, modelo 66", subtitle:"La pieza que abrió el taller de la abuela", categoria:"Máquina de coser", origen:"Alemania", material:"Hierro fundido y roble", uso:"Confección textil", year:"1932", p1:"Esta máquina llegó al local hace más de una década, traída por una clienta que la heredó de su abuela.", p2:"Toca el video para verla en movimiento."},
  {title:"Reloj de péndulo Junghans", subtitle:"Marcó el ritmo del local por 40 años", categoria:"Reloj de pared", origen:"Alemania", material:"Nogal y latón", uso:"Cronometraje doméstico", year:"1958", p1:"Su péndulo de latón todavía marca la hora con precisión.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Underwood No. 5", subtitle:"Escribió cartas que nunca se enviaron", categoria:"Máquina de escribir", origen:"Estados Unidos", material:"Acero y baquelita", uso:"Escritura mecánica", year:"1925", p1:"Sus teclas conservan el desgaste de años de uso diario.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Radio de válvulas Philips", subtitle:"La voz de la casa en tardes de lluvia", categoria:"Radio", origen:"Países Bajos", material:"Baquelita y madera", uso:"Recepción de radio AM", year:"1948", p1:"Todavía enciende y sintoniza estaciones AM.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Gramófono His Master's Voice", subtitle:"Suena igual que en 1920", categoria:"Gramófono", origen:"Reino Unido", material:"Latón y madera", uso:"Reproducción de discos", year:"1920", p1:"La bocina amplifica el sonido sin electricidad.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Mecedora vienesa Thonet", subtitle:"El asiento favorito de tres generaciones", categoria:"Mecedora", origen:"Austria", material:"Madera curvada y mimbre", uso:"Mobiliario", year:"1910", p1:"Su técnica de madera curvada la hizo famosa mundialmente.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Baúl de viaje Louis Vuitton (réplica)", subtitle:"Guardó secretos de otros tiempos", categoria:"Baúl", origen:"Francia", material:"Lona y madera", uso:"Almacenaje de viaje", year:"1905", p1:"Sus refuerzos metálicos aún resisten golpes de traslado.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Cámara Kodak Brownie", subtitle:"Capturó los primeros retratos familiares", categoria:"Cámara fotográfica", origen:"Estados Unidos", material:"Baquelita", uso:"Fotografía", year:"1957", p1:"Usaba rollo 620, hoy difícil de conseguir.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Candelabro de bronce", subtitle:"Iluminó cenas de tres generaciones", categoria:"Candelabro", origen:"España", material:"Bronce", uso:"Iluminación", year:"1900", p1:"Cada brazo conserva marcas de cera derretida.", p2:"Video de ejemplo — reemplazar por el clip real."},
  {title:"Máquina registradora National", subtitle:"Sonaba en cada venta del mostrador", categoria:"Caja registradora", origen:"Estados Unidos", material:"Hierro y níquel", uso:"Cobro en tienda", year:"1915", p1:"Su timbre metálico anunciaba cada venta del día.", p2:"Video de ejemplo — reemplazar por el clip real."}
];

const objetos = [];
for(let i=0; i<15; i++){
  const t = plantillas[i % plantillas.length];
  const num = String(i+1).padStart(3,'0');
  objetos.push({
    id: i+1, 
    tag: `Pieza ${num}`,
    title: t.title, 
    subtitle: t.subtitle, 
    categoria: t.categoria, 
    origen: t.origen,
    material: t.material, 
    uso: t.uso, 
    year: `Circa ${t.year}`,
    procedencia: "Colección del local", 
    estado: "Exhibición",
    foto: `https://picsum.photos/seed/obj${i+1}/400/400`, // 👈 Si dejas este valor vacío "" la Polaroid saldrá negra
    video: "LdzSFBtqLks",
    p1: t.p1, 
    p2: t.p2
  });
}
