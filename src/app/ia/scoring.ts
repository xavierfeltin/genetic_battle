export interface Scoring {
    id: number;
    nbHealthPack: number;
    damageReceived: number;
    accuracy: number;
    score: number;
    state: string;
    generation?: number;
    lifespan?: number;
}
