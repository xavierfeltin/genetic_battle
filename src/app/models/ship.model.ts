import { GameObject } from './game-object.model';
import { GameAction } from '../bot/bot';
import { ADN } from '../ia/adn';
import { Vect2D } from './vect2D.model';
import { MyMath } from '../tools/math.tools';

export class Ship extends GameObject {
    // Constants
    public static readonly TURN_LEFT: number = 0;
    public static readonly TURN_RIGHT: number = 1;
    public static readonly MOVE_FORWARD: number = 2;
    public static readonly EXTEND_FOV: number = 0;
    public static readonly REDUCE_FOV: number = 1;
    public static readonly KEEP_FOV: number = 2;

    public static readonly MAX_LIFE: number = 100;

    private static readonly MAX_SPEED: number = 5;
    private static readonly MIN_FIRE_RATE: number = 1;
    private static readonly MAX_FIRE_RATE: number = 10;

    private static readonly NB_GENES: number = 5;
    private static readonly MIN_ADN_VALUE: number = -1;
    private static readonly MAX_ADN_VALUE: number = 1;

    public static readonly MAX_ANGLE_FOV: number = 120;
    public static readonly MIN_ANGLE_FOV: number = 10;
    private static readonly MAX_LENGTH_FOV = 50;
    private static readonly MIN_LENGTH_FOV = 200;
    private static readonly MIN_LENGTH_RADAR = 1;
    private static readonly MAX_LENGTH_RADAR = 50;

    private static readonly MIN_ATTRACTION = -2;
    private static readonly MAX_ATTRACTION = 2;

    // Properties
    private coolDown: number;
    private life: number;

    // Variables to pilot a ship
    private attractHealth: number;
    private attractMissile: number;
    private attractShip: number;
    private fov: number; // in radians
    private fovLength: number;
    private cosHalfFov: number; // optimisation
    private radarLength: number;
    private radarLenSquared: number; // optimisation
    private fireRate: number; // probability to fire each frame
    private adn: ADN;
    private energyFuel: number;

    constructor(id: number) {
        super(id);
        this.speed = Ship.MAX_SPEED;
        this.radius = 20;
        this.coolDown = 0;
        this.life = Ship.MAX_LIFE;
        this.energy = -1; // firing takes energy
        this.energyFuel = 0; //moving consume energy
        this.useSteering = true;

        this.setADN(new ADN(Ship.NB_GENES,
            Array<number>(Ship.NB_GENES).fill(Ship.MIN_ADN_VALUE),
            Array<number>(Ship.NB_GENES).fill(Ship.MAX_ADN_VALUE)));
    }

    public setADN(adn: ADN) {
        this.adn = adn;
        const genes = adn.getGenes();
        
        this.attractHealth = MyMath.map(genes[0], Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);
        this.attractMissile = MyMath.map(genes[1], Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);
        this.attractShip = MyMath.map(genes[2], Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);

        const angle = MyMath.map(genes[3], Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV);
        this.setFOV(Math.round(angle));

        this.fireRate = Math.round(MyMath.map(genes[4], Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE, Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE));
        this.radarLength = Math.round(MyMath.map(genes[4], Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE, Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR));
        this.radarLenSquared = this.radarLength * this.radarLength;
    }

    public getFOV(): number { return this.fov; }
    public getFOVLen(): number { return this.fovLength; }
    public setFOV(angle: number) {
        this.fov = angle;
        this.fovLength = MyMath.map(this.fov, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, Ship.MIN_LENGTH_FOV, Ship.MAX_LENGTH_FOV);
        this.cosHalfFov = Math.cos((this.fov / 2) * Math.PI / 180);
    }

    public getRadarLen() {
        return this.radarLength;
    }

    public clone(id: number, orientation: number): Ship {
        const ship = new Ship(id);
        ship.setPosition(this.pos);
        ship.setOrientation(orientation);
        ship.setADN(this.adn.mutate());
        ship.setBorders(this.getBorders());
        return ship;
    }

    public changeFOV(action: number) {}

    public canFire(ships: Ship[]): boolean {
        const target = this.getClosestInSight(ships);
        return target !== null && this.coolDown === 0;
    }

    public reduceCoolDown() {
        this.coolDown = Math.max(this.coolDown- 1, 0);
    }

    public fire(ships: Ship[]): boolean {
        if (this.canFire(ships)) {
            this.updateLife(this.energy); // firing consume energy
            this.coolDown = this.fireRate;
            return true;

            /*
            const proba = Math.random();
            if (proba < this.fireRate) {
                this.updateLife(this.energy); // firing consume energy
                return true;
            }
            */
        }
        return false;
    }

