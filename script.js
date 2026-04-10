// =========================================================
//  POKÉDEX — SCRIPT PRINCIPAL (v12)
// =========================================================

const TOTAL_POKEMON = 151;
let allPokemonBasic = [];
let currentPokemonId = 1;
let currentTab = 'all';
let currentTypeFilter = '';
let seenSet = new Set();
let favorites = JSON.parse(localStorage.getItem('pokedex-favorites') || '[]');
let pokemonCache = {};
let speciesCache = {};
let evoCache = {};
let pokemonTypeMap = {}; // { id: ['grass','poison'], ... }
const localPokemonDatabase = Array.isArray(window.pokemonDatabase) ? window.pokemonDatabase : [];
const localPokemonById = localPokemonDatabase.reduce((acc, pokemon) => {
    acc[pokemon.id] = pokemon;
    return acc;
}, {});
let menuIndex = 0;
const menuActions = ['start', 'credits'];

// ===== NAVEGAÇÃO POR TECLADO NA LISTA =====
let filteredList = []; // lista atualmente exibida
let listNavIndex = 0;  // índice selecionado na lista

// ===== FUNDOS LOCAIS POR TIPO (pasta assets/) =====
const TYPE_BACKGROUNDS = {
    fire:     'assets/FundoPokedexFogo.png',
    water:    'assets/FundoPokedexAgua.JPG',
    grass:    'assets/FundoPokedexPlanta.JPG',
    bug:      'assets/FundoPokedexInseto.JPG',
    normal:   'assets/FundoPokedexNormal.JPG',
    poison:   'assets/FundoPokedexVeneno.JPG',
    electric: 'assets/FundoPokedexEletrico.JPG',
    ground:   'assets/FundoPokedexTerra.JPG',
    fairy:    'assets/FundoPokedexFada.JPG',
    fighting: 'assets/FundoPokedexLutador.JPG',
    psychic:  'assets/FundoPokedexPsiquico.JPG',
    rock:     'assets/FundoPokedexPedra.JPG',
    ghost:    'assets/FundoPokedexFantasma.JPG',
    ice:      'assets/FundoPokedexGelo.JPG',
    dragon:   'assets/FundoPokedexDragao.JPG',
    dark:     'assets/FundoPokedexEscuridao.JPG',
    steel:    'assets/FundoPokedexAco.JPG',
    flying:   'assets/FundoPokedexVoador.JPG',
};

const OVERLAY_COLORS = {
    water:'rgba(10,40,120,.45)', electric:'rgba(120,100,0,.4)', fire:'rgba(150,40,10,.4)',
    grass:'rgba(20,80,20,.4)', bug:'rgba(50,80,10,.4)', ice:'rgba(60,140,160,.35)',
    psychic:'rgba(100,20,70,.4)', fairy:'rgba(140,50,90,.35)', poison:'rgba(70,15,90,.45)',
    ground:'rgba(120,90,30,.4)', rock:'rgba(90,70,30,.4)', fighting:'rgba(110,25,15,.4)',
    ghost:'rgba(30,15,60,.55)', dark:'rgba(15,10,8,.55)', dragon:'rgba(40,15,100,.45)',
    steel:'rgba(70,70,90,.4)', flying:'rgba(60,80,130,.35)', normal:'rgba(70,70,50,.35)',
};

// ===== CORES POR TIPO PARA INDICADOR NA LISTA =====
const TYPE_COLORS = {
    normal:   '#a8a878',
    fire:     '#f08030',
    water:    '#6890f0',
    electric: '#f8d030',
    grass:    '#78c850',
    ice:      '#98d8d8',
    fighting: '#c03028',
    poison:   '#a040a0',
    ground:   '#e0c068',
    flying:   '#a890f0',
    psychic:  '#f85888',
    bug:      '#a8b820',
    rock:     '#b8a038',
    ghost:    '#705898',
    dragon:   '#7038f8',
    dark:     '#705848',
    steel:    '#b8b8d0',
    fairy:    '#ee99ac',
};

