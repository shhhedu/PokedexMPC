import { state } from './state.js';
import * as dom from './dom.js';
import { fetchPokemon, loadBasicPokemonList } from './api.js';
import { loadEvolutions } from './evolutions.js';
import { renderList, highlightSelected, updateCounters, updateSaveBtn, updateTypeBackground, updateTypeFilterColor } from './ui.js';
import { initEvents } from './events.js';
import { initPokemonRain, stopRain } from './rain.js';
import { capitalize } from './utils.js';

async function simulateLoading() {
    return new Promise(resolve => {
        const z=['Z','Z z','Z z z','Z z z .','Z z z . .','Z z z . . .'];
        let p=0,fi=0;
        const zI=setInterval(()=>{
            dom.snorlaxStatus.textContent=z[fi];
            fi=(fi+1)%z.length},400);
        const lI=setInterval(()=>{
            p=Math.min(p+Math.random()*3+1,100);
            if(p>=100){clearInterval(lI);
                clearInterval(zI);resolve()
            }},80);
    });
}
function snorlaxWakeUp(){
    return new Promise(r=>{
        dom.snorlaxStatus.textContent='!';
        dom.snorlaxStatus.classList.add('awake');
        setTimeout(()=>dom.snorlaxContainer.classList.add('waking-up'),800);
        setTimeout(()=>dom.loadingScreen.classList.add('fade-out'),1400);
        setTimeout(()=>{dom.loadingScreen.style.display='none';
            r()
        },2400);
    });
}
function showTitleScreen(){
    return new Promise(r=>{
        dom.titleScreen.classList.remove('hidden');
        state.currentScreen='title';
        setTimeout(()=>dom.forestBg.classList.add('reveal'),100);
        setTimeout(r,1400)
    })
}
function dropLogo(){
    return new Promise(r=>{
        dom.logoContainer.classList.add('drop-in');
        setTimeout(r,1200)
    })
}
function showMenu(){
    dom.menuOptions.classList.remove('hidden');
    dom.menuOptions.classList.add('show');
    state.menuIndex=0;updateMenuSelection()
}
function updateMenuSelection(){
    document.querySelectorAll('#menu-options .menu-item')
        .forEach((el,i)=>el.classList.toggle('selected',i===state.menuIndex))
}

function goToPokedex(){
    state.currentScreen='transitioning';
    dom.titleScreen.classList.add('fade-out');
    setTimeout(()=>{
        dom.titleScreen.style.display='none';
        dom.pokedexScreen.classList.remove('hidden');
        dom.pokedexScreen.classList.add('screen-enter');
        state.currentScreen='pokedex';initPokedex()},800)
}
function openCredits(){
    state.currentScreen='credits';
    dom.creditsScreen.classList.remove('hidden');
    dom.creditsScreen.classList.remove('fade-out');
    initPokemonRain();
}
function closeCredits(){
    dom.creditsScreen.classList.add('fade-out');
    stopRain();
    setTimeout(()=>{
        dom.creditsScreen.classList.add('hidden');
        state.currentScreen='title'},500)
}
function backToMenu(){
    dom.pokedexScreen.classList.add('screen-exit');
    setTimeout(()=>{dom.pokedexScreen.classList.add('hidden');
        dom.pokedexScreen.classList.remove('screen-exit','screen-enter');
        dom.titleScreen.style.display='';
        dom.titleScreen.classList.remove('fade-out');
        state.currentScreen='title'},500)
}

async function initPokedex(){
    if(state.pokedexInitialized)return;
    state.pokedexInitialized=true;

    await loadBasicPokemonList();
    state.filteredList = [...state.allPokemonBasic];
    state.listNavIndex = 0;
    renderList(state.filteredList, selectPokemon);
    await selectPokemon(1);
    setupSearch(); setupTabs();
    setupTypeFilter();
    updateCounters();
    fetchAllPokemonTypes();
}

async function fetchAllPokemonTypes() {
    const batchSize = 20;
    for (let i = 0; i < state.allPokemonBasic.length; i += batchSize) {
        const batch = state.allPokemonBasic.slice(i, i + batchSize);
        await Promise.all(batch.map(async (p) => {
            if (state.pokemonTypeMap[p.id]) return;
            const data = await fetchPokemon(p.id);
            if (data) state.pokemonTypeMap[p.id] = data.types.map(t => t.type.name);
        }));
        renderList(state.filteredList, selectPokemon);
    }
}

