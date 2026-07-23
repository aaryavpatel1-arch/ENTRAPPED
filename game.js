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
rocketGroup.visible = false;
weaponContainer.add(rocketGroup);

// Create Weapon Visual Models
(function buildWeaponMeshes() {
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.95, roughness: 0.1 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.4, 0.3), bladeMat);
    blade.position.y = 1.7;
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.25), new THREE.MeshStandardMaterial({ color: 0x886600 }));
    swordGroup.add(blade, hilt);

    const slMat = new THREE.MeshStandardMaterial({ color: 0x553311, roughness: 0.6 });
    const slHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8), slMat);
    const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), slMat);
    forkL.position.set(-0.25, 0.5, 0); forkL.rotation.z = -0.3;
    const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), slMat);
    forkR.position.set(0.25, 0.5, 0); forkR.rotation.z = 0.3;
    slingshotGroup.add(slHandle, forkL, forkR);

    const rTube = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.2), new THREE.MeshStandardMaterial({ color: 0x22222a, metalness: 0.9 }));
    rTube.rotation.x = Math.PI / 2;
    const rTip = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
    rTip.rotation.x = Math.PI / 2; rTip.position.z = -1.0;
    rocketGroup.add(rTube, rTip);
})();

// Projectile Manager (Working Slingshot Pellets & Rockets)
const Projectiles = {
    list: [],

    spawnPellet(origin, direction) {
        const geo = new THREE.SphereGeometry(0.35, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);
        scene.add(mesh);

        this.list.push({
            mesh, dir: direction, speed: CONFIG.WEAPONS.SLINGSHOT.speed,
            damage: CONFIG.WEAPONS.SLINGSHOT.damage, type: 'pellet', life: 2.0
        });
    },

    spawnRocket(origin, direction) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.3), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
        body.rotation.x = Math.PI / 2;
        group.add(body);
        group.position.copy(origin);
        group.lookAt(origin.clone().add(direction));
        scene.add(group);

        this.list.push({
            mesh: group, dir: direction, speed: CONFIG.WEAPONS.ROCKET.speed,
            damage: CONFIG.WEAPONS.ROCKET.damage, type: 'rocket', life: 3.0
        });
    },

    update(dt) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const p = this.list[i];
            p.life -= dt;
            p.mesh.position.addScaledVector(p.dir, p.speed * dt);

            if (p.type === 'rocket') {
                createHitParticles(p.mesh.position, 0xff5500);
            }

            let hit = false;

            NPCs.list.forEach(npc => {
                if (!npc.alive || hit) return;
                
                // Optimized Hitbox Check for Slingshot & Rockets
                const hitRadius = (p.type === 'rocket' ? 3.2 : 2.0) * npc.stats.scale;
                if (p.mesh.position.distanceTo(npc.mesh.position.clone().add(new THREE.Vector3(0, 2, 0))) < hitRadius) {
                    npc.takeDamage(p.damage);
                    StyleSystem.addScore(p.type === 'rocket' ? 80 : 35);
                    createHitParticles(p.mesh.position, p.type === 'rocket' ? 0xff0000 : 0xffff00);
                    hit = true;
                }
            });

            const bound = CONFIG.MAP_SIZE / 2 - 2;
            if (Math.abs(p.mesh.position.x) > bound || Math.abs(p.mesh.position.z) > bound || p.mesh.position.y <= 0) {
                hit = true;
            }

            if (hit || p.life <= 0) {
                if (p.type === 'rocket') {
                    AudioSystem.playExplosion();
                    triggerScreenShake(0.4, 0.2);
                    createHitParticles(p.mesh.position, 0xff0055);
                }
                scene.remove(p.mesh);
                this.list.splice(i, 1);
            }
        }
    }
};