// ===== CORES CLARAS/TRANSPARENTES POR TIPO (para o select) =====
const TYPE_COLORS_LIGHT = {
    normal:   'rgba(168,168,120,.35)',
    fire:     'rgba(240,128,48,.35)',
    water:    'rgba(104,144,240,.35)',
    electric: 'rgba(248,208,48,.35)',
    grass:    'rgba(120,200,80,.35)',
    ice:      'rgba(152,216,216,.35)',
    fighting: 'rgba(192,48,40,.35)',
    poison:   'rgba(160,64,160,.35)',
    ground:   'rgba(224,192,104,.35)',
    flying:   'rgba(168,144,240,.35)',
    psychic:  'rgba(248,88,136,.35)',
    bug:      'rgba(168,184,32,.35)',
    rock:     'rgba(184,160,56,.35)',
    ghost:    'rgba(112,88,152,.35)',
    dragon:   'rgba(112,56,248,.35)',
    dark:     'rgba(112,88,72,.35)',
    steel:    'rgba(184,184,208,.35)',
    fairy:    'rgba(238,153,172,.35)',
};

const $ = id => document.getElementById(id);

const loadingScreen=$('loading-screen'), snorlaxContainer=$('snorlax-container'), snorlaxStatus=$('snorlax-status');
const titleScreen=$('title-screen'), forestBg=$('forest-bg'), logoContainer=$('logo-container'), menuOptions=$('menu-options');
const creditsScreen=$('credits-screen'), pokedexScreen=$('pokedex-screen');
const pokemonList=$('pokemon-list'), searchInput=$('search-input');
const displayName=$('pokemon-display-name'), displayNumber=$('pokemon-display-number');
const spriteImg=$('pokemon-sprite'), typesContainer=$('pokemon-types'), evoChain=$('evolution-chain');
const saveBtn=$('save-btn'), seenCountEl=$('seen-count'), savedCountEl=$('saved-count');
const pokemonWeight=$('pokemon-weight'), pokemonHeight=$('pokemon-height'), pokemonAbility=$('pokemon-ability');
const typeBgImage=$('type-bg-image'), typeBgOverlay=$('type-bg-overlay'), btnBackMenu=$('btn-back-menu');
const typeFilterSelect=$('type-filter-select');

let currentScreen = 'loading';

// =========================================================
//  CHUVA DE POKÉMON — CANVAS (Tela de Créditos)
// =========================================================
let rainCanvas, rainCtx, rainAnimId;
let fallingPokemons = [];
let pokemonRainImages = [];
let rainImagesLoaded = false;

function initPokemonRain() {
    rainCanvas = $('pokemon-rain-canvas');
    rainCtx = rainCanvas.getContext('2d');
    resizeRainCanvas();
    window.addEventListener('resize', resizeRainCanvas);

    if (!rainImagesLoaded) {
        loadRainImages();
    } else {
        startRain();
    }
}

function resizeRainCanvas() {
    if (!rainCanvas) return;
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
}

function loadRainImages() {
    const ids = [];
    while (ids.length < 30) {
        const rid = Math.floor(Math.random() * 151) + 1;
        if (!ids.includes(rid)) ids.push(rid);
    }

    let loaded = 0;
    pokemonRainImages = [];

    ids.forEach(id => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            pokemonRainImages.push(img);
            loaded++;
            if (loaded === ids.length) {
                rainImagesLoaded = true;
                startRain();
            }
        };
        img.onerror = () => {
            loaded++;
            if (loaded === ids.length) {
                rainImagesLoaded = true;
                startRain();
            }
        };
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
    });
}

function spawnFallingPokemon() {
    if (pokemonRainImages.length === 0) return null;
    const img = pokemonRainImages[Math.floor(Math.random() * pokemonRainImages.length)];
    const size = 70 + Math.random() * 50;
    return {
        img,
        x: Math.random() * rainCanvas.width,
        y: -size - Math.random() * 150,
        size,
        speed: 0.4 + Math.random() * 0.6,
        opacity: 0.2 + Math.random() * 0.3,
        wobbleAmp: 12 + Math.random() * 25,
        wobbleSpeed: 0.003 + Math.random() * 0.006,
        wobbleOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
    };
}

function startRain() {
    fallingPokemons = [];
    for (let i = 0; i < 15; i++) {
        const p = spawnFallingPokemon();
        if (p) {
            p.y = Math.random() * rainCanvas.height;
            fallingPokemons.push(p);
        }
    }
    animateRain();
}

function animateRain() {
    if (!rainCanvas) return;
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);

    if (fallingPokemons.length < 18 && Math.random() < 0.03) {
        const p = spawnFallingPokemon();
        if (p) fallingPokemons.push(p);
    }

    const now = performance.now();

    fallingPokemons.forEach(p => {
        p.y += p.speed;
        p.rotation += p.rotSpeed;
        const wobbleX = Math.sin(now * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;

        rainCtx.save();
        rainCtx.globalAlpha = p.opacity;
        rainCtx.translate(p.x + wobbleX + p.size / 2, p.y + p.size / 2);
        rainCtx.rotate(p.rotation);
        rainCtx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        rainCtx.restore();
    });

    fallingPokemons = fallingPokemons.filter(p => p.y <= rainCanvas.height + p.size);

    rainAnimId = requestAnimationFrame(animateRain);
}

