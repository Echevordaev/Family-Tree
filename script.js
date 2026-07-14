// ===================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====================
const treeContainer = document.getElementById('tree-container');
const tocContainer = document.getElementById('chronicle-toc');
const personModal = document.getElementById('person-modal');
const chapterModal = document.getElementById('chapter-modal');
const modalBody = document.getElementById('modal-body');
const chapterBody = document.getElementById('chapter-body');
const modalClose = document.querySelectorAll('.modal-close');

// Цвета для категорий
const categoryColors = {
  yazev: '#c7a87b',
  chevardaev: '#9bb7c7',
  koveshnikov: '#b8a89a',
  samsnov: '#c7b89b'
};

// ===================== ПОСТРОЕНИЕ ИЕРАРХИИ =====================
function buildHierarchy() {
  // Преобразуем массив people в объект для быстрого доступа
  const peopleMap = {};
  people.forEach(p => peopleMap[p.id] = p);

  // Создаем структуру для D3: каждый узел имеет id, name, children
  // Сначала строим карту дочерних элементов
  const childrenMap = {};
  links.forEach(link => {
    if (!childrenMap[link.from]) childrenMap[link.from] = [];
    childrenMap[link.from].push(link.to);
  });

  // Рекурсивная функция построения узла
  function buildNode(id) {
    const person = peopleMap[id];
    if (!person) return null;
    const node = {
      id: id,
      name: person.name,
      category: person.category,
      photo: person.photo,
      birth: person.birth,
      death: person.death,
      spouse: person.spouse,
      desc: person.desc,
      children: []
    };
    if (childrenMap[id]) {
      childrenMap[id].forEach(childId => {
        const childNode = buildNode(childId);
        if (childNode) node.children.push(childNode);
      });
    }
    return node;
  }

  // Ищем корни (узлы, которые не являются чьими-то детьми)
  const allFromIds = new Set(links.map(l => l.from));
  const allToIds = new Set(links.map(l => l.to));
  const rootIds = [...allFromIds].filter(id => !allToIds.has(id));

  // Строим лес
  const roots = rootIds.map(id => buildNode(id)).filter(Boolean);
  
  // Если корней больше одного, создаем искусственный общий корень
  if (roots.length > 1) {
    return {
      id: 'root',
      name: 'Семьи',
      category: 'root',
      children: roots
    };
  } else if (roots.length === 1) {
    return roots[0];
  }
  return null;
}

// ===================== ОТРИСОВКА ДЕРЕВА С ПОМОЩЬЮ D3 =====================
let svg, g, zoomBehavior;

function drawTree() {
  // Очищаем контейнер
  treeContainer.innerHTML = '';

  const rootData = buildHierarchy();
  if (!rootData) {
    treeContainer.innerHTML = '<p style="text-align:center;padding:40px;">Нет данных для отображения</p>';
    return;
  }

  // Размеры
  const container = treeContainer;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Создаем SVG
  svg = d3.select('#tree-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Группа для трансформаций
  g = svg.append('g');

  // Зум
  zoomBehavior = d3.zoom()
    .scaleExtent([0.2, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);
  // Начальное смещение, чтобы дерево было видно по центру
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(50, 100).scale(0.8));

  // Создаем иерархию D3
  const root = d3.hierarchy(rootData);

  // Определяем макет дерева (слева направо)
  const treeLayout = d3.tree()
    .size([height - 200, width - 200])
    .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

  treeLayout(root);

  // Рисуем связи
  g.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#baa68b')
    .attr('stroke-width', 2)
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

  // Рисуем узлы
  const node = g.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('click', (event, d) => {
      event.stopPropagation();
      if (d.data.id !== 'root') showPerson(d.data.id);
    });

  // Окружности с фото или инициалами
  node.each(function(d) {
    const el = d3.select(this);
    const person = d.data;
    const radius = 30;

    // Если есть фото, используем pattern
    if (person.photo && person.photo !== 'images/placeholder.jpg') {
      // Создаем уникальный ID для pattern
      const patternId = `img-${person.id}`;
      // Определяем pattern
      svg.append('defs')
        .append('pattern')
        .attr('id', patternId)
        .attr('width', 1)
        .attr('height', 1)
        .append('image')
        .attr('xlink:href', person.photo)
        .attr('width', radius * 2)
        .attr('height', radius * 2)
        .attr('preserveAspectRatio', 'xMidYMid slice');

      el.append('circle')
        .attr('r', radius)
        .attr('fill', `url(#${patternId})`)
        .attr('stroke', '#5a4a3a')
        .attr('stroke-width', 2);
    } else {
      // Без фото: цветной круг с инициалами
      const color = categoryColors[person.category] || '#ccc';
      el.append('circle')
        .attr('r', radius)
        .attr('fill', color)
        .attr('stroke', '#5a4a3a')
        .attr('stroke-width', 2);

      const initials = person.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .substring(0, 2);
      el.append('text')
        .attr('dy', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', radius * 0.8)
        .attr('fill', '#3b2e1e')
        .text(initials);
    }
  });

  // Подписи под узлами
  node.append('text')
    .attr('dy', 45)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#3b2e1e')
    .text(d => {
      const p = d.data;
      const years = p.birth ? `${p.birth}–${p.death || ''}` : '';
      // Показываем только фамилию или короткое имя
      const shortName = p.name.split(' ').slice(0, 2).join(' ');
      return shortName.length > 18 ? shortName.substring(0, 16) + '...' : shortName;
    });
}

// ===================== КАРТОЧКА ЧЕЛОВЕКА =====================
function showPerson(id) {
  const person = people.find(p => p.id === id);
  if (!person) return;

  const children = links.filter(l => l.from === id).map(l => people.find(p => p.id === l.to)).filter(Boolean);
  const parents = links.filter(l => l.to === id).map(l => people.find(p => p.id === l.from)).filter(Boolean);

  let spouse = null;
  // Ищем супруга: общие дети
  if (children.length > 0) {
    const spouseCandidates = links.filter(l => children.some(c => c.id === l.to) && l.from !== id).map(l => people.find(p => p.id === l.from));
    spouse = spouseCandidates[0] || null;
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

  // Кликабельные ссылки на других людей
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
  if (!svg) return;
  svg.selectAll('.node').each(function(d) {
    const person = d.data;
    const show = filterVal === 'all' || person.category === filterVal;
    d3.select(this).style('opacity', show ? 1 : 0.2);
    // Также можно скрыть связи, но это сложнее, оставим так
  });
}

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
drawTree();
renderTOC();
