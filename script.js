// Main data lives here: levels, Windows labels, asset paths, and the virtual file system.
const IMAGE = "assets/images/";
const SOUND = "assets/sounds/";
const SAVE_KEY = "itigenik-real-fs-v6";
const STATE_VERSION = 6;

const ASSETS = {
  robot: {
    happy: `${IMAGE}aitigenik-happy.png`,
    thinking: `${IMAGE}aitigenik-thinking.png`,
    pointing: `${IMAGE}aitigenik-pointing.png`,
    success: `${IMAGE}aitigenik-success.png`,
    detective: `${IMAGE}aitigenik-detective.png`
  },
  folders: {
    yellow: `${IMAGE}folder-yellow.png`,
    photos: `${IMAGE}folder-photos.png`,
    school: `${IMAGE}folder-school.png`,
    music: `${IMAGE}folder-music.png`,
    games: `${IMAGE}folder-games.png`
  },
  files: {
    image: `${IMAGE}file-image.png`,
    document: `${IMAGE}file-document.png`,
    music: `${IMAGE}file-music.png`,
    video: `${IMAGE}file-video.png`,
    game: `${IMAGE}file-game.png`
  },
  star: `${IMAGE}star.png`,
  search: `${IMAGE}search-icon.png`,
  certificate: `${IMAGE}certificate-bg.png`,
  interface: {
    windowsCreate: `${IMAGE}windows-create-folder.png`
  },
  sounds: {
    click: `${SOUND}click.mp3`,
    success: `${SOUND}success.mp3`,
    wrong: `${SOUND}wrong.mp3`,
    folderOpen: `${SOUND}folder-open.mp3`,
    dragDrop: `${SOUND}drag-drop.mp3`,
    typing: `${SOUND}typing.mp3`,
    search: `${SOUND}search.mp3`,
    levelComplete: `${SOUND}level-complete.mp3`,
    finalFanfare: `${SOUND}final-fanfare.mp3`
  }
};

const OS = {
  windows: {
    label: "Windows",
    appName: "Проводник Windows",
    rootName: "Этот компьютер",
    searchPlaceholder: "Поиск",
    documentExt: "txt",
    gameExt: "exe",
    sidebar: [
      { label: "Рабочий стол", path: ["Рабочий стол"] },
      { label: "Документы", path: ["Документы"] },
      { label: "Загрузки", path: ["Загрузки"] },
      { label: "Изображения", path: ["Изображения"] },
      { label: "Проект", path: ["Документы", "Проект"] },
      { label: "Школа", path: ["Документы", "Школа"] },
      { label: "Музыка", path: ["Музыка"] },
      { label: "Игры", path: ["Игры"] }
    ]
  }
};

const LEVELS = [
  {
    id: "welcome",
    title: "Приветствие",
    mood: "happy",
    helper: "Привет! Сегодня ты научишься работать с файлами и папками в Windows."
  },
  {
    id: "openDocuments",
    title: "Открытие папки",
    mood: "pointing",
    helper: "Открой папку «Документы». Путь сверху должен измениться.",
    mission: "Открой папку «Документы».",
    hint: "На компьютере выдели папку одним кликом, затем открой двойным щелчком. На планшете коснись папки два раза.",
    setup: (s) => setPathByNames(s, []),
    expectedAction: { type: "open-folder", targetName: "Документы" },
    validate: (s) => pathNames(s).join("/") === rootPathForDocuments(s).join("/")
  },
  {
    id: "renameHomework",
    title: "Переименование файла",
    mood: "thinking",
    helper: "Переименуй файл «новый-документ.txt» в «домашка.txt».",
    mission: "Переименуй файл «новый-документ.txt» в «домашка.txt».",
    hint: "Выбери «новый-документ.txt», нажми «Переименовать», напиши «домашка» и нажми «Сохранить».",
    setup: setupRenameMission,
    expectedAction: { type: "rename-file", fromBase: "новый-документ", toBase: "домашка" },
    validate: (s) => Boolean(findFileByBaseName(s.vfs, rootPathForDocuments(s), "домашка"))
  },
  {
    id: "createSchool",
    title: "Создание папки",
    mood: "pointing",
    helper: "Создай папку «Школа» внутри «Документы».",
    mission: "Создай папку «Школа», если её ещё нет.",
    hint: "Нажми «Создать» > «Папку», затем напиши «Школа» и нажми Enter.",
    setup: setupCreateSchoolMission,
    expectedAction: { type: "create-folder", targetName: "Школа" },
    validate: (s) => Boolean(findFolderByNames(s.vfs, [...rootPathForDocuments(s), "Школа"]))
  },
  {
    id: "moveHomework",
    title: "Перенос файла",
    mood: "pointing",
    helper: "Перенеси файл «домашка» в папку «Школа».",
    mission: "Перенеси файл «домашка» в папку «Школа».",
    hint: "Выбери «домашка», затем нажми «Школа» в левой панели или перетащи файл на папку.",
    setup: setupMoveHomeworkMission,
    expectedAction: { type: "move-file", fileBase: "домашка", targetName: "Школа" },
    validate: (s) => Boolean(findFileByBaseName(s.vfs, [...rootPathForDocuments(s), "Школа"], "домашка"))
  },
  {
    id: "sortFiles",
    title: "Сортировка",
    mood: "thinking",
    helper: "Рассортируй файлы: изображения в «Изображения», музыку в «Музыка», игру в «Игры», текст в «Документы».",
    mission: "Рассортируй файлы по папкам.",
    hint: "Котик и море идут в «Изображения», песня в «Музыка», игра в «Игры», история в «Документы».",
    setup: setupSortMission,
    expectedAction: { type: "move-file", sorting: true },
    validate: validateSortMission
  },
  {
    id: "findLessonByFolders",
    title: "Поиск по папкам",
    mood: "pointing",
    helper: "Найди файл «урок», переходя по папкам. Поиск сейчас не нужен: тренируем путь.",
    mission: "Найди файл «урок», переходя по папкам.",
    hint: () => `Путь: ${displayPath([...rootPathForDocuments(state), "Школа", "Математика", lessonFileName()])}.`,
    setup: setupFindLessonMission,
    expectedAction: { type: "select-file", targetBase: "урок" },
    validate: validateFindLessonMission
  },
  {
    id: "searchRobot",
    title: "Поиск",
    mood: "detective",
    helper: "Найди файл «робот.png» через поиск.",
    mission: "Найди файл «робот.png» через поиск.",
    hint: "Введи «робот» в поле поиска и нажми найденный результат.",
    setup: setupSearchMission,
    expectedAction: { type: "search-open-file", targetName: "робот.png" },
    validate: (s) => selectedNode(s)?.name === "робот.png"
  },
  {
    id: "deleteOldFile",
    title: "Удаление файла",
    mood: "detective",
    helper: "Найди и удали файл «старый-файл.tmp». Он больше не нужен.",
    mission: "Найди и удали файл «старый-файл.tmp».",
    hint: "Открой «Загрузки», выбери «старый-файл.tmp» и нажми «Удалить».",
    setup: setupDeleteOldMission,
    expectedAction: { type: "delete-file", targetName: "старый-файл.tmp" },
    validate: (s) => !findFileByNames(s.vfs, downloadsPath(s), "старый-файл.tmp")
  },
  {
    id: "saveProjectCover",
    title: "Сохранение файла",
    mood: "pointing",
    helper: "Сохрани файл «обложка-проекта.png» в папку «Изображения».",
    mission: "Сохрани файл «обложка-проекта.png» в папку «Изображения».",
    hint: "Файл лежит в «Загрузки». Перенеси его в папку «Изображения».",
    setup: setupSaveProjectCoverMission,
    expectedAction: { type: "move-file", fileName: "обложка-проекта.png", targetName: "Изображения" },
    validate: (s) => Boolean(findFileByNames(s.vfs, imageFolderPath(s), "обложка-проекта.png"))
  },
  {
    id: "finale",
    title: "Финал",
    mood: "success",
    helper: "Поздравляем! Ты стал мастером файлов и папок!"
  }
];