function stopRain() {
    if (rainAnimId) {
        cancelAnimationFrame(rainAnimId);
        rainAnimId = null;
    }
    fallingPokemons = [];
    if (rainCtx && rainCanvas) {
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    }
}

// =========================================================
//  INTRO
// =========================================================
function simulateLoading() {
    return new Promise(resolve => {
        const z=['Z','Z z','Z z z','Z z z .','Z z z . .','Z z z . . .'];
        let p=0,fi=0;
        const zI=setInterval(()=>{snorlaxStatus.textContent=z[fi];fi=(fi+1)%z.length},400);
        const lI=setInterval(()=>{p=Math.min(p+Math.random()*3+1,100);if(p>=100){clearInterval(lI);clearInterval(zI);resolve()}},80);
    });
}
function snorlaxWakeUp(){return new Promise(r=>{snorlaxStatus.textContent='!';snorlaxStatus.classList.add('awake');setTimeout(()=>snorlaxContainer.classList.add('waking-up'),800);setTimeout(()=>loadingScreen.classList.add('fade-out'),1400);setTimeout(()=>{loadingScreen.style.display='none';r()},2400)})}
function showTitleScreen(){return new Promise(r=>{titleScreen.classList.remove('hidden');currentScreen='title';setTimeout(()=>forestBg.classList.add('reveal'),100);setTimeout(r,1400)})}
function dropLogo(){return new Promise(r=>{logoContainer.classList.add('drop-in');setTimeout(r,1200)})}
function showMenu(){menuOptions.classList.remove('hidden');menuOptions.classList.add('show');menuIndex=0;updateMenuSelection()}
function updateMenuSelection(){document.querySelectorAll('#menu-options .menu-item').forEach((el,i)=>el.classList.toggle('selected',i===menuIndex))}

// =========================================================
//  NAVEGAÇÃO
// =========================================================
document.addEventListener('keydown',e=>{
    if(currentScreen==='title'){
        if(e.key==='ArrowUp'){menuIndex=(menuIndex-1+menuActions.length)%menuActions.length;updateMenuSelection()}
        else if(e.key==='ArrowDown'){menuIndex=(menuIndex+1)%menuActions.length;updateMenuSelection()}
        else if(e.key==='Enter')executeMenuAction(menuActions[menuIndex])
    } else if(currentScreen==='credits'){
        if(e.key==='Escape'||e.key==='Enter')closeCredits()
    } else if(currentScreen==='pokedex'){
        // Não navegar se o campo de busca estiver focado
        if(document.activeElement === searchInput) return;

        if(e.key==='ArrowUp'){
            e.preventDefault();
            if(filteredList.length === 0) return;
            listNavIndex = (listNavIndex - 1 + filteredList.length) % filteredList.length;
            selectPokemonByListIndex(listNavIndex);
            scrollListToIndex(listNavIndex);
        } else if(e.key==='ArrowDown'){
            e.preventDefault();
            if(filteredList.length === 0) return;
            listNavIndex = (listNavIndex + 1) % filteredList.length;
            selectPokemonByListIndex(listNavIndex);
            scrollListToIndex(listNavIndex);
        } else if(e.key==='Enter'){
            e.preventDefault();
            if(filteredList.length > 0 && filteredList[listNavIndex]){
                selectPokemon(filteredList[listNavIndex].id);
            }
        } else if(e.key==='Escape'){
            backToMenu();
        }
    }
});

function selectPokemonByListIndex(index){
    if(filteredList[index]){
        selectPokemon(filteredList[index].id);
    }
}

