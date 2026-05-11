const treeContainer = document.getElementById('tree-container');
const treeMobileContainer = document.getElementById('tree-mobile-container');
const tocContainer = document.getElementById('chronicle-toc');
const personModal = document.getElementById('person-modal');
const chapterModal = document.getElementById('chapter-modal');
const modalBody = document.getElementById('modal-body');
const chapterBody = document.getElementById('chapter-body');
const modalClose = document.querySelectorAll('.modal-close');

// ===================== Общие функции =====================
const cardCoords = {
  firs: [1250, 30],
  afanasiy: [1250, 190],
  ivan_af: [1250, 350],
  marina: [600, 430],
  andrey: [1250, 530],
  anna_m: [450, 710],
  ekaterina: [1050, 700],
  ivan_andr: [1550, 710],
  klavdiya: [1750, 840],
  nikolay_yazev: [1250, 870],
  yuriy_nik: [600, 1050],
  mariya: [950, 1050],
  leonid: [1300, 1050],
  lyudmila: [1500, 1050],
  tatyana_n: [1700, 1050],
  andrey_nik: [1900, 1050],
  anatoliy_nik: [2100, 1050],
  sergey_yazev: [2100, 1220],
  vera: [400, 1260],
  lyubov: [750, 1260],
  sergey_kov: [1450, 1220],
  kseniya: [1300, 1220],
  anatoliy_kov: [1050, 1410],
  aleksandr_kov: [1450, 1410],
  ivan_che: [2500, 170],
  praskovya: [2350, 340],
  nikolay_che: [2500, 530],
  raisa: [2350, 700],
  yuriy_che: [1850, 1410],
  aleksandr_che: [1100, 1410],
  evgeniy: [600, 1600],
  igor_che: [850, 1600],
  alexandr_evg: [350, 1780],
  dmitriy: [700, 1780],
  vladimir: [1500, 1600],
  aleksandr_sam: [1250, 1780],
  svetlana: [1650, 1780]
};

