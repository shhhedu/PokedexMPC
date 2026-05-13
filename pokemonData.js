const pokemonDatabase = [
  {
    id: 1,
    name: "Bulbasaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif",
    stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    weight: 6.9,
    height: 0.7,
    ability: "Overgrow"
  },
  {
    id: 4,
    name: "Charmander",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/4.gif",
    stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    weight: 8.5,
    height: 0.6,
    ability: "Blaze"
  },
  {
    id: 7,
    name: "Squirtle",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif",
    stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    weight: 9.0,
    height: 0.5,
    ability: "Torrent"
  },
  {
    id: 25,
    name: "Pikachu",
    types: ["electric"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif",
    stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    weight: 6.0,
    height: 0.4,
    ability: "Static"
  },
  {
    id: 39,
    name: "Jigglypuff",
    types: ["normal", "fairy"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/39.gif",
    stats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 },
    weight: 5.5,
    height: 0.5,
    ability: "Cute Charm"
  },
  {
    id: 52,
    name: "Meowth",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/52.gif",
    stats: { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90 },
    weight: 4.2,
    height: 0.4,
    ability: "Pickup"
  },
  {
    id: 54,
    name: "Psyduck",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/54.gif",
    stats: { hp: 50, atk: 52, def: 48, spa: 65, spd: 50, spe: 55 },
    weight: 19.6,
    height: 0.8,
    ability: "Damp"
  },
  {
    id: 58,
    name: "Growlithe",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/58.gif",
    stats: { hp: 55, atk: 70, def: 45, spa: 70, spd: 50, spe: 60 },
    weight: 19.0,
    height: 0.7,
    ability: "Intimidate"
  },
  {
    id: 63,
    name: "Abra",
    types: ["psychic"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/63.gif",
    stats: { hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90 },
    weight: 19.5,
    height: 0.9,
    ability: "Synchronize"
  },
  {
    id: 66,
    name: "Machop",
    types: ["fighting"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/66.gif",
    stats: { hp: 70, atk: 80, def: 50, spa: 35, spd: 35, spe: 35 },
    weight: 19.5,
    height: 0.8,
    ability: "Guts"
  },
  {
    id: 74,
    name: "Geodude",
    types: ["rock", "ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/74.gif",
    stats: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 },
    weight: 20.0,
    height: 0.4,
    ability: "Rock Head"
  },
  {
    id: 81,
    name: "Magnemite",
    types: ["electric", "steel"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/81.gif",
    stats: { hp: 25, atk: 35, def: 70, spa: 95, spd: 55, spe: 45 },
    weight: 6.0,
    height: 0.3,
    ability: "Magnet Pull"
  },
  {
    id: 92,
    name: "Gastly",
    types: ["ghost", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/92.gif",
    stats: { hp: 30, atk: 35, def: 30, spa: 100, spd: 35, spe: 80 },
    weight: 0.1,
    height: 1.3,
    ability: "Levitate"
  },
  {
    id: 133,
    name: "Eevee",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/133.gif",
    stats: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 },
    weight: 6.5,
    height: 0.3,
    ability: "Run Away"
  },
  {
    id: 143,
    name: "Snorlax",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/143.gif",
    stats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 },
    weight: 460.0,
    height: 2.1,
    ability: "Immunity"
  }
];

if (typeof window !== 'undefined') {
  window.pokemonDatabase = pokemonDatabase;
}
