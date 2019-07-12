import { Genome } from './genotype/genome';
import { ADN } from '../adn';
import { MyMath } from '../../tools/math.tools';
import { NodeGene } from './genotype/node';

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

    /**
     * Crossover between two adn
     * @param adn adn from the second parent
     * @param isBest -1 current parent is best, 0 both are the same, 1 other parent is best
     */
    public crossOver(adn: RTADN, isBest: number = 0): RTADN {
        const result = new RTADN(this.minimum, this.maximum, this.mutationRate, this.crossOverRate);

        const unionLinks = [];
        const unionNodes = []; // generated from the links kept during crossover
        let index = 0;

        // Make an union of all the innovation numbers
        for (const link of this.genome.connectGenes) {

            // Some innovations are present in the other set and not in the current genome
            while (index < adn.genome.connectGenes.length
                && adn.genome.connectGenes[index].innovation < link.innovation) {

                // Push it if this parent is the best or both have the same fitness
                if (isBest === 1) {
                    unionLinks.push(adn.genome.connectGenes[index].copy([]));
                }
                index++;
            }

            // Innovations are present in both genomes
            if (index < adn.genome.connectGenes.length
                && adn.genome.connectGenes[index].innovation === link.innovation) {
                // Set the link with the average of the weights from the 2 parents
                const newLink = link.copy([]);
                newLink.weight = (link.weight + adn.genome.connectGenes[index].weight) / 2;
            } else {
                // push it if this parent is the best or both have the same fitness
                if (isBest === -1) {
                    unionLinks.push(link.copy([]));
                }
            }
        }

        // Innovations remain in the other genome
        if (index < adn.genome.connectGenes.length) {
            for (const link of adn.genome.connectGenes) {
                unionLinks.push(link.copy([]));
            }
        }

        // Get the nodes from the links
        for (const link of unionLinks) {
            let found: NodeGene = unionNodes.find((n: NodeGene) => n.identifier === link.inNode.identifier);
            if (!found) {
                unionNodes.push(link.inNode);
            } else if (found.layer !== link.inNode.layer) {
                // Update the layer with the latest link information
                found.layer = link.inNode.layer;
            }

            found = unionNodes.find((n: NodeGene) => n.identifier === link.outNode.identifier);
            if (!found) {
                unionNodes.push(link.outNode);
            } else if (found.layer !== link.outNode.layer) {
                // Update the layer with the latest link information
                found.layer = link.outNode.layer;
            }
        }

        result.g.nodeGenes = unionNodes;
        result.g.connectGenes = unionLinks;
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
                link.weight = Math.max(link.weight, 8);
                link.weight = Math.min(link.weight, -8);
            }

            if (Math.random() <= RTADN.MUTATION_ACTIVATION_RATE) {
                link.activate(!link.isEnabled);
            }
        }

        return result;
    }
}
