import { GameObject } from './game-object.model';

export class Health extends GameObject {
    
    constructor(id: number) {
        super(id);
        this.energy = 5;
        this.speed = 0;
        this.radius = 5;
    }
}
