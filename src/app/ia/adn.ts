import { MyMath } from '../tools/math.tools';

export class ADN {
    public static readonly MUTATION_RATE = 0.02;
    public static readonly SWITCH_RATE = 0.01;

    private genes: number[];
    private mutationRate: number;

    // Allowed range for each adn coefficients
    private minimums: number[];
    private maximums: number[];

    constructor(nbGenes: number, min: number[], max: number[], mutationRate: number) {
        this.minimums = [...min];
        this.maximums = [...max];
        this.mutationRate = mutationRate;

        this.genes = Array<number>(nbGenes);
        for (let i = 0; i < nbGenes; i++) {
            this.genes[i] = MyMath.random(min[i], max[i]);
        }
    }

    public getGenes() {
        return this.genes;
    }

    public getSize() {
        return this.genes.length;
    }

    public crossOver(adn: ADN): ADN {
        const result = new ADN(this.genes.length, this.minimums, this.maximums, this.mutationRate);

        for (let i = 0; i < result.genes.length; i++) {
            const probaSwitch = Math.random();
            if (probaSwitch <= ADN.SWITCH_RATE) {
                result.genes[i] = adn.genes[i];
            } else {
                result.genes[i] = this.genes[i];
            }
        }

        /*
        const median = Math.floor(result.genes.length / 2);
        const isOdd = (result.genes.length % 2) === 0;

        for (let i = 0; i < median; i++) {
            result.genes[i] = this.genes[i];
        }

        let index = median;
        if (isOdd) {
            result.genes[median] = (Math.random() < 0.5) ? this.genes[median] : adn.genes[median];
            index++;
        }

        for (let i = index; i < result.genes.length; i++) {
            result.genes[i] = this.genes[i];
        }
        */

        return result;
    }

    public mutate(): ADN {
        const result = new ADN(this.genes.length, this.minimums, this.maximums, this.mutationRate);

        for (let i = 0; i < this.genes.length; i++) {
            if (Math.random() < ADN.MUTATION_RATE) {
                let pct = this.genes[i] * 0.05;
                if (pct === 0) {
                    pct = 0.01;
                }
                this.genes[i] += MyMath.random(-pct, pct);
            } else {
                result.genes[i] = this.genes[i];
            }
        }

        return result;
    }
}

export class FactoryADN {
    private mutationRate: number;

    public constructor(rate: number = ADN.MUTATION_RATE) {
        this.mutationRate = rate;
    }

    public getMutationRate(): number {
        return this.mutationRate;
    }

    public setMutationRate(rate: number) {
        this.mutationRate = rate;
    }

    public create(nbGenes: number, min: number[], max: number[]): ADN {
        return new ADN(nbGenes, min, max, this.mutationRate);
    }
}