const stage = document.querySelector("#stage");
const levelBadge = document.querySelector("#levelBadge");
const starsBadge = document.querySelector("#starsBadge");
const helperMessage = document.querySelector("#helperMessage");
const robotImage = document.querySelector("#robotImage");
const nextButton = document.querySelector("#nextButton");
const hintButton = document.querySelector("#hintButton");
const retryButton = document.querySelector("#retryButton");
const soundToggle = document.querySelector("#soundToggle");
const volumeSlider = document.querySelector("#volumeSlider");

let idCounter = 1;
let dragId = "";
let lastItemClick = { id: "", time: 0 };
let state = loadState();

const isTouchMode = window.matchMedia("(pointer: coarse)").matches;

nextButton.addEventListener("click", () => {
  if (!state.completed) return;
  playSound(state.level >= LEVELS.length - 2 ? "finalFanfare" : "click");
  state.level = Math.min(state.level + 1, LEVELS.length - 1);
  state.completed = false;
  state.levelSetup = "";
  state.selectedId = "";
  state.selectedItem = null;
  state.search = { term: "", results: [] };
  state.feedback = "";
  state.feedbackMood = "";
  saveState();
  render();
});

hintButton.addEventListener("click", () => {
  const level = currentLevel();
  setHelper(levelText(level.hint) || "Исследуй окно: путь, папки, файлы и боковую панель настоящие.", "thinking");
});

retryButton.addEventListener("click", () => {
  state.completed = false;
  state.levelSetup = "";
  state.selectedId = "";
  state.selectedItem = null;
  state.search = { term: "", results: [] };
  state.feedback = "";
  state.feedbackMood = "";
  saveState();
  playSound("click");
  render();
});

soundToggle.addEventListener("click", () => {
  state.muted = !state.muted;
  saveState();
  renderSoundControls();
});

volumeSlider.addEventListener("input", () => {
  state.volume = Number(volumeSlider.value);
  saveState();
});

stage.addEventListener("click", handleClick, true);
stage.addEventListener("dblclick", handleDoubleClick);
stage.addEventListener("pointerup", handlePointerNavigation, true);
stage.addEventListener("keydown", handleKeydown);
stage.addEventListener("input", handleInput);
stage.addEventListener("dragstart", handleDragStart);
stage.addEventListener("dragend", handleDragEnd);
stage.addEventListener("dragover", handleDragOver);
stage.addEventListener("drop", handleDrop);

render();

function defaultState() {
  return {
    version: STATE_VERSION,
    os: "windows",
    level: 0,
    stars: 0,
    completed: false,
    levelSetup: "",
    currentPath: [],
    selectedId: "",
    selectedItem: null,
    namingId: "",
    renameDialog: false,
    renameValue: "",
    menuOpen: false,
    fileDialog: false,
    fileType: "document",
    muted: false,
    volume: 0.7,
    search: { term: "", results: [] },
    missionFlags: { searchedRobot: false },
    feedback: "",
    feedbackMood: "",
    vfs: null
  };
}

