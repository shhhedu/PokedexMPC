import { fetchEvolutionChain, fetchSpecies } from './api.js';
import { evoChain } from './dom.js';
import {
    evolutionSpriteCandidates,
    extractIdFromUrl,
    formatPokemonName,
    setImageWithFallback
} from './utils.js';

function createEvolutionItem(node,currentSpeciesId,onSelect){
    const id=extractIdFromUrl(node.species.url);
    const item=document.createElement('div');
    item.className='evo-item';
    if(id===currentSpeciesId)item.classList.add('current');

    const img=document.createElement('img');
    img.alt=node.species.name;
    setImageWithFallback(img,evolutionSpriteCandidates(id));

    const name=document.createElement('span');
    name.textContent=formatPokemonName(node.species.name);
    item.append(img,name);
    item.addEventListener('click',()=>onSelect(id));
    return item;
}

function getEvolutionStages(root){
    const stages=[];
    let currentStage=[root];
    while(currentStage.length){
        stages.push(currentStage);
        currentStage=currentStage.flatMap(node=>node.evolves_to||[]);
    }
    return stages;
}

export async function loadEvolutions(speciesReference,onSelect,isCurrent=()=>true){
    evoChain.textContent='Carregando...';
    const species=await fetchSpecies(speciesReference);
    if(!isCurrent())return;
    if(!species?.evolution_chain?.url){
        evoChain.textContent='—';
        return;
    }

    const evolution=await fetchEvolutionChain(species.evolution_chain.url);
    if(!isCurrent())return;
    if(!evolution?.chain){
        evoChain.textContent='—';
        return;
    }

    const flow=document.createElement('div');
    flow.className='evo-stages';
    getEvolutionStages(evolution.chain).forEach((nodes,index)=>{
        if(index){
            const arrow=document.createElement('span');
            arrow.className='evo-arrow';
            arrow.textContent='→';
            flow.appendChild(arrow);
        }

        const stage=document.createElement('div');
        stage.className='evo-stage';
        nodes.forEach(node=>stage.appendChild(
            createEvolutionItem(node,species.id,onSelect)
        ));
        flow.appendChild(stage);
    });

    evoChain.innerHTML='';
    evoChain.appendChild(flow);
}
