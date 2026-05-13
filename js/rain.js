import { $ } from './dom.js';

let rainCanvas, rainCtx, rainAnimId;
let fallingPokemons = [];
let pokemonRainImages = [];
let rainImagesLoaded = false;

export function initPokemonRain() {
    rainCanvas = $('pokemon-rain-canvas');
    rainCtx = rainCanvas.getContext('2d');
    resizeRainCanvas();
    window.addEventListener('resize', resizeRainCanvas);

    if (!rainImagesLoaded) loadRainImages();
    else startRain();
}

export function stopRain() {
    if (rainAnimId) cancelAnimationFrame(rainAnimId);
    rainAnimId = null;
    fallingPokemons = [];
    if (rainCtx && rainCanvas)
        rainCtx.clearRect(0, 0,
            rainCanvas.width,
            rainCanvas.height);
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
            pokemonRainImages.push(img); done();
        };
        img.onerror = () => {
            done();
        };
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
    });

    function done(){
        loaded++;
        if (loaded === ids.length) {
            rainImagesLoaded = true;
            startRain();
        }
    }
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
        if (p) { p.y = Math.random() * rainCanvas.height; fallingPokemons.push(p);
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