async function selectPokemon(id){
    state.currentPokemonId=id;
    highlightSelected();
    state.seenSet.add(id);
    updateCounters();

    const pokemon=await fetchPokemon(id);
    if(!pokemon)return;

    state.pokemonTypeMap[id] = pokemon.types.map(t => t.type.name);

    dom.displayName.textContent=capitalize(pokemon.name);
    dom.displayNumber.textContent=`#${String(id).padStart(3,'0')}`;

    dom.spriteImg.style.opacity='0';
    const gif=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
    const fb=pokemon.sprites.other?.['official-artwork']?.front_default||pokemon.sprites.front_default||'';
    const t=new Image();
    t.onload=()=>{
        dom.spriteImg.src=gif;
        dom.spriteImg.style.opacity='1'};
    t.onerror=()=>{
        dom.spriteImg.src=fb;
        dom.spriteImg.style.opacity='1'
    };
    t.src=gif;

    dom.typesContainer.innerHTML='';
    pokemon.types.forEach(t=>{
        const b=document.createElement('span');
        b.className=`type-badge type-${t.type.name}`;
        b.textContent=t.type.name;dom.typesContainer.appendChild(b)});
    updateTypeBackground(pokemon.types[0].type.name);

    const sm={
        hp:'hp',
        attack:'atk',
        defense:'def',
        'special-attack':'spa',
        'special-defense':'spd',
        speed:'spe'
    };
    pokemon.stats.forEach(s=>{
        const k=sm[s.stat.name];
        if(!k)return;
        const bar=dom.$(`stat-${k}`),
            val=dom.$(`val-${k}`),
            pct=Math.min((s.base_stat/255)*100,100);
        bar.style.width=`${pct}%`;
        bar.style.background=pct>60?'#4caf50':pct>35?'#ff9800':'#f44336';
        val.textContent=s.base_stat
    });

    dom.pokemonWeight.textContent=`${
        (pokemon.weight/10).toFixed(1)
    } kg`;
    dom.pokemonHeight.textContent=`${
        (pokemon.height/10).toFixed(1)
    } m`;
    dom.pokemonAbility.textContent=pokemon.abilities.length>0?capitalize(pokemon.abilities[0].ability.name.replace(/-/g,' ')):'—';

    updateSaveBtn();
    await loadEvolutions(id, selectPokemon);
    renderList(state.filteredList, selectPokemon);
}

function setupSearch(){
    dom.searchInput.addEventListener('input',applyFilters)
}
function setupTabs(){
    document.querySelectorAll('#tabs .tab').forEach(tab=>{
        tab.addEventListener('click',()=>{
            document.querySelectorAll('#tabs .tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            state.currentTab=tab.dataset.tab;
            dom.searchInput.value='';
            applyFilters();
        });
    });
}
function setupTypeFilter(){
    updateTypeFilterColor();
    dom.typeFilterSelect.addEventListener('change',()=>{
        state.currentTypeFilter=dom.typeFilterSelect.value;
        updateTypeFilterColor();
        applyFilters();
    });
}

function applyFilters(){
    const q=dom.searchInput.value.trim().toLowerCase();
    let list=state.allPokemonBasic;

    if(state.currentTab==='favorites')
        list=list.filter(p=>state.favorites.includes(p.id));

    if(q){
        list=list.filter(p=>{
            const n=String(p.id).padStart(3,'0');
            return p.name.includes(q)||n.includes(q)||String(p.id)===q;
        });
    }

    if(state.currentTypeFilter){
        list=list.filter(p=>{
            const types=state.pokemonTypeMap[p.id];
            return types && types.includes(state.currentTypeFilter);
        });
    }

    state.filteredList = list;
    state.listNavIndex = 0;
    const currentIdx = list.findIndex(p => p.id === state.currentPokemonId);
    if(currentIdx !== -1) state.listNavIndex = currentIdx;

    renderList(list, selectPokemon);
}

dom.saveBtn.addEventListener('click',()=>toggleFavorite(state.currentPokemonId));
function toggleFavorite(id){
    const idx=state.favorites.indexOf(id);
    if(idx===-1)state.favorites.push(id);
    else state.favorites.splice(idx,1);
    localStorage.setItem('pokedex-favorites',
        JSON.stringify(state.favorites));
    updateSaveBtn();updateCounters();applyFilters();
}

function selectPokemonByListIndex(index){
    if(state.filteredList[index]) selectPokemon(state.filteredList[index].id);
}
function scrollListToIndex(index){
    const items = dom.pokemonList.querySelectorAll('.poke-list-item');
    if(items[index]) items[index].scrollIntoView({
        block: 'nearest', behavior: 'smooth'
    });
}
function executeMenuAction(a){
    if(a==='start')goToPokedex();
    else if(a==='credits')openCredits()}

dom.btnBackMenu.addEventListener('click',backToMenu);

initEvents({
    onMenuAction: executeMenuAction,
    onCloseCredits: closeCredits,
    onBackMenu: backToMenu,
    onSelectByIndex: selectPokemonByListIndex,
    onScrollToIndex: scrollListToIndex,
    updateMenuSelection
});

async function init(){
    await simulateLoading();
    await snorlaxWakeUp();
    await showTitleScreen();
    await dropLogo();showMenu()}
init();