import { MyMath } from '../tools/math.tools';

export interface Rates {
    mutation: number;
    crossOver: number;

    //RTADN specific
    mutationActivation?: number;
    mutationConnect?: number;
    mutationAllowRecurrent?: number;
    mutationSplitConnect?: number;
}

export class Meta {
    private static readonly MIN_AGE_FITNESS_EVALUATION = 4;
    private static readonly COEFF_FORGETTING_FITNESS = 0.6;

    // Identification
    public id: number;
    public parentA?: number;
    public parentB?: number;
    public generation?: number;

    // Evaluation
    public fitness: number;
    public stdFitness: number; // standardized for computing proba
    public adjustedFitness: number;
    public proba: number;

    // Specific
    public specieId: number;
    public isToRemove: boolean;
    public age: number; // number of evaluation of this ADN

    public constructor() {
        this.id = -1;
        this.parentA = -1;
        this.parentB = -1;
        this.generation = 1;
        this.fitness = 0;
        this.stdFitness = 0;
        this.adjustedFitness = 0;
        this.proba = -1;
        this.specieId = -1;
        this.isToRemove = false;
        this.age = 0;
    }

    /**
     * No previous evaluation, take the score as such
     * First evaluations, use the mean of previous fitnesses
     * After, use a forgetting coefficient on older fitness
     * @param score score of the last evaluation of the individual
     */
    public evaluateFitness(score: number) {
        if (this.age === 0) {
            this.fitness = score;
        } else if (this.age <= Meta.MIN_AGE_FITNESS_EVALUATION) {
            this.fitness = this.fitness * this.age;
            this.fitness += score;
            this.fitness /= (this.age + 1);
        } else {
            this.fitness = this.fitness + (score - this.fitness) * Meta.COEFF_FORGETTING_FITNESS;
        }
        this.age += 1;
    }
}

export class ADN {
    public static readonly MUTATION_RATE = 0.02;
    public static readonly CROSSOVER_RATE = 0.8;
    public static readonly DEFAULT_RATES = {
        mutation: ADN.MUTATION_RATE,
        crossOver: ADN.CROSSOVER_RATE
    }

    protected genes: number[];
    protected rates: Rates;
    //protected mutationRate: number;
    //protected crossOverRate: number;

    // Allowed range for each adn coefficients
    protected minimum: number;
    protected maximum: number;
    protected meta: Meta;

    constructor(nbGenes: number, min: number, max: number, rates: Rates) {
        this.minimum = min;
        this.maximum = max;
        this.rates.mutation = rates.mutation;
        this.rates.crossOver = rates.crossOver;

        this.genes = [];
        for (let i = 0; i < nbGenes; i++) {
            this.genes.push(MyMath.random(this.minimum, this.maximum));
        }

        this.meta = new Meta();
    }

    public getGenes(): number[] {
        return this.genes;
    }

    public getSize(): number {
        return this.genes.length;
    }

    public crossOver(adn: ADN): ADN {
        const result = new ADN(this.genes.length, this.minimum, this.maximum, this.rates);
        result.metadata.parentA = this.metadata.id;
        result.metadata.parentB = adn.metadata.id;
        result.metadata.generation = this.metadata.generation + 1;
        return result;
    }

    public mutate(): ADN {
        const result = new ADN(this.genes.length, this.minimum, this.maximum, this.rates);
        return result;
    }

    public get metadata(): Meta {
        return this.meta;
    }

    public set metadata(meta: Meta) {
        this.meta = meta;
    }
}

export class HugeADN extends ADN {
    constructor(nbGenes: number, min: number, max: number, rates: Rates) {
        super(nbGenes, min, max, rates);
    }

    public mutate(): HugeADN {
        const result = new HugeADN(this.genes.length, this.minimum, this.maximum, this.rates);

        const maxGenesToMutate = Math.ceil(this.genes.length * this.rates.mutation); // * ADN.MUTATION_RATE;
        const nbToMutate = Math.round(Math.random() * maxGenesToMutate);

        const indexes = [];
        for (let i = 0; i < nbToMutate; i++) {
            indexes.push(Math.round(Math.random() * this.genes.length));
        }

        for (let i = 0; i < this.genes.length; i++) {
            if (i in indexes) {
                let pct = this.maximum * 0.5;
                if (pct === 0) {
                    pct = 0.01;
                }
                result[i] = this.genes[i] + MyMath.random(-pct, pct);
                result[i] = Math.max(result[i], -8);
                result[i] = Math.min(result[i], 8);
            } else {
                result[i] = this.genes[i];
            }
        }

        return result;
    }

