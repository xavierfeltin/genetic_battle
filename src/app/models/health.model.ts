import { GameObject } from './game-object.model';

export class Health extends GameObject {
    public static readonly DEFAULT_HEALING: number = 5;

    constructor(id: number, healing: number) {
        super(id);
        this.energy = healing;
        this.speed = 0;
        this.radius = 5;
    }
}

export class FactoryHealth {
    private healing: number;

    public constructor(healing: number = Health.DEFAULT_HEALING) {
        this.healing = healing;
    }

    public getHealing(): number {
        return this.healing;
    }

    public setHealing(healing: number) {
        this.healing = healing;
    }

    public create(id: number): Health {
        return new Health(id, this.healing);
    }
}