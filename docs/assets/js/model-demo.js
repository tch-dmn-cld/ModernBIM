(() => {
  'use strict';
  const model = document.querySelector('.model');
  const detail = document.getElementById('model-detail');
  const expand = document.getElementById('model-expand');
  const description = document.getElementById('mep-focus-description');
  const buttons = [...document.querySelectorAll('[data-system-focus]')].filter(el=>el.tagName==='BUTTON');
  const summaries = {
    all:'Разделы увязаны в общей системе координат.',
    vent:'П1: забор и подготовка воздуха, подача в помещения. В1: удаление воздуха по отдельной сети.',
    water:'Ввод, водомерный узел, разводка до приборов, водоразбор и отвод стоков в К1.',
    heat:'ИТП на техническом этаже: теплообменники, циркуляция, подача и обратная линия к потребителям.'
  };
  function focus(system) {
    if (!Object.hasOwn(summaries,system)) return;
    model.dataset.systemFocus=system; detail.dataset.systemFocus=system;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.systemFocus===system)));
    description.textContent=summaries[system];
  }
  buttons.forEach(button=>button.addEventListener('click',()=>focus(button.dataset.systemFocus)));
  expand.addEventListener('click',()=>{
    const target=detail.querySelector('.detail-model');
    if (!target.firstChild) {
      const svg=model.querySelector('.building').cloneNode(true);
      const ids=new Map([...svg.querySelectorAll('[id]')].map(el=>[el.id,'detail-'+el.id]));
      for (const el of [svg,...svg.querySelectorAll('*')]) for (const attr of [...el.attributes]) {
        let value=attr.value;
        if (attr.name==='id') value=ids.get(value)||value;
        else if (attr.name==='aria-labelledby') value=value.split(' ').map(id=>ids.get(id)||id).join(' ');
        else if (value.startsWith('#')&&ids.has(value.slice(1))) value='#'+ids.get(value.slice(1));
        else value=value.replace(/url\(#([^)]+)\)/g,(match,id)=>ids.has(id)?'url(#'+ids.get(id)+')':match);
        if (value!==attr.value) el.setAttribute(attr.name,value);
      }
      target.appendChild(svg);
    }
    detail.showModal();
  });
  document.getElementById('model-detail-close').addEventListener('click',()=>detail.close());
  detail.addEventListener('close',()=>expand.focus());
  focus('all');
})();
