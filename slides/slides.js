document.fonts.ready.then(() => document.body.classList.add('fonts-ready'));

const panelContainer = document.querySelector('#panels');
const panels = panelContainer ? panelContainer.querySelectorAll('.panel') : [];
const startButton = document.querySelector('#btn-start');
const prevButton = document.querySelector('#btn-previous');
const nextButton = document.querySelector('#btn-next');
let currentIndex = 0;

const portraitPool = window.portraitPool ?? [
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/14.jpg',
  'https://randomuser.me/api/portraits/women/19.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/women/26.jpg',
  'https://randomuser.me/api/portraits/men/29.jpg',
  'https://randomuser.me/api/portraits/women/31.jpg',
  'https://randomuser.me/api/portraits/men/33.jpg',
  'https://randomuser.me/api/portraits/women/36.jpg',
  'https://randomuser.me/api/portraits/men/41.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/47.jpg',
  'https://randomuser.me/api/portraits/women/49.jpg',
  'https://randomuser.me/api/portraits/men/52.jpg',
  'https://randomuser.me/api/portraits/women/55.jpg',
  'https://randomuser.me/api/portraits/men/58.jpg',
  'https://randomuser.me/api/portraits/women/61.jpg',
  'https://randomuser.me/api/portraits/men/64.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/71.jpg',
  'https://randomuser.me/api/portraits/women/73.jpg',
  'https://randomuser.me/api/portraits/men/76.jpg',
  'https://randomuser.me/api/portraits/women/79.jpg',
  'https://randomuser.me/api/portraits/men/82.jpg',
  'https://randomuser.me/api/portraits/women/85.jpg',
  'https://randomuser.me/api/portraits/men/88.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
  'https://randomuser.me/api/portraits/men/93.jpg',
];

const fallbackQuestions = window.fallbackQuestions ?? [
  'What are you learning from the land you work with?',
  'Where are you seeing regeneration already happening?',
  'What practice helps you stay in relationship with place?',
  'What would a more reciprocal way of working look like here?',
  'Which materials feel most aligned with a regenerative future?',
  'What have local communities taught you about care and repair?',
  'How do you notice when a project is giving more than it takes?',
  'What assumptions about growth are you trying to unlearn?',
  'Where have you seen waste become a starting point for value?',
  'What does long-term stewardship ask of your work?',
];

const shuffle = (items) => {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
};

const buildQuestionSequence = (questions, count) => {
  const usableQuestions = questions.length ? questions : fallbackQuestions;
  const sequence = [];

  while (sequence.length < count) {
    sequence.push(...shuffle(usableQuestions));
  }

  return sequence.slice(0, count);
};

const bringVisionTileToFront = (field, tile) => {
  const nextZIndex = Number.parseInt(field.dataset.nextZIndex || '20', 10);

  tile.style.zIndex = String(nextZIndex);
  field.dataset.nextZIndex = String(nextZIndex + 1);
};

const createVisionTile = (question, photoUrl, index, count) => {
  const tile = document.createElement('article');
  const photo = document.createElement('div');
  const label = document.createElement('p');
  const progress = count > 1 ? index / (count - 1) : 0;
  const verticalBand = index % 4;
  const size = 15;
  const left = -4 + progress * 96 + (Math.random() * 6 - 3);
  const top = 1.5 + verticalBand * 3.2 + Math.random() * 2.4;
  const rotation = -15 + Math.random() * 30;
  const zIndex = 4 + verticalBand;

  tile.className = 'vision-tile';
  tile.style.setProperty('--tile-left', `${left}vw`);
  tile.style.setProperty('--tile-top', `${top}rem`);
  tile.style.setProperty('--tile-width', `${size}rem`);
  tile.style.setProperty('--tile-height', `${size}rem`);
  tile.style.setProperty('--tile-rotate', `${rotation.toFixed(2)}deg`);
  tile.style.setProperty('--tile-photo', `url("${photoUrl}")`);
  tile.style.zIndex = String(zIndex);

  photo.className = 'vision-tile-photo';
  label.className = 'vision-tile-question';
  label.textContent = question;

  tile.append(photo, label);
  return tile;
};

