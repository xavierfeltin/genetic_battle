import { Genome } from './genotype/genome';
import { ADN } from '../adn';
import { MyMath } from '../../tools/math.tools';
import { NodeGene } from './genotype/node';
import { ConnectGene } from './genotype/connect';

export interface RTADNRates {
    mutation: number;
    crossOver: number;
    mutationActivation: number;
    mutationConnect: number;
    mutationAllowRecurrent: number;
    mutationSplitConnect: number;
}

export class RTADN extends ADN {
    public static readonly MUTATION_ACTIVATION_RATE: number = 0.01;
    public static readonly MUTATION_CONNECT_RATE: number = 0.01;
    public static readonly MUTATION_ALLOW_RECURRENT: number = 0.01;
    public static readonly MUTATION_SPLIT_CONNECT_RATE: number = 0.01;

    private g: Genome;
    private mutationActivationRate: number;
    private mutationConnectRate: number;
    private mutationAllowRecurrentRate: number;
    private mutationSplitConnectRate: number; 

    // TODO: add genome directly in constructor
    constructor(min: number, max: number, rates: RTADNRates) {
        super(0, min, max, rates.mutation, rates.crossOver);
        this.g = new Genome();
        this.mutationActivationRate = rates.mutationActivation;
        this.mutationConnectRate = rates.mutationConnect;
        this.mutationAllowRecurrentRate = rates.mutationAllowRecurrent;
        this.mutationSplitConnectRate = rates.mutationSplitConnect; 
    }

    public get genome(): Genome {
        return this.g;
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
        const result = new RTADN(this.minimum, this.maximum, this.rates);

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
        const result = new RTADN(this.minimum, this.maximum, this.rates);
        const newGenome = this.g.copy();

        let pct = this.maximum * 0.5;
        if (pct === 0) {
            pct = 0.01;
        }

        for (const link of newGenome.connectGenes) {
            if (Math.random() <= this.mutationRate) {
                link.weight = link.weight + MyMath.random(-pct, pct);
                link.weight = Math.max(link.weight, 8);
                link.weight = Math.min(link.weight, -8);
            }

            if (Math.random() <= this.mutationActivationRate) {
                link.activate(!link.isEnabled);
            }            
        }

        if (Math.random() <= this.mutationConnectRate) {
            //TODO : check previously existing innovation to set the correct innovation number

            const nodeIn = this.g.nodeGenes[Math.round(MyMath.random(0, this.g.nodeGenes.length -1))];
            const nodeOut = this.g.nodeGenes[Math.round(MyMath.random(0, this.g.nodeGenes.length -1))];

            if (Math.random() <= this.mutationAllowRecurrentRate && nodeOut.layer <= nodeIn.layer) {
                this.g.addConnection(nodeOut, nodeIn); // prevent the recurrent by flipping the connection
            } else {
                this.g.addConnection(nodeIn, nodeOut); // percentage where a recurrent link is acceptable
            }                
        }

        if (Math.random() <= this.mutationSplitConnectRate) {
            //TODO : check previously existing innovation to set the correct innovation number

            const enabledLinks = this.g.connectGenes.filter((link: ConnectGene) => link.isEnabled);
            const link = enabledLinks[Math.round(MyMath.random(0, enabledLinks.length -1))];
            this.g.splitConnection(link);
        }

        return result;
    }

    public get rates(): RTADNRates {
        return {
            mutation: this.mutationRate,
            crossOver: this.crossOverRate,
            mutationActivation: this.mutationActivationRate,
            mutationConnect: this.mutationConnectRate,
            mutationAllowRecurrent: this.mutationAllowRecurrentRate,
            mutationSplitConnect: this.mutationSplitConnectRate
        }
    }
}
