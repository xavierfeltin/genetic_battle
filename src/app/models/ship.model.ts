import { GameObject } from './game-object.model';
import { GameAction } from '../bot/bot';
import { ADN, FactoryADN } from '../ia/adn';
import { Vect2D } from './vect2D.model';
import { MyMath } from '../tools/math.tools';
import { NeuralNetwork } from '../ia/neural-network';

export class Ship extends GameObject {
    // Constants
    public static readonly TURN_LEFT: number = 0;
    public static readonly TURN_RIGHT: number = 1;
    public static readonly MOVE_FORWARD: number = 2;
    public static readonly EXTEND_FOV: number = 0;
    public static readonly REDUCE_FOV: number = 1;
    public static readonly KEEP_FOV: number = 2;

    public static readonly MAX_LIFE: number = 100;
    public static readonly DEFAULT_ENERGY_FUEL: number = 0;
    public static readonly DEFAULT_ENERGY_FIRE: number = -5;

    private static readonly MAX_SPEED: number = 5;
    public static readonly MIN_FIRE_RATE: number = 0;
    public static readonly MAX_FIRE_RATE: number = 10;

    private static readonly NB_GENES: number = 6;
    private static readonly NB_ATTRIBUTES: number = 6;
    private static readonly NB_NN_INPUT: number = 15;
    private static readonly NN_HIDDEN_LAYERS: number[] = [15, 8];
    private static readonly MIN_ADN_VALUE: number = -1;
    private static readonly MAX_ADN_VALUE: number = 1;
    private static readonly MIN_NN_VALUE: number = 0;
    private static readonly MAX_NN_VALUE: number = 1;

    public static readonly MAX_ANGLE_FOV: number = 170;
    public static readonly MIN_ANGLE_FOV: number = 2;
    public static readonly MIN_LENGTH_RADAR = 1;
    public static readonly MAX_LENGTH_RADAR = 50;

    public static readonly MIN_ATTRACTION = -2;
    public static readonly MAX_ATTRACTION = 2;

    // Properties
    private coolDown: number;
    private adn: ADN;
    private partner: Ship;
    private nbClones: number;
    private nbChildren: number;
    private adnFactory: FactoryADN;

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

    // IA / AG
    private nbGenes: number;
    private isNeuroEvo: boolean;
    private nn: NeuralNetwork; // for neuroevolution

    constructor(id: number, energyFuel: number, energyFire: number, adnFactory: FactoryADN, isNeuroEvo: boolean = false) {
        super(id);
        this.speed = Ship.MAX_SPEED;
        this.radius = 20;
        this.coolDown = 0;
        this.life = Ship.MAX_LIFE;
        this.energy = energyFire; // firing takes energy
        this.energyFuel = energyFuel; // moving consume energy
        this.useSteering = true;
        this.partner = null;
        this.nbClones = 0;
        this.nbChildren = 0;
        this.adnFactory = adnFactory;

        this.attractHealth = 0;
        this.attractMissile = 0;
        this.attractShip = 0;
        this.setFOV((Ship.MIN_ANGLE_FOV + Ship.MAX_ANGLE_FOV) / 2 );
        this.radarLength = Math.round((Ship.MIN_LENGTH_RADAR + Ship.MAX_LENGTH_RADAR) / 2);
        this.radarLenSquared = this.radarLength * this.radarLength;
        this.fireRate = Math.round((Ship.MIN_FIRE_RATE + Ship.MAX_FIRE_RATE) / 2);

        this.isNeuroEvo = isNeuroEvo;
        if (this.isNeuroEvo) {
            this.nn = new NeuralNetwork(Ship.NB_NN_INPUT, Ship.NN_HIDDEN_LAYERS, Ship.NB_ATTRIBUTES);
        }
        this.nbGenes = this.isNeuroEvo ? this.nn.getNbCoefficients() : Ship.NB_GENES;
        const minValue = Ship.MIN_ADN_VALUE * 1;
        const maxValue = Ship.MAX_ADN_VALUE * 1;


        this.createADN(this.nbGenes,
            Array<number>(this.nbGenes).fill(minValue),
            Array<number>(this.nbGenes).fill(maxValue));
    }

