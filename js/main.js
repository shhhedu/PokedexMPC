import { state } from './state.js';
import * as dom from './dom.js';
import { fetchPokemon, fetchPokemonIdsByType, loadBasicPokemonList } from './api.js';
import { loadEvolutions } from './evolutions.js';
import {
    renderList,
    renderListMessage,
    highlightSelected,
    updateCounters,
    updateListItemTypes,
    updateSaveBtn,
    updateTypeBackground,
    updateTypeFilterColor
} from './ui.js';
import { initEvents } from './events.js';
import { initPokemonRain, stopRain } from './rain.js';
import {
    capitalize,
    FALLBACK_SPRITE,
    formatPokemonName,
    formatPokemonNumber,
    pokemonSpriteCandidates,
    setImageWithFallback
} from './utils.js';

function setupStaticImageFallbacks(){
    document.querySelectorAll('img:not(#pokemon-sprite)').forEach(img=>{
        const useFallback=()=>{
            img.removeEventListener('error',useFallback);
            img.src=FALLBACK_SPRITE;
        };
        img.addEventListener('error',useFallback,{once:true});
        if(img.complete&&img.naturalWidth===0)useFallback();
    });
}

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
    if(state.allPokemonBasic.length){
        const nationalIds=new Set(state.allPokemonBasic.map(pokemon=>pokemon.id));
        const validFavorites=state.favorites.filter(id=>nationalIds.has(id));
        if(validFavorites.length!==state.favorites.length){
            state.favorites=validFavorites;
            saveFavorites();
        }
    }
    state.filteredList=[...state.allPokemonBasic];
    state.listNavIndex=0;
    setupSearch();setupTabs();setupTypeFilter();
    updateCounters();

    if(state.filteredList.length===0){
        renderListMessage('Não foi possível carregar a lista. Verifique sua conexão e tente novamente.');
        updateNavigationButtons();
        return;
    }

    renderList(state.filteredList,selectPokemon);
    await selectPokemon(state.filteredList[0].id);
}

async function selectPokemon(id){
    const requestId=++state.selectionRequestId;
    state.currentPokemonId=id;
    highlightSelected();
    updateNavigationButtons();

    const pokemon=await fetchPokemon(id);
    if(requestId!==state.selectionRequestId)return;
    if(!pokemon){
        showPokemonError(id);
        return;
    }

    state.currentPokemonId=pokemon.id;
    state.seenSet.add(pokemon.id);
    state.pokemonTypeMap[pokemon.id]=pokemon.types.map(t=>t.type.name);
    updateCounters();

    dom.displayName.textContent=formatPokemonName(pokemon.name);
    dom.displayNumber.textContent=`#${formatPokemonNumber(pokemon.id)}`;

    dom.spriteImg.style.opacity='0';
    setImageWithFallback(
        dom.spriteImg,
        pokemonSpriteCandidates(pokemon),
        ()=>dom.spriteImg.style.opacity='1'
    );

    dom.typesContainer.innerHTML='';
    pokemon.types.forEach(type=>{
        const badge=document.createElement('span');
        badge.className=`type-badge type-${type.type.name}`;
        badge.textContent=type.type.name;
        dom.typesContainer.appendChild(badge)
    });
    if(pokemon.types[0])updateTypeBackground(pokemon.types[0].type.name);

    const statMap={
        hp:'hp',
        attack:'atk',
        defense:'def',
        'special-attack':'spa',
        'special-defense':'spd',
        speed:'spe'
    };
    pokemon.stats.forEach(stat=>{
        const key=statMap[stat.stat.name];
        if(!key)return;
        const bar=dom.$(`stat-${key}`);
        const value=dom.$(`val-${key}`);
        const percent=Math.min((stat.base_stat/255)*100,100);
        bar.style.width=`${percent}%`;
        bar.style.background=percent>60?'#4caf50':percent>35?'#ff9800':'#f44336';
        value.textContent=stat.base_stat
    });

    dom.pokemonWeight.textContent=`${(pokemon.weight/10).toFixed(1)} kg`;
    dom.pokemonHeight.textContent=`${(pokemon.height/10).toFixed(1)} m`;
    dom.pokemonAbility.textContent=pokemon.abilities.length
        ? capitalize(pokemon.abilities[0].ability.name.replace(/-/g,' '))
        : '—';

    updateSaveBtn();
    updateListItemTypes(pokemon.id);
    await loadEvolutions(
        pokemon.species,
        selectPokemon,
        ()=>requestId===state.selectionRequestId
    );
}

