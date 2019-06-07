import { MyMath } from '../tools/math.tools';

export class ADN {
    public static readonly MUTATION_RATE = 0.01;
    public static readonly SWITCH_RATE = 0.5;

    protected genes: number[];
    protected mutationRate: number;

    // Allowed range for each adn coefficients
    protected minimum: number;
    protected maximum: number;

    constructor(nbGenes: number, min: number, max: number, mutationRate: number) {
        this.minimum = min;
        this.maximum = max;
        this.mutationRate = mutationRate;

        this.genes = [];
        for (let i = 0; i < nbGenes; i++) {
            this.genes.push(MyMath.random(this.minimum, this.maximum));
        }
    }

    public getGenes() {
        return this.genes;
    }

    public getSize() {
        return this.genes.length;
    }

    public crossOver(adn: ADN): ADN {
        const result = new ADN(this.genes.length, this.minimum, this.maximum, this.mutationRate);
        return result;
    }

    public mutate() {
        const result = new ADN(this.genes.length, this.minimum, this.maximum, this.mutationRate);
        return result;
    }
}

export class HugeADN extends ADN {
    constructor(nbGenes: number, min: number, max: number, mutationRate: number) {
        super(nbGenes, min, max, mutationRate);
    }

    public mutate() {
        const result = new HugeADN(this.genes.length, this.minimum, this.maximum, this.mutationRate);

        const maxGenesToMutate = Math.round(Math.sqrt(this.genes.length)); // * ADN.MUTATION_RATE;
        const nbToMutate = Math.round(Math.random() * maxGenesToMutate);

        const indexes = [];
        for (let i = 0; i < nbToMutate; i++) {
            indexes.push(Math.round(Math.random() * this.genes.length));
        }

        for (let i = 0; i < this.genes.length; i++) {
            if (i in indexes) {
                let pct = this.maximum * 1.0;
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
        const result = new HugeADN(this.genes.length, this.minimum, this.maximum, this.mutationRate);

        for (let i = 0; i < result.genes.length; i++) {
            const probaSwitch = Math.random();
            if (probaSwitch <= ADN.SWITCH_RATE) {
                result.genes[i] = adn.getGenes()[i];
            } else {
                result.genes[i] = this.genes[i];
            }
        }

        return result;
    }
}

export class SmallADN extends ADN {
    constructor(nbGenes: number, min: number, max: number, mutationRate: number) {
        super(nbGenes, min, max, mutationRate);
    }

    public mutate() {
        const result = new SmallADN(this.genes.length, this.minimum, this.maximum, this.mutationRate);

        const maxGenesToMutate = this.genes.length * ADN.MUTATION_RATE;
        const nbToMutate = Math.ceil(Math.random() * maxGenesToMutate);

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

    public crossOver(adn: ADN): ADN {
        const result = new SmallADN(this.genes.length, this.minimum, this.maximum, this.mutationRate);

        const median = Math.floor(result.genes.length / 2);
        const isOdd = (result.genes.length % 2) === 0;

        for (let i = 0; i < median; i++) {
            result.genes[i] = this.genes[i];
        }

        let index = median;
        if (isOdd) {
            result.genes[median] = (Math.random() < 0.5) ? this.genes[median] : adn.getGenes()[median];
            index++;
        }

        for (let i = index; i < result.genes.length; i++) {
            result.genes[i] = this.genes[i];
        }

        return result;
    }
}

export class FactoryADN {
    private mutationRate: number;
    private isHugeADN: boolean;

    public constructor(rate: number = ADN.MUTATION_RATE, isHugeADN: boolean = true) {
        this.mutationRate = rate;
        this.isHugeADN = isHugeADN;
    }

    public getMutationRate(): number {
        return this.mutationRate;
    }

    public setMutationRate(rate: number) {
        this.mutationRate = rate;
    }

    public getIsHugeADN(): boolean {
        return this.isHugeADN;
    }

    public setIsHugeADN(isHugeADN: boolean) {
        this.isHugeADN = isHugeADN;
    }

    public create(nbGenes: number, min: number, max: number): ADN {
        if (this.isHugeADN) {
            return new HugeADN(nbGenes, min, max, this.mutationRate);
        }
        else {
            return new SmallADN(nbGenes, min, max, this.mutationRate);
        }
    }
}