function loadState() {
  try {
    localStorage.removeItem("itigenik-os");
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    if (saved.version !== STATE_VERSION || saved.os !== "windows") return defaultState();
    idCounter = getMaxId(saved.vfs) + 1;
    return { ...defaultState(), ...saved, os: "windows" };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function currentLevel() {
  return LEVELS[state.level] || LEVELS[0];
}

function osConfig() {
  return OS.windows;
}

function render() {
  const level = currentLevel();
  if (!state.vfs && level.id !== "welcome") resetVirtualComputer();
  if (level.setup && state.levelSetup !== level.id) {
    level.setup(state);
    state.levelSetup = level.id;
    state.selectedId = "";
    state.selectedItem = null;
    state.namingId = "";
    state.renameDialog = false;
    state.renameValue = "";
    state.menuOpen = false;
    state.fileDialog = false;
    state.search = { term: "", results: [] };
    state.feedback = "";
    state.feedbackMood = "";
    saveState();
  }

  document.body.dataset.os = "windows";
  document.body.dataset.level = String(state.level);
  document.body.dataset.path = state.currentPath.join("/");
  document.body.dataset.selected = state.selectedId || "";
  updateHud();
  renderSoundControls();
  renderHelper(state.feedback || levelText(level.helper), state.feedbackMood || level.mood);
  retryButton.disabled = ["welcome", "finale"].includes(level.id);
  nextButton.disabled = !state.completed;
  nextButton.classList.toggle("ready", state.completed && level.id !== "finale");
  nextButton.textContent = level.id === "finale" ? "Готово" : "Дальше";

  if (level.id === "welcome") stage.innerHTML = renderWelcome();
  else if (level.id === "finale") stage.innerHTML = renderFinale();
  else stage.innerHTML = renderGameLevel(level);

  focusNamingInput();
}

function updateHud() {
  const totalMissions = LEVELS.length - 2;
  if (state.level === 0) levelBadge.textContent = "Старт игры";
  else if (currentLevel().id === "finale") levelBadge.textContent = "Финал";
  else levelBadge.textContent = `Уровень ${state.level} из ${totalMissions}`;
  starsBadge.innerHTML = `<img src="${ASSETS.star}" alt="" /> ${state.stars}`;
}

function renderSoundControls() {
  soundToggle.textContent = state.muted ? "Тихо" : "Звук";
  soundToggle.setAttribute("aria-pressed", String(!state.muted));
  volumeSlider.value = String(state.volume);
}

function renderWelcome() {
  return `
    <div class="screen center-screen intro-screen">
      <img class="hero-robot" src="${ASSETS.robot.happy}" alt="Айтигеник" />
      <h2 class="big-title">Айтигеник: порядок в компьютере</h2>
      <p class="lead">Привет! Сегодня ты научишься работать с файлами и папками в Windows.</p>
      <button class="primary-button wide-button" data-action="start" type="button">Начать</button>
    </div>
  `;
}

function renderGameLevel(level) {
  return `
    <div class="screen real-game">
      <section class="mission-card ${state.completed ? "mission-done" : ""}">
        <div>
          <p class="mission-kicker">${level.title}</p>
          <h2>${levelText(level.mission)}</h2>
        </div>
        <span>${state.completed ? "Готово" : "Миссия"}</span>
      </section>
      ${renderFileManager()}
      ${state.fileDialog ? renderFileDialog() : ""}
      ${state.renameDialog ? renderRenameDialog() : ""}
      ${renderMissionChecklist(level.id)}
    </div>
  `;
}

function levelText(value) {
  return typeof value === "function" ? value() : value;
}

function renderFileManager() {
  const os = osConfig();
  const folder = currentFolder();
  const pathNodesList = getPathNodes(state);

  return `
    <section class="finder-window windows">
      <header class="window-titlebar">
        <span class="explorer-icon"></span>
        <strong>${os.appName}</strong>
        <span class="window-caption">${folder?.name || os.rootName}</span>
      </header>
      ${renderMenuBar()}
      <div class="manager-toolbar">
        ${renderBreadcrumbs(pathNodesList)}
        <label class="search-control">
          <img src="${ASSETS.search}" alt="" />
          <input data-search-input value="${escapeAttr(state.search.term)}" placeholder="${os.searchPlaceholder}" />
        </label>
      </div>
      ${renderSearchResults()}
      <div class="manager-body">
        <aside class="sidebar">
          ${os.sidebar.map((item) => renderSidebarItem(item)).join("")}
        </aside>
        <div class="file-pane" data-drop-path="${pathNames(state).join("|")}">
          ${folder.children.length ? folder.children.map(renderFsItem).join("") : renderEmptyFolder()}
        </div>
      </div>
    </section>
  `;
}

function renderMenuBar() {
  const canRename = Boolean(selectedEntry());
  return `
    <nav class="menu-bar">
      <button class="toolbar-button ${state.menuOpen ? "active" : ""}" data-action="toggle-create-menu" type="button">Создать</button>
      <button class="toolbar-button" data-action="open-file-dialog" type="button">Создать файл</button>
      <button class="toolbar-button" data-action="rename-selected" type="button" ${canRename ? "" : "disabled"}>Переименовать</button>
      <button class="toolbar-button danger" data-action="delete-selected" type="button" ${canRename ? "" : "disabled"}>Удалить</button>
      ${state.menuOpen ? `
        <div class="menu-popover">
          <img class="command-art" src="${ASSETS.interface.windowsCreate}" alt="" />
          <button data-action="create-folder" type="button">Папку</button>
        </div>
      ` : ""}
    </nav>
  `;
}

function renderBreadcrumbs(nodes) {
  return `
    <nav class="breadcrumbs" aria-label="Path">
      ${nodes.map((node, index) => `
        <button data-crumb="${index}" data-drop-path="${nodes.slice(1, index + 1).map((n) => n.name).join("|")}" type="button">
          ${escapeHtml(node.name)}
        </button>
        ${index < nodes.length - 1 ? "<span>›</span>" : ""}
      `).join("")}
    </nav>
  `;
}

function renderSidebarItem(item) {
  const active = item.path.join("/") === pathNames(state).join("/");
  return `
    <button class="side-item ${active ? "active" : ""}" data-side-path="${item.path.join("|")}" data-drop-path="${item.path.join("|")}" type="button">
      <img src="${folderIconFor(item.label)}" alt="" />
      <span>${escapeHtml(item.label)}</span>
    </button>
  `;
}

function renderFsItem(node) {
  const selected = node.id === state.selectedId ? "selected" : "";
  const targetPath = [...pathNames(state), node.name].join("|");
  const draggable = node.type === "file" ? 'draggable="true"' : "";
  const drop = node.type === "folder" ? `data-drop-path="${targetPath}" data-folder-path="${targetPath}"` : "";
  const icon = node.type === "folder" ? folderIconFor(node.name) : fileIconFor(node.fileType);
  const openClass = node.id === state.openingId ? "opening" : "";

  if (node.id === state.namingId) {
    return `
      <div class="fs-item ${selected} naming" data-id="${node.id}" data-item-type="${node.type}" ${drop}>
        <img src="${icon}" alt="" />
        <input data-rename-id="${node.id}" value="${escapeAttr(node.name)}" aria-label="Folder name" />
      </div>
    `;
  }

  return `
    <button class="fs-item ${selected} ${openClass}" data-id="${node.id}" data-item-type="${node.type}" ${drop} ${draggable} type="button">
      <img src="${icon}" alt="" />
      <span>${escapeHtml(node.name)}</span>
    </button>
  `;
}

function renderEmptyFolder() {
  return `
    <div class="empty-folder">
      <img src="${ASSETS.folders.yellow}" alt="" />
      <strong>Эта папка пустая</strong>
      <span>Можно создать папку или файл прямо здесь.</span>
    </div>
  `;
}

function renderSearchResults() {
  if (!state.search.results.length) return "";
  return `
    <div class="search-results">
      ${state.search.results.map((result) => `
        <button data-search-result="${result.id}" type="button">
          <img src="${fileIconFor(result.fileType)}" alt="" />
          <span>${escapeHtml(result.path)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderFileDialog() {
  const ext = extensionFor(state.fileType);
  return `
    <div class="modal-backdrop">
      <section class="file-dialog" role="dialog" aria-modal="true" aria-label="Создать файл">
        <h2>Создать файл</h2>
        <label>
          Имя файла
          <input data-new-file-name value="${escapeAttr(state.newFileName || "")}" placeholder="урок" />
        </label>
        <div class="type-grid">
          ${["image", "document", "music", "video"].map((type) => `
            <button class="${state.fileType === type ? "active" : ""}" data-file-type="${type}" type="button">
              <img src="${fileIconFor(type)}" alt="" />
              ${fileTypeLabel(type)}
            </button>
          `).join("")}
        </div>
        <p class="file-example">Будет создан: <strong>${escapeHtml((state.newFileName || "урок").trim() || "урок")}.${ext}</strong></p>
        <div class="dialog-actions">
          <button class="secondary-button" data-action="close-file-dialog" type="button">Отмена</button>
          <button class="primary-button" data-action="confirm-file" type="button">Создать</button>
        </div>
      </section>
    </div>
  `;
}

function renderRenameDialog() {
  const selected = selectedEntry();
  if (!selected) return "";
  const isFile = selected.node.type === "file";
  const ext = isFile ? extensionOf(selected.node.name) : "";
  const currentBase = isFile ? baseName(selected.node.name) : selected.node.name;
  const value = state.renameValue || currentBase;
  return `
    <div class="modal-backdrop">
      <section class="file-dialog" role="dialog" aria-modal="true" aria-label="Переименовать ${isFile ? "файл" : "папку"}">
        <h2>Переименовать ${isFile ? "файл" : "папку"}</h2>
        <p class="file-example">Текущее имя: <strong>${escapeHtml(selected.node.name)}</strong></p>
        <label>
          Новое имя
          <input data-rename-dialog-name value="${escapeAttr(value)}" placeholder="домашка" />
        </label>
        ${isFile && ext ? `<p class="file-example">Расширение сохранится: <strong>.${escapeHtml(ext)}</strong></p>` : ""}
        <div class="dialog-actions">
          <button class="secondary-button" data-action="cancel-rename" type="button">Отмена</button>
          <button class="primary-button" data-action="confirm-rename" type="button">Сохранить</button>
        </div>
      </section>
    </div>
  `;
}

function renderMissionChecklist(levelId) {
  if (!["sortFiles"].includes(levelId)) return "";
  const checks = getChecklist(levelId);
  return `
    <section class="checklist">
      ${checks.map((item) => `
        <div class="${item.done ? "done" : ""}">
          <span>${item.done ? "✓" : ""}</span>
          <p>${item.text}</p>
        </div>
      `).join("")}
    </section>
  `;
}

function renderFinale() {
  if (!state.finalFanfarePlayed) {
    state.finalFanfarePlayed = true;
    playSound("finalFanfare");
    saveState();
  }
  return `
    <div class="screen center-screen finale-screen">
      <div class="certificate">
        <img src="${ASSETS.robot.success}" alt="Айтигеник празднует" />
        <h2>Поздравляем!</h2>
        <p class="lead">Ты стал мастером файлов и папок!</p>
        <p>Система: <strong>Windows</strong></p>
        <p>Звёзды: <strong>${state.stars}</strong></p>
      </div>
      <button class="primary-button wide-button" data-action="play-again" type="button">Играть снова</button>
    </div>
  `;
}

function handleClick(event) {
  const action = event.target.closest("[data-action]");
  const fileType = event.target.closest("[data-file-type]");
  const item = event.target.closest("[data-id]");

  if (action) {
    runAction(action.dataset.action, action);
    return;
  }
  if (fileType) {
    state.fileType = fileType.dataset.fileType;
    playSound("click");
    saveAndRender();
    return;
  }
  if (handleNavigationTarget(event.target)) return;
  if (item) {
    pressItem(item.dataset.id);
    return;
  }

  if (currentLevel().expectedAction && event.target.closest(".finder-window")) {
    rejectAction();
  }
}

function handlePointerNavigation(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (dragId || event.target.closest("input, textarea, select")) return;
  const item = event.target.closest("[data-id]");
  if (item) {
    pressItem(item.dataset.id);
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (!handleNavigationTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
}

function handleNavigationTarget(target) {
  const result = target.closest("[data-search-result]");
  const crumb = target.closest("[data-crumb]");
  const side = target.closest("[data-side-path]");

  if (result) {
    openSearchResult(result.dataset.searchResult);
    return true;
  }
  if (crumb) {
    const nodes = getPathNodes(state);
    const index = Number(crumb.dataset.crumb);
    navigateTo(nodes.slice(1, index + 1).map((node) => node.name));
    return true;
  }
  if (side) {
    const targetPath = parsePath(side.dataset.sidePath);
    if (moveSelectedFileTo(targetPath)) return true;
    navigateTo(targetPath);
    return true;
  }
  return false;
}

function pressItem(id) {
  const now = Date.now();
  const wasSelected = state.selectedId === id;
  const repeatedQuickly = lastItemClick.id === id && now - lastItemClick.time < 1200;
  if (wasSelected && repeatedQuickly) {
    openItem(id);
    lastItemClick = { id: "", time: 0 };
    return;
  }
  selectItem(id);
  lastItemClick = { id, time: now };
}

function handleDoubleClick(event) {
  const item = event.target.closest("[data-id]");
  if (!item || isTouchMode) return;
  openItem(item.dataset.id);
}

function handleKeydown(event) {
  if (event.target.matches("[data-rename-dialog-name]") && event.key === "Enter") {
    confirmRename();
    return;
  }
  if (event.target.matches("[data-rename-dialog-name]") && event.key === "Escape") {
    state.renameDialog = false;
    state.renameValue = "";
    saveAndRender();
    return;
  }
  const rename = event.target.closest("[data-rename-id]");
  if (rename && event.key === "Enter") {
    finishRename(rename.dataset.renameId, rename.value);
    return;
  }
  if (rename && event.key === "Escape") {
    state.namingId = "";
    saveAndRender();
    return;
  }
  if (event.target.matches("[data-search-input]") && event.key === "Enter") {
    runSearch(event.target.value);
  }
}

function handleInput(event) {
  if (event.target.matches("[data-new-file-name]")) {
    state.newFileName = event.target.value;
    playSoftTyping();
    saveAndRender();
  }
  if (event.target.matches("[data-search-input]")) {
    state.search.term = event.target.value;
    saveState();
  }
  if (event.target.matches("[data-rename-id]")) {
    playSoftTyping();
  }
  if (event.target.matches("[data-rename-dialog-name]")) {
    state.renameValue = event.target.value;
    playSoftTyping();
    saveState();
  }
}

function handleDragStart(event) {
  const item = event.target.closest("[data-id]");
  if (!item) return;
  const node = findNode(state.vfs, item.dataset.id)?.node;
  if (node?.type !== "file") return;
  dragId = node.id;
  event.dataTransfer.setData("text/plain", node.id);
  event.target.classList.add("dragging");
}

function handleDragEnd(event) {
  dragId = "";
  event.target.closest(".fs-item")?.classList.remove("dragging");
}

function handleDragOver(event) {
  if (!event.target.closest("[data-drop-path]")) return;
  event.preventDefault();
  event.target.closest("[data-drop-path]").classList.add("drop-hover");
}

function handleDrop(event) {
  const target = event.target.closest("[data-drop-path]");
  if (!target) return;
  event.preventDefault();
  target.classList.remove("drop-hover");
  const fileId = event.dataTransfer.getData("text/plain") || dragId;
  moveNodeToPath(fileId, parsePath(target.dataset.dropPath));
}

function runAction(action) {
  const levelId = currentLevel().id;
  if (action === "start" && levelId !== "welcome") return;
  if (action === "play-again" && levelId !== "finale") return;
  if (action !== "start" && action !== "play-again" && ["welcome", "finale"].includes(levelId)) return;

  const actions = {
    start() {
      const muted = state.muted;
      const volume = state.volume;
      state = defaultState();
      state.muted = muted;
      state.volume = volume;
      resetVirtualComputer();
      playSound("click");
      state.level = 1;
      state.completed = false;
      state.levelSetup = "";
      saveAndRender();
    },
    "toggle-create-menu"() {
      state.menuOpen = !state.menuOpen;
      playSound("click");
      saveAndRender();
    },
    "create-folder"() {
      createFolderFlow();
    },
    "open-file-dialog"() {
      if (currentLevel().expectedAction) {
        rejectAction();
        return;
      }
      state.fileDialog = true;
      state.newFileName = "урок";
      state.fileType = "document";
      playSound("click");
      saveAndRender();
    },
    "close-file-dialog"() {
      state.fileDialog = false;
      playSound("click");
      saveAndRender();
    },
    "confirm-file"() {
      confirmCreateFile();
    },
    "rename-selected"() {
      startRenameSelected();
    },
    "confirm-rename"() {
      confirmRename();
    },
    "cancel-rename"() {
      state.renameDialog = false;
      state.renameValue = "";
      playSound("click");
      saveAndRender();
    },
    "delete-selected"() {
      deleteSelected();
    },
    "play-again"() {
      const muted = state.muted;
      const volume = state.volume;
      state = defaultState();
      state.muted = muted;
      state.volume = volume;
      resetVirtualComputer();
      state.level = 1;
      state.completed = false;
      state.levelSetup = "";
      saveAndRender();
    }
  };
  if (actions[action]) actions[action]();
}

function isExpectedAction(action) {
  const level = currentLevel();
  const expected = level.expectedAction;
  if (!expected) return true;
  if (!action || action.type !== expected.type) return false;

  if (level.id === "openDocuments") {
    return action.targetName === "Документы" && samePath(action.targetPath, rootPathForDocuments(state));
  }
  if (level.id === "createSchool") {
    return action.targetName === "Школа" && samePath(action.parentPath, rootPathForDocuments(state));
  }
  if (level.id === "renameHomework") {
    return action.fromBase === "новый-документ" && action.toBase === "домашка" && samePath(action.parentPath, rootPathForDocuments(state));
  }
  if (level.id === "moveHomework") {
    return action.fileBase === "домашка" && action.targetName === "Школа" && samePath(action.targetPath, [...rootPathForDocuments(state), "Школа"]);
  }
  if (level.id === "sortFiles") {
    return sortTargetFor(action.fileName) === action.targetName;
  }
  if (level.id === "findLessonByFolders") {
    return action.targetBase === "урок" && samePath(action.parentPath, lessonFolderPath(state));
  }
  if (level.id === "searchRobot") {
    return action.targetName === "робот.png" && state.search.term.trim().toLowerCase().includes("робот");
  }
  if (level.id === "deleteOldFile") {
    return action.targetName === "старый-файл.tmp";
  }
  if (level.id === "saveProjectCover") {
    return action.fileName === "обложка-проекта.png" && action.targetName === "Изображения" && samePath(action.targetPath, imageFolderPath(state));
  }
  return true;
}

function rejectAction(customMessage = "") {
  const message = customMessage || currentLevel().wrong || "Почти! Сейчас нужно выполнить именно задание Айтигеника. Попробуй ещё раз.";
  softWrong(message);
}

function isFileSelectionAllowed() {
  return ["renameHomework", "moveHomework", "sortFiles", "deleteOldFile", "saveProjectCover"].includes(currentLevel().id);
}

function folderTargetHint() {
  if (currentLevel().id === "openDocuments") return "Почти! Сейчас нужно открыть именно папку «Документы». Попробуй ещё раз.";
  if (currentLevel().id === "findLessonByFolders") return "Почти! Иди по пути: Документы > Школа > Математика.";
  return "Почти! Сейчас нужно выполнить именно задание Айтигеника.";
}

function moveTargetHint(fileName) {
  const target = sortTargetFor(fileName);
  if (target) return `Почти! Файл «${fileName}» нужно перенести в папку «${target}».`;
  if (baseName(fileName) === "домашка") return "Почти! Файл «домашка» нужно перенести в папку «Школа».";
  if (fileName === "обложка-проекта.png") return "Почти! Обложку проекта нужно сохранить в папку «Изображения».";
  return "Почти! Этот файл сейчас нужно положить в другую папку.";
}

function resetVirtualComputer() {
  idCounter = 1;
  state.os = "windows";
  state.vfs = createInitialFileSystem();
  setPathByNames(state, []);
  clearSelection();
  state.renameDialog = false;
  state.renameValue = "";
  state.search = { term: "", results: [] };
  state.missionFlags = { searchedRobot: false };
}

function selectItem(id) {
  const found = findNode(state.vfs, id);
  if (!found) return;

  setSelectedItem(found);
  if (currentLevel().id === "findLessonByFolders") {
    const action = selectionAction(found);
    if (found.node.type === "file") {
      if (isExpectedAction(action) && validateFindLessonMission(state)) {
        setHelper("Отлично! Ты нашёл файл по правильному пути.", "success");
        playSound("success");
        validateCurrentLevel(action);
        saveAndRender();
        return;
      }
      rejectAction("Почти! Найди именно файл «урок» в папке «Математика».");
      saveAndRender();
      return;
    }
  }
  setHelper(found.node.type === "folder" ? "Папка выбрана. Двойной щелчок откроет её." : "Файл выбран. Теперь можно переименовать, удалить или перетащить его.", found.node.type === "file" ? "pointing" : "thinking");
  playSound("click");
  saveAndRender();
}

function selectionAction(found) {
  const parentPath = found.parent ? pathToNode(state.vfs, found.parent.id).slice(1).map((node) => node.name) : [];
  return {
    type: "select-file",
    targetName: found.node.name,
    targetBase: baseName(found.node.name),
    parentPath
  };
}

function openItem(id) {
  const found = findNode(state.vfs, id);
  if (!found) return;
  setSelectedItem(found);

  if (found.node.type === "folder") {
    navigateTo(pathToNode(state.vfs, found.node.id).slice(1).map((pathNode) => pathNode.name));
    return;
  }

  if (currentLevel().id === "findLessonByFolders") {
    const action = selectionAction(found);
    if (isExpectedAction(action) && validateFindLessonMission(state)) {
      setHelper("Отлично! Ты нашёл файл по правильному пути.", "success");
      if (!state.completed) {
        playSound("success");
        validateCurrentLevel(action);
      }
      saveAndRender();
      return;
    }
    if (!state.completed) {
      rejectAction("Почти! Нужно найти файл «урок» внутри папки «Математика».");
    }
    saveAndRender();
    return;
  }
  setHelper(`Файл «${found.node.name}» выбран.`, "pointing");
  playSound("click");
  saveAndRender();
}

function navigateTo(names, options = {}) {
  if (!findFolderByNames(state.vfs, names)) {
    softWrong("Эта папка сейчас недоступна.");
    return false;
  }
  const action = options.action || { type: "open-folder", targetName: names[names.length - 1] || state.vfs.name, targetPath: names };
  const folder = findFolderByNames(state.vfs, names);
  state.openingId = folder?.id || "";
  state.currentPath = names;
  clearSelection();
  playSound("folderOpen");
  if (!state.completed && currentLevel().expectedAction && !isExpectedAction(action) && action.type === "open-folder") {
    setHelper(folderTargetHint(), "thinking");
  } else {
    setHelper(names.length ? `Открыта папка «${names[names.length - 1]}». Путь сверху обновился.` : `Открыт ${state.vfs.name}.`, "happy");
  }
  if (!options.skipValidate) validateCurrentLevel(action);
  saveAndRender();
  window.setTimeout(() => {
    state.openingId = "";
    saveState();
    render();
  }, 180);
  return true;
}

function createFolderFlow() {
  if (!["createSchool"].includes(currentLevel().id)) {
    rejectAction();
    return;
  }
  const folder = currentFolder();
  const base = uniqueName(folder, "Новая папка");
  const node = folderNode(base, []);
  folder.children.unshift(node);
  state.namingId = node.id;
  setSelectedItem(findNode(state.vfs, node.id));
  state.menuOpen = false;
  playSound("click");
  setHelper(`Папка появилась внутри ${folder.name}. Теперь напиши её имя.`, "pointing");
  saveAndRender();
}

function finishRename(id, value) {
  const found = findNode(state.vfs, id);
  if (!found) return;
  const name = value.trim();
  if (!name) {
    softWrong("Нужно ввести имя. Попробуй ещё раз.");
    return;
  }
  const finalName = found.node.type === "file" ? normalizeFileRename(found.node.name, name) : name;
  if (found.node.type === "file" && !baseName(finalName).trim()) {
    softWrong("Нужно ввести имя файла. Расширение сохранится автоматически.");
    return;
  }
  const action = found.node.type === "folder"
    ? { type: "create-folder", targetName: finalName, parentPath: pathToNode(state.vfs, found.parent.id).slice(1).map((node) => node.name) }
    : { type: "rename-file", fromName: found.node.name, fromBase: baseName(found.node.name), toName: finalName, toBase: baseName(finalName), parentPath: pathToNode(state.vfs, found.parent.id).slice(1).map((node) => node.name) };

  if (currentLevel().expectedAction && !isExpectedAction(action)) {
    rejectAction(currentLevel().id === "renameHomework" ? "Почти! Нужно переименовать «новый-документ» именно в «домашка»." : "Почти! Сейчас нужна папка «Школа».");
    return;
  }

  if (found.parent.children.some((child) => child.id !== id && child.name === finalName)) {
    softWrong("Такое имя уже есть в этой папке. Выбери другое.");
    return;
  }
  found.node.name = finalName;
  state.namingId = "";
  state.renameDialog = false;
  state.renameValue = "";
  setSelectedItem(found);
  setHelper(`Готово! Имя «${finalName}» сохранено в файловой системе.`, "success");
  playSound("success");
  validateCurrentLevel(action);
  saveAndRender();
}

function confirmCreateFile() {
  if (currentLevel().expectedAction) {
    rejectAction();
    return;
  }
  const folder = currentFolder();
  const rawName = (state.newFileName || "урок").trim();
  const cleanName = rawName.replace(/[^\wа-яА-ЯёЁ -]/g, "") || "урок";
  const name = uniqueName(folder, `${cleanName}.${extensionFor(state.fileType)}`);
  const node = fileNode(name, state.fileType);
  folder.children.unshift(node);
  state.fileDialog = false;
  setSelectedItem(findNode(state.vfs, node.id));
  setHelper(`${name} создан внутри ${folder.name}. Он уже хранится в виртуальной файловой системе.`, "success");
  playSound("success");
  validateCurrentLevel();
  saveAndRender();
}

function startRenameSelected() {
  const found = selectedEntry();
  if (!found) {
    rejectAction("Сначала выбери файл, который нужно переименовать.");
    return;
  }
  if (!["renameHomework"].includes(currentLevel().id)) {
    rejectAction();
    return;
  }
  if (currentLevel().id === "renameHomework") {
    const parentPath = found.parent ? pathToNode(state.vfs, found.parent.id).slice(1).map((node) => node.name) : [];
    if (found.node.type !== "file" || baseName(found.node.name) !== "новый-документ" || !samePath(parentPath, rootPathForDocuments(state))) {
      rejectAction("Почти! Сначала выбери файл «новый-документ» в папке «Документы».");
      return;
    }
  }
  state.renameDialog = true;
  state.renameValue = found.node.type === "file" ? baseName(found.node.name) : found.node.name;
  playSound("click");
  setHelper("Теперь введи новое имя и нажми «Сохранить». Расширение файла сохранится само.", "pointing");
  saveAndRender();
}

function confirmRename() {
  const found = selectedEntry();
  if (!found) {
    rejectAction("Сначала выбери файл, который нужно переименовать.");
    return;
  }
  finishRename(found.node.id, state.renameValue || "");
}

function deleteSelected() {
  const found = selectedEntry();
  if (!found || !found.parent || found.node.type !== "file") {
    rejectAction("Сначала выбери файл, который нужно удалить.");
    return;
  }
  const action = { type: "delete-file", targetName: found.node.name, targetBase: baseName(found.node.name) };
  if (currentLevel().expectedAction && !isExpectedAction(action)) {
    rejectAction("Почти! Сейчас нужно удалить именно «старый-файл.tmp».");
    return;
  }
  found.parent.children = found.parent.children.filter((child) => child.id !== found.node.id);
  clearSelection();
  setHelper(`Файл «${found.node.name}» удалён.`, "success");
  playSound("success");
  validateCurrentLevel(action);
  saveAndRender();
}

function moveSelectedFileTo(path) {
  const found = selectedEntry();
  if (!found || found.node.type !== "file") return false;
  moveNodeToPath(found.node.id, path);
  return true;
}

function moveNodeToPath(id, path) {
  const found = findNode(state.vfs, id);
  const target = findFolderByNames(state.vfs, path);
  if (!found || !target || found.node.type !== "file") {
    softWrong("Перемещать можно файлы, и только в настоящую папку.");
    return;
  }
  if (found.parent.id === target.id) {
    softWrong("Файл уже лежит в этой папке.");
    return;
  }
  const action = {
    type: "move-file",
    fileName: found.node.name,
    fileBase: baseName(found.node.name),
    targetName: target.name,
    targetPath: path
  };
  if (currentLevel().expectedAction && !isExpectedAction(action)) {
    rejectAction(moveTargetHint(found.node.name));
    return;
  }
  found.parent.children = found.parent.children.filter((child) => child.id !== id);
  found.node.name = uniqueName(target, found.node.name);
  target.children.push(found.node);
  setSelectedItem(findNode(state.vfs, found.node.id));
  setHelper(`${found.node.name} перемещён в ${target.name}. Структура компьютера изменилась.`, "success");
  playSound("dragDrop");
  validateCurrentLevel(action);
  saveAndRender(true);
}

function runSearch(term) {
  const clean = term.trim();
  if (!clean) {
    state.search = { term: "", results: [] };
    saveAndRender();
    return;
  }
  if (currentLevel().expectedAction && currentLevel().id !== "searchRobot") {
    rejectAction("Сейчас поиск не нужен. Выполни действие из задания.");
    return;
  }
  if (currentLevel().id === "searchRobot" && !clean.toLowerCase().includes("робот")) {
    rejectAction("Почти! Сейчас нужно найти файл «робот.png». Введи «робот».");
    return;
  }
  state.search.term = clean;
  state.search.results = searchFiles(state.vfs, clean);
  playSound("search");
  setHelper(state.search.results.length ? "Поиск нашёл файлы. Нажми результат, чтобы прыгнуть прямо в папку." : "Пока ничего не найдено. Попробуй часть имени: робот, котик, домашка или урок.", "detective");
  saveAndRender();
}

function openSearchResult(id) {
  const found = findNode(state.vfs, id);
  if (!found || found.node.type !== "file") return;
  const action = { type: "search-open-file", targetName: found.node.name, targetBase: baseName(found.node.name) };
  if (currentLevel().expectedAction && !isExpectedAction(action)) {
    rejectAction("Почти! Сейчас через поиск нужно открыть именно «робот.png».");
    return;
  }
  const parentPath = pathToNode(state.vfs, found.parent.id).slice(1).map((node) => node.name);
  navigateTo(parentPath, { action, skipValidate: true });
  setSelectedItem(findNode(state.vfs, id));
  state.missionFlags.searchedRobot = found.node.name === "робот.png" || state.missionFlags.searchedRobot;
  setHelper(`Переход выполнен: открыт путь к ${found.node.name}.`, "success");
  validateCurrentLevel(action);
  saveAndRender();
}

function validateCurrentLevel(action = null) {
  const level = currentLevel();
  if (!level.validate || state.completed) return;
  if (level.expectedAction && action && !isExpectedAction(action)) return;
  if (level.validate(state)) {
    state.completed = true;
    state.stars += 1;
    setHelper(level.id === "findLessonByFolders" ? "Отлично! Ты нашёл файл по правильному пути." : "Миссия выполнена! Ты сделал это настоящим действием в файловой системе.", "success");
    playSound("levelComplete");
    celebrate(level.id === "saveProjectCover");
    saveState();
  }
}

function saveAndRender(dropAnimation = false) {
  saveState();
  render();
  if (dropAnimation) stage.querySelector(".file-pane")?.classList.add("drop-flash");
}

function setHelper(message, mood = "happy") {
  state.feedback = message;
  state.feedbackMood = mood;
  renderHelper(message, mood);
}

function renderHelper(message, mood = "happy") {
  helperMessage.textContent = message;
  if (robotImage) robotImage.src = ASSETS.robot[mood] || ASSETS.robot.happy;
}

function softWrong(message) {
  setHelper(message, "thinking");
  playSound("wrong");
}

function playSound(name) {
  if (state.muted) return;
  const src = ASSETS.sounds[name];
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = Math.max(0, Math.min(1, state.volume));
  audio.play().catch(() => {});
}

let typingTimer = 0;
function playSoftTyping() {
  window.clearTimeout(typingTimer);
  typingTimer = window.setTimeout(() => playSound("typing"), 60);
}

function celebrate(big = false) {
  starsBadge.classList.remove("star-pop");
  window.requestAnimationFrame(() => starsBadge.classList.add("star-pop"));
  if (!big && currentLevel().id !== "saveProjectCover") return;
  const confetti = document.createElement("div");
  confetti.className = "confetti";
  confetti.innerHTML = Array.from({ length: big ? 28 : 16 }, (_, i) => `<i style="--x:${(i % 7) - 3};--d:${i % 5}"></i>`).join("");
  document.querySelector(".game-card").append(confetti);
  window.setTimeout(() => confetti.remove(), 1300);
}

function focusNamingInput() {
  const dialogInput = stage.querySelector("[data-rename-dialog-name]");
  if (dialogInput) {
    dialogInput.focus();
    dialogInput.select();
    return;
  }
  const input = stage.querySelector("[data-rename-id]");
  if (input) {
    input.focus();
    input.select();
  }
}

function createInitialFileSystem() {
  return folderNode("Этот компьютер", [
    folderNode("Документы", [
      folderNode("Школа", [
        folderNode("Математика", [
          fileNode("урок.txt", "document")
        ])
      ]),
      folderNode("Проект", []),
      fileNode("новый-документ.txt", "document")
    ]),
    folderNode("Загрузки", [
      fileNode("старый-файл.tmp", "document")
    ]),
    folderNode("Рабочий стол", []),
    folderNode("Изображения", [
      fileNode("котик.png", "image"),
      fileNode("море.jpg", "image"),
      fileNode("робот.png", "image")
    ]),
    folderNode("Музыка", [
      fileNode("песня.mp3", "music")
    ]),
    folderNode("Игры", [
      fileNode("игра.exe", "game")
    ])
  ]);
}

function folderNode(name, children = []) {
  return { id: `n${idCounter++}`, type: "folder", name, children };
}

function fileNode(name, fileType) {
  return { id: `n${idCounter++}`, type: "file", name, fileType };
}

function currentFolder() {
  return findFolderByNames(state.vfs, state.currentPath) || state.vfs;
}

function setSelectedItem(found) {
  if (!found) {
    clearSelection();
    return;
  }
  const parentPath = found.parent ? pathToNode(state.vfs, found.parent.id).slice(1).map((node) => node.name) : [];
  state.selectedId = found.node.id;
  state.selectedItem = {
    id: found.node.id,
    name: found.node.name,
    type: found.node.type,
    path: [...parentPath, found.node.name],
    parentPath
  };
}

function clearSelection() {
  state.selectedId = "";
  state.selectedItem = null;
}

function selectedEntry() {
  const id = state.selectedItem?.id || state.selectedId;
  if (!id || !state.vfs) return null;
  const found = findNode(state.vfs, id);
  if (!found) {
    clearSelection();
    return null;
  }
  if (!state.selectedItem || state.selectedItem.name !== found.node.name || state.selectedItem.type !== found.node.type) {
    setSelectedItem(found);
  }
  return found;
}

function selectedNode(s) {
  const id = s.selectedItem?.id || s.selectedId;
  if (!id || !s.vfs) return null;
  return findNode(s.vfs, id)?.node || null;
}

function getPathNodes(s) {
  const nodes = [s.vfs];
  let cursor = s.vfs;
  for (const name of s.currentPath) {
    cursor = cursor.children.find((child) => child.type === "folder" && child.name === name);
    if (!cursor) break;
    nodes.push(cursor);
  }
  return nodes;
}

function pathNames(s) {
  return [...s.currentPath];
}

function parsePath(value = "") {
  return value.split("|").filter(Boolean);
}

function pathToNode(root, id, trail = []) {
  const nextTrail = [...trail, root];
  if (root.id === id) return nextTrail;
  if (root.type !== "folder") return [];
  for (const child of root.children) {
    const found = pathToNode(child, id, nextTrail);
    if (found.length) return found;
  }
  return [];
}

function findNode(root, id, parent = null) {
  if (!root) return null;
  if (root.id === id) return { node: root, parent };
  if (root.type !== "folder") return null;
  for (const child of root.children) {
    const found = findNode(child, id, root);
    if (found) return found;
  }
  return null;
}

function findFolderByNames(root, names) {
  let cursor = root;
  for (const name of names) {
    if (!cursor || cursor.type !== "folder") return null;
    cursor = cursor.children.find((child) => child.type === "folder" && child.name === name);
  }
  return cursor?.type === "folder" ? cursor : null;
}

function findFileByNames(root, folderNames, fileName) {
  const folder = findFolderByNames(root, folderNames);
  return folder?.children.find((child) => child.type === "file" && child.name === fileName) || null;
}

function findFileByBaseName(root, folderNames, wantedBase) {
  const folder = findFolderByNames(root, folderNames);
  return folder?.children.find((child) => child.type === "file" && baseName(child.name) === wantedBase) || null;
}

function ensureFolder(s, parentPath, name) {
  const parent = findFolderByNames(s.vfs, parentPath);
  if (!parent) return null;
  let folder = parent.children.find((child) => child.type === "folder" && child.name === name);
  if (!folder) {
    folder = folderNode(name, []);
    parent.children.push(folder);
  }
  return folder;
}

function setPathByNames(s, names) {
  if (findFolderByNames(s.vfs, names)) s.currentPath = names;
}

function samePath(a = [], b = []) {
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

function displayPath(parts) {
  return [state.vfs?.name || osConfig().rootName, ...parts].join(" > ");
}

function baseName(fileName) {
  const dot = fileName.lastIndexOf(".");
  return dot > -1 ? fileName.slice(0, dot) : fileName;
}

function extensionOf(fileName) {
  const dot = fileName.lastIndexOf(".");
  return dot > -1 ? fileName.slice(dot + 1) : "";
}

function normalizeFileRename(oldName, typedName) {
  const clean = typedName.trim().replace(/\.[^/.]*$/, "");
  const ext = extensionOf(oldName);
  return ext ? `${clean}.${ext}` : clean;
}

function sortTargetFor(fileName) {
  const rules = {
    "котик.png": "Изображения",
    "море.jpg": "Изображения",
    "песня.mp3": "Музыка",
    [gameFileName()]: "Игры",
    [historyFileName()]: "Документы"
  };
  return rules[fileName] || "";
}

function fileTypeLabel(type) {
  return {
    image: "Изображение",
    document: "Документ",
    music: "Музыка",
    video: "Видео",
    game: "Игра"
  }[type] || "Файл";
}

function searchFiles(root, term) {
  const results = [];
  const clean = term.toLowerCase();
  function walk(node, trail) {
    if (node.type === "file" && node.name.toLowerCase().includes(clean)) {
      results.push({
        id: node.id,
        fileType: node.fileType,
        path: [...trail, node.name].join("/")
      });
    }
    if (node.type === "folder") node.children.forEach((child) => walk(child, [...trail, node.name]));
  }
  walk(root, []);
  return results.map((result) => ({ ...result, path: result.path.replace(`${root.name}/`, "") }));
}

function uniqueName(folder, wanted) {
  if (!folder.children.some((child) => child.name === wanted)) return wanted;
  const dot = wanted.lastIndexOf(".");
  const base = dot > -1 ? wanted.slice(0, dot) : wanted;
  const ext = dot > -1 ? wanted.slice(dot) : "";
  let index = 2;
  while (folder.children.some((child) => child.name === `${base} ${index}${ext}`)) index += 1;
  return `${base} ${index}${ext}`;
}

function extensionFor(type) {
  const ext = { image: "png", document: osConfig().documentExt, music: "mp3", video: "mp4", game: osConfig().gameExt };
  return ext[type] || "txt";
}

function fileIconFor(type) {
  return ASSETS.files[type] || ASSETS.files.document;
}

function folderIconFor(name) {
  const lower = name.toLowerCase();
  if (lower.includes("изображ")) return ASSETS.folders.photos;
  if (lower.includes("школ") || lower.includes("домаш") || lower.includes("математ") || lower.includes("природ")) return ASSETS.folders.school;
  if (lower.includes("музык") || lower.includes("звук")) return ASSETS.folders.music;
  if (lower.includes("игр")) return ASSETS.folders.games;
  return ASSETS.folders.yellow;
}

function rootPathForDocuments(s = state) {
  return ["Документы"];
}

function downloadsPath(s = state) {
  return ["Загрузки"];
}

function musicPath(s = state) {
  return ["Музыка"];
}

function gamesPath(s = state) {
  return ["Игры"];
}

function imageFolderPath(s = state) {
  return ["Изображения"];
}

function lessonFolderPath(s = state) {
  return [...rootPathForDocuments(s), "Школа", "Математика"];
}

function lessonFileName(s = state) {
  return "урок.txt";
}

function homeworkFileName() {
  return "домашка.txt";
}

function historyFileName() {
  return "история.txt";
}

function gameFileName() {
  return "игра.exe";
}

function validateSortMission(s) {
  return Boolean(findFileByNames(s.vfs, imageFolderPath(s), "котик.png")) &&
    Boolean(findFileByNames(s.vfs, imageFolderPath(s), "море.jpg")) &&
    Boolean(findFileByNames(s.vfs, musicPath(s), "песня.mp3")) &&
    Boolean(findFileByNames(s.vfs, gamesPath(s), gameFileName())) &&
    Boolean(findFileByNames(s.vfs, rootPathForDocuments(s), historyFileName()));
}

function validateFindLessonMission(s) {
  const id = s.selectedItem?.id || s.selectedId;
  const found = id ? findNode(s.vfs, id) : null;
  if (!found || found.node.type !== "file") return false;
  const parentPath = found.parent ? pathToNode(s.vfs, found.parent.id).slice(1).map((node) => node.name) : [];
  return found.node.name === lessonFileName(s) &&
    samePath(parentPath, lessonFolderPath(s)) &&
    samePath(pathNames(s), lessonFolderPath(s));
}

function setupSearchMission(s) {
  placeFile(s, "робот.png", "image", imageFolderPath(s));
}

function setupRenameMission(s) {
  removeChildByName(s, rootPathForDocuments(s), "домашка.txt");
  ensureFile(s, rootPathForDocuments(s), "новый-документ.txt", "document");
  setPathByNames(s, rootPathForDocuments(s));
}

function setupCreateSchoolMission(s) {
  removeChildByName(s, rootPathForDocuments(s), "Школа");
  setPathByNames(s, rootPathForDocuments(s));
}

function setupMoveHomeworkMission(s) {
  ensureFolder(s, rootPathForDocuments(s), "Школа");
  placeFile(s, homeworkFileName(), "document", rootPathForDocuments(s));
  setPathByNames(s, rootPathForDocuments(s));
}

function setupSortMission(s) {
  placeFile(s, "котик.png", "image", downloadsPath(s));
  placeFile(s, "море.jpg", "image", downloadsPath(s));
  placeFile(s, "песня.mp3", "music", downloadsPath(s));
  placeFile(s, gameFileName(), "game", downloadsPath(s));
  placeFile(s, historyFileName(), "document", downloadsPath(s));
  setPathByNames(s, downloadsPath(s));
}

function setupFindLessonMission(s) {
  ensureFolder(s, rootPathForDocuments(s), "Школа");
  ensureFolder(s, [...rootPathForDocuments(s), "Школа"], "Математика");
  ensureFile(s, lessonFolderPath(s), lessonFileName(s), "document");
  setPathByNames(s, rootPathForDocuments(s));
}

function setupDeleteOldMission(s) {
  ensureFile(s, downloadsPath(s), "старый-файл.tmp", "document");
  setPathByNames(s, downloadsPath(s));
}

function setupSaveProjectCoverMission(s) {
  placeFile(s, "обложка-проекта.png", "image", downloadsPath(s));
  setPathByNames(s, downloadsPath(s));
}

function removeChildByName(s, parentPath, name) {
  const parent = findFolderByNames(s.vfs, parentPath);
  if (parent) parent.children = parent.children.filter((child) => child.name !== name);
}

function placeFile(s, name, fileType, targetPath) {
  const target = findFolderByNames(s.vfs, targetPath);
  if (!target) return null;
  const result = searchFiles(s.vfs, name).find((item) => item.path.split("/").pop() === name);
  const found = result ? findNode(s.vfs, result.id) : null;
  if (!found) {
    const node = fileNode(name, fileType);
    target.children.push(node);
    return node;
  }
  if (found.parent?.id !== target.id) {
    found.parent.children = found.parent.children.filter((child) => child.id !== found.node.id);
    target.children.push(found.node);
  }
  return found.node;
}

function ensureFile(s, path, name, fileType) {
  const folder = findFolderByNames(s.vfs, path);
  if (folder && !folder.children.some((child) => child.name === name)) folder.children.push(fileNode(name, fileType));
}

function getChecklist(levelId) {
  if (levelId === "sortFiles") {
    return [
      { text: "котик.png находится в Изображения", done: Boolean(findFileByNames(state.vfs, imageFolderPath(state), "котик.png")) },
      { text: "море.jpg находится в Изображения", done: Boolean(findFileByNames(state.vfs, imageFolderPath(state), "море.jpg")) },
      { text: "песня.mp3 находится в Музыка", done: Boolean(findFileByNames(state.vfs, musicPath(state), "песня.mp3")) },
      { text: `${gameFileName()} находится в Игры`, done: Boolean(findFileByNames(state.vfs, gamesPath(state), gameFileName())) },
      { text: `${historyFileName()} находится в Документы`, done: Boolean(findFileByNames(state.vfs, rootPathForDocuments(state), historyFileName())) }
    ];
  }
  return [];
}

function getMaxId(root) {
  if (!root) return 0;
  const number = Number(String(root.id || "n0").replace("n", ""));
  if (root.type !== "folder") return number;
  return Math.max(number, ...root.children.map(getMaxId));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

if (new URLSearchParams(window.location.search).has("debug")) {
  window.__itigenikDebug = {
    getState: () => JSON.parse(JSON.stringify(state)),
    next: () => {
      if (state.completed) {
        state.level = Math.min(state.level + 1, LEVELS.length - 1);
        state.completed = false;
        state.levelSetup = "";
        saveAndRender();
      }
    },
    openPath: (names) => {
      setPathByNames(state, names);
      validateCurrentLevel();
      saveAndRender();
    },
    createFolder: (name) => {
      const folder = currentFolder();
      folder.children.push(folderNode(name, []));
      validateCurrentLevel();
      saveAndRender();
    },
    createFile: (baseName, type) => {
      state.fileType = type;
      state.newFileName = baseName;
      confirmCreateFile();
    },
    moveFile: (name, path) => {
      const item = searchFiles(state.vfs, name).find((result) => result.path.endsWith(name));
      if (!item) return false;
      moveNodeToPath(item.id, path);
      return true;
    },
    search: (term) => runSearch(term),
    openResult: (name) => {
      const result = state.search.results.find((item) => item.path.endsWith(name));
      if (!result) return false;
      openSearchResult(result.id);
      return true;
    }
  };
}
