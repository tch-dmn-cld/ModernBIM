(() => {
  'use strict';
  const $=(id)=>document.getElementById(id);
  const initial=()=>[
    {id:'23041',reason:'Не заполнен обязательный параметр элемента.',fix:'Параметр заполнен по выбранному типу.',state:'open'},
    {id:'23042',reason:'Обнаружен дублирующий профиль.',fix:'Дублирующий профиль удалён в демонстрации.',state:'open'}
  ];
  let issues=initial(), checked=false, selected=null, isolated=false;
  const status=(text,kind='neutral')=>{ $('plugin-status').textContent=text;$('plugin-status').dataset.status=kind; };
  function render(){
    const container=$('plugin-issues');container.replaceChildren();
    if(!checked){
      const p=document.createElement('p');p.className='screen-footnote';p.textContent='Запустите проверку, чтобы получить список замечаний.';container.appendChild(p);
    }else issues.forEach(issue=>{
      const button=document.createElement('button');button.type='button';button.className='diagnostic-item';
      button.setAttribute('aria-pressed',String(selected===issue.id));
      button.dataset.state=issue.state;
      const code=document.createElement('strong');code.textContent='ID '+issue.id;
      const reason=document.createElement('span');reason.textContent=issue.reason;
      const badge=document.createElement('small');badge.textContent={open:'Требует исправления',pending:'Исправлено · требуется проверка',verified:'Проверено'}[issue.state];
      button.append(code,reason,badge);button.addEventListener('click',()=>select(issue.id));container.appendChild(button);
    });
    const issue=issues.find(x=>x.id===selected);
    $('plugin-issue-count').textContent=checked?String(issues.filter(x=>x.state!=='verified').length):'—';
    $('plugin-selected').textContent=selected?'ID '+selected:'Нет выбора';
    ['plugin-show','plugin-copy'].forEach(id=>{$(id).disabled=!selected;});
    $('plugin-fix').disabled=!checked||!issue||issue.state!=='open';
    document.querySelectorAll('[data-model-element]').forEach(element=>{
      element.setAttribute('aria-pressed',String(element.dataset.modelElement===selected));
      element.classList.toggle('is-isolated-out',isolated&&element.dataset.modelElement!==selected);
    });
    $('plugin-isolate').disabled=!selected;
    $('plugin-isolate').setAttribute('aria-pressed',String(isolated));
  }
  function select(id){
    if(!issues.some(x=>x.id===id))return;
    selected=id;render();
    $('plugin-action-note').textContent='Выбран элемент '+id+'. Можно показать его в 3D, скопировать ID или исправить замечание.';
  }
  function resetResults(){
    issues=initial();checked=false;selected=null;isolated=false;
    $('plugin-action-note').textContent='';$('plugin-copy-fallback').hidden=true;
    document.querySelector('.plugin-scene').classList.remove('view-selected');render();
  }
  function familyHint(){
    const value=$('plugin-family').value;
    $('plugin-family-hint').textContent=value==='point'?'Точечное семейство не задаёт длину стыка. Выберите линейный тип для этого сценария.':value==='line'?'Выбран линейный тип: он подходит для размещения вдоль протяжённого стыка.':'Для протяжённого стыка подходит линейное семейство: его длина задаётся линией размещения.';
    $('plugin-family').classList.toggle('needs-choice',value!=='line');
  }
  $('plugin-recommend').addEventListener('click',()=>{
    $('plugin-family').value='line';resetResults();familyHint();status('Рекомендованный вариант выбран. Можно проверить модель.');
  });
  $('plugin-family').addEventListener('change',()=>{
    resetResults();familyHint();status('Настройки изменены. Запустите проверку заново.');
  });
  $('plugin-check').addEventListener('click',()=>{
    if($('plugin-family').value!=='line'){
      familyHint();status('Для этого сценария выберите линейное семейство. Подсказка объясняет рекомендуемый вариант.','warning');
      $('plugin-family').focus();return;
    }
    checked=true;
    issues.forEach(issue=>{if(issue.state==='pending')issue.state='verified';});
    const remaining=issues.filter(x=>x.state!=='verified').length;
    status(remaining?'Проверка завершена. Замечаний: '+remaining+'. Выберите строку, чтобы перейти к элементу.':'Повторная проверка завершена: замечаний нет. Результат подтверждён в демонстрации.',remaining?'warning':'success');
    render();
  });
  $('plugin-fix').addEventListener('click',()=>{
    const issue=issues.find(x=>x.id===selected);
    if(!checked||!issue||issue.state!=='open')return;
    issue.state='pending';$('plugin-action-note').textContent=issue.fix+' Теперь повторите проверку.';
    status('Изменение внесено в демонстрацию. Повторная проверка ещё не выполнена.','warning');render();
  });
  $('plugin-show').addEventListener('click',()=>{
    if(!selected)return;
    document.querySelector('.plugin-scene').classList.add('view-selected');
    $('plugin-action-note').textContent='На 3D-схеме подсвечен элемент '+selected+'.';
  });
  $('plugin-isolate').addEventListener('click',()=>{
    if(!selected)return;isolated=!isolated;render();
    $('plugin-action-note').textContent=isolated?'Показан только выбранный элемент '+selected+'.':'Показаны все элементы демонстрационной модели.';
  });
  $('plugin-copy').addEventListener('click',async()=>{
    if(!selected)return;const id=selected;
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(id);
      $('plugin-action-note').textContent='ID '+id+' скопирован.';$('plugin-copy-fallback').hidden=true;
    }catch{
      const field=$('plugin-copy-fallback');field.value=id;field.hidden=false;field.focus();field.select();
      $('plugin-action-note').textContent='ID выделен в поле. Нажмите Ctrl+C или используйте системное копирование.';
    }
  });
  $('plugin-reset').addEventListener('click',()=>{
    $('plugin-family').value='';resetResults();familyHint();status('Выберите семейство и запустите проверку.');
  });
  document.querySelectorAll('[data-model-element]').forEach(element=>{
    element.addEventListener('click',()=>select(element.dataset.modelElement));
    element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(element.dataset.modelElement);}});
  });
  resetResults();familyHint();
})();
