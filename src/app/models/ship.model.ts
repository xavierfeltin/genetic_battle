import { GameObject } from './game-object.model';
import { ADN } from '../ia/adn';
import { FactoryADN } from '../ia/adn.factory';
import { Vect2D } from './vect2D.model';
import { MyMath } from '../tools/math.tools';
import { NeuralNetwork } from '../ia/neural-network';
import { Missile } from './missile.model';
import { Scoring } from '../ia/scoring';
import { Phenotype } from './phenotype.interface';
import { ShipNeurEvo } from './shipNeuroEvo.model';
import { ShipScoring } from './shipScoring.model';import { RTNeuralNetwork } from '../ia/rt_neat/phenotype/neural-network';
import { RTADN } from '../ia/rt_neat/adn';
import { Perceptron } from '../ia/perceptron';

export interface ShipActions {
    turnRight: boolean;
    turnLeft: boolean;
    reduceFOV: boolean;
    increaseFOV: boolean;
    reduceRadar: boolean;
    increaseRadar: boolean;
    fire: boolean;
}

export interface ShipAttractions {
    reduceFromHealth: boolean;
    increaseToHealth: boolean;
    reduceFromMissiles: boolean;
    increaseToMissiles: boolean;
    reduceFromShips: boolean;
    increaseToShips: boolean;
    reduceFOV: boolean;
    increaseFOV: boolean;
    reduceRadar: boolean;
    increaseRadar: boolean;
    fire: boolean;
}

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
    public static readonly DEFAULT_NN_HIDDEN_LAYERS: number[] = [16, 8];

    private static readonly MAX_SPEED: number = 5;
    private static readonly MIN_SPEED: number = 2;

    public static readonly MIN_FIRE_RATE: number = 0;
    public static readonly MAX_FIRE_RATE: number = 100;

    private static readonly NB_GENES: number = 6;
    // private static readonly NN_OUTPUTS: number[] = [3, 3, 3, 3, 3, 1]; // attractions approach
    // private static readonly NN_OUTPUTS: number[] = [3, 3, 3, 1]; // actions approach
    private static readonly NN_OUTPUTS: number[] = [2, 2, 2, 1]; // actions approach simplified
    public static readonly IS_ACTION_DRIVEN: boolean = true;

    private static readonly NB_NN_INPUT: number = 10;
    private static readonly NN_HIDDEN_LAYERS: number[] = [4, 4];
    private static readonly MIN_ADN_VALUE: number = -1;
    private static readonly MAX_ADN_VALUE: number = 1;
    private static readonly MIN_NN_VALUE: number = 0;
    private static readonly MAX_NN_VALUE: number = 1;

    public static readonly MAX_ANGLE_FOV: number = 120;
    public static readonly MIN_ANGLE_FOV: number = 10;
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

    // Static properties
    public static mean: ShipScoring = null;
    public static std: ShipScoring = null;

    private readonly centerObject: GameObject;

    // Properties
    private coolDown: number;
    private adn: ADN;
    private partner: Ship;
    private nbClones: number;
    private nbChildren: number;
    private adnFactory: FactoryADN;
    private scoringCoefficients: ShipScoring;
    private score: number;

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
    private angleWithMissileOnFOV: number;
    private angleWithShipOnFOV: number;
    private angleWithHealthOnFOV: number;
    private angleWithMissileOnRadar: number;
    private angleWithShipOnRadar: number;
    private angleWithHealthOnRadar: number;

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

        this.fireRate = 0; // Math.round((Ship.MIN_FIRE_RATE + Ship.MAX_FIRE_RATE) / 2);

        this.scoringCoefficients =  scoringCoefficients;
        this.score = 0;

        this.setupADN(adnFactory.getADNType(), neuroEvoInputs, nnStructure, generation);

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
        this.angleWithMissileOnFOV = 0;
        this.angleWithShipOnFOV = 0;
        this.angleWithHealthOnFOV = 0;
        this.angleWithMissileOnRadar = 0;
        this.angleWithShipOnRadar = 0;
        this.angleWithHealthOnRadar = 0;
    }

    public static updateStatistics(ships: Ship[]) {
        Ship.mean = new ShipScoring();
        const names = Ship.mean.getCoefficientNames();
        for (const key of names) {
            Ship.mean.setCoefficient(key.toString(), 0);
        }

        Ship.std = new ShipScoring();
        for (const name of names) {
            Ship.std.setCoefficient(name.toString(), 0);
        }

        for (const ship of ships) {
            for (const key of names) {
                const keyAsString = key.toString();
                Ship.mean.setCoefficient(keyAsString, Ship.mean.getCoefficient(keyAsString) + ship[key]);
            }
        }

        for (const key of names) {
            const keyAsString = key.toString();
            Ship.mean.setCoefficient(keyAsString, Ship.mean.getCoefficient(keyAsString) / ships.length);
        }

        for (const ship of ships) {
            for (const key of names) {
                const keyAsString = key.toString();
                Ship.std.setCoefficient(keyAsString, ((ship[key] - Ship.mean.getCoefficient(keyAsString))
                    * (ship[key] - Ship.mean.getCoefficient(keyAsString))));
            }
        }

        for (const key of names) {
            const keyAsString = key.toString();
            Ship.std.setCoefficient(keyAsString, Math.sqrt((1 / ships.length) * Ship.std.getCoefficient(keyAsString)));
        }
    }

    public older() {
        this.age ++;
        this.adn.metadata.individualAge = this.getAgeInSeconds();
    }

    private setupADN(adnType: number, neuroEvoInputs: ShipNeurEvo, nnStructure: number[],
                     generation: number) {
        // this.adnFactory.setIsHugeADN(this.isNeuroEvo); // will not change once the ship is created
        this.adnFactory.setADNType(adnType); // will not change once the ship is created
        this.isNeuroEvo = this.adnFactory.isHugeAdn() || this.adnFactory.isRTAdn();

        this.generation = generation;
        const minValue = Ship.MIN_ADN_VALUE * 1;
        const maxValue = Ship.MAX_ADN_VALUE * 1;

        if (this.isNeuroEvo) {
            this.inputsNeuroEvo = neuroEvoInputs;
            const activeInputs = this.inputsNeuroEvo.getActiveInputNames();
            const nbNNInputs = activeInputs.length;
            const nbNNOutputs = Ship.NN_OUTPUTS.reduce((accumulator, currentValue) => accumulator + currentValue);
            const inputLabels = activeInputs.map(i => i.toString()
                                                .replace('input', '')
                                                .replace('Distance', 'Dist')
                                                .replace('With', '')
                                                .replace('Detected', 'Found'));
            const outputLabels = ['left', 'right', 'incFOV', 'decFOV', 'incRadar', 'decRadar', 'fire'];

            if (this.adnFactory.isHugeAdn()) {
                this.neuronalNetworkStructure = nnStructure;
                this.nn = new Perceptron(activeInputs.length, this.neuronalNetworkStructure, Ship.NN_OUTPUTS);
                this.nbGenes = this.nn.getNbCoefficients();
                this.createADN(this.nbGenes, minValue, maxValue, nbNNInputs, nbNNOutputs, inputLabels, outputLabels);
            }

            if (this.adnFactory.isRTAdn()) {
                this.createADN(-1, minValue, maxValue, nbNNInputs, nbNNOutputs, inputLabels, outputLabels);
                const rtadn = this.getADN() as RTADN;
                this.nn = new RTNeuralNetwork(rtadn.genome, Ship.NN_OUTPUTS);
            }
        } else {
            this.createADN(Ship.NB_GENES, minValue, maxValue, 0, 0, [], []);
        }
    }

    // TODO TEMPORARY to test worst evolution approach
    public isDead(): boolean {
        return false;
    }

    public createADN(nbGenes: number, minimum: number, maximum: number, 
        nbNNInputs: number, nbNNOutputs: number, inputLabels: string[], outputLabels: string[]) {        
        
        this.adn = this.adnFactory.create(nbGenes, minimum, maximum, 
            nbNNInputs, nbNNOutputs, inputLabels, outputLabels);

        if (!this.isNeuroEvo) {
            // In GA, phenotype is processed once
            this.expressADN();
        }
    }

    public setADN(adn: ADN) {
        this.adn = adn;
        if (!this.isNeuroEvo) {
            this.expressADN();
        } else {
            if (this.adnFactory.isHugeAdn()) {
                const nn = this.nn as Perceptron;
                nn.setCoefficients(adn.getGenes());
            } else if (this.adnFactory.isRTAdn()) {
                const nn = this.nn as RTNeuralNetwork;
                const rtadn = this.adn as RTADN;
                this.nn = new RTNeuralNetwork(rtadn.genome, nn.outputsTemplate);
            }
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

    public needEvaluation(): boolean {
        return this.getAgeInSeconds() >= this.maxTimer;
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

    public getNeuralNetwork(): NeuralNetwork {
        return this.nn;
    }

    public getParentsID(): number[] {
        return this.parentsID;
    }

    public updateScoring() {
        const meanCoeffs = Ship.mean.getCoefficients();
        const stdCoeffs = Ship.std.getCoefficients();
        const coeffs = this.scoringCoefficients.getCoefficients();
        let newScore = 0;

        // tslint:disable-next-line:forin
        for (const key in coeffs) {
            let std = stdCoeffs[key];
            if (std === 0) {
                std = 1;
            } else if (std < 0.8) {
                std = 0.8; // avoid huge scoring values
            }

            const value = (this[key] - meanCoeffs[key]) / std;
            newScore += coeffs[key] * value;
        }

        // Try to modelize an "expectation" indicator depending of lifespan
        // const lifespan = this.getAgeInSeconds();
        this.score = newScore; // / Math.log(lifespan + Math.E) ;
    }

    public scoring(): number {
        return this.score;
    }

    /**
     * Evaluate causes the ship to be back at the factory
     */
    public evaluate() {
        if (this.needEvaluation()) {
            // Evaluate the ship after its TTL
            this.age = 0;
            this.adn.metadata.evaluateFitness(this.score);

            // Restart as "new" from the factory
            this.setPosition(new Vect2D(400, 400));
            const orientation = Math.random() * 360;
            this.setOrientation(orientation);
            this.resetScore();
        } else if (this.adn.metadata.age === 0) {
            // Update fitness in real time if no predefined fitness has been established
            this.adn.metadata.fitness = this.score;
        }
    }

    public resetScore() {
        this.score = 0;
        this.nbHealthPackPicked = 0;
        this.nbReceivedDamage = 0;
        this.missileAccuracy = 0;
        this.nbMissilesLaunched = 0;
        this.nbEnnemiesTouched = 0;
        this.nbEnnemiesDestroyed = 0;
        this.nbMissilesDestroyed = 0;

        // flags previous frame
        this.hasBeenShot = false;
        this.hasBeenHealed = false;
        this.hasFired = false;
        this.hasTouchedEnnemy = false;
        this.hasTouchedMissile = false;
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
            fitness: this.adn.metadata.fitness,
            stamp: this.timer,
            state: this.isDead() ? 'Dead' : 'Alive',
            generation: this.generation,
            evaluation: this.adn.metadata.age,
            lifespan: Math.round(this.getAgeInSeconds()), // in second
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

    private getFlagFromNumber(value: number): boolean {
        return value > 0;
    }

    private convertNNIntoActions(output: number[]): ShipActions {
        const actions = {
            turnRight: this.getFlagFromNumber(output[0]),
            turnLeft: this.getFlagFromNumber(output[1]),
            reduceFOV: this.getFlagFromNumber(output[2]),
            increaseFOV: this.getFlagFromNumber(output[3]),
            reduceRadar: this.getFlagFromNumber(output[4]),
            increaseRadar: this.getFlagFromNumber(output[5]),
            fire: this.getFlagFromNumber(output[6])
        };
        return actions;
    }

    private convertNNIntoAttractions(output: number[]): ShipAttractions {
        const attractions = {
            reduceFromHealth: this.getFlagFromNumber(output[0]),
            increaseToHealth: this.getFlagFromNumber(output[1]),
            reduceFromMissiles: this.getFlagFromNumber(output[2]),
            increaseToMissiles: this.getFlagFromNumber(output[3]),
            reduceFromShips: this.getFlagFromNumber(output[4]),
            increaseToShips: this.getFlagFromNumber(output[5]),
            reduceFOV: this.getFlagFromNumber(output[6]),
            increaseFOV: this.getFlagFromNumber(output[7]),
            reduceRadar: this.getFlagFromNumber(output[8]),
            increaseRadar: this.getFlagFromNumber(output[9]),
            fire: this.getFlagFromNumber(output[10])
        };
        return attractions;
    }

    private matchAttributesNeuroEvo(output: number[]) {

        if (Ship.IS_ACTION_DRIVEN) {
            const actions = this.convertNNIntoActions(output);
            const deltaAngle = 2;
            const deltaFOV = 1;
            const deltaRadar = 1;


            if (actions.turnLeft !== actions.turnRight) { // XOR operator
                const delta = actions.turnLeft ? -deltaAngle : deltaAngle;
                const newAngle = (this.orientation + delta) % 360;
                this.setOrientation(newAngle);
            }

            if (actions.increaseFOV !== actions.reduceFOV) {
                let delta = actions.reduceFOV ? -deltaFOV : deltaFOV;
                delta = (this.fov + deltaFOV > Ship.MAX_ANGLE_FOV) ? 0 : deltaFOV;
                if (delta !== 0) {
                    this.setFOV(Math.round(this.getFOV() + delta));
                }
            }

            if (actions.increaseRadar !== actions.reduceRadar) {
                let delta = actions.reduceRadar ? -deltaRadar : deltaRadar;
                delta = (this.radarLength + deltaRadar > Ship.MAX_LENGTH_RADAR) ? 0 : deltaRadar;
                if (delta !== 0) {
                    this.setRadar(this.radarLength + delta);
                }
            }

            this.fireRate = actions.fire ? 100 : 0;
        } else {
            const attractions = this.convertNNIntoAttractions(output);
            const deltaHealth = 0.05;
            const deltaMissile = 0.05;
            const deltaShip = 0.05;
            const deltaFOV = 1;
            const deltaRadar = 1;

            if (attractions.increaseToHealth !== attractions.reduceFromHealth) {
                let delta = attractions.reduceFromHealth ? -deltaHealth : deltaHealth;
                delta = (this.attractHealth + deltaHealth > Ship.MAX_ATTRACTION) ? 0 : deltaHealth;
                if (delta !== 0) {
                    this.attractHealth += delta;
                }
            }

            if (attractions.increaseToMissiles !== attractions.reduceFromMissiles) {
                let delta = attractions.reduceFromMissiles ? -deltaMissile : deltaMissile;
                delta = (this.attractMissile + deltaMissile > Ship.MAX_ATTRACTION) ? 0 : deltaMissile;
                if (delta !== 0) {
                    this.attractMissile += delta;
                }
            }

            if (attractions.increaseToShips !== attractions.reduceFromShips) {
                let delta = attractions.reduceFromShips ? -deltaShip : deltaShip;
                delta = (this.attractShip + deltaShip > Ship.MAX_ATTRACTION) ? 0 : deltaShip;
                if (delta !== 0) {
                    this.attractShip += delta;
                }
            }

            if (attractions.increaseFOV !== attractions.reduceFOV) {
                let delta = attractions.reduceFOV ? -deltaFOV : deltaFOV;
                delta = (this.fov + deltaFOV > Ship.MAX_ANGLE_FOV) ? 0 : deltaFOV;
                if (delta !== 0) {
                    this.setFOV(Math.round(this.getFOV() + delta));
                }
            }

            if (attractions.increaseRadar !== attractions.reduceRadar) {
                let delta = attractions.reduceRadar ? -deltaRadar : deltaRadar;
                delta = (this.radarLength + deltaRadar > Ship.MAX_LENGTH_RADAR) ? 0 : deltaRadar;
                if (delta !== 0) {
                    this.setRadar(this.radarLength + delta);
                }
            }

            this.fireRate = attractions.fire ? 100 : 0;
        }
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
        const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
        ship.setPosition(pos);
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
        const radAngle = this.fov * Math.PI / 180;

        const oppositeSide = Math.sin(Ship.MIN_ANGLE_FOV * Math.PI / 180) * Ship.MAX_LENGTH_FOV;
        const hyp = Math.sqrt(((oppositeSide / 2) * (oppositeSide / 2)) + (Ship.MAX_LENGTH_FOV * Ship.MAX_LENGTH_FOV));
        const area = 0.5 * hyp * oppositeSide; // 4600; // constant FOV area

        this.fovLength = Math.round(Math.sqrt(2 * area / radAngle));
        // this.fovLength = Ship.MAX_LENGTH_FOV;
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
        ship.setADN(this.adn.copy());
        ship.getADN().mutate();
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
        if (this.canFire(ships, missiles) && (proba <= this.fireRate) && this.fireRate > 0) {
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

        this.angleWithMissileOnFOV = this.detectedMissileOnFOV === null ?
            -100 : this.heading.angleWithVector(Vect2D.sub(this.detectedMissileOnFOV.pos, this.pos));
        this.angleWithShipOnFOV = this.detectedShipOnFOV === null ?
            -100 : this.heading.angleWithVector(Vect2D.sub(this.detectedShipOnFOV.pos, this.pos));
        this.angleWithHealthOnFOV = this.detectedHealthOnFOV === null ?
            -100 : this.heading.angleWithVector(Vect2D.sub(this.detectedHealthOnFOV.pos, this.pos));
        this.angleWithMissileOnRadar = this.detectedMissileOnRadar === null ?
            -100 : this.heading.angleWithVector(Vect2D.sub(this.detectedMissileOnRadar.pos, this.pos));
        this.angleWithShipOnRadar = this.detectedShipOnRadar === null ?
            -100 : this.heading.angleWithVector(Vect2D.sub(this.detectedShipOnRadar.pos, this.pos));
        this.angleWithHealthOnRadar = this.detectedHealthOnRadar === null ?
            -100 : this.heading.angleWithVector(Vect2D.sub(this.detectedHealthOnRadar.pos, this.pos));
    }

    public behaviors(missiles: GameObject[], healths: GameObject[], ships: GameObject[], wArea: number, hArea: number) {
        this.scan(missiles, healths, ships);

        if (this.isNeuroEvo) {
            // in NeuroEvolution phenotype is processed each time a ship makes an action
            this.expressADNNeuroEvo(missiles, healths, ships);
            this.resetStates();
        }

        if (Ship.IS_ACTION_DRIVEN) {
            this.velo.setMag(this.speed);
        } else {
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
        }

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
        const deltaBehindY = Math.sin((this.orientation + 180) * Math.PI / 180) * this.radius;
        const deltaBehindX = Math.cos((this.orientation + 180) * Math.PI / 180) * this.radius;
        const xShip = this.pos.x + deltaBehindX ;
        const yShip = this.pos.y + deltaBehindY ;
        const posBehindShip = new Vect2D(xShip, yShip);

        // Compare angle between heading and target with field of view angle
        const vShipTarget = Vect2D.sub(target.pos, posBehindShip);
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
        // Undetected missile means missile is very far away
        return this.distanceMissileOnFOV === -1 ? 1 : this.distanceMissileOnFOV / Ship.MAX_DISTANCE;
    }
    private get inputDistanceDetectedShipFOV(): number {
        return this.distanceShipOnFOV === -1 ? 1 : this.distanceShipOnFOV / Ship.MAX_DISTANCE;
    }
    private get inputDistanceDetectedHealthFOV(): number {
        return this.distanceHealthOnFOV === -1 ? 1 : this.distanceHealthOnFOV / Ship.MAX_DISTANCE;
    }
    private get inputDistanceDetectedMissileRadar(): number {
        return this.distanceMissileOnRadar === -1 ? 1 : this.distanceMissileOnRadar / Ship.MAX_DISTANCE;
    }
    private get inputDistanceDetectedHealthRadar(): number {
        return this.distanceHealthOnRadar === -1 ? 1 : this.distanceHealthOnRadar / Ship.MAX_DISTANCE;
    }
    private get inputDistanceDetectedShipRadar(): number {
        return this.distanceShipOnRadar === -1 ? 1 : this.distanceShipOnRadar / Ship.MAX_DISTANCE;
    }


    // Radian angle normalized in the range [-1, 1]
    // Undetected missile means missile is very far away
    private get inputAngleWithDetectedMissileFOV(): number {
        return this.distanceMissileOnFOV === -1 ? 0 : this.angleWithMissileOnFOV / Math.PI;
    }
    private get inputAngleWithDetectedShipFOV(): number {
        return this.distanceShipOnFOV === -1 ? 0 : this.angleWithShipOnFOV / Math.PI;
    }
    private get inputAngleWithDetectedHealthFOV(): number {
        return this.distanceHealthOnFOV === -1 ? 0 : this.angleWithHealthOnFOV / Math.PI;
    }
    private get inputAngleWithDetectedMissileRadar(): number {
        return this.distanceMissileOnRadar === -1 ? 0 : this.angleWithMissileOnRadar / Math.PI;
    }
    private get inputAngleWithDetectedHealthRadar(): number {
        return this.distanceHealthOnRadar === -1 ? 0 : this.angleWithHealthOnRadar / Math.PI;
    }
    private get inputAngleWithDetectedShipRadar(): number {
        return this.distanceShipOnRadar === -1 ? 0 : this.angleWithShipOnRadar / Math.PI;
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

    private get scoringHealthPickedAcc(): number {
        return this.nbHealthPackPicked * this.getAccuracy();
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
    private borders: number[];

    public constructor(adnFactory: FactoryADN, energyFuel: number = Ship.DEFAULT_ENERGY_FUEL,
                       energyFire: number = Ship.DEFAULT_ENERGY_FIRE, isNeuroEvolution: boolean = false,
                       nnStruture: number[] = Ship.DEFAULT_NN_HIDDEN_LAYERS, borders: number[] = [0, 800, 0, 800]) {
        this.energyFuel = energyFuel;
        this.energyFire = energyFire;
        this.adnFactory = adnFactory;
        this.scoringCoefficients = new ShipScoring();
        this.isNeuroEvolution = isNeuroEvolution;
        this.neuronalNetworkStructure = nnStruture;
        this.shipNeuroEvo = new ShipNeurEvo();
        this.borders = borders;
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

    public createFromADN(id: number, adn: ADN) {
        const ship = this.create(id, adn.metadata.generation, [adn.metadata.parentA, adn.metadata.parentB]);
        ship.setADN(adn);
        const pos = new Vect2D(Math.random() * this.borders[1], Math.random() * this.borders[3]);
        ship.setPosition(pos);
        const orientation = Math.random() % 360;
        ship.setOrientation(orientation);
        ship.setBorders(this.borders);
        return ship;
    }
}
