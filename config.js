// Game Balance Configuration - Combat Initiation Edition
const CONFIG = {
    // Player Physics & Movement
    PLAYER_SPEED: 22,
    DASH_SPEED: 50,
    JUMP_FORCE: 28,
    GRAVITY: 62,
    MOUSE_SENSITIVITY: 0.0022,

    // Scary NPC Mechanics
    NPC_SPEED: 14,
    NPC_DAMAGE: 20,
    NPC_MAX_HEALTH: 120,
    NPC_TWITCH_INTENSITY: 0.15, // Eerie erratic jitter motion

    // Weapons Profiles (1: Sword, 2: Slingshot, 3: Rocket)
    WEAPONS: {
        SWORD: { 
            name: 'CLASSIC SWORD', 
            damage: 65, 
            range: 6.5, 
            cooldown: 0.35, 
            type: 'melee' 
        },
        SLINGSHOT: { 
            name: 'SLINGSHOT', 
            damage: 35, 
            range: 150, 
            cooldown: 0.2, 
            type: 'hitscan' 
        },
        ROCKET: { 
            name: 'ROCKET LAUNCHER', 
            damage: 130, 
            range: 200, 
            cooldown: 0.8, 
            type: 'projectile' 
        }
    }
};
