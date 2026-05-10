const treeContainer = document.getElementById('tree-container');
const tocContainer = document.getElementById('chronicle-toc');
const personModal = document.getElementById('person-modal');
const chapterModal = document.getElementById('chapter-modal');
const modalBody = document.getElementById('modal-body');
const chapterBody = document.getElementById('chapter-body');
const modalClose = document.querySelectorAll('.modal-close');

// ===================== ДЕРЕВО =====================

// Карта позиций для прямоугольных карточек (x, y в процентах от контейнера)
const cardPositions = {
  firs: [48, 1],
  afanasiy: [48, 9],
  ivan_af: [48, 17],
  marina: [18, 21],
  andrey: [48, 26],
  anna_m: [18, 35],
  ekaterina: [42, 35],
  ivan_andr: [62, 35],
  klavdiya: [72, 42],
  nikolay_yazev: [48, 44],
  yuriy_nik: [22, 53],
  mariya: [38, 53],
  leonid: [52, 53],
  lyudmila: [58, 53],
  tatyana_n: [64, 53],
  andrey_nik: [70, 53],
  anatoliy_nik: [76, 53],
  sergey_yazev: [76, 62],
  vera: [15, 65],
  lyubov: [28, 65],
  sergey_kov: [58, 62],
  kseniya: [52, 62],
  anatoliy_kov: [42, 72],
  aleksandr_kov: [58, 72],
  ivan_che: [88, 8],
  praskovya: [82, 16],
  nikolay_che: [88, 26],
  raisa: [82, 34],
  yuriy_che: [70, 72],
  aleksandr_che: [42, 72],
  evgeniy: [22, 80],
  igor_che: [35, 80],
  alexandr_evg: [10, 90],
  dmitriy: [26, 90],
  vladimir: [58, 80],
  aleksandr_sam: [48, 90],
  svetlana: [64, 90]
};

