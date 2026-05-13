import { state } from './state.js';
import { menuActions } from './config.js';
import { searchInput } from './dom.js';

export function initEvents({ onMenuAction, onCloseCredits, onBackMenu, onSelectByIndex, onScrollToIndex, updateMenuSelection }) {
    document.addEventListener('keydown',e=>{
        if(state.currentScreen==='title'){
            if(e.key==='ArrowUp'){
                state.menuIndex=(state.menuIndex-1+menuActions.length)
                    %menuActions.length;
                updateMenuSelection()
            }
            else if(e.key==='ArrowDown'){
                state.menuIndex=(state.menuIndex+1)
                    %menuActions.length;
                updateMenuSelection()
            }
            else if(e.key==='Enter')onMenuAction(menuActions[state.menuIndex]);
        } else if(state.currentScreen==='credits'){
            if(e.key==='Escape'||e.key==='Enter')onCloseCredits();
        } else if(state.currentScreen==='pokedex'){
            if(document.activeElement === searchInput) return;

            if(e.key==='ArrowUp'){
                e.preventDefault();
                if(state.filteredList.length === 0) return;
                state.listNavIndex = (state.listNavIndex - 1 + state.filteredList.length) % state.filteredList.length;
                onSelectByIndex(state.listNavIndex);
                onScrollToIndex(state.listNavIndex);
            } else if(e.key==='ArrowDown'){
                e.preventDefault();
                if(state.filteredList.length === 0) return;
                state.listNavIndex = (state.listNavIndex + 1) % state.filteredList.length;
                onSelectByIndex(state.listNavIndex);
                onScrollToIndex(state.listNavIndex);
            } else if(e.key==='Enter'){
                e.preventDefault();
                if(state.filteredList.length > 0 && state.filteredList[state.listNavIndex]){
                    onSelectByIndex(state.listNavIndex);
                }
            } else if(e.key==='Escape'){
                onBackMenu();
            }
        }
    });

    document.querySelectorAll('#menu-options .menu-item')
        .forEach(el=>el.addEventListener('click',()=>onMenuAction(el.dataset.action)));
}