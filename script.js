const treeContainer = document.getElementById('tree-container');
const modal = document.getElementById('person-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

// ===== Отрисовка схемы =====
function renderTree() {
  const width = treeContainer.clientWidth || 1000;
  const height = 650;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", height);

  // Позиции кружков (можно менять для лучшего вида)
  const positions = {
    firs: [width*0.5, 40],
    afanasiy: [width*0.5, 120],
    ivan_af: [width*0.5, 200],
    andrey: [width*0.5, 280],
    ivan_andr: [width*0.3, 360],
    nikolay_yazev: [width*0.3, 440],
    yuriy_nik: [width*0.15, 520],
    mariya: [width*0.35, 520],
    vera: [width*0.1, 600],
    lyubov: [width*0.25, 600],
    ivan_che: [width*0.8, 200],
    nikolay_che: [width*0.8, 280],
    aleksandr_che: [width*0.7, 360],
    evgeniy: [width*0.5, 500],
    alexandr_evg: [width*0.42, 580],
    dmitriy: [width*0.54, 580]
  };

  // Рисуем связи
  links.forEach(link => {
    const from = positions[link.from];
    const to = positions[link.to];
    if (from && to) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", from[0]);
      line.setAttribute("y1", from[1]);
      line.setAttribute("x2", to[0]);
      line.setAttribute("y2", to[1]);
      line.setAttribute("stroke", "#baa68b");
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    }
  });

  // Рисуем кружки
  Object.entries(positions).forEach(([id, [cx, cy]]) => {
    const person = people.find(p => p.id === id);
    if (!person) return;

    const color = person.category === 'chevardaev' ? '#9bb7c7' : '#c7a87b';

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", "18");
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "#5a4a3a");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("cursor", "pointer");
    circle.setAttribute("data-id", id);
    circle.addEventListener('click', () => showPerson(id));
    svg.appendChild(circle);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy + 28);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#3b2e1e");
    text.textContent = person.name.split(" ")[0];
    svg.appendChild(text);
  });

  treeContainer.innerHTML = '';
  treeContainer.appendChild(svg);
}

// ===== Показать информацию о человеке =====
function showPerson(id) {
  const person = people.find(p => p.id === id);
  if (!person) return;

  const children = links.filter(l => l.from === id).map(l => {
    const child = people.find(p => p.id === l.to);
    return child ? child.name : '';
  });
  const parents = links.filter(l => l.to === id).map(l => {
    const parent = people.find(p => p.id === l.from);
    return parent ? parent.name : '';
  });

  modalBody.innerHTML = `
    <img src="${person.photo}" alt="${person.name}" onerror="this.src='images/placeholder.jpg'" />
    <h2>${person.name}</h2>
    <div class="years">${person.birth} – ${person.death}</div>
    <p>${person.desc}</p>
    ${person.spouse ? `<p><strong>Супруг(а):</strong> ${person.spouse}</p>` : ''}
    ${parents.length ? `<p><strong>Родители:</strong> ${parents.join(', ')}</p>` : ''}
    ${children.length ? `<p><strong>Дети:</strong> ${children.join(', ')}</p>` : ''}
  `;
  modal.style.display = 'block';
}

// ===== Закрытие модального окна =====
modalClose.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// ===== Старт =====
renderTree();
window.addEventListener('resize', renderTree);
