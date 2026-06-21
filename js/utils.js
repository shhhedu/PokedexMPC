export const capitalize = s => s ? s.charAt(0).toUpperCase()+s.slice(1) : '';

export const formatPokemonName = name => name
    ? name.split('-').map(capitalize).join(' ')
    : '';

export const formatPokemonNumber = id => String(id).padStart(4,'0');

export const extractIdFromUrl = url => {
    const id=Number(String(url||'').replace(/\/$/,'').split('/').pop());
    return Number.isInteger(id)?id:null;
};

const fallbackSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="86" fill="#f5f5f5" stroke="#555" stroke-width="12"/>
<path d="M15 100h170A86 86 0 0 0 15 100" fill="#d94a4a"/>
<path d="M15 100h170" stroke="#555" stroke-width="12"/>
<circle cx="100" cy="100" r="28" fill="#fff" stroke="#555" stroke-width="12"/>
</svg>`;

export const FALLBACK_SPRITE=`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;

export function setImageWithFallback(img,candidates,onLoad){
    const sources=[...new Set(candidates.filter(Boolean))];
    let index=0;

    const loadNext=()=>{
        if(index<sources.length){
            img.src=sources[index++];
        }else{
            img.onerror=null;
            img.src=FALLBACK_SPRITE;
        }
    };

    img.onload=()=>{
        if(onLoad)onLoad(img.src);
    };
    img.onerror=loadNext;
    loadNext();
}

export function pokemonSpriteCandidates(pokemon){
    const id=pokemon.id;
    return [
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`,
        pokemon.sprites.front_default,
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        pokemon.sprites.other?.['official-artwork']?.front_default,
        pokemon.sprites.other?.home?.front_default,
        pokemon.sprites.other?.dream_world?.front_default
    ];
}

export function evolutionSpriteCandidates(id){
    const root='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
    return [
        `${root}/${id}.png`,
        `${root}/other/official-artwork/${id}.png`,
        `${root}/other/home/${id}.png`
    ];
}