    public createADN(nbGenes: number, minimums: number[], maximums: number[]) {
        this.adn = this.adnFactory.create(nbGenes, minimums, maximums);

        if (!this.isNeuroEvo) {
            // In GA, phenotype is processed once
            this.expressADN();
        }
    }

    public setADN(adn: ADN) {
        this.adn = adn;
        if (!this.isNeuroEvo) {
            this.expressADN();
        }
    }

    private expressADN() {
        const genes = this.adn.getGenes();
        this.matchAttributes(genes);
    }

    private matchAttributes(output: number[]) {
        let min = this.isNeuroEvo ? Ship.MIN_NN_VALUE : Ship.MIN_ADN_VALUE;
        let max = this.isNeuroEvo ? Ship.MAX_NN_VALUE : Ship.MAX_ADN_VALUE;

        this.attractHealth = MyMath.map(output[0], min, max, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);
        this.attractMissile = MyMath.map(output[1], min, max, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);
        this.attractShip = MyMath.map(output[2], min, max, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);

        const angle = MyMath.map(output[3], min, max, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV);
        this.setFOV(Math.round(angle));

        this.fireRate = Math.round(MyMath.map(output[4], min, max, Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE));
        this.radarLength = Math.round(MyMath.map(output[5], min, max,
            Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR));
        this.radarLenSquared = this.radarLength * this.radarLength;
    }

    public expressADNNeuroEvo(missiles: GameObject[], healths: GameObject[], ships: GameObject[]) {
        const input = [];
        const detectedMissiles = this.getClosestOnRadar(missiles);
        const detectedShip = this.getClosestInSight(ships);
        const detectedHealth = this.getClosestInSight(healths);

        input.push(detectedMissiles === null ? 0 : 1);
        input.push(detectedShip === null ? 0 : 1);
        input.push(detectedHealth === null ? 0 : 1);
        input.push(this.hasPartner === null ? 0 : 1);
        input.push(MyMath.map(this.attractMissile, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.attractShip, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.attractHealth, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.fov, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.radarLength, Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.fireRate, Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.life, 0, Ship.MAX_LIFE, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.velo.x, 0, Ship.MAX_SPEED, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.velo.y, 0, Ship.MAX_SPEED, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.pos.x, this.xMin, this.xMax, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));
        input.push(MyMath.map(this.pos.y, this.yMin, this.yMax, Ship.MIN_ADN_VALUE, Ship.MAX_ADN_VALUE));

        // Call NN with the current game state viewed by the ship
        const output = this.nn.feedForward(input);
        this.matchAttributes(output); // Match ouputs with ship attributes
    }

    public getADNFactory(): FactoryADN {
        return this.adnFactory;
    }

    public setPartner(ship: Ship) {
        this.partner = ship;
    }

    public hasPartner(): boolean {
        return this.partner !== null;
    }

    public reproduce(id: number, orientation: number): Ship {
        const adn = this.adn.crossOver(this.partner.adn);
        const ship = new Ship(id, this.energyFuel, this.energy, this.adnFactory);
        ship.setADN(adn.mutate());
        ship.setPosition(this.pos);
        ship.setOrientation(orientation);
        ship.setBorders(this.getBorders());

        this.nbChildren ++;
        this.partner.nbChildren++;
        return ship;
    }

    public getNbClones(): number { return this.nbClones; }
    public getNbChildren(): number { return this.nbChildren; }

