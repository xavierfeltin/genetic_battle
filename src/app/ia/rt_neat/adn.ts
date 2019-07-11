import { Genome } from './genotype/genome';
import { ADN } from '../adn';

export class RTADN extends ADN {
    protected g: Genome;

    constructor(min: number, max: number, mutationRate: number, crossOverRate: number) {
        super(0, min, max, mutationRate, crossOverRate);
        this.g = new Genome();
    }

    public get genome(): Genome {
        return this.genome;
    }

    public set genome(gen: Genome) {
        this.g = gen;
    }

    public crossOver(adn: RTADN): RTADN {
        const result = new RTADN(this.minimum, this.maximum, this.mutationRate, this.crossOverRate);
        return result;
    }

    public mutate(): RTADN {
        const result = new RTADN(this.minimum, this.maximum, this.mutationRate, this.crossOverRate);
        const newGenome = this.g.copy();

        return result;
    }
}
