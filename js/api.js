import { state } from './state.js';
import { TOTAL_POKEMON } from './config.js';

export async function fetchPokemon(id){
    if(state.pokemonCache[id]) return state.pokemonCache[id];
    try{
        const r=await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const d=await r.json();
        state.pokemonCache[id]=d;
        return d;
    }catch{
        return null;
    }
}

export async function fetchSpecies(id){
    if(state.speciesCache[id]) return state.speciesCache[id];
    try{
        const r=await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        const d=await r.json();
        state.speciesCache[id]=d;
        return d;
    }catch{
        return null;
    }
}

export async function loadBasicPokemonList(){
    try{
        const r=await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);
        const d=await r.json();
        state.allPokemonBasic = d.results.map((p,i)=>({id:i+1,name:p.name}));
    }catch{
        state.allPokemonBasic = [];
        for(let i=1;i<=TOTAL_POKEMON;i++) state.allPokemonBasic.push({id:i,name:`pokemon-${i}`});
    }
}