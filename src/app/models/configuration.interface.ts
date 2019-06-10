export interface Configuration {
    nbStartingShips: number;
    maxShips: number;
    energyFuel: number;
    energyFire: number;
    damageMissile: number;
    nbStartingHealth: number;
    rateHealth: number;
    nbHealthDestroyingShip: number;
    lifeFromHealth: number;
    cloneRate: number;
    breedingRate: number;
    mutationRate: number;
    crossOverRate: number;
    evolutionMode: string;
    resetSimulation: boolean;
    debugMode: boolean;
}