    public crossOver(adn: ADN): ADN {
        const result = new HugeADN(this.genes.length, this.minimum, this.maximum, this.rates);

        for (let i = 0; i < result.genes.length; i++) {

            const probaSwitch = Math.random();
            if (probaSwitch <= this.rates.crossOver) {
                result.genes[i] = (this.genes[i] + adn.getGenes()[i]) / 2;
            }

            /* Replace value approach
            const probaSwitch = Math.random();
            if (probaSwitch <= this.crossOverRate) {
                result.genes[i] = this.genes[i];
            } else {
                result.genes[i] = adn.getGenes()[i];
            }
            */
        }

        result.metadata.parentA = this.metadata.id;
        result.metadata.parentB = adn.metadata.id;
        result.metadata.generation = this.metadata.generation + 1;

        return result;
    }
}

export class SmallADN extends ADN {
    constructor(nbGenes: number, min: number, max: number, rates: Rates) {
        super(nbGenes, min, max, rates);
    }

    public mutate(): SmallADN {
        const result = new SmallADN(this.genes.length, this.minimum, this.maximum, this.rates);

        const maxGenesToMutate = Math.ceil(this.genes.length * this.rates.mutation);
        const nbToMutate = Math.round(Math.random() * maxGenesToMutate);

        const indexes = [];
        for (let i = 0; i < nbToMutate; i++) {
            indexes.push(Math.round(Math.random() * this.genes.length));
        }

        for (let i = 0; i < this.genes.length; i++) {
            if (i in indexes) {
                let pct = this.maximum * 0.5;
                if (pct === 0) {
                    pct = 0.01;
                }

                result[i] = this.genes[i] + MyMath.random(-pct, pct);
                result[i] = Math.max(result[i], this.minimum);
                result[i] = Math.min(result[i], this.maximum);
            } else {
                result[i] = this.genes[i];
            }
        }

        return result;
    }

    /**
     * Cross over between two ADN
     * Calling ADN is the reference for the crossOver rate
     * @param adn second parent adn
     */
    public crossOver(adn: ADN): ADN {
        const result = new SmallADN(this.genes.length, this.minimum, this.maximum, this.rates);

        for (let i = 0; i < this.genes.length; i++) {
            const probaSwitch = Math.random();
            if (probaSwitch <= this.rates.crossOver) {
                result.genes[i] = this.genes[i];
            } else {
                result.genes[i] = adn.getGenes()[i];
            }
        }

        result.metadata.parentA = this.metadata.id;
        result.metadata.parentB = adn.metadata.id;
        result.metadata.generation = this.metadata.generation + 1;

        return result;
    }
}

export class FactoryADN {
    private rates: Rates;
    private isHugeADN: boolean;

    public constructor(rates: Rates = ADN.DEFAULT_RATES, isHugeADN: boolean = true) {
        this.rates.mutation = rates.mutation;
        this.rates.crossOver = rates.crossOver;
        this.isHugeADN = isHugeADN;
    }

    public getMutationRate(): number {
        return this.rates.mutation;
    }

    public setMutationRate(rate: number) {
        this.rates.mutation = rate;
    }

    public getCrossOverRate(): number {
        return this.rates.crossOver;
    }

    public setCrossOverRate(rate: number) {
        this.rates.crossOver = rate;
    }

    public getIsHugeADN(): boolean {
        return this.isHugeADN;
    }

    public setIsHugeADN(isHugeADN: boolean) {
        this.isHugeADN = isHugeADN;
    }

    public create(nbGenes: number, min: number, max: number): ADN {
        if (this.isHugeADN) {
            return new HugeADN(nbGenes, min, max, this.rates);
        } else {
            return new SmallADN(nbGenes, min, max, this.rates);
        }
    }
}