function showPerson(id) {
  const person = people.find(p => p.id === id);
  if (!person) return;

  const children = links.filter(l => l.from === id).map(l => people.find(p => p.id === l.to)).filter(Boolean);
  const parents = links.filter(l => l.to === id).map(l => people.find(p => p.id === l.from)).filter(Boolean);
  let spouse = null;
  if (children.length > 0) {
    const spouseLinks = links.filter(l => children.some(c => c.id === l.to) && l.from !== id);
    const spouseId = spouseLinks[0]?.from;
    spouse = people.find(p => p.id === spouseId);
  }

  const galleryPhotos = [];
  if (person.photo && person.photo !== 'images/placeholder.jpg') galleryPhotos.push({ src: person.photo, caption: person.name });
  if (spouse && spouse.photo && spouse.photo !== 'images/placeholder.jpg') galleryPhotos.push({ src: spouse.photo, caption: spouse.name });
  parents.forEach(p => { if (p.photo && p.photo !== 'images/placeholder.jpg') galleryPhotos.push({ src: p.photo, caption: p.name }); });
  children.forEach(c => { if (c.photo && c.photo !== 'images/placeholder.jpg') galleryPhotos.push({ src: c.photo, caption: c.name }); });

  const makeLinks = (arr) => arr.map(p => `<span class="person-link" data-id="${p.id}">${p.name}</span>`).join(', ') || '—';

  modalBody.innerHTML = `
    <div class="modal-person">
      <img class="modal-person-main-photo" src="${person.photo}" alt="${person.name}" onerror="this.src='images/placeholder.jpg'" />
      <h2>${person.name}</h2>
      <div class="years">${person.birth || ''} ${person.death ? '– ' + person.death : ''}</div>
      <p class="bio">${person.desc}</p>
      <div class="relations">
        <p><strong>Родители:</strong> ${makeLinks(parents)}</p>
        ${spouse ? `<p><strong>Супруг(а):</strong> <span class="person-link" data-id="${spouse.id}">${spouse.name}</span></p>` : ''}
        <p><strong>Дети:</strong> ${makeLinks(children)}</p>
      </div>
      ${galleryPhotos.length > 0 ? `
        <div class="gallery-title">Фотографии (${galleryPhotos.length})</div>
        <div class="gallery-grid">
          ${galleryPhotos.map(g => `<div class="gallery-item"><img src="${g.src}" alt="${g.caption}" loading="lazy" /><div class="gal-caption">${g.caption}</div></div>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  modalBody.querySelectorAll('.person-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      showPerson(link.dataset.id);
    });
  });

  personModal.style.display = 'block';
}

// ===================== ДЕСКТОПНОЕ ДЕРЕВО =====================
let scale = 1, translateX = 0, translateY = 0;
const treeWrapper = document.getElementById('tree-wrapper-desktop');
const zoomLevelDisplay = document.getElementById('zoom-level');

function applyTransform() {
  treeContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  zoomLevelDisplay.textContent = Math.round(scale * 100) + '%';
}

function setScale(newScale, centerX, centerY) {
  const oldScale = scale;
  scale = Math.max(0.3, Math.min(2.5, newScale));
  if (centerX !== undefined && centerY !== undefined) {
    const dx = centerX - translateX;
    const dy = centerY - translateY;
    const factor = scale / oldScale;
    translateX = centerX - dx * factor;
    translateY = centerY - dy * factor;
  }
  applyTransform();
}

function fitToScreenDesktop() {
  const wrapper = treeWrapper;
  if (!wrapper || wrapper.offsetWidth === 0) return;
  const wrapperWidth = wrapper.clientWidth;
  const wrapperHeight = wrapper.clientHeight;
  const containerWidth = 3000;
  const containerHeight = 2000;
  const scaleX = wrapperWidth / containerWidth;
  const scaleY = wrapperHeight / containerHeight;
  const fitScale = Math.min(scaleX, scaleY, 1);
  scale = fitScale;
  translateX = (wrapperWidth - containerWidth * scale) / 2;
  translateY = (wrapperHeight - containerHeight * scale) / 2;
  applyTransform();
}

function drawTreeDesktop() {
  if (!treeContainer) return;
  treeContainer.innerHTML = '';

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "3000");
  svg.setAttribute("height", "2000");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "1";

  links.forEach(link => {
    const from = cardCoords[link.from];
    const to = cardCoords[link.to];
    if (!from || !to) return;
    const x1 = from[0] + 80;
    const y1 = from[1] + 122;
    const x2 = to[0] + 80;
    const y2 = to[1];

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#baa68b");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  });
  treeContainer.appendChild(svg);

  Object.entries(cardCoords).forEach(([id, [left, top]]) => {
    const person = people.find(p => p.id === id);
    if (!person) return;

    const card = document.createElement('div');
    card.className = `tree-card ${person.category}`;
    card.style.left = left + 'px';
    card.style.top = top + 'px';
    card.setAttribute('data-id', id);
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      showPerson(id);
    });

    card.innerHTML = `
      <img src="${person.photo}" alt="${person.name}" onerror="this.src='images/placeholder.jpg'" />
      <div class="card-info">
        <div class="card-name">${person.name.split(' ')[0]}</div>
        <div class="card-years">${person.birth || ''} ${person.death ? '– ' + person.death : ''}</div>
      </div>
    `;
    treeContainer.appendChild(card);
  });
}

// Drag & pinch для десктопа
let isDragging = false, startX, startY, startTranslateX, startTranslateY;
let pinchStartDist = 0, pinchStartScale = 1;

function onPointerDown(e) {
  if (e.target.closest('.tree-card')) return;
  e.preventDefault();
  if (e.touches && e.touches.length === 2) {
    isDragging = false;
    pinchStartDist = getTwoFingersDist(e);
    pinchStartScale = scale;
    return;
  }
  isDragging = true;
  const pos = getEventPos(e);
  startX = pos.x; startY = pos.y;
  startTranslateX = translateX; startTranslateY = translateY;
  treeWrapper.style.cursor = 'grabbing';
}

function onPointerMove(e) {
  if (e.touches && e.touches.length === 2) {
    e.preventDefault();
    const dist = getTwoFingersDist(e);
    if (pinchStartDist > 0) {
      const newScale = pinchStartScale * (dist / pinchStartDist);
      scale = Math.max(0.3, Math.min(2.5, newScale));
      applyTransform();
    }
    return;
  }
  if (!isDragging) return;
  e.preventDefault();
  const pos = getEventPos(e);
  translateX = startTranslateX + (pos.x - startX);
  translateY = startTranslateY + (pos.y - startY);
  applyTransform();
}

function onPointerUp() {
  isDragging = false;
  treeWrapper.style.cursor = 'grab';
  pinchStartDist = 0;
}

function getEventPos(e) {
  if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function getTwoFingersDist(e) {
  if (!e.touches || e.touches.length < 2) return 0;
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx*dx + dy*dy);
}

if (treeWrapper) {
  treeWrapper.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', (e) => { if (isDragging) onPointerMove(e); });
  window.addEventListener('mouseup', onPointerUp);
  treeWrapper.addEventListener('touchstart', onPointerDown, { passive: false });
  treeWrapper.addEventListener('touchmove', onPointerMove, { passive: false });
  treeWrapper.addEventListener('touchend', onPointerUp);
  treeWrapper.addEventListener('touchcancel', onPointerUp);
}

// Кнопки зума (десктоп)
document.getElementById('zoom-in')?.addEventListener('click', () => setScale(scale * 1.3, treeWrapper.clientWidth/2, treeWrapper.clientHeight/2));
document.getElementById('zoom-out')?.addEventListener('click', () => setScale(scale / 1.3, treeWrapper.clientWidth/2, treeWrapper.clientHeight/2));
document.getElementById('zoom-reset')?.addEventListener('click', fitToScreenDesktop);

// ===================== МОБИЛЬНОЕ ДЕРЕВО =====================
function buildMobileTree() {
  if (!treeMobileContainer) return;
  // Строим упрощённое вертикальное дерево: перечисляем всех людей, группируем по поколениям
  // Используем порядок, основанный на cardCoords (по y-координате)
  const sortedPeople = people
    .filter(p => cardCoords[p.id]) // только те, что на дереве
    .sort((a, b) => cardCoords[a.id][1] - cardCoords[b.id][1]); // сортировка по y

  const list = document.createElement('ul');
  list.className = 'tree-mobile-list';

  let currentY = null;
  sortedPeople.forEach(person => {
    const pos = cardCoords[person.id];
    // Добавляем стрелку, если переход на новое поколение (разрыв по Y > 150)
    if (currentY !== null && pos[1] - currentY > 150) {
      const arrow = document.createElement('li');
      arrow.className = 'mobile-arrow';
      arrow.textContent = '↓';
      list.appendChild(arrow);
    }
    currentY = pos[1];

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="mobile-card ${person.category}" data-id="${person.id}">
        <img src="${person.photo}" alt="${person.name}" onerror="this.src='images/placeholder.jpg'" />
        <div class="info">
          <div class="name">${person.name}</div>
          <div class="years">${person.birth || ''} ${person.death ? '– ' + person.death : ''}</div>
        </div>
      </div>
    `;
    li.querySelector('.mobile-card').addEventListener('click', (e) => {
      showPerson(person.id);
    });
    list.appendChild(li);
  });

  treeMobileContainer.innerHTML = '';
  treeMobileContainer.appendChild(list);
}

