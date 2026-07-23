// Game Engine State & Wave Logic
const Engine = {
    clock: new THREE.Clock(),
    state: 'MENU',
    currentWave: 1,
    enemiesToSpawnInWave: 10,
    isBossWave: false,
    
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
        this.enemiesToSpawnInWave = this.isBossWave ? 1 : 10 + (this.currentWave * 2);
        
        const waveUI = document.getElementById('ui-wave');
        if (waveUI) {
            waveUI.innerText = this.isBossWave ? `${this.currentWave} [BOSS PHASE]` : this.currentWave;
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

// Audio System
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
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },
    playRocket() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    },
    playHit() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }
};

// World & Graphics Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205);
scene.fog = new THREE.FogExp2(0x020205, 0.012);

const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

// Dynamic Lighting
scene.add(new THREE.AmbientLight(0x332244, 1.2));
const sunLight = new THREE.DirectionalLight(0xff0055, 2.0);
sunLight.position.set(40, 100, 30);
scene.add(sunLight);

// Floor Grid
const gridHelper = new THREE.GridHelper(350, 70, 0x00ffff, 0xff0055);
gridHelper.position.y = 0.05;
scene.add(gridHelper);

const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(350, 350),
    new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.1, metalness: 0.8 })
);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

// Screen Shake Engine
let screenShakeTimer = 0;
let screenShakeIntensity = 0;
function triggerScreenShake(intensity = 0.3, duration = 0.15) {
    screenShakeIntensity = intensity;
    screenShakeTimer = duration;
}

// ============================================================================
// GLTF LOADER SETUP & WEAPON MODELS
// ============================================================================
const gltfLoader = new THREE.GLTFLoader();
const weaponContainer = new THREE.Group();
camera.add(weaponContainer);
scene.add(camera);

// Weapon Groups
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

// Create Procedural Fallback Weapons
function createProceduralFallbackWeapons() {
    // Fallback Sword
    const bladeGeo = new THREE.BoxGeometry(0.1, 3.4, 0.3);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.1 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 1.7;
    const hiltGeo = new THREE.BoxGeometry(0.7, 0.1, 0.25);
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0x886600, metalness: 0.8 });
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    swordGroup.add(blade, hilt);

    // Fallback Slingshot
    const slHandleMat = new THREE.MeshStandardMaterial({ color: 0x553311, roughness: 0.6 });
    const slHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8), slHandleMat);
    const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), slHandleMat);
    forkL.position.set(-0.25, 0.5, 0); forkL.rotation.z = -0.3;
    const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), slHandleMat);
    forkR.position.set(0.25, 0.5, 0); forkR.rotation.z = 0.3;
    slingshotGroup.add(slHandle, forkL, forkR);

    // Fallback Rocket Launcher
    const rTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x22222a, metalness: 0.9, roughness: 0.2 })
    );
    rTube.rotation.x = Math.PI / 2;
    const rTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.3),
        new THREE.MeshBasicMaterial({ color: 0xff0055 })
    );
    rTip.rotation.x = Math.PI / 2;
    rTip.position.z = -1.0;
    rocketGroup.add(rTube, rTip);
}
createProceduralFallbackWeapons();

// Helper Function to Load External 3D GLTF/GLB Models
function loadCustomModel(path, targetGroup, scale = 1, rotation = [0,0,0], position = [0,0,0]) {
    gltfLoader.load(
        path,
        (gltf) => {
            // Remove fallback procedural meshes if custom model successfully loads
            while (targetGroup.children.length > 0) {
                targetGroup.remove(targetGroup.children[0]);
            }
            const model = gltf.scene;
            model.scale.setScalar(scale);
            model.rotation.set(rotation[0], rotation[1], rotation[2]);
            model.position.set(position[0], position[1], position[2]);
            targetGroup.add(model);
            console.log(`Successfully loaded model: ${path}`);
        },
        undefined,
        (error) => {
            console.warn(`Could not load GLTF model from '${path}'. Using procedural model fallback.`, error);
        }
    );
}

// To use custom 3D model files, place your .gltf/.glb files in your folder and uncomment these lines:
// loadCustomModel('models/sword.glb', swordGroup, 1.0, [0, 0, 0], [0, 0, 0]);
// loadCustomModel('models/slingshot.glb', slingshotGroup, 1.0, [0, 0, 0], [0, 0, 0]);
// loadCustomModel('models/rocket_launcher.glb', rocketGroup, 1.0, [0, 0, 0], [0, 0, 0]);

