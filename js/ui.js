import { TYPE_COLORS, TYPE_COLORS_LIGHT, TYPE_BACKGROUNDS, OVERLAY_COLORS } from './config.js';
import { state } from './state.js';
import { pokemonList, seenCountEl, savedCountEl, saveBtn, typeBgImage, typeBgOverlay, typeFilterSelect } from './dom.js';
import { capitalize, formatPokemonName, formatPokemonNumber } from './utils.js';

let backgroundRequestId=0;

export function renderList(list, onSelect){
    pokemonList.innerHTML='';
    list.forEach((p, index) =>{
        const div=document.createElement('div');
        div.className='poke-list-item';
        div.dataset.pokemonId=p.id;
        if(p.id===state.currentPokemonId)div.classList.add('selected');
        const isFav=state.favorites.includes(p.id);

        const types = state.pokemonTypeMap[p.id];
        const primaryType = types ? types[0] : null;
        const typeColor = primaryType ? (TYPE_COLORS[primaryType] || '#a8a878') : '#a8a878';

        let typeDotsHTML = '';
        if(types){
            typeDotsHTML = '<span class="poke-list-type-dots">';
            types.forEach(t => {
                const c = TYPE_COLORS[t] || '#a8a878';
                typeDotsHTML += `<span class="poke-list-type-dot" style="background:${c}" title="${capitalize(t)}"></span>`;
            });
            typeDotsHTML += '</span>';
        }

        div.innerHTML=`
            <div class="poke-list-pokeball" style="background: radial-gradient(circle at 50% 50%, #fff 25%, ${typeColor} 25% 48%, #333 48% 52%, #fff 52%);"></div>
            <span class="poke-list-number">${formatPokemonNumber(p.id)}</span>
            <span class="poke-list-name">${formatPokemonName(p.name)}</span>
            ${typeDotsHTML}
            ${isFav?'<span class="poke-list-fav">★</span>':''}
        `;

        if(primaryType) div.style.borderLeft = `3px solid ${typeColor}`;

        div.addEventListener('click',()=>{
            state.listNavIndex = index;
            onSelect(p.id);
        });
        pokemonList.appendChild(div);
    });
}

export function highlightSelected(){
    document.querySelectorAll('.poke-list-item').forEach((el, i) =>{
        const n=Number(el.dataset.pokemonId);
        const isSelected = n===state.currentPokemonId;
        el.classList.toggle('selected', isSelected);
        if(isSelected) state.listNavIndex = i;
    });
}

export function updateListItemTypes(id){
    const item=pokemonList.querySelector(`[data-pokemon-id="${id}"]`);
    const types=state.pokemonTypeMap[id];
    if(!item||!types?.length)return;

    item.style.borderLeftColor=TYPE_COLORS[types[0]]||'#a8a878';
    let dots=item.querySelector('.poke-list-type-dots');
    if(!dots){
        dots=document.createElement('span');
        dots.className='poke-list-type-dots';
        const favorite=item.querySelector('.poke-list-fav');
        item.insertBefore(dots,favorite||null);
    }
    dots.innerHTML='';
    types.forEach(type=>{
        const dot=document.createElement('span');
        dot.className='poke-list-type-dot';
        dot.style.background=TYPE_COLORS[type]||'#a8a878';
        dot.title=capitalize(type);
        dots.appendChild(dot);
    });
}

export function renderListMessage(message){
    pokemonList.innerHTML='';
    const status=document.createElement('p');
    status.className='pokemon-list-status';
    status.textContent=message;
    pokemonList.appendChild(status);
}

export function updateCounters(){
    seenCountEl.textContent=state.seenSet.size;
    savedCountEl.textContent=state.favorites.length
}

export function updateSaveBtn(){
    const f=state.favorites.includes(state.currentPokemonId);
    saveBtn.textContent=f?'★ Salvo!':'☆ Salvar Favorito';
    saveBtn.classList.toggle('saved',f);
}

export function updateTypeBackground(type){
    const requestId=++backgroundRequestId;
    const fallback=TYPE_BACKGROUNDS.fire;
    const url=TYPE_BACKGROUNDS[type]||fallback;
    typeBgImage.style.backgroundImage=`url('${fallback}')`;

    const image=new Image();
    image.onload=()=>{
        if(requestId===backgroundRequestId)
            typeBgImage.style.backgroundImage=`url('${url}')`;
    };
    image.onerror=()=>{
        if(requestId===backgroundRequestId)
            typeBgImage.style.backgroundImage=`url('${fallback}')`;
    };
    image.src=url;
    typeBgOverlay.style.background=OVERLAY_COLORS[type]||OVERLAY_COLORS.normal;
}

export function updateTypeFilterColor(){
    const val = typeFilterSelect.value;
    if(val && TYPE_COLORS_LIGHT[val]){
        typeFilterSelect.style.background = TYPE_COLORS_LIGHT[val];
        typeFilterSelect.style.color = '#333';
        typeFilterSelect.style.borderColor = TYPE_COLORS[val] || 'rgba(255,255,255,.2)';
    } else {
        typeFilterSelect.style.background = 'rgba(255,255,255,.92)';
        typeFilterSelect.style.color = '#333';
        typeFilterSelect.style.borderColor = 'rgba(255,255,255,.2)';
    }
}
