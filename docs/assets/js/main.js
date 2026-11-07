(() => {
  'use strict';
  document.documentElement.classList.add('has-js');

  const themeButton = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeButton.setAttribute('aria-pressed', String(theme === 'light'));
    themeColor.setAttribute('content', theme === 'dark' ? '#111816' : '#f6f7f1');
  };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('modernbim-theme'); } catch {}
  if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  themeButton.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('modernbim-theme', theme); } catch {}
  });

  const model = document.querySelector('.model');
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const captions = {
    geometry: ['Геометрия — только начало.', 'За каждым элементом модели должны стоять понятные и проверяемые данные.'],
    data: ['Элемент связан с информацией.', 'Структурное витражное остекление фасада: геометрия, состав и свойства связаны с конкретным элементом модели.'],
    quality: ['Неопределённость должна быть видна.', 'В этом примере состав стеклопакета требует уточнения. До проверки эти сведения нельзя считать достоверными.'],
    engineering: ['Инженерные системы в общей модели.', 'ОВ — условная сеть вентиляции; ВК — водоснабжение и канализация. Полупрозрачный корпус помогает видеть трассы и взаимное положение систем.']
  };
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      if (!Object.hasOwn(captions, mode)) return;
      model.dataset.modelMode = mode;
      modeButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      model.querySelector('.caption-title').textContent = captions[mode][0];
      model.querySelector('.caption-text').textContent = captions[mode][1];
    });
  });

  const competenceButtons = [...document.querySelectorAll('[data-competence]')];
  const competencePanels = [...document.querySelectorAll('.competence-panel')];
  const selectCompetence = (button) => {
    const id = button.dataset.competence;
    if (!competencePanels.some((panel) => panel.id === id)) return;
    competenceButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    competencePanels.forEach((panel) => { panel.hidden = panel.id !== id; });
  };
  competenceButtons.forEach((button) => {
    button.addEventListener('click', () => selectCompetence(button));
  });
  if (competenceButtons.length) selectCompetence(competenceButtons[0]);

  [modeButtons, competenceButtons].forEach((group) => {
    group.forEach((button, index) => {
      button.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % group.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + group.length) % group.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = group.length - 1;
        else return;
        event.preventDefault();
        group[next].focus();
        group[next].click();
      });
    });
  });
  const caseButtons = [...document.querySelectorAll('[data-case]')];
  const casePanels = [...document.querySelectorAll('.case-panel')];
  caseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = 'case-' + button.dataset.case;
      if (!casePanels.some((panel) => panel.id === id)) return;
      caseButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      casePanels.forEach((panel) => { panel.hidden = panel.id !== id; });
    });
  });
  if (caseButtons.length) caseButtons[0].click();

  const estimateText = {
    model: 'В модели задаются геометрия, параметры и принадлежность элементов. Это исходные данные для следующих этапов.',
    schedule: 'Спецификация группирует элементы одного типа и собирает их количество и свойства без повторного ручного ввода.',
    quantity: 'Объём вычисляется из параметров выбранного семейства. Для реальных работ заранее определяют состав и правила измерения объёмов.',
    cost: 'Объём умножается на условную расценку. Изменение параметров пересчитывает пример; реальные расценки и состав работ требуют обоснования.'
  };
  const estimateButtons = [...document.querySelectorAll('[data-estimate]')];
  estimateButtons.forEach((button) => button.addEventListener('click', () => {
    const stage = button.dataset.estimate;
    if (!Object.hasOwn(estimateText, stage)) return;
    document.querySelector('.estimate-screen').dataset.estimateStage = stage;
    estimateButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#estimate-explanation').textContent = estimateText[stage];
  }));

  const instructionSteps = [
    ['Подготовьте исходные данные', 'Выберите тип семейства и проверьте, что нужные параметры доступны для обработки.'],
    ['Выполните обработку', 'Скрипт Dynamo или плагин читает согласованные параметры и выполняет операцию по заданным правилам.'],
    ['Проверьте результат', 'Сопоставьте геометрию и параметры с исходной задачей. Уточните замечания до передачи данных участникам проекта.']
  ];
  let instructionStep = 0;
  const showInstruction = () => {
    document.querySelector('.instruction-screen').dataset.instructionStep = String(instructionStep);
    document.querySelector('#instruction-counter').textContent = '0' + (instructionStep + 1) + ' / 03';
    document.querySelector('#instruction-title').textContent = instructionSteps[instructionStep][0];
    document.querySelector('#instruction-text').textContent = instructionSteps[instructionStep][1];
    document.querySelector('#instruction-next').textContent = instructionStep === 2 ? 'Повторить →' : 'Следующий шаг →';
  };
  document.querySelector('#instruction-next').addEventListener('click', () => { instructionStep = (instructionStep + 1) % 3; showInstruction(); });
  document.querySelector('#instruction-reset').addEventListener('click', () => { instructionStep = 0; showInstruction(); });
  const quizButtons = [...document.querySelectorAll('[data-quiz]')];
  quizButtons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      quizButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('#quiz-answer').textContent = button.dataset.quiz === 'verify'
        ? 'Да. Успешный запуск операции ещё не подтверждает достоверность результата.'
        : 'Одного запуска недостаточно. Сначала проверьте результат и устраните замечания.';
    });
  });

})();
