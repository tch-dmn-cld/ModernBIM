(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const principles = {
    guidance: {
      kicker: 'ЧЕЛОВЕК УПРАВЛЯЕТ ПРОЦЕССОМ',
      title: 'Выбор остаётся за человеком.',
      description: 'В задачах с участием проектировщика инструмент помогает моделировать и настраивать параметры. Подходящие варианты заметны сразу, а рекомендация имеет понятное объяснение.',
      human: 'Моделирует, настраивает параметры, выбирает стратегию и проверяет результат.',
      system: 'Сокращает ручные операции, подсказывает варианты и объясняет ограничения.',
      choices: ['Подходящий элемент', 'Элемент с ограничением'],
      feedback: ['Вариант подходит: исходные данные согласованы. Решение о выборе принимает пользователь.', 'Для этого элемента не хватает согласованных данных. Подсказка объясняет ограничение и помогает выбрать подходящий вариант.'],
      view: 'Подсказки в контексте',
      note: 'Выбор на схеме связан с пояснением. Причина рекомендации видна рядом с элементом.'
    },
    validation: {
      kicker: 'ПРЕДУПРЕЖДАТЬ ОШИБКИ',
      title: 'Сначала проверить условия.',
      description: 'Инструмент проверяет исходные данные до изменения модели. Если есть противоречие, показывает причину и проблемный элемент, чтобы пользователь мог принять обоснованное решение.',
      human: 'Разбирается в замечании, уточняет данные или исправляет модель.',
      system: 'Выявляет ограничение, не допускает ошибочное изменение и проверяет исправления.',
      choices: ['Условия согласованы', 'Есть противоречие'],
      feedback: ['Проверка пройдена: условия согласованы. Пользователь видит, на чём основан вывод инструмента.', 'Обнаружены несогласованные параметры. Изменение этого элемента блокируется; причина и место замечания остаются видимыми.'],
      view: 'Замечание связано с элементом',
      note: 'Подсветка связывает замечание с моделью. Исправление требует повторной проверки, а не простого скрытия сообщения.'
    },
    context: {
      kicker: 'РАБОТА БЕЗ ПОТЕРИ КОНТЕКСТА',
      title: 'Модель остаётся перед глазами.',
      description: 'Пользователь продолжает работать с моделью: выбирает элементы, меняет вид и оценивает результат. Инструмент связывает подсказки и замечания с тем, что видно на активном виде.',
      human: 'Выбирает элементы на виде и сопоставляет результат с окружением в модели.',
      system: 'Помогает находить проблемные элементы и показывает обратную связь в контексте модели.',
      choices: ['Выбор на виде', 'Замечание на виде'],
      feedback: ['Элемент выбран на активном виде. Его положение и окружение помогают принять решение.', 'Замечание связано с подсвеченным элементом. Пользователь может оценить окружение, уточнить параметры и исправить модель.'],
      view: 'Модель доступна для работы',
      note: 'Выбор и замечание связаны с элементами на виде. Пользователь может работать с моделью, сохраняя контекст задачи.'
    }
  };
  const tabs = [...document.querySelectorAll('button[data-practice]')];
  const choices = [...document.querySelectorAll('[data-practice-choice]')];
  let mode = 'guidance', choice = 'good';
  function render() {
    const data = principles[mode], bad = choice === 'bad';
    tabs.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.practice === mode)));
    choices.forEach((button,index) => {
      button.textContent = data.choices[index];
      button.setAttribute('aria-pressed', String(button.dataset.practiceChoice === choice));
    });
    ['kicker','title','description','human','system'].forEach(key => { $('practice-'+key).textContent = data[key]; });
    $('practice-feedback').textContent = data.feedback[bad ? 1 : 0];
    $('practice-feedback').dataset.tone = bad ? 'warning' : 'good';
    $('practice-view-status').textContent = data.view;
    $('practice-scene-note').textContent = data.note;
    const scene = $('practice-scene');
    scene.dataset.practice = mode; scene.dataset.selection = choice;
    scene.querySelectorAll('[data-scene-node]').forEach(node => {
      const selected = node.dataset.sceneNode === (bad ? 'blocked' : 'target');
      node.setAttribute('aria-pressed', String(selected));
    });
  }
  tabs.forEach((button,index) => {
    button.addEventListener('click', () => { mode = button.dataset.practice; choice = 'good'; render(); });
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index+1)%tabs.length;
      else if (event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length-1;
      else return;
      event.preventDefault(); tabs[next].focus(); tabs[next].click();
    });
  });
  choices.forEach(button => button.addEventListener('click', () => { choice = button.dataset.practiceChoice; render(); }));
  document.querySelectorAll('[data-scene-node]').forEach(node => {
    const select = () => {
      choice = node.dataset.sceneNode === 'target' ? 'good' : 'bad';
      render();
    };
    node.addEventListener('click',select);
    node.addEventListener('keydown',event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
  });
  render();
})();