// Particle Effects
const particles = [];
function createHitParticles(pos, color = 0xff0044) {
    for (let i = 0; i < 8; i++) {
        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const pMat = new THREE.MeshBasicMaterial({ color: color });
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.copy(pos);
        
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 16,
            Math.random() * 12 + 2,
            (Math.random() - 0.5) * 16
        );
        scene.add(p);
        particles.push({ mesh: p, vel: vel, life: 0.3 });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        p.vel.y -= 32 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }
}

// Input Manager
const Input = {
    keys: {},
    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        window.addEventListener('mousedown', () => { 
            if (Engine.state === 'PLAY') {
                AudioSystem.init();
                Player.attack();
            }
        });
        window.addEventListener('mousemove', e => {
            if (Engine.state !== 'PLAY') return;
            Player.yaw -= e.movementX * CONFIG.MOUSE_SENSITIVITY;
            Player.pitch -= e.movementY * CONFIG.MOUSE_SENSITIVITY;
            Player.pitch = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, Player.pitch));
        });
    }
};
Input.init();

// Player Entity
const Player = {
    pos: new THREE.Vector3(0, 3, 0),
    vel: new THREE.Vector3(),
    yaw: 0, pitch: 0,
    hp: 100,
    isGrounded: true,
    activeWeapon: 1,
    lastAttackTime: 0,
    lastDashTime: 0,
    isSwinging: false,
    swingTimer: 0,
    recoilTimer: 0,

    update(dt) {
        if (Engine.state !== 'PLAY') return;

        camera.rotation.order = 'YXZ';
        let shakeX = 0, shakeY = 0;
        if (screenShakeTimer > 0) {
            screenShakeTimer -= dt;
            shakeX = (Math.random() - 0.5) * screenShakeIntensity;
            shakeY = (Math.random() - 0.5) * screenShakeIntensity;
        }
        camera.rotation.set(this.pitch + shakeY, this.yaw + shakeX, 0);

        const move = new THREE.Vector3();
        if (Input.keys['KeyW']) move.z -= 1;
        if (Input.keys['KeyS']) move.z += 1;
        if (Input.keys['KeyA']) move.x -= 1;
        if (Input.keys['KeyD']) move.x += 1;
        move.normalize();

        const now = Engine.clock.getElapsedTime();
        let currentSpeed = CONFIG.PLAYER_SPEED;
        if (Input.keys['ShiftLeft'] && (now - this.lastDashTime > CONFIG.DASH_COOLDOWN)) {
            this.lastDashTime = now;
            currentSpeed = CONFIG.DASH_SPEED;
            triggerScreenShake(0.15, 0.1);
        }

        move.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.vel.x = move.x * currentSpeed;
        this.vel.z = move.z * currentSpeed;

        if (Input.keys['Space'] && this.isGrounded) {
            this.vel.y = CONFIG.JUMP_FORCE;
            this.isGrounded = false;
        }

        this.vel.y -= CONFIG.GRAVITY * dt;
        this.pos.addScaledVector(this.vel, dt);

        if (this.pos.y <= 3) {
            this.pos.y = 3;
            this.vel.y = 0;
            this.isGrounded = true;
        }

        const limit = CONFIG.MAP_SIZE / 2 - 3;
        this.pos.x = Math.max(-limit, Math.min(limit, this.pos.x));
        this.pos.z = Math.max(-limit, Math.min(limit, this.pos.z));

        camera.position.copy(this.pos);

        if (this.isSwinging) {
            this.swingTimer += dt * 16;
            swordGroup.rotation.z = -Math.sin(this.swingTimer) * 1.9;
            swordGroup.rotation.x = Math.cos(this.swingTimer) * 0.9;
            if (this.swingTimer >= Math.PI) {
                this.isSwinging = false;
                swordGroup.rotation.set(0.2, -0.4, -0.2);
            }
        }

        if (this.recoilTimer > 0) {
            this.recoilTimer -= dt * 10;
            weaponContainer.position.z = Math.sin(this.recoilTimer) * 0.25;
        } else {
            weaponContainer.position.z = 0;
        }

        if (Input.keys['Digit1']) this.switchWeapon(1);
        if (Input.keys['Digit2']) this.switchWeapon(2);
        if (Input.keys['Digit3']) this.switchWeapon(3);
    },

    switchWeapon(slot) {
        this.activeWeapon = slot;
        swordGroup.visible = (slot === 1);
        slingshotGroup.visible = (slot === 2);
        rocketGroup.visible = (slot === 3);

        const names = ['', CONFIG.WEAPONS.SWORD.name, CONFIG.WEAPONS.SLINGSHOT.name, CONFIG.WEAPONS.ROCKET.name];
        document.getElementById('weapon-display').innerText = names[slot];
    },

    attack() {
        const now = Engine.clock.getElapsedTime();
        const lookDir = new THREE.Vector3();
        camera.getWorldDirection(lookDir);

        if (this.activeWeapon === 1) { // SWORD MELEE
            if (now - this.lastAttackTime < CONFIG.WEAPONS.SWORD.cooldown) return;
            this.lastAttackTime = now;
            this.isSwinging = true;
            this.swingTimer = 0;
            AudioSystem.playSwordSlash();
            triggerScreenShake(0.12, 0.1);

            NPCs.list.forEach((npc) => {
                if (!npc.alive) return;
                if (this.pos.distanceTo(npc.mesh.position) <= CONFIG.WEAPONS.SWORD.range) {
                    const dirToNPC = new THREE.Vector3().subVectors(npc.mesh.position, this.pos).normalize();
                    if (lookDir.dot(dirToNPC) > 0.35) {
                        npc.takeDamage(CONFIG.WEAPONS.SWORD.damage);
                        StyleSystem.addScore(45);
                        triggerScreenShake(0.25, 0.12);
                        createHitParticles(npc.mesh.position, 0x00ffff);
                    }
                }
            });
        }
        else if (this.activeWeapon === 2) { // SLINGSHOT
            if (now - this.lastAttackTime < CONFIG.WEAPONS.SLINGSHOT.cooldown) return;
            this.lastAttackTime = now;
            this.recoilTimer = 1.0;
            AudioSystem.playSlingshot();

            const spawnPos = this.pos.clone().add(lookDir.clone().multiplyScalar(1.5));
            Projectiles.spawnPellet(spawnPos, lookDir);
        }
        else if (this.activeWeapon === 3) { // ROCKET LAUNCHER & ROCKET JUMP
            if (now - this.lastAttackTime < CONFIG.WEAPONS.ROCKET.cooldown) return;
            this.lastAttackTime = now;
            this.recoilTimer = 1.8;
            AudioSystem.playRocket();
            triggerScreenShake(0.35, 0.18);

            if (lookDir.y < -0.7) {
                this.vel.y = CONFIG.ROCKET_JUMP_FORCE;
                this.isGrounded = false;
                triggerScreenShake(0.5, 0.25);
                createHitParticles(this.pos, 0xffaa00);
            }

            const spawnPos = this.pos.clone().add(lookDir.clone().multiplyScalar(2.0));
            Projectiles.spawnRocket(spawnPos, lookDir);
        }
    },

    takeDamage(amt) {
        this.hp -= amt;
        document.getElementById('hp-val').innerText = `${Math.max(0, Math.floor(this.hp))} HP`;
        document.getElementById('hp-bar-fill').style.width = `${Math.max(0, this.hp)}%`;
        
        const dmgOverlay = document.getElementById('damage-overlay');
        dmgOverlay.style.opacity = '0.9';
        setTimeout(() => dmgOverlay.style.opacity = '0', 120);

        if (this.hp <= 0) {
            Engine.setState('DEAD');
        }
    }
};

