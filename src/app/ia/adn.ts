import { MyMath } from '../tools/math.tools';

export class ADN {
    private static readonly MUTATION_RATE = 0.01;
    private genes: number[];

    // Allowed range for each adn coefficients
    private minimums: number[];
    private maximums: number[];

    constructor(nbGenes: number, min: number[], max: number[]) {
        this.minimums = [...min];
        this.maximums = [...max];
        this.genes = Array<number>(nbGenes);
        for (let i = 0; i < nbGenes; i++) {
            this.genes[i] = Math.random();
        }
    }

    public getGenes() {
        return this.genes;
    }

    public getSize() {
        return this.genes.length;
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
