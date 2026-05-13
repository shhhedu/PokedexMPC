import { TYPE_COLORS, TYPE_COLORS_LIGHT, TYPE_BACKGROUNDS, OVERLAY_COLORS } from './config.js';
import { state } from './state.js';
import { pokemonList, seenCountEl, savedCountEl, saveBtn, typeBgImage, typeBgOverlay, typeFilterSelect } from './dom.js';
import { capitalize } from './utils.js';

export function renderList(list, onSelect){
    pokemonList.innerHTML='';
    list.forEach((p, index) =>{
        const div=document.createElement('div');
        div.className='poke-list-item';
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
            <span class="poke-list-number">${String(p.id).padStart(3,'0')}</span>
            <span class="poke-list-name">${capitalize(p.name)}</span>
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
        const n=parseInt(el.querySelector('.poke-list-number').textContent);
        const isSelected = n===state.currentPokemonId;
        el.classList.toggle('selected', isSelected);
        if(isSelected) state.listNavIndex = i;
    });
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
    const url=TYPE_BACKGROUNDS[type]||TYPE_BACKGROUNDS.normal;
    typeBgImage.style.backgroundImage=`url('${url}')`;
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