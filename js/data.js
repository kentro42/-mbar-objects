const CLOUD_NAME = "genszcmv";

function imagenUrl(publicId){
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_500/${publicId}`;
}
function videoUrl(publicId){
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}.mp4`;
}

function posterUrl(publicId){
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,f_jpg,q_auto,w_500/${publicId}.jpg`;
}

const objetos = [
  {
    numero: "001",
    id: "objetos/pieza-001",
    title: "Singer de pedal, modelo 66",
    subtitle: "La pieza que abrió el taller de la abuela",
    year: "Circa 1932",
    categoria: "Máquina de coser",
    origen: "Alemania",
    material: "Hierro fundido y roble",
    procedencia: "Colección del local",
    estado: "Exhibición",
    uso: "Confección textil",
    p1: "Esta máquina llegó al local hace más de una década, traída por una clienta que la heredó de su abuela.",
    p2: "Toca el video para verla en movimiento."
  }
  
];

objetos.forEach(o => {
  o.tag = `Pieza ${o.numero}`;
  o.foto = posterUrl(o.id);
  o.video = videoUrl(o.id);
});
