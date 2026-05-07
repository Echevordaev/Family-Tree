const relatives = [
  {
    id: 1,
    name: "Николай Иванович Язев",
    birth: "1903",
    death: "после 1946",
    category: "yazev",
    image: "images/nikolay_yazev.jpg", // замените на своё
    description: "Автор рукописи. Инженер-капитан во время ВОВ. Служил на военном складе в Калуге. Записал историю семьи со слов отца и деда."
  },
  {
    id: 2,
    name: "Николай Иванович Чевордаев",
    birth: "1921",
    death: "2002",
    category: "chevardaev",
    image: "images/nikolay_chevardaev.jpg",
    description: "Артиллерист на танке, ранен. Орден Отечественной войны II степени. 8-й ребёнок в семье, 4-й живой."
  },
  {
    id: 3,
    name: "Мария Сергеевна Язева (Ковешникова)",
    birth: "1933",
    death: "2021",
    category: "yazev",
    image: "images/mariya_yazeva.jpg",
    description: "Инженер-конструктор на ф-ке Лыжина. В 7 лет потеряла мать, жила у тётки. Работала в семье Кира Булычёва."
  },
  {
    id: 4,
    name: "Юрий Николаевич Язев",
    birth: "1933",
    death: "1995",
    category: "yazev",
    image: "images/yuriy_yazev.jpg",
    description: "Электрик, фотограф-любитель. После 4-х тюремных сроков остепенился. Принципиальный, писал письма о несправедливости."
  },
  // Добавляйте новых родственников по шаблону:
  // {
  //   id: 5,
  //   name: "Имя Фамилия",
  //   birth: "год",
  //   death: "год",
  //   category: "yazev/chevardaev/samsnov",
  //   image: "images/filename.jpg",
  //   description: "Краткая биография."
  // }
];

// ====== Логика работы (можно не трогать) ======
const container = document.getElementById('cardsContainer');
const filters = document.querySelectorAll('.filter');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalDetails = document.getElementById('modal-details');
const modalClose = document.querySelector('.modal-close');

function renderCards(category = 'all') {
  container.innerHTML = '';
  const filtered = category === 'all' 
    ? relatives 
    : relatives.filter(r => r.category === category);
  
  filtered.forEach(rel => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${rel.image}" alt="${rel.name}" onerror="this.src='images/placeholder.jpg'" />
      <div class="card-body">
        <h3>${rel.name}</h3>
        <div class="life-years">${rel.birth} – ${rel.death}</div>
        <p>${rel.description.substring(0, 80)}...</p>
      </div>
    `;
    card.addEventListener('click', () => openModal(rel));
    container.appendChild(card);
  });
}

function openModal(rel) {
  modal.style.display = 'block';
  modalImg.src = rel.image;
  modalName.textContent = rel.name;
  modalDetails.textContent = `${rel.birth} – ${rel.death}\n\n${rel.description}`;
}

modalClose.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.filter);
  });
});

// Старт
renderCards();