function drawTree() {
  const containerWidth = treeContainer.clientWidth || 1100;
  const containerHeight = 1020;

  // Очищаем контейнер
  treeContainer.innerHTML = '';
  treeContainer.style.position = 'relative';
  treeContainer.style.width = '100%';
  treeContainer.style.height = containerHeight + 'px';

  // Создаём SVG для линий
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", containerHeight);
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "1";

  // Рисуем линии между карточками
  const toPx = (pct, dim) => (parseFloat(pct) / 100) * dim;

  links.forEach(link => {
    const fromPos = cardPositions[link.from];
    const toPos = cardPositions[link.to];
    if (!fromPos || !toPos) return;

    const x1 = toPx(fromPos[0], containerWidth) + 70; // центр карточки (~140px ширина / 2)
    const y1 = toPx(fromPos[1], containerHeight) + 55; // низ карточки
    const x2 = toPx(toPos[0], containerWidth) + 70;
    const y2 = toPx(toPos[1], containerHeight);

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

  // Рисуем карточки
  Object.entries(cardPositions).forEach(([id, [leftPct, topPct]]) => {
    const person = people.find(p => p.id === id);
    if (!person) return;

    const card = document.createElement('div');
    card.className = `tree-card ${person.category}`;
    card.style.left = leftPct + '%';
    card.style.top = topPct + '%';
    card.setAttribute('data-id', id);
    card.addEventListener('click', () => showPerson(id));

    card.innerHTML = `
      <img src="${person.photo}" alt="${person.name}" onerror="this.src='images/placeholder.jpg'" />
      <div class="card-info">
        <div class="card-name">${person.name.split(' ')[0]}</div>
        <div class="card-years">${person.birth} – ${person.death}</div>
      </div>
    `;
    treeContainer.appendChild(card);
  });
}

// ===================== КАРТОЧКА ЧЕЛОВЕКА =====================
function showPerson(id) {
  const person = people.find(p => p.id === id);
  if (!person) return;

  // Находим детей
  const children = links
    .filter(l => l.from === id)
    .map(l => people.find(p => p.id === l.to))
    .filter(Boolean);

  // Находим родителей
  const parents = links
    .filter(l => l.to === id)
    .map(l => people.find(p => p.id === l.from))
    .filter(Boolean);

  // Собираем все связанные фото (сам человек + родители + дети + супруг)
  const galleryPhotos = [];
  if (person.photo && person.photo !== 'images/placeholder.jpg') {
    galleryPhotos.push({ src: person.photo, caption: person.name });
  }
  parents.forEach(p => {
    if (p.photo && p.photo !== 'images/placeholder.jpg') {
      galleryPhotos.push({ src: p.photo, caption: p.name });
    }
  });
  children.forEach(c => {
    if (c.photo && c.photo !== 'images/placeholder.jpg') {
      galleryPhotos.push({ src: c.photo, caption: c.name });
    }
  });

  const childrenNames = children.map(c => c.name).join(', ');
  const parentsNames = parents.map(p => p.name).join(', ');

  let galleryHTML = '';
  if (galleryPhotos.length > 0) {
    galleryHTML = `
      <div class="gallery-title">Все фотографии (${galleryPhotos.length})</div>
      <div class="gallery-grid">
        ${galleryPhotos.map(g => `
          <div class="gallery-item">
            <img src="${g.src}" alt="${g.caption}" loading="lazy" />
            <div class="gal-caption">${g.caption}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="modal-person">
      <img class="modal-person-main-photo" src="${person.photo}" alt="${person.name}" onerror="this.src='images/placeholder.jpg'" />
      <h2>${person.name}</h2>
      <div class="years">${person.birth} – ${person.death}</div>
      <p class="bio">${person.desc}</p>
      <div class="relations">
        ${person.spouse ? `<p><strong>Супруг(а):</strong> ${person.spouse}</p>` : ''}
        ${parentsNames ? `<p><strong>Родители:</strong> ${parentsNames}</p>` : ''}
        ${childrenNames ? `<p><strong>Дети:</strong> ${childrenNames}</p>` : ''}
      </div>
      ${galleryHTML}
    </div>
  `;

  personModal.style.display = 'block';
}

// ===================== ЛЕТОПИСЬ =====================
function renderTOC() {
  tocContainer.innerHTML = chapters.map((ch, i) => `
    <li><a href="#" data-index="${i}">${ch.title}</a></li>
  `).join('');

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

// ===================== ЗАКРЫТИЕ =====================
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
    const filterVal = btn.dataset.filter;
    applyFilter(filterVal);
  });
});

function applyFilter(filterVal) {
  document.querySelectorAll('.tree-card').forEach(card => {
    const id = card.getAttribute('data-id');
    const person = people.find(p => p.id === id);
    if (filterVal === 'all' || (person && person.category === filterVal)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ===================== ПЕРЕТАСКИВАНИЕ ДЕРЕВА =====================
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

treeContainer.addEventListener('mousedown', e => {
  isDragging = true;
  treeContainer.style.cursor = 'grabbing';
  startX = e.pageX - treeContainer.offsetLeft;
  startY = e.pageY - treeContainer.offsetTop;
  scrollLeft = treeContainer.scrollLeft;
  scrollTop = treeContainer.scrollTop;
});

treeContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  treeContainer.style.cursor = 'grab';
});

treeContainer.addEventListener('mouseup', () => {
  isDragging = false;
  treeContainer.style.cursor = 'grab';
});

treeContainer.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - treeContainer.offsetLeft;
  const y = e.pageY - treeContainer.offsetTop;
  const walkX = (x - startX) * 1.5;
  const walkY = (y - startY) * 1.5;
  treeContainer.scrollLeft = scrollLeft - walkX;
  treeContainer.scrollTop = scrollTop - walkY;
});

// ===================== СТАРТ =====================
drawTree();
renderTOC();
window.addEventListener('resize', drawTree);
