export interface Configuration {
    nbStartingShips: number;
    energyFuel: number;
    energyFire: number;
    damageMissile: number;
    nbStartingHealth: number;
    rateHealth: number;
    nbHealthDestroyingShip: number;
    lifeFromHealth: number;
    cloneRate: number;
    crossOverRate: number;
    mutationRate: number;
    evolutionMode: string;
    resetSimulation: boolean;
    debugMode: boolean;
}