// ===================== ЛЕТОПИСЬ =====================
function renderTOC() {
  tocContainer.innerHTML = chapters.map((ch, i) => `<li><a href="#" data-index="${i}">${ch.title}</a></li>`).join('');
  document.querySelectorAll('.chronicle-toc a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const i = e.target.dataset.index;
      const ch = chapters[i];
      chapterBody.innerHTML = `<h3>${ch.title}</h3><p>${ch.text.replace(/\n/g, '</p><p>')}</p>`;
      chapterModal.style.display = 'block';
    });
  });
}

// ===================== ЗАКРЫТИЕ МОДАЛОК =====================
modalClose.forEach(btn => btn.addEventListener('click', () => {
  personModal.style.display = 'none';
  chapterModal.style.display = 'none';
}));
window.addEventListener('click', e => {
  if (e.target === personModal) personModal.style.display = 'none';
  if (e.target === chapterModal) chapterModal.style.display = 'none';
});

// ===================== ФИЛЬТРЫ =====================
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

function applyFilter(filterVal) {
  // Десктопные карточки
  document.querySelectorAll('.tree-card').forEach(card => {
    const id = card.getAttribute('data-id');
    const person = people.find(p => p.id === id);
    card.style.display = (!person || filterVal === 'all' || person.category === filterVal) ? 'block' : 'none';
  });
  // Мобильные карточки
  document.querySelectorAll('.mobile-card').forEach(card => {
    const id = card.getAttribute('data-id');
    const person = people.find(p => p.id === id);
    card.style.display = (!person || filterVal === 'all' || person.category === filterVal) ? 'flex' : 'none';
    // также скрываем родительский li
    const li = card.closest('li');
    if (li) li.style.display = card.style.display;
  });
}

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
drawTreeDesktop();
buildMobileTree();
renderTOC();
fitToScreenDesktop();
window.addEventListener('resize', () => {
  fitToScreenDesktop();
  // Если мобильное дерево уже построено, обновлять не нужно, только если размер поменялся — мы не перестраиваем
});
