const treeContainer = document.getElementById('tree-container');
const tocContainer = document.getElementById('chronicle-toc');
const personModal = document.getElementById('person-modal');
const chapterModal = document.getElementById('chapter-modal');
const modalBody = document.getElementById('modal-body');
const chapterBody = document.getElementById('chapter-body');
const modalClose = document.querySelectorAll('.modal-close');

// ===================== ДЕРЕВО =====================
const positions = {
  firs: [50, 40],
  afanasiy: [50, 130],
  ivan_af: [50, 220],
  marina: [14, 270],
  andrey: [50, 310],
  anna_m: [15, 390],
  ekaterina: [40, 400],
  ivan_andr: [72, 390],
  klavdiya: [85, 450],
  nikolay_yazev: [50, 470],
  yuriy_nik: [25, 550],
  mariya: [42, 550],
  leonid: [58, 550],
  lyudmila: [67, 550],
  tatyana_n: [76, 550],
  andrey_nik: [85, 550],
  anatoliy_nik: [94, 550],
  sergey_yazev: [94, 630],
  vera: [15, 640],
  lyubov: [30, 640],
  sergey_kov: [58, 640],
  anatoliy_kov: [36, 720],
  aleksandr_kov: [58, 720],
  ivan_che: [85, 640],
  praskovya: [94, 700],
  nikolay_che: [85, 720],
  raisa: [94, 780],
  yuriy_che: [72, 800],
  aleksandr_che: [50, 800],
  evgeniy: [30, 880],
  igor_che: [42, 880],
  alexandr_evg: [17, 950],
  dmitriy: [35, 950],
  vladimir: [72, 880],
  aleksandr_sam: [60, 950],
  svetlana: [80, 950],
};

function drawTree() {
  const width = treeContainer.clientWidth || 1100;
  const height = Object.values(positions).reduce((max, p) => Math.max(max, p[1]), 1000) + 60;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 1100 ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", height);

  // Связи
  links.forEach(link => {
    const from = positions[link.from];
    const to = positions[link.to];
    if (!from || !to) return;
    const line = document.createElementNS(svgNS, "line");
    const pctX = from[0] + '%';
    line.setAttribute("x1", from[0]*1.1 + '%');
    line.setAttribute("y1", from[1]+10);
    line.setAttribute("x2", to[0]*1.1 + '%');
    line.setAttribute("y2", to[1]-10);
    line.setAttribute("stroke", "#baa68b");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  });

  // Кружки
  Object.entries(positions).forEach(([id, [cx, cy]]) => {
    const person = people.find(p => p.id === id);
    if (!person) return;
    const color = person.category === 'chevardaev' ? '#9bb7c7'
      : person.category === 'koveshnikov' ? '#b8a89a'
      : person.category === 'samsnov' ? '#c7b89b'
      : '#c7a87b';

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx + '%');
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", "16");
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "#5a4a3a");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("cursor", "pointer");
    circle.addEventListener('click', () => showPerson(id));
    svg.appendChild(circle);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", cx + '%');
    text.setAttribute("y", cy + 26);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "8");
    text.setAttribute("fill", "#3b2e1e");
    text.textContent = person.name.split(" ")[0];
    svg.appendChild(text);
  });

  treeContainer.innerHTML = '';
  treeContainer.appendChild(svg);
}

// ===================== КАРТОЧКИ =====================
function showPerson(id) {
  const person = people.find(p => p.id === id);
  if (!person) return;
  const children = links.filter(l => l.from === id).map(l => {
    const p = people.find(pp => pp.id === l.to);
    return p ? p.name : '';
  });
  const parents = links.filter(l => l.to === id).map(l => {
    const p = people.find(pp => pp.id === l.from);
    return p ? p.name : '';
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
    drawTree();
  });
});

// ===================== СТАРТ =====================
drawTree();
renderTOC();
window.addEventListener('resize', drawTree);
