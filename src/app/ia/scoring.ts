export interface Scoring {
    id: number;
    nbHealthPack: number;
    damageReceived: number;
    accuracy: number;
    score: number;
    state: string;
    stamp: number; // in seconds
    generation?: number;
    lifespan?: number;    
}