    public getLife(): number {
        return this.life;
    }

    public applyAction(action: GameAction) {
        switch (action.moveAction) {
            case Ship.TURN_LEFT: {
                this.turnLeft();
                break;
            }
            case Ship.TURN_RIGHT: {
                this.turnRight();
                break;
            }
            case Ship.MOVE_FORWARD: {
                this.goForward();
                break;
            }
        }

        switch (action.changeFov) {
            case Ship.EXTEND_FOV: {
                this.improveFOV();
                break;
            }
            case Ship.REDUCE_FOV: {
                this.reduceFOV();
                break;
            }
            case Ship.KEEP_FOV: {
                this.keepFOV();
                break;
            }
        }
    }

    public consumeFuel() {
        this.life += this.energyFuel;
    }

    public updateLife(energy: number) {
        this.life += energy;
    }

    public isDead(): boolean {
        return this.life <= 0;
    }

    public behaviors(missiles: GameObject[], healths: GameObject[], ships: GameObject[], wArea: number, hArea: number) {
        if (!this.boundaries(wArea, hArea)) {
            const missile = this.getClosestOnRadar(missiles);
            const health = this.getClosestInSight(healths);
            const ship = this.getClosestInSight(ships);

            this.steer(missile, this.attractMissile);
            this.steer(health, this.attractHealth);
            this.steer(ship, this.attractShip);
        }

        // Apply acceleration to velocity
        this.applyAcc();
    }

    private boundaries(wArea: number, hArea: number) {
        const d = 25;
        let desired: Vect2D = null;

        if (this.pos.x - this.width / 2 < d) {
          desired = new Vect2D(this.speed, this.velo.y);
        } else if (this.pos.x + this.width / 2 > wArea - d) {
          desired = new Vect2D(-this.speed, this.velo.y);
        }

        if (this.pos.y - this.height / 2 < d) {
          desired = new Vect2D(this.velo.x, this.speed);
        } else if (this.pos.y + this.height / 2 > hArea - d) {
          desired = new Vect2D(this.velo.x, -this.speed);
        }

        if (desired != null) {
            desired.limit(this.speed);
            const steer = Vect2D.sub(desired, this.velo);
            steer.limit(GameObject.MAX_FORCE);
            this.applyForce(steer);
            return true;
        }
        return false;
    }

    private steer(target: GameObject, attractCoeff: number) {
        if (target !== null) {
            this.seek(target, attractCoeff);
        }
    }

    private turnLeft() {
        this.orientation -= 3;
        this.orientation = this.orientation % 360;
    }

    private turnRight() {
        this.orientation += 3;
        this.orientation = this.orientation % 360;
    }

    private goForward() {
        return;
    }

    private improveFOV() {
        this.fov = Math.min(this.fov + 1, Ship.MAX_ANGLE_FOV);
    }

    private reduceFOV() {
        this.fov = Math.max(this.fov - 1, Ship.MIN_ANGLE_FOV);
    }

    private keepFOV() {
        return;
    }

    private getClosestInSight(objects: GameObject[]): GameObject {
        let minDistance = NaN;
        let target = null;

        for (const object of objects) {
            const dist = this.pos.distance2(object.pos);
            if (Number.isNaN(minDistance) && this.isInView(object)) {
                minDistance = dist;
                target = object;
            } else if (dist < minDistance) {
                if (this.isInView(target)) {
                    minDistance = dist;
                    target = object;
                }
            }
        }

        return target;
    }

    private getClosestOnRadar(objects: GameObject[]): GameObject {
        let minDistance = NaN;
        let target = null;

        for (const object of objects) {
            const dist = this.pos.distance2(object.pos);
            if (Number.isNaN(minDistance) && this.isOnRadar(object, dist)) {
                minDistance = dist;
                target = object;
            } else if (dist < minDistance) {
                if (this.isOnRadar(object, dist)) {
                    minDistance = dist;
                    target = object;
                }
            }
        }

        return target;
    }

    public isInView(target: GameObject): boolean {
        // Compare angle between heading and target with field of view angle
        const vShipTarget = Vect2D.sub(target.pos, this.pos);
        const distance = vShipTarget.norm;
        vShipTarget.normalize();
        const dotProduct = this.heading.dotProduct(vShipTarget);
        return dotProduct > this.cosHalfFov && distance <= this.fovLength ;
    }

    public isOnRadar(target: GameObject, distanceSquared: number): boolean {
        return distanceSquared <= this.radarLenSquared;
    }
}
