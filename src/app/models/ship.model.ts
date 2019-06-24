import { GameObject } from './game-object.model';
import { ADN, FactoryADN } from '../ia/adn';
import { Vect2D } from './vect2D.model';
import { MyMath } from '../tools/math.tools';
import { NeuralNetwork } from '../ia/neural-network';
import { Missile } from './missile.model';
import { Scoring } from '../ia/scoring';
import { Phenotype } from './phenotype.interface';
import { ShipNeurEvo } from './shipNeuroEvo.model';
import { ShipScoring } from './shipScoring.model';
import { TouchSequence } from 'selenium-webdriver';

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
    public static readonly DEFAULT_ENERGY_FIRE: number = -2;
    public static readonly DEFAULT_NN_HIDDEN_LAYERS: number[] = [4, 4];

    private static readonly MAX_SPEED: number = 5;
    private static readonly MIN_SPEED: number = 2;

    public static readonly MIN_FIRE_RATE: number = 0;
    public static readonly MAX_FIRE_RATE: number = 100;

    private static readonly NB_GENES: number = 6;
    private static readonly NN_OUTPUTS: number[] = [3, 3, 3, 3, 3, 1];
    private static readonly NB_NN_INPUT: number = 10;
    private static readonly NN_HIDDEN_LAYERS: number[] = [4, 4];
    private static readonly MIN_ADN_VALUE: number = -1;
    private static readonly MAX_ADN_VALUE: number = 1;
    private static readonly MIN_NN_VALUE: number = 0;
    private static readonly MAX_NN_VALUE: number = 1;

    public static readonly MAX_ANGLE_FOV: number = 120;
    public static readonly MIN_ANGLE_FOV: number = 2;
    public static readonly MIN_LENGTH_RADAR: number = 40;
    public static readonly MAX_LENGTH_RADAR: number = 120;
    public static readonly MIN_LENGTH_FOV: number = 80;
    public static readonly MAX_LENGTH_FOV: number = 600;
    public static readonly MAX_DISTANCE: number = 800 * Math.sqrt(2);

    public static readonly MIN_ATTRACTION: number = -2;
    public static readonly MAX_ATTRACTION: number = 2;

    public static readonly DUE_TO_MISSILE: number = 0;
    public static readonly DUE_TO_HEALTH_PACK: number = 1;
    public static readonly DUE_TO_OTHER: number = 2;
    private readonly centerObject: GameObject;

    // Properties
    private coolDown: number;
    private adn: ADN;
    private partner: Ship;
    private nbClones: number;
    private nbChildren: number;
    private adnFactory: FactoryADN;
    private scoringCoefficients: ShipScoring;

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

    // Variables for scoring
    private nbHealthPackPicked: number;
    private nbReceivedDamage: number;
    private missileAccuracy: number;
    private nbMissilesLaunched: number;
    private nbEnnemiesTouched: number;
    private nbEnnemiesDestroyed: number;
    private nbMissilesDestroyed: number;

    // flags previous frame
    private hasBeenShot: boolean; // true if took damage due to missile
    private hasBeenHealed: boolean; // true if took an health pack
    private hasFired: boolean; // true if shoot
    private hasTouchedEnnemy: boolean; // true if touched ship
    private hasTouchedMissile: boolean; // true if touched missile
    private timer: number;
    private maxTimer: number;

    // IA / AG
    private parentsID: number[];
    private nbGenes: number;
    private isNeuroEvo: boolean;
    private nn: NeuralNetwork; // for neuroevolution
    private generation: number;
    private inputsNeuroEvo: ShipNeurEvo;
    private neuronalNetworkStructure: number[];

    // Sensors
    private detectedMissileOnFOV: Missile;
    private detectedShipOnFOV: Ship;
    private detectedHealthOnFOV: GameObject;
    private detectedMissileOnRadar: Missile;
    private detectedShipOnRadar: Ship;
    private detectedHealthOnRadar: GameObject;
    private distanceMissileOnFOV: number;
    private distanceShipOnFOV: number;
    private distanceHealthOnFOV: number;
    private distanceMissileOnRadar: number;
    private distanceShipOnRadar: number;
    private distanceHealthOnRadar: number;


    constructor(id: number, generation: number, energyFuel: number,
                energyFire: number, adnFactory: FactoryADN, isNeuroEvo: boolean = false,
                scoringCoefficients: ShipScoring, neuroEvoInputs: ShipNeurEvo,
                nnStructure: number[], parentsID: number[] = [-1]) {
        super(id);

        this.parentsID = [...parentsID];
        this.centerObject = new GameObject(-1);
        this.centerObject.setPosition(new Vect2D(this.xMax / 2, this.yMax / 2));
        this.centerObject.setVelocity(new Vect2D(0, 0));

        this.radius = 20;
        this.coolDown = 0;
        this.life = Ship.MAX_LIFE;
        this.energy = energyFire; // firing takes energy
        this.energyFuel = energyFuel; // moving consume energy
        this.useSteering = true;
        this.partner = null;
        this.nbClones = 0;
        this.nbChildren = 0;
        this.hasBeenShot = false;
        this.hasBeenHealed = false;
        this.hasFired = false;
        this.hasTouchedEnnemy = false;
        this.hasTouchedMissile = false;

        this.nbHealthPackPicked = 0;
        this.nbReceivedDamage = 0;
        this.nbEnnemiesTouched = 0;
        this.nbMissilesDestroyed = 0;
        this.nbEnnemiesDestroyed = 0;
        this.missileAccuracy = 1;
        this.nbMissilesLaunched = 0;

        this.adnFactory = adnFactory;

        this.attractHealth = 0;
        this.attractMissile = 0;
        this.attractShip = 0;
        this.setFOV((Ship.MIN_ANGLE_FOV + Ship.MAX_ANGLE_FOV) / 2 );

        const length = Math.round((Ship.MIN_LENGTH_RADAR + Ship.MAX_LENGTH_RADAR) / 2);
        this.setRadar(length);

        this.fireRate = Math.round((Ship.MIN_FIRE_RATE + Ship.MAX_FIRE_RATE) / 2);

        this.scoringCoefficients =  scoringCoefficients;
        this.isNeuroEvo = isNeuroEvo;
        this.inputsNeuroEvo = neuroEvoInputs;
        const activeInputs = this.inputsNeuroEvo.getActiveInputNames();
        this.neuronalNetworkStructure = nnStructure;
        if (this.isNeuroEvo) {
            this.nn = new NeuralNetwork(activeInputs.length, this.neuronalNetworkStructure, Ship.NN_OUTPUTS);
        }
        this.nbGenes = this.isNeuroEvo ? this.nn.getNbCoefficients() : Ship.NB_GENES;
        const minValue = Ship.MIN_ADN_VALUE * 1;
        const maxValue = Ship.MAX_ADN_VALUE * 1;
        this.generation = generation;

        this.adnFactory.setIsHugeADN(this.isNeuroEvo); // will not change once the ship is created
        this.createADN(this.nbGenes, minValue, maxValue);

        this.detectedMissileOnFOV = null;
        this.detectedShipOnFOV = null;
        this.detectedHealthOnFOV = null;
        this.detectedMissileOnRadar = null;
        this.detectedShipOnRadar = null;
        this.detectedHealthOnRadar = null;
        this.distanceMissileOnFOV = -1;
        this.distanceShipOnFOV = -1;
        this.distanceHealthOnFOV = -1;
        this.distanceMissileOnRadar = -1;
        this.distanceShipOnRadar = -1;
        this.distanceHealthOnRadar = -1;
    }

    public createADN(nbGenes: number, minimum: number, maximum: number) {
        this.adn = this.adnFactory.create(nbGenes, minimum, maximum);

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

    public setScoringCoefficients(scoringCoeffs: ShipScoring) {
        const coeffs = scoringCoeffs.getCoefficients();
        // tslint:disable-next-line:forin
        for (const key in coeffs) {
            this.scoringCoefficients.setCoefficient(key, coeffs[key]);
        }
    }

    public setTime(t: number, maxT: number) {
        this.timer = t;
        this.maxTimer = maxT;
    }

    public ennemyWounded() {
        this.nbEnnemiesTouched ++;
        this.hasTouchedEnnemy = true;
    }

    public ennemyDown() {
        this.nbEnnemiesTouched ++;
        this.nbEnnemiesDestroyed ++;
        this.hasTouchedEnnemy = true;
    }

    public missileDestroyed() {
        this.nbMissilesDestroyed ++;
        this.hasTouchedMissile = true;
    }

    public getADN(): ADN {
        return this.adn;
    }

    public getParentsID(): number[] {
        return this.parentsID;
    }

    public scoring(): number {
        const coeffs = this.scoringCoefficients.getCoefficients();
        let score = 0;
        // tslint:disable-next-line:forin
        for (const key in coeffs) {
            score += coeffs[key] * this[key];
        }
        return score;
    }

    public getScore(): Scoring {
        const score = {
            id: this.id,
            nbHealthPack: this.nbHealthPackPicked,
            damageReceived: this.nbReceivedDamage,
            touchedEnnemies: this.nbEnnemiesTouched,
            destroyedEnnemies: this.nbEnnemiesDestroyed,
            missileDestroyed: this.nbMissilesDestroyed,
            missileLaunched: this.nbMissilesLaunched,
            accuracy: this.getAccuracy(),
            score: this.scoring(),
            stamp: this.timer,
            state: this.isDead() ? 'Dead' : 'Alive',
            generation: this.generation,
            lifespan: Math.round(this.getAge() / 30), // in second
            life: this.life
        };
        return score;
    }

    public getPhenotype(): Phenotype {
        const phenotype = {
            attractionShip: this.attractShip,
            attractionHealth: this.attractHealth,
            attractionMissile: this.attractMissile,
            fireRate: this.fireRate,
            radarLength: this.radarLength,
            fovAngle: this.fov
        };
        return phenotype;
    }

    private getAccuracy(): number {
        if (this.nbMissilesLaunched === 0) { return 0; }
        return this.nbEnnemiesTouched  / this.nbMissilesLaunched;
    }

    private expressADN() {
        const genes = this.adn.getGenes();
        this.matchAttributes(genes);
    }

    private matchAttributes(output: number[]) {
        const min = this.isNeuroEvo ? Ship.MIN_ADN_VALUE : Ship.MIN_ADN_VALUE;
        const max = this.isNeuroEvo ? Ship.MAX_ADN_VALUE : Ship.MAX_ADN_VALUE;

        this.attractHealth = MyMath.map(output[0], min, max, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);
        this.attractMissile = MyMath.map(output[1], min, max, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);
        this.attractShip = MyMath.map(output[2], min, max, Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION);

        const angle = MyMath.map(output[3], min, max, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV);
        this.setFOV(Math.round(angle));

        this.fireRate = Math.round(MyMath.map(output[4], min, max, Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE));

        const length = Math.round(MyMath.map(output[5], min, max, Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR));
        this.setRadar(length);
    }

    private getSolution(output: number[]): number {
        const score = [];
        let sum = 0;
        if (output.length > 1) {
            for (const out of output) {
                sum += out;
                score.push(sum);
            }
            score[score.length - 1] = 1; // force last value to be 1 for probabilities
            const rand = Math.random();
            let i = 0;
            while (i < score.length && rand < score[i]) {
                i += 1;
            }
            return i;
        } else {
            return output[0];
        }
    }

    private matchAttributesNeuroEvo(output: number[][]) {
        let i = this.getSolution(output[0]);
        let delta = (i === 0 || i === 2)  ? ((i === 0) ? -0.05 : 0.05 ) : 0;
        this.attractHealth += delta;
        this.attractHealth = Math.min(this.attractHealth + delta, Ship.MAX_ATTRACTION);
        this.attractHealth = Math.max(this.attractHealth, Ship.MIN_ATTRACTION);

        i = this.getSolution(output[1]);
        delta = (i === 0 || i === 2)  ? ((i === 0) ? -0.05 : 0.05 ) : 0;
        this.attractMissile += delta;
        this.attractMissile = Math.min(this.attractMissile, Ship.MAX_ATTRACTION);
        this.attractMissile = Math.max(this.attractMissile, Ship.MIN_ATTRACTION);

        i = this.getSolution(output[2]);
        delta = (i === 0 || i === 2)  ? ((i === 0) ? -0.05 : 0.05 ) : 0;
        this.attractShip += delta;
        this.attractShip = Math.min(this.attractShip, Ship.MAX_ATTRACTION);
        this.attractShip = Math.max(this.attractShip, Ship.MIN_ATTRACTION);

        i = this.getSolution(output[3]);
        delta = (i === 0 || i === 2)  ? ((i === 0) ? -1 : 1 ) : 0;
        delta = (this.fov + delta > Ship.MAX_ANGLE_FOV) ? 0 : delta;
        delta = (this.fov + delta < Ship.MIN_ANGLE_FOV) ? 0 : delta;
        this.setFOV(Math.round(this.getFOV() + delta));

        i = this.getSolution(output[4]);
        delta = (i === 0 || i === 2)  ? ((i === 0) ? -1 : 1 ) : 0;
        delta = (this.radarLength + delta > Ship.MAX_LENGTH_RADAR) ? 0 : delta;
        delta = (this.radarLength + delta < Ship.MIN_LENGTH_RADAR) ? 0 : delta;
        this.setRadar(this.radarLength + delta);

        i = this.getSolution(output[5]);
        this.fireRate = (i <= 0 ) ? 0 : 100;
    }

    public expressADNNeuroEvo(missiles: GameObject[], healths: GameObject[], ships: GameObject[]) {
        const input: number[] = [];
        const activatedInputs = this.inputsNeuroEvo.getActiveInputNames();
        // Manage inputs depending of NeuroEvo Inputs
        for (const key of activatedInputs) {
            input.push(this[key]);
        }

        // Call NN with the current game state viewed by the ship
        const output = this.nn.feedForward(input);
        this.matchAttributesNeuroEvo(output); // Match ouputs with ship attributes
    }

    public getADNFactory(): FactoryADN {
        return this.adnFactory;
    }

    public isFamily(ship) {
        let found = false;
        let i = 0;
        while (!found && i < this.parentsID.length) {
            found = found || this.parentsID[i] === ship.id;
            let j = 0;
            while (!found && j < ship.parentsID.length) {
                found = found || (ship.parentsID[j] === this.parentsID[i] && this.parentsID[i] !== -1);
                found = found || this.id === ship.parentsID[j];
                j++;
            }
            i++;
        }
        return found;
    }

    public setPartner(ship: Ship) {
        this.partner = ship;
    }

    public hasPartner(): boolean {
        return this.partner !== null;
    }

    public reproduce(newId: number, orientation: number): Ship {
        const adn = (this.scoring() > this.partner.scoring()) ? this.adn.crossOver(this.partner.adn) : this.partner.adn.crossOver(this.adn);
        adn.mutate();

        const ship = new Ship(newId, this.generation + 1, this.energyFuel, this.energy,
            this.adnFactory, this.isNeuroEvo, this.scoringCoefficients, this.inputsNeuroEvo,
            this.neuronalNetworkStructure, [this.id, this.partner.id]);
        ship.setADN(adn);
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
        // this.fovLength = Math.round(Math.sqrt(2 * area / radAngle));
        this.fovLength = Ship.MAX_LENGTH_FOV;
    }

    public setRadar(length: number) {
        this.radarLength = length;
        this.radarLenSquared = length * length;

        // More wide is the radar, less the ship is fast
        this.maxSpeed = MyMath.map(this.radarLength, Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, Ship.MAX_SPEED, Ship.MIN_SPEED);
        this.speed = this.maxSpeed;
    }


    public getRadarLen(): number { return this.radarLength; }
    public getFireRate(): number { return this.fireRate; }
    public getHealthAttraction(): number { return this.attractHealth; }
    public getShipsAttraction(): number { return this.attractShip; }
    public getMissileshAttraction(): number { return this.attractMissile; }
    // public getCenterAttraction(): number { return this.attractCenter; }

    public clone(id: number, orientation: number): Ship {
        const ship = new Ship(id, this.generation + 1, this.energyFuel, this.energy,
                            this.adnFactory, this.isNeuroEvo, this.scoringCoefficients,
                            this.inputsNeuroEvo, this.neuronalNetworkStructure, [this.id]);
        ship.setPosition(this.pos);
        ship.setOrientation(orientation);
        ship.setADN(this.adn.mutate());
        ship.setBorders(this.getBorders());

        this.nbClones ++;
        return ship;
    }

    public copy(): Ship {
        const ship = new Ship(this.id, this.generation, this.energyFuel, this.energy,
                            this.adnFactory, this.isNeuroEvo, this.scoringCoefficients,
                            this.inputsNeuroEvo, this.neuronalNetworkStructure, this.parentsID);
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

    public canFire(ships: Ship[], missiles: Missile[]): boolean {
        const ship = this.getClosestInSight(ships);
        const missile = this.getClosestInSight(missiles);

        if (this.isNeuroEvo) {
            // NN decides if the ship should shoot or not
            return this.coolDown === 0;
        } else {
            // AG is having more input information
            return (ship !== null || missile !== null) && this.coolDown === 0;
        }
    }

    public reduceCoolDown() {
        this.coolDown = Math.max(this.coolDown - 1, 0);
    }

    public fire(ships: Ship[], missiles: Missile[]): boolean {
        const proba = Math.random() * 100;
        if (this.canFire(ships, missiles) && (proba <= this.fireRate)) {
            this.updateLife(this.energy, Ship.DUE_TO_OTHER); // firing consume energy
            this.coolDown = 10; // this.fireRate;
            this.hasFired = true;
            this.nbMissilesLaunched++;
            return true;
        }
        return false;
    }

    public getLife(): number {
        return this.life;
    }

    public getHealthPackPicked(): number {
        return this.nbHealthPackPicked;
    }

    public getGeneration(): number {
        return this.generation;
    }

    public updateLife(energy: number, cause: number) {
        this.life = Math.min(this.life + energy, Ship.MAX_LIFE);

        switch (cause) {
            case Ship.DUE_TO_MISSILE: {
                this.hasBeenShot = true;
                this.nbReceivedDamage ++;
                break;
            }
            case Ship.DUE_TO_HEALTH_PACK: {
                this.hasBeenHealed = true;
                this.nbHealthPackPicked++;
                break;
            }
            default: {
                break;
            }
        }
    }

    private scan(missiles: GameObject[], healths: GameObject[], ships: GameObject[]) {
        this.detectedMissileOnFOV = this.getClosestInSight(missiles) as Missile;
        this.detectedShipOnFOV = this.getClosestInSight(ships) as Ship;
        this.detectedHealthOnFOV = this.getClosestInSight(healths);
        this.detectedMissileOnRadar = this.getClosestOnRadar(missiles) as Missile;
        this.detectedShipOnRadar = this.getClosestOnRadar(ships) as Ship;
        this.detectedHealthOnRadar = this.getClosestOnRadar(healths);

        this.distanceMissileOnFOV = this.detectedMissileOnFOV === null ? -1 : this.detectedMissileOnFOV.pos.distance(this.pos);
        this.distanceShipOnFOV = this.detectedShipOnFOV === null ? -1 : this.detectedShipOnFOV.pos.distance(this.pos);
        this.distanceHealthOnFOV = this.detectedHealthOnFOV === null ? -1 : this.detectedHealthOnFOV.pos.distance(this.pos);
        this.distanceMissileOnRadar = this.detectedMissileOnRadar === null ? -1 : this.detectedMissileOnRadar.pos.distance(this.pos);
        this.distanceShipOnRadar = this.detectedShipOnRadar === null ? -1 : this.detectedShipOnRadar.pos.distance(this.pos);
        this.distanceHealthOnRadar = this.detectedHealthOnRadar === null ? -1 : this.detectedHealthOnRadar.pos.distance(this.pos);
    }

    public behaviors(missiles: GameObject[], healths: GameObject[], ships: GameObject[], wArea: number, hArea: number) {
        this.scan(missiles, healths, ships);

        if (this.isNeuroEvo) {
            // in NeuroEvolution phenotype is processed each time a ship makes an action
            this.expressADNNeuroEvo(missiles, healths, ships);
            this.resetStates();
        }

        if (this.distanceMissileOnFOV < this.distanceMissileOnRadar) {
            this.steer(this.detectedMissileOnRadar, this.attractMissile);
        } else {
            this.steer(this.detectedMissileOnFOV, this.attractMissile);
        }

        if (this.distanceShipOnFOV < this.distanceShipOnRadar) {
            this.steer(this.detectedShipOnRadar, this.attractShip);
        } else {
            this.steer(this.detectedShipOnFOV, this.attractShip);
        }

        if (this.distanceHealthOnFOV < this.distanceHealthOnRadar) {
            this.steer(this.detectedHealthOnRadar, this.attractHealth);
        } else {
            this.steer(this.detectedHealthOnFOV, this.attractHealth);
        }

        this.boundaries(wArea, hArea);

        // Apply acceleration to velocity
        this.applyAcc();

        if (this.velo.x !== 0 && this.velo.y !== 0) {
            this.updateLife(this.energyFuel, Ship.DUE_TO_OTHER); // moving consumes energy
        }
    }

    private resetStates() {
        this.hasFired = false;
        this.hasBeenHealed = false;
        this.hasBeenShot = false;
        this.hasTouchedEnnemy = false;
        this.hasTouchedMissile = false;
    }

    private boundaries(wArea: number, hArea: number) {
        const d = 25;
        const desiredX: Vect2D = new Vect2D(0, 0);
        const desiredY: Vect2D = new Vect2D(0, 0);

        if (this.pos.x - (this.width) < d) {
            desiredX.setV(new Vect2D(this.speed, this.velo.y));
        } else if (this.pos.x + (this.width) > wArea - d) {
            desiredX.setV(new Vect2D(-this.speed, this.velo.y));
        }

        if (this.pos.y - (this.height) < d) {
          desiredY.setV(new Vect2D(this.velo.x, this.speed));
        } else if (this.pos.y + (this.height) > hArea - d) {
          desiredY.setV(new Vect2D(this.velo.x, -this.speed));
        }

        const desired = Vect2D.add(desiredX, desiredY);
        if (desired != null) {
            desired.limit(this.speed);
            const steer = Vect2D.sub(desired, this.velo);
            steer.limit(GameObject.MAX_FORCE);
            steer.mul(3);
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

    private getClosestInSight(objects: GameObject[]): GameObject {
        let minDistance = NaN;
        let target = null;

        for (const object of objects) {
            if (object instanceof Missile) {
                const m = object as Missile;
                if (m.getLauncher().id === this.id) {
                    continue;
                }
            }

            if (object instanceof Ship) {
                const s = object as Ship;
                if (s.id === this.id) {
                    continue;
                }
            }

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
            if (object instanceof Missile) {
                const m = object as Missile;
                if (m.getLauncher().id === this.id) {
                    continue;
                }
            } else if (object instanceof Ship) {
                const s = object as Ship;
                if (s.id === this.id) {
                    continue;
                }
            }

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

    public getEnergyFire(): number {
        return this.energy;
    }

    public getEnergyFuel(): number {
        return this.energyFuel;
    }

    // Neuro Evolution Input Getters
    private get inputFlagDetectedMissileFOV(): number {
        return this.detectedMissileOnFOV !== null ? 1 : 0;
    }
    private get inputFlagDetectedShipFOV(): number {
        return this.detectedShipOnFOV !== null ? 1 : 0;
    }
    private get inputFlagDetectedHealthFOV(): number {
        return this.detectedHealthOnFOV !== null ? 1 : 0;
    }
    private get inputFlagDetectedMissileRadar(): number {
        return this.detectedMissileOnRadar !== null ? 1 : 0;
    }
    private get inputFlagDetectedHealthRadar(): number {
        return this.detectedHealthOnRadar !== null ? 1 : 0;
    }
    private get inputFlagDetectedShipRadar(): number {
        return this.detectedShipOnRadar !== null ? 1 : 0;
    }
    private get inputDistanceDetectedMissileFOV(): number {
        return this.distanceMissileOnFOV === -1 ? -1 : MyMath.map(this.distanceMissileOnFOV, 0, Ship.MAX_DISTANCE, 1, 0);
    }
    private get inputDistanceDetectedShipFOV(): number {
        return this.distanceShipOnFOV === -1 ? -1 : MyMath.map(this.distanceShipOnFOV, 0, Ship.MAX_DISTANCE, 1, 0);
    }
    private get inputDistanceDetectedHealthFOV(): number {
        return this.distanceHealthOnFOV === -1 ? -1 : MyMath.map(this.distanceHealthOnFOV, 0, Ship.MAX_DISTANCE, 1, 0);
    }
    private get inputDistanceDetectedMissileRadar(): number {
        return this.distanceMissileOnRadar === -1 ? -1 : MyMath.map(this.distanceMissileOnRadar, 0, Ship.MAX_DISTANCE, 1, 0);
    }
    private get inputDistanceDetectedHealthRadar(): number {
        return this.distanceHealthOnRadar === -1 ? -1 : MyMath.map(this.distanceHealthOnRadar, 0, Ship.MAX_DISTANCE, 1, 0);
    }
    private get inputDistanceDetectedShipRadar(): number {
        return this.distanceShipOnRadar === -1 ? -1 : MyMath.map(this.distanceShipOnRadar, 0, Ship.MAX_DISTANCE, 1, 0);
    }
    private get inputAttractionMissile(): number {
        return this.attractMissile;
    }
    private get inputAttractionShip(): number {
        return this.attractShip;
    }
    private get inputAttractionHealth(): number {
        return this.attractHealth;
    }
    private get inputFOVAngle(): number {
        return MyMath.map(this.fov, Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputRadarRadius(): number {
        return MyMath.map(this.radarLength, Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputFireRate(): number {
        return MyMath.map(this.fireRate, Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputLife(): number {
        return MyMath.map(this.life, 0, Ship.MAX_LIFE, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputMaxSpeed(): number {
        return MyMath.map(this.maxSpeed, 0, Ship.MAX_SPEED, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputFlagHasFired(): number {
        return this.hasFired ? 1 : 0;
    }
    private get inputFlagHasBeenHealed(): number {
        return this.hasBeenHealed ? 1 : 0;
    }
    private get inputFlagHasBeenShot(): number {
        return this.hasBeenShot ? 1 : 0;
    }
    private get inputFlagTouchedEnnemy(): number {
        return this.hasTouchedEnnemy ? 1 : 0;
    }
    private get inputFlagTouchedMissile(): number {
        return this.hasTouchedMissile ? 1 : 0;
    }
    private get inputVelocityX(): number {
        return MyMath.map(this.velo.x, 0, Ship.MAX_SPEED, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputVelocityY(): number {
        return MyMath.map(this.velo.y, 0, Ship.MAX_SPEED, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputPositionX(): number {
        return MyMath.map(this.pos.x, this.xMin, this.xMax, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }
    private get inputPositionY(): number {
        return MyMath.map(this.pos.y, this.yMin, this.yMax, Ship.MIN_NN_VALUE, Ship.MAX_ADN_VALUE);
    }

    // Scoring Getters
    private get scoringHealthPicked(): number {
        return this.nbHealthPackPicked;
    }

    private get scoringEnnemiesTouched(): number {
        return this.nbEnnemiesTouched;
    }

    private get scoringEnnemiesDestroyed(): number {
        return this.nbEnnemiesDestroyed;
    }

    private get scoringMissilesDestroyed(): number {
        return this.nbMissilesDestroyed;
    }

    private get scoringMissilesLaunched(): number {
        return this.nbMissilesLaunched;
    }

    private get scoringReceivedDamage(): number {
        return this.nbReceivedDamage;
    }

    private get scoringAccuracy(): number {
        return this.getAccuracy();
    }

    private get scoringLifespan(): number {
        return this.age / 30;
    }

    private get scoringEnnemiesTouchedAcc(): number {
        return this.nbEnnemiesTouched * this.getAccuracy();
    }

    private get scoringEnnemiesDestroyedAcc(): number {
        return this.nbEnnemiesDestroyed * this.getAccuracy();
    }

    private get scoringMissilesDestroyedAcc(): number {
        return this.nbMissilesDestroyed * this.getAccuracy();
    }

    private get scoringMissilesLaunchedAcc(): number {
        return this.nbMissilesLaunched * this.getAccuracy();
    }
}

export class FactoryShip {
    private energyFuel: number;
    private energyFire: number;
    private adnFactory: FactoryADN;
    private scoringCoefficients: ShipScoring;
    private isNeuroEvolution: boolean;
    private shipNeuroEvo: ShipNeurEvo;
    private neuronalNetworkStructure: number[];

    public constructor(adnFactory: FactoryADN, energyFuel: number = Ship.DEFAULT_ENERGY_FUEL,
                       energyFire: number = Ship.DEFAULT_ENERGY_FIRE, isNeuroEvolution: boolean = false,
                       nnStruture: number[] = Ship.DEFAULT_NN_HIDDEN_LAYERS) {
        this.energyFuel = energyFuel;
        this.energyFire = energyFire;
        this.adnFactory = adnFactory;
        this.scoringCoefficients = new ShipScoring();
        this.isNeuroEvolution = isNeuroEvolution;
        this.neuronalNetworkStructure = nnStruture;
        this.shipNeuroEvo = new ShipNeurEvo();
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

    public getNeuroEvolution() {
        return this.isNeuroEvolution;
    }

    public setNeuroEvolution(activate: boolean) {
        this.isNeuroEvolution = activate;
    }

    public getADNFactory(): FactoryADN {
        return this.adnFactory;
    }

    public getShipScoringCoefficients(): ShipScoring {
        return this.scoringCoefficients;
    }

    public getShipNeuroEvo(): ShipNeurEvo {
        return this.shipNeuroEvo;
    }

    public getNeuronalNetworkStructure(): number[] {
        return this.neuronalNetworkStructure;
    }

    public setNeuronalNetworkStructure(nnStructure: number[]) {
        this.neuronalNetworkStructure = nnStructure;
    }

    public create(id: number, generation: number, parentsID: number[] = [-1]): Ship {
        return new Ship(id, generation, this.energyFuel, this.energyFire,
                        this.adnFactory, this.isNeuroEvolution, this.scoringCoefficients.copy(),
                        this.shipNeuroEvo.copy(), this.neuronalNetworkStructure, parentsID);
    }
}
