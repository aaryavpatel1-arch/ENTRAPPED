// Game Engine State
const Engine = {
    clock: new THREE.Clock(),
    state: 'MENU',
    
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
    }
};

// WebAudio Sound Effects Generator
const AudioSystem = {
    ctx: null,
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    playLaser() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    playHit() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
};

// Scene & World Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a12);
scene.fog = new THREE.FogExp2(0x0a0a12, 0.008);

const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Environment Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

// Level Geometry (Floor + Pillars)
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshLambertMaterial({ color: 0x1a1a24 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Generate Arena Obstacles
const pillarGeo = new THREE.BoxGeometry(6, 20, 6);
const pillarMat = new THREE.MeshLambertMaterial({ color: 0x333344 });
for (let i = 0; i < 16; i++) {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(
        (Math.random() - 0.5) * 200,
        10,
        (Math.random() - 0.5) * 200
    );
    scene.add(pillar);
}

// Player Input System
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
    lastShot: 0,

    update(dt) {
        if (Engine.state !== 'PLAY') return;

        // Mouse Look
        camera.rotation.order = 'YXZ';
        camera.rotation.set(this.pitch, this.yaw, 0);

        // Direction Vectors
        const move = new THREE.Vector3();
        if (Input.keys['KeyW']) move.z -= 1;
        if (Input.keys['KeyS']) move.z += 1;
        if (Input.keys['KeyA']) move.x -= 1;
        if (Input.keys['KeyD']) move.x += 1;
        move.normalize();

        const speed = Input.keys['ShiftLeft'] ? CONFIG.DASH_SPEED : CONFIG.PLAYER_SPEED;
        move.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        
        this.vel.x = move.x * speed;
        this.vel.z = move.z * speed;

        // Jump Physics
        if (Input.keys['Space'] && this.isGrounded) {
            this.vel.y = CONFIG.JUMP_FORCE;
            this.isGrounded = false;
        }

        // Apply Gravity
        this.vel.y -= CONFIG.GRAVITY * dt;
        this.pos.addScaledVector(this.vel, dt);

        // Floor Collision
        if (this.pos.y <= 3) {
            this.pos.y = 3;
            this.vel.y = 0;
            this.isGrounded = true;
        }

        camera.position.copy(this.pos);

        // Weapon Selector Input
        if (Input.keys['Digit1']) {
            this.activeWeapon = 1;
            document.getElementById('weapon-display').innerText = CONFIG.WEAPONS.SLINGSHOT.name;
        }
        if (Input.keys['Digit2']) {
            this.activeWeapon = 2;
            document.getElementById('weapon-display').innerText = CONFIG.WEAPONS.ROCKET.name;
        }
    },

    attack() {
        AudioSystem.playLaser();
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
        
        NPCs.list.forEach((npc) => {
            if (!npc.alive) return;
            const intersects = raycaster.intersectObject(npc.mesh);
            if (intersects.length > 0) {
                const dmg = this.activeWeapon === 1 ? CONFIG.WEAPONS.SLINGSHOT.damage : CONFIG.WEAPONS.ROCKET.damage;
                npc.takeDamage(dmg);
            }
        });
    },

    takeDamage(amt) {
        this.hp -= amt;
        document.getElementById('hp-val').innerText = `${Math.max(0, this.hp)} HP`;
        document.getElementById('hp-bar-fill').style.width = `${Math.max(0, this.hp)}%`;
        
        const dmgOverlay = document.getElementById('damage-overlay');
        dmgOverlay.style.opacity = '0.8';
        setTimeout(() => dmgOverlay.style.opacity = '0', 120);

        if (this.hp <= 0) {
            Engine.setState('DEAD');
        }
    }
};

// Hostile NPC System
const NPCs = {
    list: [],
    spawnTimer: 0,

    spawn() {
        const geo = new THREE.BoxGeometry(2, 4, 2);
        const mat = new THREE.MeshLambertMaterial({ color: 0xff0055 });
        const mesh = new THREE.Mesh(geo, mat);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 30;
        mesh.position.set(
            Player.pos.x + Math.cos(angle) * dist,
            2,
            Player.pos.z + Math.sin(angle) * dist
        );

        scene.add(mesh);

        const npc = {
            mesh,
            hp: CONFIG.NPC_MAX_HEALTH,
            alive: true,
            takeDamage(amt) {
                AudioSystem.playHit();
                this.hp -= amt;
                this.mesh.material.color.setHex(0xffffff);
                setTimeout(() => { if (this.alive) this.mesh.material.color.setHex(0xff0055); }, 80);
                
                if (this.hp <= 0) {
                    this.alive = false;
                    scene.remove(this.mesh);
                    NPCs.updateCount();
                }
            }
        };

        this.list.push(npc);
        this.updateCount();
    },

    updateCount() {
        const activeCount = this.list.filter(n => n.alive).length;
        document.getElementById('ui-enemies').innerText = activeCount;
    },

    update(dt) {
        if (Engine.state !== 'PLAY') return;

        this.spawnTimer += dt;
        if (this.spawnTimer > 2.5 && this.list.filter(n => n.alive).length < 10) {
            this.spawn();
            this.spawnTimer = 0;
        }

        this.list.forEach(npc => {
            if (!npc.alive) return;

            const dir = new THREE.Vector3().subVectors(Player.pos, npc.mesh.position);
            dir.y = 0;
            
            if (dir.length() > 2.2) {
                dir.normalize();
                npc.mesh.position.addScaledVector(dir, CONFIG.NPC_SPEED * dt);
                npc.mesh.lookAt(Player.pos.x, 2, Player.pos.z);
            } else {
                Player.takeDamage(CONFIG.NPC_DAMAGE * dt * 2);
            }
        });
    }
};

// Attach Menu Controls
document.getElementById('btn-start').onclick = () => Engine.setState('PLAY');
document.getElementById('btn-resume').onclick = () => Engine.setState('PLAY');
document.getElementById('btn-restart').onclick = () => location.reload();

window.addEventListener('keydown', e => {
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (Engine.state === 'PLAY') Engine.setState('PAUSE');
        else if (Engine.state === 'PAUSE') Engine.setState('PLAY');
    }
});

// Resize Handling
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

    renderer.render(scene, camera);
}
animate();
