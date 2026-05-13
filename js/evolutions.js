import { state } from './state.js';
import { fetchSpecies } from './api.js';
import { evoChain } from './dom.js';
import { capitalize } from './utils.js';

const extractId = url => parseInt(url.replace(/\/$/,'').split('/').pop());

export async function loadEvolutions(id, onSelect){
    evoChain.innerHTML='<span style="font-size:7px;' +
        'color:#888">Carregando...</span>';
    const species = await fetchSpecies(id);
    if(!species?.evolution_chain){
        evoChain.innerHTML='<span style="font-size:7px;color:#888">—</span>';
        return;
    }

    const evoUrl=species.evolution_chain.url;
    let evoData=state.evoCache[evoUrl];
    if(!evoData){
        try{
            const r= await fetch(evoUrl);
            evoData =await r.json();
            state.evoCache[evoUrl] = evoData;
        } catch {
            evoChain.innerHTML='—';return;
        }
    }

    const chain=[];
    let node=evoData.chain;
    while(node){
        chain.push({name:node.species.name,id:extractId(node.species.url)});
        node=node.evolves_to?.[0]||null;
    }

    evoChain.innerHTML='';
    chain.forEach((evo,i)=>{
        if(i>0){
            const a=document.createElement('span');
            a.className='evo-arrow';a.textContent='→';
            evoChain.appendChild(a);
        }
        const item=document.createElement('div');
        item.className='evo-item';
        if(evo.id===id)item.classList.add('current');
        item.innerHTML=`<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" 
        alt="${evo.name}"><span>${capitalize(evo.name)}</span>`;
        item.addEventListener('click',()=>onSelect(evo.id));
        evoChain.appendChild(item);
    });
}