// Terrifying Monster Spawner & Health Bar Manager
const NPCs = {
    list: [],
    spawnTimer: 0,

    createMonsterMesh(typeConfig) {
        const group = new THREE.Group();
        
        const headMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
        const torsoMat = new THREE.MeshStandardMaterial({ color: typeConfig.color, roughness: 0.2, metalness: 0.3 });
        const limbMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), headMat);
        head.position.y = 3.4;

        // Multiple Glowing Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: typeConfig.eyeColor });
        for (let i = 0; i < 4; i++) {
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), eyeMat);
            eye.position.set((i - 1.5) * 0.35, 3.5, 0.66);
            head.add(eye);
        }

        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 1.2), torsoMat);
        torso.position.y = 1.8;

        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), limbMat);
        leftLeg.position.set(-0.65, 0, 0);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), limbMat);
        rightLeg.position.set(0.65, 0, 0);

        // Creepy Extra Spider Legs / Tentacles
        const tentacles = [];
        const tentacleMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.2 });
        
        for (let i = 0; i < 6; i++) {
            const tentacleGroup = new THREE.Group();
            const tentacleMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.02, 3.2, 6),
                tentacleMat
            );
            tentacleMesh.position.y = 1.6;
            tentacleGroup.add(tentacleMesh);
            
            const side = (i % 2 === 0) ? -1 : 1;
            const yOffset = (Math.floor(i / 2) * 0.6) + 1.2;
            tentacleGroup.position.set(side * 0.9, yOffset, -0.4);
            tentacleGroup.rotation.z = side * 1.1;
            
            torso.add(tentacleGroup);
            tentacles.push(tentacleGroup);
        }

        // Floating Overhead Health Bar Mesh
        const hpCanvas = document.createElement('canvas');
        hpCanvas.width = 128;
        hpCanvas.height = 16;
        const hpCtx = hpCanvas.getContext('2d');
        const hpTexture = new THREE.CanvasTexture(hpCanvas);

        const hpPlaneMat = new THREE.SpriteMaterial({ map: hpTexture });
        const hpSprite = new THREE.Sprite(hpPlaneMat);
        hpSprite.position.set(0, 4.8, 0);
        hpSprite.scale.set(3.5, 0.45, 1.0);

        group.add(head, torso, leftLeg, rightLeg, hpSprite);
        group.scale.setScalar(typeConfig.scale);

        return { group, head, leftLeg, rightLeg, tentacles, hpCtx, hpTexture, hpSprite };
    },

    spawn(enemyTypeKey = 'CLASSIC_NOOB') {
        const typeConfig = CONFIG.ENEMIES[enemyTypeKey];
        const meshData = this.createMonsterMesh(typeConfig);

        const angle = Math.random() * Math.PI * 2;
        const dist = 45 + Math.random() * 25;
        meshData.group.position.set(
            Player.pos.x + Math.cos(angle) * dist,
            0,
            Player.pos.z + Math.sin(angle) * dist
        );

        scene.add(meshData.group);

        const npc = {
            mesh: meshData.group,
            head: meshData.head,
            leftLeg: meshData.leftLeg,
            rightLeg: meshData.rightLeg,
            tentacles: meshData.tentacles,
            hpCtx: meshData.hpCtx,
            hpTexture: meshData.hpTexture,
            hpSprite: meshData.hpSprite,
            stats: typeConfig,
            maxHp: typeConfig.hp,
            hp: typeConfig.hp,
            animTime: Math.random() * 10,
            alive: true,

            updateHealthBar() {
                const pct = Math.max(0, this.hp / this.maxHp);
                this.hpCtx.clearRect(0, 0, 128, 16);
                this.hpCtx.fillStyle = '#222222';
                this.hpCtx.fillRect(0, 0, 128, 16);
                this.hpCtx.fillStyle = '#ff0044';
                this.hpCtx.fillRect(2, 2, Math.floor(124 * pct), 12);
                this.hpTexture.needsUpdate = true;
            },

            takeDamage(amt) {
                AudioSystem.playHit();
                this.hp -= amt;
                this.updateHealthBar();
                
                if (this.hp <= 0) {
                    this.alive = false;
                    scene.remove(this.mesh);
                    NPCs.checkWaveCompletion();
                }
            }
        };

        npc.updateHealthBar();
        this.list.push(npc);
        this.updateCount();
    },

    checkWaveCompletion() {
        this.updateCount();
        const activeCount = this.list.filter(n => n.alive).length;
        if (activeCount === 0 && Engine.enemiesToSpawnInWave <= 0) {
            Engine.nextWave();
        }
    },

    updateCount() {
        const activeCount = this.list.filter(n => n.alive).length;
        document.getElementById('ui-enemies').innerText = activeCount;
    },

    update(dt) {
        if (Engine.state !== 'PLAY') return;

        this.spawnTimer += dt;
        if (this.spawnTimer > 1.6 && Engine.enemiesToSpawnInWave > 0) {
            if (Engine.isBossWave) {
                this.spawn('BOSS_NOOB');
                Engine.enemiesToSpawnInWave = 0;
            } else {
                const keys = ['CLASSIC_NOOB', 'SPEED_NOOB', 'TANK_NOOB', 'STALKER_NOOB', 'CRAWLER_NOOB'];
                const pickedKey = keys[Math.floor(Math.random() * keys.length)];
                this.spawn(pickedKey);
                Engine.enemiesToSpawnInWave--;
            }
            this.spawnTimer = 0;
        }

        this.list.forEach(npc => {
            if (!npc.alive) return;

            npc.animTime += dt * 14;

            // Terrifying Animations: twitchy head, writhing extra limbs
            npc.leftLeg.rotation.x = Math.sin(npc.animTime) * 0.9;
            npc.rightLeg.rotation.x = -Math.sin(npc.animTime) * 0.9;
            npc.head.rotation.y = (Math.random() > 0.92 ? (Math.random() - 0.5) * 2 : Math.sin(npc.animTime * 2) * 0.4);

            npc.tentacles.forEach((tentacle, index) => {
                tentacle.rotation.x = Math.sin(npc.animTime * 2.0 + index) * 0.8;
                tentacle.rotation.z = Math.cos(npc.animTime * 2.0 + index) * 0.6;
            });

            // Keep Health Bar billboard facing camera
            npc.hpSprite.quaternion.copy(camera.quaternion);

            const dir = new THREE.Vector3().subVectors(Player.pos, npc.mesh.position);
            dir.y = 0;
            
            if (dir.length() > 2.2) {
                dir.normalize();
                npc.mesh.position.addScaledVector(dir, npc.stats.speed * dt);
                npc.mesh.lookAt(Player.pos.x, 0, Player.pos.z);
            } else {
                Player.takeDamage(npc.stats.damage * dt * 2);
            }

            const limit = CONFIG.MAP_SIZE / 2 - 3;
            npc.mesh.position.x = Math.max(-limit, Math.min(limit, npc.mesh.position.x));
            npc.mesh.position.z = Math.max(-limit, Math.min(limit, npc.mesh.position.z));
        });
    }
};

// Menu Actions
document.getElementById('btn-start').onclick = () => Engine.setState('PLAY');
document.getElementById('btn-resume').onclick = () => Engine.setState('PLAY');
document.getElementById('btn-restart').onclick = () => location.reload();

window.addEventListener('keydown', e => {
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (Engine.state === 'PLAY') Engine.setState('PAUSE');
        else if (Engine.state === 'PAUSE') Engine.setState('PLAY');
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main Animation Engine Loop
function animate() {
    requestAnimationFrame(animate);
    const dt = Engine.clock.getDelta();

    Player.update(dt);
    NPCs.update(dt);
    Projectiles.update(dt);
    StyleSystem.update(dt);
    updateParticles(dt);

    renderer.render(scene, camera);
}
animate();
