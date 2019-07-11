import { MyMath } from '../tools/math.tools';

export class ADN {
    public static readonly MUTATION_RATE = 0.02;
    public static readonly CROSSOVER_RATE = 0.8;

    protected genes: number[];
    protected mutationRate: number;
    protected crossOverRate: number;

    // Allowed range for each adn coefficients
    protected minimum: number;
    protected maximum: number;

    constructor(nbGenes: number, min: number, max: number, mutationRate: number, crossOverRate: number) {
        this.minimum = min;
        this.maximum = max;
        this.mutationRate = mutationRate;
        this.crossOverRate = crossOverRate;

        this.genes = [];
        for (let i = 0; i < nbGenes; i++) {
            this.genes.push(MyMath.random(this.minimum, this.maximum));
        }
    }

    public getGenes(): number[] {
        return this.genes;
    }

    public getSize(): number {
        return this.genes.length;
    }

    public crossOver(adn: ADN): ADN {
        const result = new ADN(this.genes.length, this.minimum, this.maximum, this.mutationRate, this.crossOverRate);
        return result;
    }

    public mutate(): ADN {
        const result = new ADN(this.genes.length, this.minimum, this.maximum, this.mutationRate, this.crossOverRate);
        return result;
    }
}

export class HugeADN extends ADN {
    constructor(nbGenes: number, min: number, max: number, mutationRate: number, crossOverRate: number) {
        super(nbGenes, min, max, mutationRate, crossOverRate);
    }

    public mutate(): HugeADN {
        const result = new HugeADN(this.genes.length, this.minimum, this.maximum, this.mutationRate, this.crossOverRate);

        const maxGenesToMutate = Math.ceil(this.genes.length * this.mutationRate); // * ADN.MUTATION_RATE;
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
                // result[i] = Math.max(result[i], this.minimum);
                // result[i] = Math.min(result[i], this.maximum);
            } else {
                result[i] = this.genes[i];
            }
        }

        return result;
    }

    public crossOver(adn: ADN): ADN {
        const result = new HugeADN(this.genes.length, this.minimum, this.maximum, this.mutationRate, this.crossOverRate);

        for (let i = 0; i < result.genes.length; i++) {
            const probaSwitch = Math.random();
            if (probaSwitch <= this.crossOverRate) {
                result.genes[i] = this.genes[i];
            } else {
                result.genes[i] = adn.getGenes()[i];
            }
        }

        return result;
    }
}

export class SmallADN extends ADN {
    constructor(nbGenes: number, min: number, max: number, mutationRate: number, crossOverRate: number) {
        super(nbGenes, min, max, mutationRate, crossOverRate);
    }

    public mutate(): SmallADN {
        const result = new SmallADN(this.genes.length, this.minimum, this.maximum, this.mutationRate, this.crossOverRate);

        const maxGenesToMutate = Math.ceil(this.genes.length * this.mutationRate);
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
        const result = new SmallADN(this.genes.length, this.minimum, this.maximum, this.mutationRate, this.crossOverRate);

        for (let i = 0; i < this.genes.length; i++) {
            const probaSwitch = Math.random();
            if (probaSwitch <= this.crossOverRate) {
                result.genes[i] = this.genes[i];
            } else {
                result.genes[i] = adn.getGenes()[i];
            }
        }

        return result;
    }
}

export class FactoryADN {
    private mutationRate: number;
    private crossOverRate: number;
    private isHugeADN: boolean;

    public constructor(mutationRate: number = ADN.MUTATION_RATE, crossOverRate: number = ADN.CROSSOVER_RATE, isHugeADN: boolean = true) {
        this.mutationRate = mutationRate;
        this.crossOverRate = crossOverRate;
        this.isHugeADN = isHugeADN;
    }

    public getMutationRate(): number {
        return this.mutationRate;
    }

    public setMutationRate(rate: number) {
        this.mutationRate = rate;
    }

    public getCrossOverRate(): number {
        return this.crossOverRate;
    }

    public setCrossOverRate(rate: number) {
        this.crossOverRate = rate;
    }

    public getIsHugeADN(): boolean {
        return this.isHugeADN;
    }

    public setIsHugeADN(isHugeADN: boolean) {
        this.isHugeADN = isHugeADN;
    }

    public create(nbGenes: number, min: number, max: number): ADN {
        if (this.isHugeADN) {
            return new HugeADN(nbGenes, min, max, this.mutationRate, this.crossOverRate);
        } else {
            return new SmallADN(nbGenes, min, max, this.mutationRate, this.crossOverRate);
        }
    }
}
