function loadFavorites(){
    try{
        const saved=JSON.parse(localStorage.getItem('pokedex-favorites')||'[]');
        if(!Array.isArray(saved))return [];
        return [...new Set(saved.map(Number).filter(Number.isInteger))];
    }catch{
        return [];
    }
}

export const state = {
    allPokemonBasic: [],
    currentPokemonId: null,
    currentTab: 'all',
    currentTypeFilter: '',
    seenSet: new Set(),
    favorites: loadFavorites(),
    pokemonCache: {},
    speciesCache: {},
    evoCache: {},
    typeCache: {},
    pokemonTypeMap: {},
    menuIndex: 0,
    filteredList: [],
    listNavIndex: 0,
    currentScreen: 'loading',
    pokedexInitialized: false,
    selectionRequestId: 0,
    filterRequestId: 0
};
