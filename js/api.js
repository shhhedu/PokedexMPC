import { state } from './state.js';
import { extractIdFromUrl } from './utils.js';

const API_BASE='https://pokeapi.co/api/v2';
const BASIC_LIST_CACHE='pokedex-national-list-v1';
let basicListPromise=null;

async function fetchJson(url){
    const response=await fetch(url);
    if(!response.ok)throw new Error(`PokéAPI respondeu com ${response.status}`);
    return response.json();
}

function readBasicListCache(){
    try{
        const list=JSON.parse(localStorage.getItem(BASIC_LIST_CACHE)||'[]');
        return Array.isArray(list)?list:[];
    }catch{
        return [];
    }
}

function saveBasicListCache(list){
    try{
        localStorage.setItem(BASIC_LIST_CACHE,JSON.stringify(list));
    }catch{
        // A lista continua disponível em memória quando o armazenamento falha.
    }
}

export async function fetchPokemon(id){
    if(state.pokemonCache[id])return state.pokemonCache[id];
    try{
        const data=await fetchJson(`${API_BASE}/pokemon/${id}`);
        state.pokemonCache[id]=data;
        return data;
    }catch(error){
        console.warn(`Não foi possível carregar o Pokémon ${id}.`,error);
        return null;
    }
}

export async function fetchSpecies(reference){
    const raw=typeof reference==='object'?reference?.url:reference;
    const url=String(raw||'').startsWith('http')
        ? String(raw)
        : `${API_BASE}/pokemon-species/${raw}`;
    const key=extractIdFromUrl(url)||raw;
    if(state.speciesCache[key])return state.speciesCache[key];
    try{
        const data=await fetchJson(url);
        state.speciesCache[key]=data;
        return data;
    }catch(error){
        console.warn(`Não foi possível carregar a espécie ${key}.`,error);
        return null;
    }
}

export async function fetchEvolutionChain(url){
    if(state.evoCache[url])return state.evoCache[url];
    try{
        const data=await fetchJson(url);
        state.evoCache[url]=data;
        return data;
    }catch(error){
        console.warn('Não foi possível carregar a cadeia evolutiva.',error);
        return null;
    }
}

export async function loadBasicPokemonList(){
    if(state.allPokemonBasic.length)return state.allPokemonBasic;
    if(basicListPromise)return basicListPromise;

    basicListPromise=(async()=>{
        try{
            const metadata=await fetchJson(`${API_BASE}/pokemon-species?limit=1`);
            const count=Number(metadata.count);
            if(!Number.isInteger(count)||count<1)throw new Error('Quantidade inválida recebida da PokéAPI');

            const data=await fetchJson(`${API_BASE}/pokemon-species?limit=${count}`);
            state.allPokemonBasic=data.results.map(species=>({
                id:extractIdFromUrl(species.url),
                name:species.name
            })).filter(pokemon=>Number.isInteger(pokemon.id))
                .sort((a,b)=>a.id-b.id);

            if(!state.allPokemonBasic.length)throw new Error('A PokéAPI retornou uma lista vazia');
            saveBasicListCache(state.allPokemonBasic);
        }catch(error){
            state.allPokemonBasic=readBasicListCache();
            console.warn('Não foi possível atualizar a National Dex; usando o cache disponível.',error);
        }
        return state.allPokemonBasic;
    })().finally(()=>{
        basicListPromise=null;
    });

    return basicListPromise;
}

export async function fetchPokemonIdsByType(type){
    if(state.typeCache[type])return state.typeCache[type];
    try{
        const data=await fetchJson(`${API_BASE}/type/${type}`);
        const ids=data.pokemon.map(entry=>extractIdFromUrl(entry.pokemon.url))
            .filter(Number.isInteger);
        state.typeCache[type]=new Set(ids);
        return state.typeCache[type];
    }catch(error){
        console.warn(`Não foi possível carregar o filtro do tipo ${type}.`,error);
        return null;
    }
}
