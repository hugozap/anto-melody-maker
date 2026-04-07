import { notes, drums, getAudioContext } from './sounds.js';
import { VisualDisplay } from './visual.js';

const STEPS = 16;
const allRows = [...notes, ...drums];
const ROWS = allRows.length; // 12
const STORAGE_KEY = 'anto-melody-maker-saves';

// State
let grid = Array.from({ length: ROWS }, () => Array(STEPS).fill(false));
let currentStep = -1;
let isPlaying = false;
let bpm = 120;
let intervalId = null;
let visualDisplay = null;

function init() {
  buildGrid();
  setupControls();
  setupSaveLoad();

  const canvas = document.getElementById('visual-canvas');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  visualDisplay = new VisualDisplay(canvas);

  window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  });
}

function buildGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';

  for (let row = 0; row < ROWS; row++) {
    // Add separator before drums section
    if (row === notes.length) {
      const sep = document.createElement('div');
      sep.className = 'grid-separator';
      gridEl.appendChild(sep);
    }

    const rowEl = document.createElement('div');
    rowEl.className = 'grid-row';

    const item = allRows[row];
    const isDrum = item.isDrum;

    // Label (clickable to preview sound)
    const label = document.createElement('div');
    label.className = 'note-label';
    label.innerHTML = `<span class="emoji">${item.emoji}</span><span class="name">${item.name}</span>`;
    label.style.setProperty('--note-color', item.color);
    label.style.cursor = 'pointer';
    label.addEventListener('click', () => {
      getAudioContext();
      item.play();
    });
    rowEl.appendChild(label);

    // Cells
    const cellsContainer = document.createElement('div');
    cellsContainer.className = 'cells-container';

    for (let col = 0; col < STEPS; col++) {
      const cell = document.createElement('button');
      cell.className = isDrum ? 'cell drum' : 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.style.setProperty('--note-color', item.color);
      cell.addEventListener('click', () => toggleCell(row, col, cell));
      cellsContainer.appendChild(cell);
    }

    rowEl.appendChild(cellsContainer);
    gridEl.appendChild(rowEl);
  }
}

function toggleCell(row, col, cell) {
  getAudioContext();
  grid[row][col] = !grid[row][col];
  cell.classList.toggle('active', grid[row][col]);

  if (grid[row][col]) {
    cell.classList.add('pop');
    setTimeout(() => cell.classList.remove('pop'), 200);
  }
}

function setupControls() {
  const playBtn = document.getElementById('play-btn');
  const clearBtn = document.getElementById('clear-btn');
  const bpmSlider = document.getElementById('bpm-slider');
  const bpmValue = document.getElementById('bpm-value');

  playBtn.addEventListener('click', () => {
    getAudioContext();
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '\u23F9 Stop' : '\u25B6 Play';
    playBtn.classList.toggle('playing', isPlaying);
    if (isPlaying) {
      currentStep = -1;
      startSequencer();
    } else {
      stopSequencer();
    }
  });

  clearBtn.addEventListener('click', () => {
    grid = Array.from({ length: ROWS }, () => Array(STEPS).fill(false));
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
  });

  bpmSlider.addEventListener('input', (e) => {
    bpm = parseInt(e.target.value);
    bpmValue.textContent = bpm;
    if (isPlaying) {
      stopSequencer();
      startSequencer();
    }
  });
}

function startSequencer() {
  const intervalMs = (60 / bpm) * 1000 / 4; // 16th notes
  intervalId = setInterval(() => step(), intervalMs);
}

function stopSequencer() {
  clearInterval(intervalId);
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('current-step'));
  currentStep = -1;
}

function step() {
  currentStep = (currentStep + 1) % STEPS;

  // Update visual highlight
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('current-step'));
  document.querySelectorAll(`.cell[data-col="${currentStep}"]`).forEach(c => {
    c.classList.add('current-step');
  });

  if (visualDisplay) visualDisplay.triggerStep();

  // Play active notes and drums
  for (let row = 0; row < ROWS; row++) {
    if (grid[row][currentStep]) {
      allRows[row].play();
      if (visualDisplay) visualDisplay.trigger(row, allRows[row].color);
    }
  }
}

// Save/Load functionality
function getSaves() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setSaves(saves) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

function setupSaveLoad() {
  const saveBtn = document.getElementById('save-btn');
  const loadBtn = document.getElementById('load-btn');
  const dropdown = document.getElementById('load-dropdown');

  saveBtn.addEventListener('click', () => {
    const name = prompt('Nombre de la melodía:');
    if (!name || !name.trim()) return;
    const saves = getSaves();
    saves.push({
      name: name.trim(),
      date: new Date().toISOString(),
      grid: grid.map(row => [...row]),
      bpm
    });
    setSaves(saves);
  });

  loadBtn.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
      renderLoadList();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.load-wrapper')) {
      dropdown.classList.add('hidden');
    }
  });
}

function renderLoadList() {
  const listEl = document.getElementById('load-list');
  const dropdown = document.getElementById('load-dropdown');
  const emptyEl = dropdown.querySelector('.load-empty');
  const saves = getSaves();

  listEl.innerHTML = '';

  if (saves.length === 0) {
    emptyEl.style.display = '';
    return;
  }

  emptyEl.style.display = 'none';

  saves.forEach((save, index) => {
    const item = document.createElement('div');
    item.className = 'load-item';
    item.dataset.index = index;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'load-item-name';
    nameSpan.textContent = save.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'load-item-delete';
    deleteBtn.textContent = '\u2715';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = getSaves();
      current.splice(index, 1);
      setSaves(current);
      renderLoadList();
    });

    item.appendChild(nameSpan);
    item.appendChild(deleteBtn);

    item.addEventListener('click', () => {
      loadState(save);
      dropdown.classList.add('hidden');
    });

    listEl.appendChild(item);
  });
}

function loadState(save) {
  // Update grid (backward compatible: old saves may have fewer rows)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < STEPS; col++) {
      grid[row][col] = save.grid[row] && save.grid[row][col] ? true : false;
    }
  }

  // Update BPM
  bpm = save.bpm || 120;
  const bpmSlider = document.getElementById('bpm-slider');
  const bpmValueEl = document.getElementById('bpm-value');
  bpmSlider.value = bpm;
  bpmValueEl.textContent = bpm;

  // Re-render cells
  document.querySelectorAll('.cell').forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    cell.classList.toggle('active', grid[row][col]);
  });

  // Restart sequencer if playing
  if (isPlaying) {
    stopSequencer();
    startSequencer();
  }
}

document.addEventListener('DOMContentLoaded', init);
