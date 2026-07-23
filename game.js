// Game Engine State & Environment Logic
const Engine = {
    clock: new THREE.Clock(),
    state: 'MENU',
    currentWave: 1,
    enemiesToSpawnInWave: 10,
    isBossWave: false,
    themeIndex: 0,
    
    setState(newState) {
        this.state = newState;
        document.getElementById('menu-main').style.display = newState === 'MENU' ? 'flex' : 'none';
        document.getElementById('menu-pause').style.display = newState === 'PAUSE' ? 'flex' : 'none';
        document.getElementById('menu-death').style.display = newState === 'DEAD' ? 'flex' : 'none';
        
        if (newState === 'PLAY') {
            document.body.requestPointerLock();
            this.clock.getDelta();
        } else {
            document.exitPointerLock();
        }
    },

    nextWave() {
        this.currentWave++;
        this.isBossWave = (this.currentWave % 10 === 0);
        
        if ((this.currentWave - 1) % 10 === 0 && this.currentWave > 1) {
            this.themeIndex = (this.themeIndex + 1) % CONFIG.THEMES.length;
            Environment.applyTheme(this.themeIndex);
        }

        this.enemiesToSpawnInWave = this.isBossWave ? 1 : 10 + (this.currentWave * 2);
        
        const waveUI = document.getElementById('ui-wave');
        if (waveUI) {
            waveUI.innerText = this.isBossWave ? `${this.currentWave} [BOSS PHASE]` : `${this.currentWave} (${CONFIG.THEMES[this.themeIndex].name})`;
        }
    }
};

// Style System Ranks
const StyleSystem = {
    score: 0,
    rankIndex: 0,
    ranks: ['DESTRUCTIVE', 'CHAOTIC', 'BRUTAL', 'ANNIHILATION', 'ULTRAKILL'],
    colors: ['#ffcc00', '#ff9900', '#ff3300', '#ff0055', '#00ffff'],

    addScore(amt) {
        this.score += amt;
        this.rankIndex = Math.min(Math.floor(this.score / 150), this.ranks.length - 1);
        this.updateHUD();
    },

    update(dt) {
        if (this.score > 0) {
            this.score = Math.max(0, this.score - dt * 25);
            this.rankIndex = Math.min(Math.floor(this.score / 150), this.ranks.length - 1);
            this.updateHUD();
        }
    },

    updateHUD() {
        const rankText = document.getElementById('style-rank-text');
        const multText = document.getElementById('style-mult');
        if (rankText && multText) {
            rankText.innerText = this.ranks[this.rankIndex];
            rankText.style.color = this.colors[this.rankIndex];
            multText.innerText = `x${(1 + this.rankIndex * 0.5).toFixed(1)}`;
        }
    }
};

// Audio Synthesizer
const AudioSystem = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playSwordSlash() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    },
    playSlingshot() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    },
    playRocket() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    playExplosion() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    },
    playHit() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
};

// Scene & Lighting Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x332244, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xff0055, 2.0);
sunLight.position.set(40, 100, 30);
scene.add(sunLight);

// Environment Manager (Dynamic Themes & Boundary Walls)
const Environment = {
    floorMesh: null,
    gridHelper: null,
    walls: [],

    init() {
        const size = CONFIG.MAP_SIZE;
        const floorGeo = new THREE.PlaneGeometry(size, size);
        const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.8 });
        this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
        this.floorMesh.rotation.x = -Math.PI / 2;
        scene.add(this.floorMesh);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0x11111a, metalness: 0.9, roughness: 0.3 });
        const wallHeight = 40;
        const halfSize = size / 2;

        const wallConfigs = [
            { pos: [0, wallHeight/2, -halfSize], size: [size, wallHeight, 2] },
            { pos: [0, wallHeight/2, halfSize], size: [size, wallHeight, 2] },
            { pos: [-halfSize, wallHeight/2, 0], size: [2, wallHeight, size] },
            { pos: [halfSize, wallHeight/2, 0], size: [2, wallHeight, size] }
        ];

        wallConfigs.forEach(cfg => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(...cfg.size), wallMat);
            wall.position.set(...cfg.pos);
            scene.add(wall);
            this.walls.push(wall);
        });

        this.applyTheme(0);
    },

    applyTheme(themeIdx) {
        const theme = CONFIG.THEMES[themeIdx];
        scene.background = new THREE.Color(theme.bg);
        scene.fog = new THREE.FogExp2(theme.fog, 0.012);

        this.floorMesh.material.color.setHex(theme.floor);

        if (this.gridHelper) scene.remove(this.gridHelper);
        this.gridHelper = new THREE.GridHelper(CONFIG.MAP_SIZE, 60, theme.grid1, theme.grid2);
        this.gridHelper.position.y = 0.05;
        scene.add(this.gridHelper);

        sunLight.color.setHex(theme.grid2);
    }
};
Environment.init();

// Screen Shake Engine
let screenShakeTimer = 0;
let screenShakeIntensity = 0;
function triggerScreenShake(intensity = 0.3, duration = 0.15) {
    screenShakeIntensity = intensity;
    screenShakeTimer = duration;
}

// 3D Weapon Models Setup
const gltfLoader = new THREE.GLTFLoader();
const weaponContainer = new THREE.Group();
camera.add(weaponContainer);
scene.add(camera);

// Viewmodel Groups
const swordGroup = new THREE.Group();
swordGroup.position.set(0.6, -0.6, -1.1);
weaponContainer.add(swordGroup);

const slingshotGroup = new THREE.Group();
slingshotGroup.position.set(0.5, -0.5, -0.9);
slingshotGroup.visible = false;
weaponContainer.add(slingshotGroup);

const rocketGroup = new THREE.Group();
rocketGroup.position.set(0.6, -0.5, -1.0);
rocketGroup