// Particle FX
const particles = [];
function createHitParticles(pos, color = 0xff0044) {
    for (let i = 0; i < 14; i++) {
        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const pMat = new THREE.MeshBasicMaterial({ color: color });
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.copy(pos);
        
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 18,
            Math.random() * 15 + 3,
            (Math.random() - 0.5) * 18
        );
        scene.add(p);
        particles.push({ mesh: p, vel: vel, life: 0.35 });
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

// Input System
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

        if (this.activeWeapon === 1) { // SWORD
            if (now - this.lastAttackTime < CONFIG.WEAPONS.SWORD.cooldown) return;
            this.lastAttackTime = now;
            this.isSwinging = true;
            this.swingTimer = 0;
            AudioSystem.playSwordSlash();
            triggerScreenShake(0.12, 0.1);

            NPCs.list.forEach((npc) => {
                if (!npc.alive) return;
                const dist = this.pos.distanceTo(npc.mesh.position);
                if (dist <= CONFIG.WEAPONS.SWORD.range) {
                    const dirToNPC = new THREE.Vector3().subVectors(npc.mesh.position, this.pos).normalize();
                    const lookDir = new THREE.Vector3();
                    camera.getWorldDirection(lookDir);
                    
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

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
            
            NPCs.list.forEach((npc) => {
                if (!npc.alive) return;
                const intersects = raycaster.intersectObject(npc.mesh, true);
                if (intersects.length > 0) {
                    npc.takeDamage(CONFIG.WEAPONS.SLINGSHOT.damage);
                    StyleSystem.addScore(25);
                    createHitParticles(intersects[0].point, 0xffff00);
                }
            });
        }
        else if (this.activeWeapon === 3) { // ROCKET LAUNCHER & ROCKET JUMP
            if (now - this.lastAttackTime < CONFIG.WEAPONS.ROCKET.cooldown) return;
            this.lastAttackTime = now;
            this.recoilTimer = 1.8;
            AudioSystem.playRocket();
            triggerScreenShake(0.35, 0.18);

            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            if (lookDir.y < -0.7) { 
                this.vel.y = CONFIG.ROCKET_JUMP_FORCE;
                this.isGrounded = false;
                this.takeDamage(CONFIG.ROCKET_SELF_DAMAGE);
                triggerScreenShake(0.5, 0.25);
                createHitParticles(this.pos, 0xffaa00);
            }

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0,0), camera);

            NPCs.list.forEach((npc) => {
                if (!npc.alive) return;
                const intersects = raycaster.intersectObject(npc.mesh, true);
                if (intersects.length > 0) {
                    npc.takeDamage(CONFIG.WEAPONS.ROCKET.damage);
                    StyleSystem.addScore(80);
                    createHitParticles(intersects[0].point, 0xffaa00);
                }
            });
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

// Enemy & Boss Spawner System
const NPCs = {
    list: [],
    spawnTimer: 0,

    createNoobMesh(typeConfig) {
        const group = new THREE.Group();
        
        const headMat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        const torsoMat = new THREE.MeshLambertMaterial({ color: typeConfig.color });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), headMat);
        head.position.y = 3.2;

        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 1.0), torsoMat);
        torso.position.y = 1.8;

        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.9), legMat);
        leftLeg.position.set(-0.55, 0, 0);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.9), legMat);
        rightLeg.position.set(0.55, 0, 0);

        group.add(head, torso, leftLeg, rightLeg);
        group.scale.setScalar(typeConfig.scale);

        return group;
    },

    spawn(enemyTypeKey = 'CLASSIC_NOOB') {
        const typeConfig = CONFIG.ENEMIES[enemyTypeKey];
        const group = this.createNoobMesh(typeConfig);

        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 30;
        group.position.set(
            Player.pos.x + Math.cos(angle) * dist,
            0,
            Player.pos.z + Math.sin(angle) * dist
        );

        scene.add(group);

        const npc = {
            mesh: group,
            stats: typeConfig,
            hp: typeConfig.hp,
            alive: true,
            takeDamage(amt) {
                AudioSystem.playHit();
                this.hp -= amt;
                
                if (this.hp <= 0) {
                    this.alive = false;
                    scene.remove(this.mesh);
                    NPCs.checkWaveCompletion();
                }
            }
        };

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
        if (this.spawnTimer > 1.8 && Engine.enemiesToSpawnInWave > 0) {
            if (Engine.isBossWave) {
                this.spawn('BOSS_NOOB');
                Engine.enemiesToSpawnInWave = 0;
            } else {
                const keys = ['CLASSIC_NOOB', 'SPEED_NOOB', 'TANK_NOOB'];
                const pickedKey = keys[Math.floor(Math.random() * keys.length)];
                this.spawn(pickedKey);
                Engine.enemiesToSpawnInWave--;
            }
            this.spawnTimer = 0;
        }

        this.list.forEach(npc => {
            if (!npc.alive) return;

            const dir = new THREE.Vector3().subVectors(Player.pos, npc.mesh.position);
            dir.y = 0;
            
            if (dir.length() > 2.2) {
                dir.normalize();
                npc.mesh.position.addScaledVector(dir, npc.stats.speed * dt);
                npc.mesh.lookAt(Player.pos.x, 0, Player.pos.z);
            } else {
                Player.takeDamage(npc.stats.damage * dt * 2);
            }
        });
    }
};

// Interface Listeners
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

// Main Loop
function animate() {
    requestAnimationFrame(animate);
    const dt = Engine.clock.getDelta();

    Player.update(dt);
    NPCs.update(dt);
    StyleSystem.update(dt);
    updateParticles(dt);

    renderer.render(scene, camera);
}
animate();