function scrollListToIndex(index){
    const items = pokemonList.querySelectorAll('.poke-list-item');
    if(items[index]){
        items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

document.querySelectorAll('#menu-options .menu-item').forEach(el=>el.addEventListener('click',()=>executeMenuAction(el.dataset.action)));
function executeMenuAction(a){if(a==='start')goToPokedex();else if(a==='credits')openCredits()}

// =========================================================
//  TRANSIÇÕES
// =========================================================
function goToPokedex(){currentScreen='transitioning';titleScreen.classList.add('fade-out');setTimeout(()=>{titleScreen.style.display='none';pokedexScreen.classList.remove('hidden');pokedexScreen.classList.add('screen-enter');currentScreen='pokedex';initPokedex()},800)}

function openCredits(){
    currentScreen='credits';
    creditsScreen.classList.remove('hidden');
    creditsScreen.classList.remove('fade-out');
    initPokemonRain();
}

function closeCredits(){
    creditsScreen.classList.add('fade-out');
    stopRain();
    setTimeout(()=>{creditsScreen.classList.add('hidden');currentScreen='title'},500);
}

btnBackMenu.addEventListener('click',backToMenu);
function backToMenu(){pokedexScreen.classList.add('screen-exit');setTimeout(()=>{pokedexScreen.classList.add('hidden');pokedexScreen.classList.remove('screen-exit','screen-enter');titleScreen.style.display='';titleScreen.classList.remove('fade-out');currentScreen='title'},500)}

// =========================================================
//  POKÉDEX — INIT
// =========================================================
let pokedexInitialized=false;
async function initPokedex(){
    if(pokedexInitialized)return;pokedexInitialized=true;
    try{const r=await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);const d=await r.json();allPokemonBasic=d.results.map((p,i)=>({id:i+1,name:p.name}))}
    catch{
        if(localPokemonDatabase.length>0){
            allPokemonBasic=localPokemonDatabase.map(p=>({id:p.id,name:p.name.toLowerCase()}));
        }else{
            allPokemonBasic=[];for(let i=1;i<=TOTAL_POKEMON;i++)allPokemonBasic.push({id:i,name:`pokemon-${i}`});
        }
    }
    filteredList = [...allPokemonBasic];
    listNavIndex = 0;
    renderList(filteredList);selectPokemon(1);setupSearch();setupTabs();setupTypeFilter();updateCounters();
    // Carregar tipos de todos os Pokémon em background para o filtro
    fetchAllPokemonTypes();
}

// =========================================================
//  BUSCAR TIPOS DE TODOS OS POKÉMON (para filtro)
// =========================================================
async function fetchAllPokemonTypes() {
    const batchSize = 20;
    for (let i = 0; i < allPokemonBasic.length; i += batchSize) {
        const batch = allPokemonBasic.slice(i, i + batchSize);
        await Promise.all(batch.map(async (p) => {
            if (pokemonTypeMap[p.id]) return;
            const data = await fetchPokemon(p.id);
            if (data) {
                pokemonTypeMap[p.id] = data.types.map(t => t.type.name);
            }
        }));
        // Re-renderizar a lista conforme os tipos vão carregando
        renderList(filteredList);
    }
}

// =========================================================
//  LISTA
// =========================================================
function renderList(list){
    pokemonList.innerHTML='';
    list.forEach((p, index) =>{
        const div=document.createElement('div');div.className='poke-list-item';
        if(p.id===currentPokemonId)div.classList.add('selected');
        const isFav=favorites.includes(p.id);

        // Obter tipos e cor do tipo principal
        const types = pokemonTypeMap[p.id];
        const primaryType = types ? types[0] : null;
        const typeColor = primaryType ? (TYPE_COLORS[primaryType] || '#a8a878') : '#a8a878';

        // Criar indicador de cor do tipo
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

        // Borda esquerda colorida pelo tipo
        if(primaryType){
            div.style.borderLeft = `3px solid ${typeColor}`;
        }

        div.addEventListener('click',()=>{
            listNavIndex = index;
            selectPokemon(p.id);
        });
        pokemonList.appendChild(div);
    });
}

function highlightSelected(){
    document.querySelectorAll('.poke-list-item').forEach((el, i) =>{
        const n=parseInt(el.querySelector('.poke-list-number').textContent);
        const isSelected = n===currentPokemonId;
        el.classList.toggle('selected', isSelected);
        if(isSelected) listNavIndex = i;
    });
}

// =========================================================
//  SELECIONAR POKÉMON
// =========================================================
async function selectPokemon(id){
    currentPokemonId=id;highlightSelected();seenSet.add(id);updateCounters();
    const pokemon=await fetchPokemon(id);if(!pokemon)return;
    // Atualizar o mapa de tipos ao selecionar
    pokemonTypeMap[id] = pokemon.types.map(t => t.type.name);
    displayName.textContent=capitalize(pokemon.name);displayNumber.textContent=`#${String(id).padStart(3,'0')}`;
    spriteImg.style.opacity='0';
    const gif=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
    const fb=pokemon.sprites.other?.['official-artwork']?.front_default||pokemon.sprites.front_default||'';
    const t=new Image();t.onload=()=>{spriteImg.src=gif;spriteImg.style.opacity='1'};t.onerror=()=>{spriteImg.src=fb;spriteImg.style.opacity='1'};t.src=gif;
    typesContainer.innerHTML='';pokemon.types.forEach(t=>{const b=document.createElement('span');b.className=`type-badge type-${t.type.name}`;b.textContent=t.type.name;typesContainer.appendChild(b)});
    updateTypeBackground(pokemon.types[0].type.name);
    const sm={hp:'hp',attack:'atk',defense:'def','special-attack':'spa','special-defense':'spd',speed:'spe'};
    pokemon.stats.forEach(s=>{const k=sm[s.stat.name];if(!k)return;const bar=$(`stat-${k}`),val=$(`val-${k}`),pct=Math.min((s.base_stat/255)*100,100);bar.style.width=`${pct}%`;bar.style.background=pct>60?'#4caf50':pct>35?'#ff9800':'#f44336';val.textContent=s.base_stat});
    pokemonWeight.textContent=`${(pokemon.weight/10).toFixed(1)} kg`;pokemonHeight.textContent=`${(pokemon.height/10).toFixed(1)} m`;
    pokemonAbility.textContent=pokemon.abilities.length>0?capitalize(pokemon.abilities[0].ability.name.replace(/-/g,' ')):'—';
    updateSaveBtn();await loadEvolutions(id);
    // Re-renderizar a lista para atualizar as cores dos tipos
    renderList(filteredList);
}

function updateTypeBackground(type){const url=TYPE_BACKGROUNDS[type]||TYPE_BACKGROUNDS.normal;typeBgImage.style.backgroundImage=`url('${url}')`;typeBgOverlay.style.background=OVERLAY_COLORS[type]||OVERLAY_COLORS.normal}

// =========================================================
//  FETCH
// =========================================================
function normalizeAbilityName(ability){
    return ability.toLowerCase().replace(/\s+/g,'-');
}

function getLocalPokemonAsApiShape(localPokemon){
    return {
        id: localPokemon.id,
        name: localPokemon.name.toLowerCase(),
        types: localPokemon.types.map(typeName => ({ type: { name: typeName } })),
        sprites: {
            front_default: localPokemon.sprite,
            other: { 'official-artwork': { front_default: localPokemon.sprite } }
        },
        stats: [
            { base_stat: localPokemon.stats.hp, stat: { name: 'hp' } },
            { base_stat: localPokemon.stats.atk, stat: { name: 'attack' } },
            { base_stat: localPokemon.stats.def, stat: { name: 'defense' } },
            { base_stat: localPokemon.stats.spa, stat: { name: 'special-attack' } },
            { base_stat: localPokemon.stats.spd, stat: { name: 'special-defense' } },
            { base_stat: localPokemon.stats.spe, stat: { name: 'speed' } }
        ],
        weight: Math.round(localPokemon.weight * 10),
        height: Math.round(localPokemon.height * 10),
        abilities: [{ ability: { name: normalizeAbilityName(localPokemon.ability) } }]
    };
}

async function fetchPokemon(id){
    if(pokemonCache[id])return pokemonCache[id];
    const localPokemon=localPokemonById[id];
    if(localPokemon){
        const localData=getLocalPokemonAsApiShape(localPokemon);
        pokemonCache[id]=localData;
        return localData;
    }
    try{const r=await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);const d=await r.json();pokemonCache[id]=d;return d}catch{return null}
}
async function fetchSpecies(id){if(speciesCache[id])return speciesCache[id];try{const r=await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);const d=await r.json();speciesCache[id]=d;return d}catch{return null}}

