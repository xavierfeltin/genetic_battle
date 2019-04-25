import { GameObject } from './game-object.model';

export class Health extends GameObject {
    private readonly energy: number;

    constructor(id: number) {
        super(id);
        this.energy = 10;
        this.speed = 0;
        this.radius = 5;
    }

    getEnergy(): number {
        return this.energy;
    }
}
