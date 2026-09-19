const PER_PAGE = 8;
const TOTAL_PAGES = Math.ceil(objetos.length / PER_PAGE);
let currentPage = 0;

function pageItems(pageIndex){
  return objetos.slice(pageIndex*PER_PAGE, pageIndex*PER_PAGE + PER_PAGE);
}

function buildPageHTML(pageIndex){
  const items = pageItems(pageIndex);
  const cards = items.map(o => `
    <div class="polaroid" data-id="${o.id}">
      <div class="shot" style="background-image:url('${o.foto}')"></div>
      <div class="num">${o.tag}</div>
    </div>
  `).join('');
  return `
    <div class="home-header">
      <div class="mark">Ambar Casa Violeta Azul</div>
      <h1>El Álbum</h1>
      <div class="sub">Toca una fotografía</div>
    </div>
    <div class="grid">${cards}</div>
    <div class="pager">
      <button id="prevBtn" ${pageIndex===0?'disabled':''}>‹ Anterior</button>
      <span class="count">${pageIndex+1} / ${TOTAL_PAGES}</span>
      <button id="nextBtn" ${pageIndex===TOTAL_PAGES-1?'disabled':''}>Siguiente ›</button>
    </div>
  `;
}

function attachPageEvents(container, pageIndex){
  container.querySelectorAll('.polaroid').forEach(el=>{
    el.addEventListener('click', ()=> openDetail(parseInt(el.dataset.id), el));
  });
  const prev = container.querySelector('#prevBtn');
  const next = container.querySelector('#nextBtn');
  if(prev) prev.addEventListener('click', ()=> turnPage(pageIndex-1, 'prev'));
  if(next) next.addEventListener('click', ()=> turnPage(pageIndex+1, 'next'));
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
  if(targetPage < 0 || targetPage > TOTAL_PAGES-1) return;

  backSide.innerHTML = buildPageHTML(targetPage);
  attachPageEvents(backSide, targetPage);

  leaf.style.transformOrigin = direction === 'next' ? 'left center' : 'right center';
  leaf.classList.add('turning'); // activa preserve-3d solo mientras dura el giro

  requestAnimationFrame(()=>{
    leaf.style.transform = direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
  });

  setTimeout(()=>{
    currentPage = targetPage;
    frontSide.innerHTML = buildPageHTML(currentPage);
    attachPageEvents(frontSide, currentPage);
    backSide.innerHTML = '';
    leaf.style.transition = 'none';
    leaf.style.transform = 'rotateY(0deg)';
    leaf.classList.remove('turning'); // vuelve a scroll normal, sin contexto 3D
    // forzar reflow antes de restaurar la transición
    void leaf.offsetHeight;
    leaf.style.transition = '';
  }, 1120);
}

/* ---------- detalle con zoom ---------- */
const overlay = document.getElementById('overlay');
const mediaBox = document.getElementById('mediaBox');
const detailContent = document.getElementById('detailContent');
const closeBtn = document.getElementById('closeBtn');
const stage = document.getElementById('stage');
let lastRect = null;

let lastScale = null;

function openDetail(id, sourceEl){
  const o = objetos.find(x=>x.id===id);
  const rect = sourceEl.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  lastRect = rect;

  mediaBox.innerHTML = `
    <img src="https://img.youtube.com/vi/${o.video}/hqdefault.jpg" alt="Video del objeto">
    <div class="play" id="playBtn"></div>
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

  // el overlay ahora es 100% ancho / 100vh alto por CSS (siempre correcto, sin
  // depender de medidas en JS); solo calculamos desde dónde "nace" el zoom.
  const scaleX = rect.width / stageRect.width;
  const scaleY = rect.height / window.innerHeight;
  const translateX = rect.left - stageRect.left;
  const translateY = rect.top - stageRect.top;
  lastScale = {scaleX, scaleY, translateX, translateY};

  overlay.style.transition = 'none';
  overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  overlay.classList.add('show');
  void overlay.offsetHeight;

  requestAnimationFrame(()=>{
    overlay.style.transition = '';
    overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
  });

  setTimeout(()=>{ detailContent.classList.add('show'); }, 380);

  document.getElementById('playBtn').addEventListener('click', ()=>{
    mediaBox.innerHTML = `<iframe src="https://www.youtube.com/embed/${o.video}?autoplay=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }, {once:true});
}

function closeDetail(){
  if(!lastScale) return;
  detailContent.classList.remove('show');
  const {scaleX, scaleY, translateX, translateY} = lastScale;
  overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  setTimeout(()=>{ overlay.classList.remove('show'); }, 460);
}
closeBtn.addEventListener('click', closeDetail);