const loadQuestions = async (source) => {
  try {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`Question fetch failed: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.filter((question) => typeof question === 'string' && question.trim());
    }

    if (Array.isArray(data.questions)) {
      return data.questions.filter((question) => typeof question === 'string' && question.trim());
    }
  } catch (error) {
    console.warn('Using fallback regenerative questions.', error);
  }

  return fallbackQuestions;
};

const initVisionTileFields = async () => {
  const fields = document.querySelectorAll('.vision-tile-field[data-question-source]');

  await Promise.all(
    Array.from(fields).map(async (field) => {
      const source = field.dataset.questionSource;
      const requestedCount = Number.parseInt(field.dataset.tileCount || '20', 10);
      const tileCount = Number.isNaN(requestedCount) ? 20 : Math.max(8, requestedCount);
      const questions = await loadQuestions(source);
      const selectedQuestions = buildQuestionSequence(questions, tileCount);
      const selectedPortraits = buildQuestionSequence(portraitPool, tileCount);
      field.dataset.nextZIndex = String(tileCount + 10);

      selectedQuestions.forEach((question, index) => {
        const tile = createVisionTile(question, selectedPortraits[index], index, tileCount);

        tile.addEventListener('click', () => bringVisionTileToFront(field, tile));
        field.appendChild(tile);
      });
    }),
  );
};

// Exit early on pages that do not use the slide deck layout.
if (panels.length) {
  panels.forEach((panel, index) => {
    if (!panel.id) {
      panel.id = `panel${String(index + 1).padStart(3, '0')}`;
    }

    const countLabel = document.createElement('p');
    countLabel.className = 'panel-count';
    countLabel.textContent = `Panel ${index + 1} of ${panels.length}`;
    const container = panel.querySelector('.container');

    if (container) {
      container.prepend(countLabel);
    } else {
      panel.prepend(countLabel);
    }
  });

  const nav = document.querySelector('#panel-index');
  if (nav) {
    const listTagName = nav.dataset.listTag || 'ol';
    const ul = document.createElement(listTagName);
    ul.className = nav.dataset.listClass || 'xlist-unstyled';

    panels.forEach((panel, index) => {
      if (index === 0) return;
      const h1 = panel.querySelector('h1');
      if (!h1) return;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${panel.id}`;
      a.textContent = h1.textContent.trim();
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);
  }
}

const updateButtons = () => {
  const hasPanels = panels.length > 0;
  if (startButton) {
    startButton.disabled = !hasPanels || currentIndex < 1;
  }
  if (prevButton) {
    prevButton.disabled = !hasPanels || currentIndex === 0;
  }
  if (nextButton) {
    nextButton.disabled = !hasPanels || currentIndex >= panels.length - 1;
  }
};

const scrollToPanel = (index, behavior = 'smooth') => {
  if (!panels.length) return;
  const clamped = Math.max(0, Math.min(index, panels.length - 1));
  currentIndex = clamped;
  panels[clamped].scrollIntoView({ behavior, block: 'start' });
  updateButtons();
};

if (startButton) {
  startButton.addEventListener('click', () => {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    scrollToPanel(0);
  });
}
if (prevButton) {
  prevButton.addEventListener('click', () => scrollToPanel(currentIndex - 1));
}
if (nextButton) {
  nextButton.addEventListener('click', () => scrollToPanel(currentIndex + 1));
}

const goToHash = () => {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;
  const idx = Array.from(panels).findIndex((panel) => panel.id === hash);
  if (idx !== -1) {
    scrollToPanel(idx, 'auto');
  }
};

window.addEventListener('hashchange', goToHash);
window.addEventListener('load', () => {
  updateButtons();
  goToHash();
  initVisionTileFields();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => scrollToPanel(currentIndex, 'auto'), 150);
});