// =========================================================
//  EVOLUÇÕES
// =========================================================
async function loadEvolutions(id){
    evoChain.innerHTML='<span style="font-size:7px;color:#888">Carregando...</span>';
    const species=await fetchSpecies(id);if(!species?.evolution_chain){evoChain.innerHTML='<span style="font-size:7px;color:#888">—</span>';return}
    const evoUrl=species.evolution_chain.url;let evoData=evoCache[evoUrl];
    if(!evoData){try{const r=await fetch(evoUrl);evoData=await r.json();evoCache[evoUrl]=evoData}catch{evoChain.innerHTML='—';return}}
    const chain=[];let node=evoData.chain;while(node){chain.push({name:node.species.name,id:extractId(node.species.url)});node=node.evolves_to?.[0]||null}
    evoChain.innerHTML='';chain.forEach((evo,i)=>{if(i>0){const a=document.createElement('span');a.className='evo-arrow';a.textContent='→';evoChain.appendChild(a)}const item=document.createElement('div');item.className='evo-item';if(evo.id===id)item.classList.add('current');item.innerHTML=`<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" alt="${evo.name}"><span>${capitalize(evo.name)}</span>`;item.addEventListener('click',()=>selectPokemon(evo.id));evoChain.appendChild(item)});
}
function extractId(url){return parseInt(url.replace(/\/$/,'').split('/').pop())}