function showPokemonError(id){
    dom.displayName.textContent='Pokémon indisponível';
    dom.displayNumber.textContent=`#${formatPokemonNumber(id)}`;
    dom.spriteImg.style.opacity='0';
    setImageWithFallback(dom.spriteImg,[],()=>dom.spriteImg.style.opacity='1');
    dom.typesContainer.innerHTML='';
    dom.pokemonWeight.textContent='—';
    dom.pokemonHeight.textContent='—';
    dom.pokemonAbility.textContent='—';
    dom.evoChain.textContent='Não foi possível carregar';
    ['hp','atk','def','spa','spd','spe'].forEach(key=>{
        dom.$(`stat-${key}`).style.width='0%';
        dom.$(`val-${key}`).textContent='0';
    });
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

async function applyFilters(){
    const requestId=++state.filterRequestId;
    const query=dom.searchInput.value.trim().toLowerCase().replace(/^#/,'');
    let list=state.allPokemonBasic;

    if(state.currentTab==='favorites'){
        list=list.filter(p=>state.favorites.includes(p.id));
    }

    if(query){
        if(/^\d+$/.test(query)){
            const id=Number(query);
            list=list.filter(p=>p.id===id);
        }else{
            list=list.filter(p=>p.name.includes(query));
        }
    }

    if(state.currentTypeFilter){
        const ids=await fetchPokemonIdsByType(state.currentTypeFilter);
        if(requestId!==state.filterRequestId)return;
        if(!ids){
            state.filteredList=[];
            renderListMessage('Não foi possível carregar este filtro.');
            updateNavigationButtons();
            return;
        }
        list=list.filter(p=>ids.has(p.id));
    }

    if(requestId!==state.filterRequestId)return;
    state.filteredList=list;
    state.listNavIndex=0;
    const currentIndex=list.findIndex(p=>p.id===state.currentPokemonId);
    if(currentIndex!==-1)state.listNavIndex=currentIndex;

    if(list.length)renderList(list,selectPokemon);
    else renderListMessage('Nenhum Pokémon encontrado.');
    updateNavigationButtons();
}

dom.saveBtn.addEventListener('click',()=>toggleFavorite(state.currentPokemonId));
function saveFavorites(){
    try{
        localStorage.setItem('pokedex-favorites',JSON.stringify(state.favorites));
    }catch{
        // Mantém favoritos na sessão quando o armazenamento não está disponível.
    }
}
function toggleFavorite(id){
    if(!Number.isInteger(id))return;
    const index=state.favorites.indexOf(id);
    if(index===-1)state.favorites.push(id);
    else state.favorites.splice(index,1);
    saveFavorites();
    updateSaveBtn();updateCounters();applyFilters();
}

function selectPokemonByListIndex(index){
    if(state.filteredList[index])selectPokemon(state.filteredList[index].id);
}
function scrollListToIndex(index){
    const items=dom.pokemonList.querySelectorAll('.poke-list-item');
    if(items[index])items[index].scrollIntoView({
        block:'nearest',behavior:'auto'
    });
}
function navigateRelative(offset){
    const list=state.filteredList;
    if(list.length===0)return;
    const currentIndex=list.findIndex(p=>p.id===state.currentPokemonId);
    const baseIndex=currentIndex===-1?(offset>0?-1:0):currentIndex;
    state.listNavIndex=(baseIndex+offset+list.length)%list.length;
    selectPokemonByListIndex(state.listNavIndex);
    scrollListToIndex(state.listNavIndex);
}
function updateNavigationButtons(){
    const disabled=state.filteredList.length<2;
    dom.btnPrevPokemon.disabled=disabled;
    dom.btnNextPokemon.disabled=disabled;
}
function executeMenuAction(action){
    if(action==='start')goToPokedex();
    else if(action==='credits')openCredits()
}

dom.btnPrevPokemon.addEventListener('click',()=>navigateRelative(-1));
dom.btnNextPokemon.addEventListener('click',()=>navigateRelative(1));
dom.btnBackMenu.addEventListener('click',backToMenu);

setupStaticImageFallbacks();

initEvents({
    onMenuAction:executeMenuAction,
    onCloseCredits:closeCredits,
    onBackMenu:backToMenu,
    onSelectByIndex:selectPokemonByListIndex,
    onScrollToIndex:scrollListToIndex,
    onNavigate:navigateRelative,
    updateMenuSelection
});

async function init(){
    await simulateLoading();
    await snorlaxWakeUp();
    await showTitleScreen();
    await dropLogo();showMenu()
}
init();
