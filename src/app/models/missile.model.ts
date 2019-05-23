import { GameObject } from './game-object.model';
import { Ship } from './ship.model';

export class Missile extends GameObject {
    public static readonly DEFAULT_DAMAGE: number = -20; // -40;
    public static readonly DEFAULT_LIFE: number = 20;

    private readonly maxShipSpeed: number = 10;

    public launchedBy: Ship;

    constructor(id: number, parent: Ship, damage: number = Missile.DEFAULT_DAMAGE, range = Missile.DEFAULT_LIFE) {
        super(id);
        this.speed = this.maxShipSpeed;
        this.radius = 5;
        this.launchedBy = parent;
        this.energy = damage;
        this.energyFuel = -1;
        this.life = Math.round(range / (this.maxShipSpeed * -this.energyFuel));
        this.setBoundingBox(20, 20);
    }

    public getLauncher(): Ship {
        return this.launchedBy;
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

    public create(id: number, parent: Ship, range: number): Missile {
        return new Missile(id, parent, this.damage, range);
    }
}
