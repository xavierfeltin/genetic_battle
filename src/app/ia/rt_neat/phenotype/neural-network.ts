import { Connect } from './connect';
import { Genome } from '../genotype/genome';
import { NodeGene } from '../genotype/node';
import { ConnectGene } from '../genotype/connect';

export class NeuralNetwork {
    private layers: Node[][]; // each layer has nodes computed in //
    private links: Connect[];

    constructor() {
        this.layers = [];
        this.links = [];
    }

    // Instanciate the neural network from a genome description
    init(genome: Genome) {
        const nodes = genome.nodeGenes.sort((a: NodeGene, b: NodeGene): number => {
            return (a.layer > b.layer) ? -1 : (a.layer < b.layer) ? 1 : 0;
        });

        const inputs: Node[] = [];
        const outputs: Node[] = [];
        const hiddens: Node[] = [];
        for (const node of nodes) {
            if (node.isInput()) {
                inputs.push(node);
            } else if (node.isOutput()) {
                outputs.push(node);
            } else {
                hiddens.push(node);
            }
        }

        const links = genome.connectGenes.filter((link: ConnectGene): boolean => {
            return link.isEnabled;
        });
    }

    feedForward(): number[] {
        return [];
    }
}
