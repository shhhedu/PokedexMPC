export const state = {
    allPokemonBasic: [],
    currentPokemonId: 1,
    currentTab: 'all',
    currentTypeFilter: '',
    seenSet: new Set(),
    favorites: JSON.parse(localStorage.getItem('pokedex-favorites') || '[]'),
    pokemonCache: {},
    speciesCache: {},
    evoCache: {},
    pokemonTypeMap: {},
    menuIndex: 0,
    filteredList: [],
    listNavIndex: 0,
    currentScreen: 'loading',
    pokedexInitialized: false
};