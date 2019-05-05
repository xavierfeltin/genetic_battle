import { MyMath } from '../tools/math.tools';

export class ADN {
    private static readonly MUTATION_RATE = 0.05;
    private genes: number[];

    // Allowed range for each adn coefficients
    private minimums: number[];
    private maximums: number[];

    constructor(nbGenes: number, min: number[], max: number[]) {
        this.minimums = [...min];
        this.maximums = [...max];
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
        const result = new ADN(this.genes.length, this.minimums, this.maximums);
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

        return result;
    }

    public mutate(): ADN {
        const result = new ADN(this.genes.length, this.minimums, this.maximums);

        for (let i = 0; i < this.genes.length; i++) {
            if (Math.random() < ADN.MUTATION_RATE) {
                this.genes[i] += MyMath.random(-0.1, 0.1);
            } else {
                result.genes[i] = this.genes[i];
            }
        }

        return result;
    }
}