// =========================================================
//  FAVORITOS
// =========================================================
saveBtn.addEventListener('click',()=>toggleFavorite(currentPokemonId));
function toggleFavorite(id){const idx=favorites.indexOf(id);if(idx===-1)favorites.push(id);else favorites.splice(idx,1);localStorage.setItem('pokedex-favorites',JSON.stringify(favorites));updateSaveBtn();updateCounters();applyFilters()}
function updateSaveBtn(){const f=favorites.includes(currentPokemonId);saveBtn.textContent=f?'★ Salvo!':'☆ Salvar Favorito';saveBtn.classList.toggle('saved',f)}

// =========================================================
//  BUSCA, ABAS & FILTRO POR TIPO
// =========================================================
function setupSearch(){searchInput.addEventListener('input',()=>applyFilters())}

function setupTabs(){
    document.querySelectorAll('#tabs .tab').forEach(tab=>{
        tab.addEventListener('click',()=>{
            document.querySelectorAll('#tabs .tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            currentTab=tab.dataset.tab;
            searchInput.value='';
            applyFilters();
        });
    });
}

function setupTypeFilter(){
    // Aplicar cor inicial no select
    updateTypeFilterColor();

    typeFilterSelect.addEventListener('change',()=>{
        currentTypeFilter=typeFilterSelect.value;
        updateTypeFilterColor();
        applyFilters();
    });
}

// =========================================================
//  ATUALIZAR COR DO SELECT DE TIPO (versão clara/transparente)
// =========================================================
function updateTypeFilterColor(){
    const val = typeFilterSelect.value;
    if(val && TYPE_COLORS_LIGHT[val]){
        // Fundo claro transparente com borda na cor sólida do tipo
        typeFilterSelect.style.background = TYPE_COLORS_LIGHT[val];
        typeFilterSelect.style.color = '#333';
        typeFilterSelect.style.borderColor = TYPE_COLORS[val] || 'rgba(255,255,255,.2)';
    } else {
        // Padrão: "Todos os Tipos"
        typeFilterSelect.style.background = 'rgba(255,255,255,.92)';
        typeFilterSelect.style.color = '#333';
        typeFilterSelect.style.borderColor = 'rgba(255,255,255,.2)';
    }
}

// Função centralizada que aplica TODOS os filtros juntos
function applyFilters(){
    const q=searchInput.value.trim().toLowerCase();
    let list=allPokemonBasic;

    // Filtro por aba (favoritos)
    if(currentTab==='favorites'){
        list=list.filter(p=>favorites.includes(p.id));
    }

    // Filtro por busca (nome ou número)
    if(q){
        list=list.filter(p=>{
            const n=String(p.id).padStart(3,'0');
            return p.name.includes(q)||n.includes(q)||String(p.id)===q;
        });
    }

    // Filtro por tipo
    if(currentTypeFilter){
        list=list.filter(p=>{
            const types=pokemonTypeMap[p.id];
            return types && types.includes(currentTypeFilter);
        });
    }

    filteredList = list;
    listNavIndex = 0;
    // Manter o Pokémon atual selecionado se estiver na lista
    const currentIdx = list.findIndex(p => p.id === currentPokemonId);
    if(currentIdx !== -1) listNavIndex = currentIdx;

    renderList(list);
}

// =========================================================
//  CONTADORES
// =========================================================
function updateCounters(){seenCountEl.textContent=seenSet.size;savedCountEl.textContent=favorites.length}

// =========================================================
//  UTILITÁRIOS
// =========================================================
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}

// =========================================================
//  FLUXO PRINCIPAL
// =========================================================
async function init(){await simulateLoading();await snorlaxWakeUp();await showTitleScreen();await dropLogo();showMenu()}
init();
