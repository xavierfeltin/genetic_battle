export interface Scoring {
    id: number;
    nbHealthPack: number;
    damageReceived: number;
    accuracy: number;
    missileLaunched: number;
    touchedEnnemies: number;
    destroyedEnnemies: number;
    missileDestroyed: number;
    score: number;
    fitness?: number;
    state: string;
    stamp: number; // in seconds
    generation?: number;
    evaluation?: number;
    lifespan?: number;
    life?: number;
}
