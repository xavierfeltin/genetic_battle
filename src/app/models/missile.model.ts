import { GameObject } from './game-object.model';

export class Missile extends GameObject {
    public static readonly DEFAULT_DAMAGE: number = -40;
    private readonly maxShipSpeed: number = 8;
    public launchedBy: number;
    
    constructor(id: number, parent: number, damage: number = Missile.DEFAULT_DAMAGE) {
        super(id);
        this.speed = this.maxShipSpeed;
        this.radius = 5;
        this.launchedBy = parent;
        this.energy = damage;
        this.energyFuel = -1;
        this.life = 80;
        this.setBoundingBox(20, 20);
    }
}

export class FactoryMissile {
    private damage: number;

    public constructor(damage: number = Missile.DEFAULT_DAMAGE) {
        this.damage = damage;
    }

    public getDamage(): number {
        return this.damage;
    }

    public setDamage(damage: number) {
        this.damage = damage;
    }

    public create(id: number, parent: number): Missile {
        return new Missile(id, parent, this.damage);
    }
}