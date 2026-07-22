// Game Balance Configuration
const CONFIG = {
    // Movement Parameters
    PLAYER_SPEED: 20,
    DASH_SPEED: 45,
    JUMP_FORCE: 26,
    GRAVITY: 60,
    MOUSE_SENSITIVITY: 0.0022,

    // NPC & Combat Setup
    NPC_SPEED: 11,
    NPC_DAMAGE: 15,
    NPC_MAX_HEALTH: 100,

    // Weapon Profiles
    WEAPONS: {
        SLINGSHOT: { name: 'SLINGSHOT', damage: 35, fireRate: 0.2, type: 'hitscan' },
        ROCKET: { name: 'ROCKET LAUNCHER', damage: 120, fireRate: 0.8, type: 'projectile' }
    }
};
