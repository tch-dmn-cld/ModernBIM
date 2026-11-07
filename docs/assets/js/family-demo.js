(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const format = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);
  const number = (id, fallback, min, max) => {
    const value = $(id).value.trim();
    const parsed = value === '' ? fallback : Number(value);
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
  };
  const xml = (text) => String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const types = {
    window: [
      {id:'window-single',name:'Одностворчатое окно',leaves:1,w:900,h:1400,min:600,max:1400,sizes:['800x1200','900x1400','1000x1500','1200x1600']},
      {id:'window',name:'Двустворчатое окно',leaves:2,w:1500,h:1500,min:900,max:2400,sizes:['1200x1400','1500x1500','1800x1600','2100x1800']},
      {id:'window-triple',name:'Трёхстворчатое окно',leaves:3,w:2100,h:1500,min:1500,max:3000,sizes:['1800x1400','2100x1500','2400x1600','2700x1800']},
      {id:'window-lower-transom',name:'Две створки + нижняя глухая фрамуга',leaves:2,transom:'bottom',w:1500,h:1800,min:1000,max:2400,sizes:['1200x1600','1500x1800','1800x1800','2100x2100']}
    ],
    door: [
      {id:'metal-single',name:'Металлическая наружная · однопольная',leaves:1,w:1000,h:2100},
      {id:'metal-double',name:'Металлическая наружная · двупольная',leaves:2,w:1800,h:2100},
      {id:'fire-single',name:'Противопожарная металлическая наружная · однопольная',leaves:1,w:1000,h:2100},
      {id:'fire-double',name:'Противопожарная металлическая наружная · двупольная',leaves:2,w:1800,h:2300}
    ],
    drain: [{id:'external-drain',name:'Наружный водосток с кровли',w:1200,h:2100}]
  };
  let kind = 'window';
  const type = () => types[kind].find((t) => t.id === $('product-type').value) || types[kind][0];
  const appendOption = (select, text, value) => { const option = new Option(text, value); select.add(option); };
  const windowFields = (t) => t.leaves === 1 ? ['window-left']
    : t.leaves === 3 ? ['window-left','window-middle','window-right'] : ['window-left','window-right'];
  function configureWindow(t) {
    const lower = kind === 'window' && t.transom === 'bottom';
    $('upper-transom-field').hidden = lower;
    $('transom-height-label').textContent = lower ? 'Высота нижней фрамуги, мм' : 'Высота фрамуги, мм';
    $('window-left-label').textContent = t.leaves === 1 ? 'Створка' : 'Левая створка';
    $('window-right-field').hidden = kind !== 'window' || t.leaves === 1;
    $('window-middle-field').hidden = kind !== 'window' || t.leaves !== 3;
    ['window-left','window-right'].forEach((id) => {
      const fixed = [...$(id).options].find((option) => option.value === 'fixed');
      fixed.hidden = lower; fixed.disabled = lower;
      if (lower && $(id).value === 'fixed') $(id).value = id === 'window-left' ? 'swing' : 'both';
    });
  }
  function sizes() {
    const t = type();
    const values = kind === 'window' ? t.sizes
      : t.leaves === 2 ? ['1200x2100','1500x2100','1800x2100','1800x2300','2100x2300']
      : ['800x2000','900x2100','1000x2100','1100x2300'];
    const select = $('family-size'); select.replaceChildren();
    values.forEach((size) => appendOption(select, size.replace('x',' × '), size));
    appendOption(select, 'Свой типоразмер', 'custom');
    const size = t.w + 'x' + t.h;
    select.value = values.includes(size) ? size : 'custom';
    $('family-width').min = String(kind === 'window' ? t.min : t.leaves === 2 ? 1200 : 700);
    $('family-width').max = String(kind === 'window' ? t.max : t.leaves === 2 ? 2400 : 1200);
    $('family-height').min = String(kind === 'window' ? t.transom === 'bottom' ? 1200 : 1000 : 1800);
    $('family-height').max = String(kind === 'window' ? 2400 : 3000);
    $('family-width').value = String(t.w); $('family-height').value = String(t.h);
    configureWindow(t);
  }
  function selectProduct(next) {
    if (!Object.hasOwn(types,next)) return;
    kind = next;
    document.querySelectorAll('[data-product]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.product === kind)));
    const select = $('product-type'); select.replaceChildren();
    types[kind].forEach((t) => appendOption(select,t.name,t.id));
    if (kind === 'window') select.value = 'window';
    $('opening-geometry').hidden = kind === 'drain';
    $('size-field').hidden = kind === 'drain';
    $('window-options').hidden = kind !== 'window';
    $('door-options').hidden = kind !== 'door';
    $('drain-options').hidden = kind !== 'drain';
    $('family-count').value = '1';
    sizes(); update();
  }
  const path = (d,cls='product-line') => '<path d="' + d + '" class="' + cls + '"/>';
  const rect = (x,y,w,h,cls='product-frame') => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + cls + '"/>';
  const text = (x,y,value,cls='product-label',extra='') => '<text x="' + x + '" y="' + y + '" class="' + cls + '" ' + extra + '>' + xml(value) + '</text>';
  const opening = (x,y,w,h,mode,hingeLeft) => {
    let result = '';
    if (mode === 'swing' || mode === 'both') {
      const hinge = hingeLeft ? x : x + w, tip = hingeLeft ? x + w : x;
      result += path('M' + hinge + ' ' + y + 'L' + tip + ' ' + (y+h/2) + 'L' + hinge + ' ' + (y+h),'opening-mark');
    }
    if (mode === 'tilt' || mode === 'both') result += path('M'+x+' '+(y+h)+'L'+(x+w/2)+' '+y+'L'+(x+w)+' '+(y+h),'opening-mark');
    return result;
  };
  function openingDrawing(w,h,transom,transomHeight) {
    const t = type(), s = Math.min(335 / w, 246 / h), W = w*s, H = h*s;
    const x = (520-W)/2, y = 48 + (246-H)/2;
    const lower = kind === 'window' && t.transom === 'bottom';
    const top = transom && !lower ? transomHeight*s : 0, bottom = lower ? transomHeight*s : 0;
    const leafY=y+top+7, leafH=H-top-bottom-14;
    let svg = '<title>Условная схема '+xml(t.name)+'</title>';
    if ($('family-reveals').checked) svg += rect(x-13,y-13,W+26,H+13,'product-reveal');
    svg += rect(x,y,W,H) + rect(x+5,y+5,W-10,H-10,'product-line');
    if (transom) {
      const height = top + bottom, transomY = lower ? y+H-bottom : y;
      svg += '<g class="product-transom" data-position="'+(lower?'bottom':'top')+'">'
        + rect(x+7,transomY+(lower?3:7),W-14,height-10,'product-glass')
        + path('M'+x+' '+(lower?transomY:y+top)+'h'+W)
        + text(x+W/2,transomY+height/2+3,'ГЛУХАЯ ФРАМУГА','product-small') + '</g>';
    }
    if (kind === 'window') {
      const fields=windowFields(t), leafW=(W-14-7*(fields.length-1))/fields.length;
      fields.forEach((id,index) => {
        const lx=x+7+index*(leafW+7), mode=$(id).value, hingeLeft=index===0;
        svg += '<g class="window-leaf" data-opening="'+mode+'">' + rect(lx,leafY,leafW,leafH,'product-glass');
        svg += opening(lx+3,leafY+3,leafW-6,leafH-6,mode,hingeLeft);
        if (mode!=='fixed') {
          const handleX=hingeLeft?lx+leafW-7:lx+7;
          svg += path('M'+handleX+' '+(leafY+leafH/2-5)+'v10','product-hardware');
        }
        svg += '</g>';
      });
      if ($('window-sill').checked) svg += rect(x-18,y+H+3,W+36,7,'product-accessory');
      if ($('window-drip').checked) svg += path('M'+(x-10)+' '+(y+H+16)+'h'+(W+20),'product-drip');
    } else {
      const left=$('door-opening').value==='left', count=t.leaves;
      const available=W-14;
      const leftW=count===1?available:available*(left?.6:.4)-3;
      const leafWidths=count===1?[available]:[leftW,available-leftW-6];
      let lx=x+7;
      leafWidths.forEach((lw,index) => {
        const active=count===1||index===(left?0:1), hingeLeft=count===1?left:index===0;
        svg += rect(lx,leafY,lw,leafH,active?'product-active':'product-frame');
        svg += opening(lx+3,leafY+3,lw-6,leafH-6,'swing',hingeLeft);
        if (active) {
          const hx=hingeLeft?lx+lw-10:lx+10, hy=leafY+leafH*.52;
          if ($('door-handle').value==='panic') svg += path('M'+(lx+10)+' '+hy+'h'+Math.max(1,lw-20),'product-hardware');
          else if ($('door-handle').value==='pull') svg += rect(hx-2,hy-12,4,24,'product-hardware');
          else svg += path('M'+hx+' '+(hy-5)+'v10m-1-4h'+(hingeLeft?-12:12),'product-hardware');
        }
        for(let indexH=0;indexH<3;indexH++) svg += rect(hingeLeft?lx-2:lx+lw-1,leafY+leafH*(.15+indexH*.35),3,7,'product-hardware');
        if ($('door-closer').checked) svg += rect(lx+lw*.3,leafY+7,lw*.4,5,'product-hardware');
        lx+=lw+6;
      });
    }
    const dimY=27;
    svg += path('M'+x+' '+dimY+'h'+W+'M'+x+' '+(dimY-4)+'v8M'+(x+W)+' '+(dimY-4)+'v8','product-dimension');
    svg += text(x+W/2,dimY-7,format(w)+' мм','product-label');
    svg += text(x-26,y+H/2,format(h)+' мм','product-label','transform="rotate(-90 '+(x-26)+' '+(y+H/2)+')"');
    const windowNote = lower ? 'ДВЕ СТВОРКИ СВЕРХУ · ГЛУХАЯ ФРАМУГА СНИЗУ'
      : (t.leaves===1?'ОДНА СТВОРКА':t.leaves===3?'ТРИ СЕКЦИИ':'ДВЕ СТВОРКИ')+' · ВИД ИЗ ПОМЕЩЕНИЯ';
    svg += text(260,344,kind==='door'?($('door-opening').value==='right'?'ПРАВОЕ ОТКРЫВАНИЕ':'ЛЕВОЕ ОТКРЫВАНИЕ'):windowNote,'product-small');
    return svg;
  }
  function drainDrawing(length,height,outlets,diameter) {
    let svg='<title>Условная наружная водосточная система</title>';
    svg+=path('M65 129 255 41 455 129M85 130v176h350V130','product-roof');
    svg+=path('M60 133H460','gutter-line');
    for(let index=0;index<outlets;index++){
      const x=outlets===1?360:100+index*320/(outlets-1);
      svg+=path('M'+(x-9)+' 133l4 14h10l4-14','product-line');
      svg+=path('M'+x+' 148v11l14 13v125l12 8','pipe-line');
      svg+=path('M'+(x+7)+' 198h14m-14 64h14','product-hardware');
    }
    svg+=text(260,22,'КАРНИЗ '+format(length)+' м','product-label');
    svg+=text(48,230,format(height)+' м','product-label','transform="rotate(-90 48 230)"');
    svg+=text(260,340,'СТОЯКИ '+outlets+' · ТРУБА Ø'+diameter+' мм','product-small');
    return svg;
  }
  function addRows(rows) {
    const body=$('family-bom'); body.replaceChildren();
    rows.forEach(([name,value,unit])=>{
      const tr=document.createElement('tr');
      const nameCell=document.createElement('td'), valueCell=document.createElement('td');
      nameCell.textContent=name; valueCell.textContent=format(value)+' '+unit;
      tr.append(nameCell,valueCell);body.appendChild(tr);
    });
  }
  function update() {
    const count=Math.round(number('family-count',1,1,20)), t=type();
    const width=number('family-width',t.w,+$('family-width').min,+$('family-width').max);
    const height=number('family-height',t.h,+$('family-height').min,+$('family-height').max);
    const depth=number('reveal-depth',200,50,600)/1000;
    const lower = kind === 'window' && t.transom === 'bottom';
    const transom=lower || $('family-transom').checked;
    const maxTransomHeight=Math.min(600,Math.floor(height*.35/50)*50);
    const transomHeight=Math.min(maxTransomHeight,number('transom-height',400,200,600));
    $('transom-height').max=String(maxTransomHeight);
    if (document.activeElement !== $('transom-height')) $('transom-height').value=String(transomHeight);
    const rows=[];let volume=width*height*count/1000000,unit='м²',source=t.name;
    $('transom-height-field').hidden=!transom;
    $('width-value').textContent=format(width)+' мм';$('height-value').textContent=format(height)+' мм';
    $('product-caption').textContent=t.name.toUpperCase();
    $('product-diagram').setAttribute('aria-label','Условная схема: '+t.name);
    if(kind==='drain'){
      const length=number('drain-length',12,3,30), pipeHeight=number('drain-height',6,2,18);
      const outlets=Math.round(number('drain-outlets',2,1,4)), diameter=$('drain-diameter').value;
      volume=pipeHeight*outlets*count;unit='м';source='Водосток Ø'+diameter;
      rows.push(['Желоб',length*count,'м'],['Секции желоба по 3 м',Math.ceil(length/3)*count,'шт.'],['Воронки',outlets*count,'шт.'],['Трубы',volume,'м'],['Секции труб по 3 м',Math.ceil(pipeHeight/3)*outlets*count,'шт.'],['Колена и отводы',3*outlets*count,'шт.'],['Кронштейны желоба',(Math.ceil(length/.6)+1)*count,'шт.'],['Хомуты трубы',(Math.ceil(pipeHeight/2)+1)*outlets*count,'шт.']);
      $('product-diagram').innerHTML=drainDrawing(length,pipeHeight,outlets,diameter);
      $('product-view-note').textContent='Условный наружный водосток: карниз, воронки, стояки и отводы. В расчёт стоимости передана только длина труб.';
      $('family-measure-label').textContent='ДЛИНА ТРУБ';
      $('estimate-formula').textContent='Высота стояка × число стояков × количество комплектов';
    }else{
      const operable=kind==='window'?windowFields(t).filter(id=>$(id).value!=='fixed').length:0;
      rows.push([kind==='window'?'Оконный блок':'Дверной блок',count,'шт.'],['Площадь проёмов',volume,'м²']);
      rows.push(['Рама',count,'шт.']);
      if(kind==='window') {
        rows.push(['Открывающиеся створки',operable*count,'шт.']);
        if(t.leaves>operable)rows.push(['Глухие секции',(t.leaves-operable)*count,'шт.']);
      } else rows.push(['Полотна',t.leaves*count,'шт.']);
      if(transom)rows.push([lower?'Нижняя глухая фрамуга':'Верхняя глухая фрамуга',count,'шт.']);
      if(kind==='window'){
        rows.push(['Оконные ручки',operable*count,'шт.'],['Петли (по 2 на подвижную створку)',2*operable*count,'шт.']);
        if($('window-sill').checked)rows.push(['Подоконник',width*count/1000,'м']);
        if($('window-drip').checked)rows.push(['Отлив',width*count/1000,'м']);
      }else{
        const handles={lever:'Нажимная пара',pull:'Ручка-скоба',panic:'Комплект «Антипаника»'};
        rows.push([handles[$('door-handle').value]||handles.lever,count,'компл.'],['Петли (по 3 на полотно)',3*t.leaves*count,'шт.'],['Замок',count,'шт.']);
        if(t.leaves===2)rows.push(['Торцевые шпингалеты',2*count,'шт.']);
        if($('door-closer').checked)rows.push(['Доводчики',t.leaves*count,'шт.']);
      }
      if($('family-reveals').checked)rows.push(['Боковые откосы',2*height/1000*depth*count,'м²'],['Верхний откос',width/1000*depth*count,'м²']);
      $('product-diagram').innerHTML=openingDrawing(width,height,transom,transomHeight);
      $('product-view-note').textContent='Вид из помещения. '+(lower?'Две открывающиеся створки сверху, глухая фрамуга снизу. ':'')+'На схеме один экземпляр; спецификация учитывает все комплекты.' + (kind==='window' && $('window-drip').checked ? ' Отлив показан синим пунктиром.' : '');
      $('family-measure-label').textContent='ПЛОЩАДЬ ПРОЁМОВ';
      $('estimate-formula').textContent='Ширина × высота × количество';
    }
    addRows(rows);
    $('family-total').textContent=count+' шт.';$('family-area').textContent=format(volume)+' '+unit;
    const rate=number('unit-rate',4500,0,1000000);
    $('estimate-type').textContent=source;$('estimate-count').textContent=count+' шт.';$('estimate-area').textContent=format(volume)+' '+unit;
    $('estimate-cost').textContent=format(volume*rate)+' ₽';$('estimate-equation').textContent=format(volume)+' '+unit+' × '+format(rate)+' ₽/'+unit;
    $('unit-rate-label').textContent='Условная расценка, ₽/'+unit;
  }
  document.querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>selectProduct(button.dataset.product)));
  $('product-type').addEventListener('change',()=>{sizes();update();});
  $('family-size').addEventListener('change',()=>{
    if($('family-size').value!=='custom'){
      const [w,h]=$('family-size').value.split('x').map(Number);
      $('family-width').value=String(w);$('family-height').value=String(h);
    }update();
  });
  ['family-width','family-height'].forEach(id=>$(id).addEventListener('input',()=>{$('family-size').value='custom';update();}));
  ['family-transom','transom-height','reveal-depth','family-reveals','window-left','window-middle','window-right','window-sill','window-drip','door-opening','door-handle','door-closer','drain-length','drain-height','drain-outlets','drain-diameter','family-count','unit-rate'].forEach(id=>$(id).addEventListener('input',update));
  const bounds={'transom-height':[400,200,600],'reveal-depth':[200,50,600],'drain-length':[12,3,30],'drain-height':[6,2,18],'drain-outlets':[2,1,4],'family-count':[1,1,20],'unit-rate':[4500,0,1000000]};
  Object.entries(bounds).forEach(([id,[fallback,min,max]])=>$(id).addEventListener('change',()=>{
    let value=number(id,fallback,min,id==='transom-height'?+$('transom-height').max:max);if(id==='transom-height')value=Math.min(+$('transom-height').max,value);if(['family-count','drain-outlets'].includes(id))value=Math.round(value);
    $(id).value=String(value);update();
  }));
  selectProduct('window');
})();
