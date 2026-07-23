// Game Balance Configuration with Waves & Bosses
const CONFIG = {
    PLAYER_SPEED: 22,
    DASH_SPEED: 55,
    DASH_COOLDOWN: 1.0,
    JUMP_FORCE: 28,
    GRAVITY: 62,
    MOUSE_SENSITIVITY: 0.0022,

    ROCKET_JUMP_FORCE: 48,
    ROCKET_SELF_DAMAGE: 15,

    // Enemy Types & Stats
    ENEMIES: {
        CLASSIC_NOOB: { hp: 80, speed: 12, damage: 15, color: 0x0055ff, scale: 1.0 },
        SPEED_NOOB: { hp: 50, speed: 22, damage: 10, color: 0xffff00, scale: 0.85 },
        TANK_NOOB: { hp: 220, speed: 8, damage: 25, color: 0x333333, scale: 1.4 },
        BOSS_NOOB: { hp: 1200, speed: 10, damage: 40, color: 0xff0000, scale: 3.2 }
    },

    // Weapons Configuration
    WEAPONS: {
        SWORD: { name: 'REAL SWORD', damage: 75, range: 7.0, cooldown: 0.3, type: 'melee' },
        SLINGSHOT: { name: 'SLINGSHOT', damage: 35, range: 150, cooldown: 0.18, type: 'hitscan' },
        ROCKET: { name: 'ROCKET LAUNCHER', damage: 140, range: 200, cooldown: 0.75, type: 'projectile' }
    }
};
