import { GameObject } from './game-object.model';

export class Missile extends GameObject {
    private readonly maxShipSpeed: number = 8;
    public launchedBy: number;
    
    constructor(id: number, parent: number) {
        super(id);
        this.speed = this.maxShipSpeed;
        this.radius = 5;
        this.launchedBy = parent;
        this.energy = -20;
    }
}