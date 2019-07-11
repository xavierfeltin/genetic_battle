import { Genome } from './genotype/genome';
import { ADN } from '../adn';
import { MyMath } from '../../tools/math.tools';

export class RTADN extends ADN {
    public static readonly MUTATION_ACTIVATION_RATE: number = 0.01;
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

        let unionNodes = this.genome.nodeGenes.map(n => n.copy());

        const unionLinks = [];
        let index = 0; 

        // Make an union of all the innovation numbers
        for (const link of this.genome.connectGenes) {

            // Some innovations are present in the other set and not in the current genome
            while (index < adn.genome.connectGenes.length 
                && adn.genome.connectGenes[index].innovation < link.innovation) {
                unionLinks.push(adn.genome.connectGenes[index].copy([]));
                index++;
            }

            // Innovations are present in both genomes
            if (index < adn.genome.connectGenes.length 
                && adn.genome.connectGenes[index].innovation === link.innovation) {
                //TO DO: choose from the most fit parent (see in publication to confirm)
            } else {
                // Innovation is only present in this genome
                unionLinks.push(link.copy([]));
            }
        }

        // Innovations remain in the other genome
        if (index < adn.genome.connectGenes.length) {
            for (const link of adn.genome.connectGenes) {
                unionLinks.push(link.copy([]));
            }
        }

        return result;
    }

    public mutate(): RTADN {
        const result = new RTADN(this.minimum, this.maximum, this.mutationRate, this.crossOverRate);
        const newGenome = this.g.copy();

        let pct = this.maximum * 0.5;
        if (pct === 0) {
            pct = 0.01;
        }

        for (const link of newGenome.connectGenes) {
            if (Math.random() <= ADN.MUTATION_RATE) {
                link.weight = link.weight + MyMath.random(-pct, pct);
                link.weight = Math.max(link.weight, this.minimum);
                link.weight = Math.min(link.weight, this.maximum);
            }

            if (Math.random() <= RTADN.MUTATION_ACTIVATION_RATE) {
                link.activate(!link.isEnabled);
            }
        }

        return result;
    }
}
