/* Este archivo asume que data.js ya se cargó antes y que existe
   la variable global "objetos" con la lista de piezas. */

const PER_PAGE = 8;
const TOTAL_PAGES = Math.max(1, Math.ceil(objetos.length / PER_PAGE));
let currentPage = 0;

function pageItems(pageIndex){
  return objetos.slice(pageIndex * PER_PAGE, pageIndex * PER_PAGE + PER_PAGE);
}

function buildPageHTML(pageIndex){
  const items = pageItems(pageIndex);
  const cards = items.map(o => `
    <div class="polaroid" data-id="${o.id}">
      <div class="shot" style="background-image:url('${o.foto}')"></div>
      <div class="num">${o.tag}</div>
      <div class="cap">✦</div>
    </div>
  `).join('');
  return `
    <div class="home-header">
      <div class="mark">Casa Violeta Azul</div>
      <h1>El Álbum</h1>
      <div class="sub">Toca una fotografía</div>
    </div>
    <div class="grid">${cards}</div>
    <div class="pager">
      <button id="prevBtn" ${pageIndex === 0 ? 'disabled' : ''}>‹ Anterior</button>
      <span class="count">${pageIndex + 1} / ${TOTAL_PAGES}</span>
      <button id="nextBtn" ${pageIndex === TOTAL_PAGES - 1 ? 'disabled' : ''}>Siguiente ›</button>
    </div>
  `;
}

function attachPageEvents(container, pageIndex){
  container.querySelectorAll('.polaroid').forEach(el => {
    el.addEventListener('click', () => openDetail(el.dataset.id, el));
  });
  const prev = container.querySelector('#prevBtn');
  const next = container.querySelector('#nextBtn');
  if(prev) prev.addEventListener('click', () => turnPage(pageIndex - 1, 'prev'));
  if(next) next.addEventListener('click', () => turnPage(pageIndex + 1, 'next'));
}

const frontSide = document.getElementById('frontSide');
const backSide = document.getElementById('backSide');
const leaf = document.getElementById('leaf');

function renderInitial(){
  frontSide.innerHTML = buildPageHTML(currentPage);
  attachPageEvents(frontSide, currentPage);
}
renderInitial();

function turnPage(targetPage, direction){
  if(targetPage < 0 || targetPage > TOTAL_PAGES - 1) return;

  backSide.innerHTML = buildPageHTML(targetPage);
  attachPageEvents(backSide, targetPage);

  leaf.style.transformOrigin = direction === 'next' ? 'left center' : 'right center';
  leaf.classList.add('turning'); // activa preserve-3d solo mientras dura el giro

  requestAnimationFrame(() => {
    leaf.style.transform = direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
  });

  setTimeout(() => {
    currentPage = targetPage;
    frontSide.innerHTML = buildPageHTML(currentPage);
    attachPageEvents(frontSide, currentPage);
    backSide.innerHTML = '';
    leaf.style.transition = 'none';
    leaf.style.transform = 'rotateY(0deg)';
    leaf.classList.remove('turning'); // vuelve a scroll normal, sin contexto 3D
    void leaf.offsetHeight; // fuerza reflow antes de restaurar la transición
    leaf.style.transition = '';
  }, 1120);
}

/* ---------- ficha de detalle con zoom ---------- */
const overlay = document.getElementById('overlay');
const mediaBox = document.getElementById('mediaBox');
const detailContent = document.getElementById('detailContent');
const closeBtn = document.getElementById('closeBtn');
const stage = document.getElementById('stage');
let lastScale = null;

function openDetail(id, sourceEl){
  const o = objetos.find(x => x.id === id);
  const rect = sourceEl.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();

  // video propio alojado en Cloudinary: se reproduce dentro del mismo
  // recuadro, sin redirigir a ninguna otra página.
  mediaBox.innerHTML = `
    <video controls preload="none" poster="${o.foto}" playsinline>
      <source src="${o.video}" type="video/mp4">
    </video>
  `;

  detailContent.className = 'content';
  detailContent.innerHTML = `
    <div class="eyebrow-row"><span>${o.year}</span><span>${o.categoria}</span><span>${o.origen}</span></div>
    <h2 class="title">${o.title}</h2>
    <p class="subtitle">${o.subtitle}</p>
    <dl class="facts">
      <div class="fact"><dt>Material</dt><dd>${o.material}</dd></div>
      <div class="fact"><dt>Procedencia</dt><dd>${o.procedencia}</dd></div>
      <div class="fact"><dt>Estado</dt><dd>${o.estado}</dd></div>
      <div class="fact"><dt>Uso original</dt><dd>${o.uso}</dd></div>
    </dl>
    <p class="body">${o.p1}</p>
    <p class="body">${o.p2}</p>
  `;

  // el overlay siempre mide 100% / 100vh por CSS; solo animamos su
  // transform (más liviano que animar left/top/width/height).
  const scaleX = rect.width / stageRect.width;
  const scaleY = rect.height / window.innerHeight;
  const translateX = rect.left - stageRect.left;
  const translateY = rect.top - stageRect.top;
  lastScale = {scaleX, scaleY, translateX, translateY};

  overlay.style.transition = 'none';
  overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  overlay.classList.add('show');
  void overlay.offsetHeight;

  requestAnimationFrame(() => {
    overlay.style.transition = '';
    overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
  });

  setTimeout(() => { detailContent.classList.add('show'); }, 380);
}

function closeDetail(){
  if(!lastScale) return;
  detailContent.classList.remove('show');
  const {scaleX, scaleY, translateX, translateY} = lastScale;
  overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  setTimeout(() => {
    overlay.classList.remove('show');
    mediaBox.innerHTML = ''; // detiene el video al cerrar
  }, 460);
}
closeBtn.addEventListener('click', closeDetail);