    public getFOV(): number { return this.fov; }
    public getFOVLen(): number { return this.fovLength; }
    public setFOV(angle: number) {
        this.fov = angle;
        this.cosHalfFov = Math.cos((this.fov / 2) * Math.PI / 180);

        const area = 2800; // constant FOV area
        const radAngle = this.fov * Math.PI / 180;
        this.fovLength = Math.round(Math.sqrt(2 * area / radAngle));
        // this.fovLength = MyMath.map(this.fov, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, Ship.MIN_LENGTH_FOV, Ship.MAX_LENGTH_FOV);
    }

    public getRadarLen(): number { return this.radarLength; }
    public getFireRate(): number { return this.fireRate; }
    public getHealthAttraction(): number { return this.attractHealth; }
    public getShipsAttraction(): number { return this.attractShip; }
    public getMissileshAttraction(): number { return this.attractMissile; }

    public clone(id: number, orientation: number): Ship {
        const ship = new Ship(id, this.energyFuel, this.energy, this.adnFactory, this.isNeuroEvo);
        ship.setPosition(this.pos);
        ship.setOrientation(orientation);
        ship.setADN(this.adn.mutate());
        ship.setBorders(this.getBorders());

        this.nbClones ++;
        return ship;
    }

    public copy(): Ship {
        const ship = new Ship(this.id, this.energyFuel, this.energy, this.adnFactory, this.isNeuroEvo);
        ship.age = this.age;
        ship.life = this.life;
        ship.nbChildren = this.nbChildren;
        ship.nbClones = this.nbClones;
        ship.setPosition(this.pos);
        ship.setOrientation(this.orientation);
        ship.setADN(this.adn);
        ship.setBorders(this.getBorders());
        return ship;
    }

    public changeFOV(action: number) {}

    public canFire(ships: Ship[]): boolean {
        const target = this.getClosestInSight(ships);
        return target !== null && this.coolDown === 0;
    }

    public reduceCoolDown() {
        this.coolDown = Math.max(this.coolDown - 1, 0);
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

    public updateLife(energy: number) {
        this.life = Math.min(this.life + energy, Ship.MAX_LIFE);
    }

    public behaviors(missiles: GameObject[], healths: GameObject[], ships: GameObject[], wArea: number, hArea: number) {

        if (this.isNeuroEvo) {
            // in NeuroEvolution phenotype is processed each time a ship makes an action
            this.expressADNNeuroEvo(missiles, healths, ships);
        }

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
            if (Number.isNaN(minDistance) && this.isOnRadar(dist)) {
                minDistance = dist;
                target = object;
            } else if (dist < minDistance) {
                if (this.isOnRadar(dist)) {
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

    public isOnRadar(distanceSquared: number): boolean {
        return distanceSquared <= this.radarLenSquared;
    }
}

export class FactoryShip {
    private energyFuel: number;
    private energyFire: number;
    private adnFactory: FactoryADN;
    private isNeuroEvolution: boolean;

    public constructor(adnFactory: FactoryADN, energyFuel: number = Ship.DEFAULT_ENERGY_FUEL,
                       energyFire: number = Ship.DEFAULT_ENERGY_FIRE, isNeuroEvolution: boolean = false) {
        this.energyFuel = energyFuel;
        this.energyFire = energyFire;
        this.adnFactory = adnFactory;
        this.isNeuroEvolution = isNeuroEvolution;
    }

    public getEnergyFuel(): number {
        return this.energyFuel;
    }

    public getEnergyFire(): number {
        return this.energyFire;
    }

    public setEnergyFuel(energy: number) {
        this.energyFuel = energy;
    }

    public setEnergyFire(energy: number) {
        this.energyFire = energy;
    }

    public getNeuroEvolution(activate: boolean) {
        return this.isNeuroEvolution;
    }

    public setNeuroEvolution(activate: boolean) {
        this.isNeuroEvolution = activate;
    }

    public create(id: number): Ship {
        return new Ship(id, this.energyFuel, this.energyFire, this.adnFactory, this.isNeuroEvolution);
    }
}
