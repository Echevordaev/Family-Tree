// ===================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====================
const treeContainer = document.getElementById('tree-container');
const tocContainer = document.getElementById('chronicle-toc');
const personModal = document.getElementById('person-modal');
const chapterModal = document.getElementById('chapter-modal');
const modalBody = document.getElementById('modal-body');
const chapterBody = document.getElementById('chapter-body');
const modalClose = document.querySelectorAll('.modal-close');

// Цвета категорий
const categoryColors = {
  yazev: '#c7a87b',
  chevardaev: '#9bb7c7',
  koveshnikov: '#b8a89a',
  samsnov: '#c7b89b'
};

// Координаты узлов (x, y) на холсте 3000x2100
const nodeCoords = {
  firs: [1250, 60],
  afanasiy: [1250, 220],
  ivan_af: [1250, 380],
  marina: [600, 460],
  andrey: [1250, 560],
  anna_m: [450, 740],
  ekaterina: [1050, 730],
  ivan_andr: [1550, 740],
  klavdiya: [1750, 870],
  nikolay_yazev: [1250, 920],
  yuriy_nik: [600, 1100],
  mariya: [950, 1100],
  leonid: [1300, 1100],
  lyudmila: [1500, 1100],
  tatyana_n: [1700, 1100],
  andrey_nik: [1900, 1100],
  anatoliy_nik: [2100, 1100],
  sergey_yazev: [2100, 1270],
  vera: [400, 1300],
  lyubov: [750, 1300],
  sergey_kov: [1450, 1270],
  kseniya: [1300, 1270],
  anatoliy_kov: [1050, 1450],
  aleksandr_kov: [1450, 1450],
  ivan_che: [2500, 200],
  praskovya: [2350, 370],
  nikolay_che: [2500, 560],
  raisa: [2350, 730],
  yuriy_che: [1850, 1450],
  aleksandr_che: [1100, 1450],
  evgeniy: [600, 1650],
  igor_che: [850, 1650],
  alexandr_evg: [350, 1830],
  dmitriy: [700, 1830],
  vladimir: [1500, 1650],
  aleksandr_sam: [1250, 1830],
  svetlana: [1650, 1830],

  // Новые узлы
  nina_kov: [800, 1630],
  nadezhda_kov: [1000, 1630],
  nadya_kov: [700, 1800],
  dmitriy_nad: [1050, 1800],
  lyubov_kov: [1300, 1630],
  mikhail_kov: [1500, 1630],
  alexey_che: [1700, 1630],
  vyacheslav_che: [1900, 1630],
  tatyana_alexey: [1750, 1800],
  tatyana_vyach: [1950, 1800],
  artem_che: [1650, 1950],
  lera_che: [1950, 1950]
};

// Масштаб и смещение
let scale = 1, translateX = 50, translateY = 50;

