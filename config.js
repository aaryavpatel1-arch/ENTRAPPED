// Game Balance Configuration with Waves, Bosses & Map Themes
const CONFIG = {
    PLAYER_SPEED: 22,
    DASH_SPEED: 55,
    DASH_COOLDOWN: 1.0,
    JUMP_FORCE: 28,
    GRAVITY: 62,
    MOUSE_SENSITIVITY: 0.0022,
    MAP_SIZE: 320, // Boundary walls limit

    ROCKET_JUMP_FORCE: 48,
    ROCKET_SELF_DAMAGE: 15,

    // Map Environment Themes (Rotates Every 10 Waves after Boss Defeat)
    THEMES: [
        { name: 'CYBER VOID', bg: 0x020205, fog: 0x020205, floor: 0x080810, grid1: 0x00ffff, grid2: 0xff0055 },
        { name: 'BLOOD ARENA', bg: 0x0a0002, fog: 0x0a0002, floor: 0x150205, grid1: 0xff0000, grid2: 0x550000 },
        { name: 'TOXIC WASTELAND', bg: 0x010a02, fog: 0x010a02, floor: 0x051508, grid1: 0x00ff44, grid2: 0x005511 },
        { name: 'SHADOW REALM', bg: 0x000000, fog: 0x000000, floor: 0x030303, grid1: 0x8800ff, grid2: 0x220044 }
    ],

    // Scary Enemy Types & Stats
    ENEMIES: {
        CLASSIC_NOOB: { hp: 80, speed: 12, damage: 15, color: 0x0055ff, scale: 1.0, eyeColor: 0xff0000 },
        SPEED_NOOB: { hp: 50, speed: 22, damage: 10, color: 0xffff00, scale: 0.85, eyeColor: 0xff0000 },
        TANK_NOOB: { hp: 220, speed: 8, damage: 25, color: 0x222222, scale: 1.4, eyeColor: 0xff0000 },
        STALKER_NOOB: { hp: 90, speed: 18, damage: 20, color: 0x111111, scale: 1.1, eyeColor: 0x00ffff },
        CRAWLER_NOOB: { hp: 60, speed: 25, damage: 12, color: 0x440000, scale: 0.7, eyeColor: 0xffff00 },
        BOSS_NOOB: { hp: 1400, speed: 11, damage: 45, color: 0xff0000, scale: 3.5, eyeColor: 0xffffff }
    },

    WEAPONS: {
        SWORD: { name: 'REAL SWORD', damage: 85, range: 7.5, cooldown: 0.28, type: 'melee' },
        SLINGSHOT: { name: 'SLINGSHOT', damage: 40, speed: 180, cooldown: 0.16, type: 'projectile' },
        ROCKET: { name: 'ROCKET LAUNCHER', damage: 160, speed: 90, cooldown: 0.75, type: 'projectile' }
    }
};