// ===================== ФУНКЦИЯ ОТРИСОВКИ ДЕРЕВА =====================
function drawTree() {
  treeContainer.innerHTML = '';
  treeContainer.style.position = 'relative';
  treeContainer.style.width = '3000px';
  treeContainer.style.height = '2100px';
  treeContainer.style.transformOrigin = 'top left';

  // Создаём SVG для линий
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "3000");
  svg.setAttribute("height", "2100");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "1";

  // Рисуем линии связей
  links.forEach(link => {
    const from = nodeCoords[link.from];
    const to = nodeCoords[link.to];
    if (!from || !to) return;

    const path = document.createElementNS(svgNS, "path");
    const x1 = from[0], y1 = from[1] + 35;
    const x2 = to[0], y2 = to[1] - 35;
    const midX = (x1 + x2) / 2;
    const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#baa68b");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
  });

  treeContainer.appendChild(svg);

  // Рисуем узлы
  Object.entries(nodeCoords).forEach(([id, [x, y]]) => {
    const person = people.find(p => p.id === id);
    if (!person) return;

    const nodeGroup = document.createElement('div');
    nodeGroup.className = 'tree-node';
    nodeGroup.style.left = (x - 35) + 'px';
    nodeGroup.style.top = (y - 35) + 'px';
    nodeGroup.style.width = '70px';
    nodeGroup.style.height = '70px';
    nodeGroup.style.position = 'absolute';
    nodeGroup.style.cursor = 'pointer';
    nodeGroup.style.zIndex = '2';
    nodeGroup.setAttribute('data-id', id);

    const circle = document.createElement('div');
    circle.className = 'tree-circle';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.borderRadius = '50%';
    circle.style.overflow = 'hidden';
    circle.style.border = '2px solid #5a4a3a';
    circle.style.backgroundColor = categoryColors[person.category] || '#ccc';
    circle.style.backgroundSize = 'cover';
    circle.style.backgroundPosition = 'center';
    circle.style.display = 'flex';
    circle.style.alignItems = 'center';
    circle.style.justifyContent = 'center';

    if (person.photo && person.photo !== 'images/placeholder.jpg') {
      circle.style.backgroundImage = `url("${person.photo}")`;
      circle.style.color = 'transparent';
    } else {
      const initials = person.name.split(' ').map(w => w[0]).join('').substring(0, 2);
      circle.innerHTML = `<span style="color:#3b2e1e;font-weight:bold;font-size:20px;">${initials}</span>`;
    }

    const label = document.createElement('div');
    label.className = 'tree-label';
    label.style.position = 'absolute';
    label.style.top = '75px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.textAlign = 'center';
    label.style.fontSize = '12px';
    label.style.color = '#3b2e1e';
    label.style.whiteSpace = 'nowrap';
    const shortName = person.name.split(' ').slice(0, 2).join(' ');
    label.textContent = shortName;
    if (person.birth) {
      label.innerHTML += `<br><span style="font-size:10px;color:#7a6855;">${person.birth}${person.death ? '–' + person.death : ''}</span>`;
    }

    nodeGroup.appendChild(circle);
    nodeGroup.appendChild(label);
    nodeGroup.addEventListener('click', (e) => {
      e.stopPropagation();
      showPerson(id);
    });

    treeContainer.appendChild(nodeGroup);
  });

  applyTransform();
}

// ===================== ТРАНСФОРМАЦИЯ =====================
function applyTransform() {
  treeContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
}

// ===================== ЗУМ И ПЕРЕТАСКИВАНИЕ =====================
let isDragging = false, startX, startY, startTX, startTY;

treeContainer.addEventListener('mousedown', (e) => {
  if (e.target.closest('.tree-node')) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startTX = translateX;
  startTY = translateY;
  treeContainer.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  translateX = startTX + (e.clientX - startX);
  translateY = startTY + (e.clientY - startY);
  applyTransform();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  treeContainer.style.cursor = 'grab';
});

// Кнопки зума
document.getElementById('zoom-in')?.addEventListener('click', () => {
  scale = Math.min(3, scale * 1.2);
  applyTransform();
});
document.getElementById('zoom-out')?.addEventListener('click', () => {
  scale = Math.max(0.3, scale / 1.2);
  applyTransform();
});
document.getElementById('zoom-reset')?.addEventListener('click', () => {
  scale = 1;
  translateX = 50;
  translateY = 50;
  applyTransform();
});

// ===================== КАРТОЧКА ЧЕЛОВЕКА =====================
function showPerson(id) {
  const person = people.find(p => p.id === id);
  if (!person) return;

  const children = links.filter(l => l.from === id).map(l => people.find(p => p.id === l.to)).filter(Boolean);
  const parents = links.filter(l => l.to === id).map(l => people.find(p => p.id === l.from)).filter(Boolean);
  let spouse = null;
  if (children.length > 0) {
    const spouseCandidate = links.filter(l => children.some(c => c.id === l.to) && l.from !== id).map(l => people.find(p => p.id === l.from))[0];
    spouse = spouseCandidate || null;
  }

  const galleryPhotos = [];
  if (person.photo && person.photo !== 'images/placeholder.jpg') galleryPhotos.push({ src: person.photo, caption: person.name });
  if (spouse?.photo && spouse.photo !== 'images/placeholder.jpg') galleryPhotos.push({ src: spouse.photo, caption: spouse.name });
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
  document.querySelectorAll('.tree-node').forEach(node => {
    const id = node.getAttribute('data-id');
    const person = people.find(p => p.id === id);
    node.style.opacity = (!person || filterVal === 'all' || person.category === filterVal) ? '1' : '0.2';
  });
}

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
drawTree();
renderTOC();
