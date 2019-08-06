import { Node } from './node';
import { Connect } from './connect';
import { Genome } from '../genotype/genome';
import { NodeGene } from '../genotype/node';

export class NeuralNetwork {
    private inputs: Node[];
    private layers: Node[][];
    private outputs: Node[];
    private links: Connect[];

    constructor() {
        this.inputs = [];
        this.layers = [];
        this.outputs = [];
        this.links = [];
    }

    // Instanciate the neural network from a genome description
    init(genome: Genome) {
        const nodes = genome.nodeGenes.sort((a: NodeGene, b: NodeGene): number => {
            return (a.layer > b.layer) ? -1 : (a.layer < b.layer) ? 1 : 0;
        });

        const hiddens: Node[] = [];
        for (const node of nodes) {
            if (node.isInput()) {
                const newNode = new Node(node.identifier, node.nodeType, node.layer, 'none');
                this.inputs.push(newNode);
            } else if (node.isOutput()) {
                const newNode = new Node(node.identifier, node.nodeType, node.layer, 'tanh');
                this.outputs.push(newNode);
            } else {
                const newNode = new Node(node.identifier, node.nodeType, node.layer, 'tanh');
                hiddens.push(newNode);
            }
        }

        // Keep only enabled links
        for (const link of genome.connectGenes) {
            if (link.isEnabled) {
                let inNode: Node = null;
                if (link.inputNode.isInput()) {
                    inNode = this.inputs.find((value: Node) => value.identifier === link.inputNode.identifier);
                } else if (link.inputNode.isOutput()) {
                    inNode = this.outputs.find((value: Node) => value.identifier === link.inputNode.identifier);
                } else {
                    inNode = hiddens.find((value: Node) => value.identifier === link.inputNode.identifier);
                }

                let outNode: Node = null;
                if (link.outputNode.isInput()) {
                    outNode = this.inputs.find((value: Node) => value.identifier === link.outputNode.identifier);
                } else if (link.outputNode.isOutput()) {
                    outNode = this.outputs.find((value: Node) => value.identifier === link.outputNode.identifier);
                } else {
                    outNode = hiddens.find((value: Node) => value.identifier === link.outputNode.identifier);
                }

                const newLink = new Connect(link.innovation, inNode, outNode, link.weight);
                inNode.addOutput(newLink);
                outNode.addInput(newLink);
                this.links.push(newLink);
            }
        }

        // divide effective hidden nodes into layers
        // TODO: do not take into account hidden nodes not connected to any output
        const split = {};
        for (const node of hiddens) {
            if (node.inputs.length > 0 || node.outputs.length > 0) {
                if (!(node.layer in split)) {
                    split[node.layer] =  [];
                }
                split[node.layer].push(node);
            }
        }

        let indexes: number[] = Object.keys(split).map( i => parseInt(i) );
        indexes = indexes.sort();
        for (const index in split) {
            this.layers.push(split[index]);
        }
    }

    feedForward(values: number[]): number[] {
        // Update inputs with new values
        for (let i = 0; i < values.length; i++) {
            this.inputs[i].value = values[i];
        }

        // Activate nodes through all layers
        for (const layer of this.layers) {
            for (const node of layer) {
                node.activate();
            }
        }

        // Activate outputs
        for (const out of this.outputs) {
            out.activate();
        }

        // Update previous values for reccurent links
        for (const link of this.links) {
            if (link.reccurent) {
                link.inputNode.saveInMemory();
            }
        }

        return this.outputs.map( out => out.value );
    }

    public get networkInputs(): Node[] {
        return this.inputs;
    }

    public get networkOutputs(): Node[] {
        return this.outputs;
    }

    public get networkLayers(): Node[][] {
        return this.layers;
    }

    public get networkConnections(): Connect[] {
        return this.links;
    }

    public print() {
        console.log('Inputs: ');
        for (const input of this.inputs) {
            input.print();
        }

        console.log('Hiddens: ');
        for (let i = 0 ; i < this.layers.length; i++) {
            console.log('Layer ' + i);
            for (const hidden of this.layers[i]) {
                hidden.print();
            }
        }

        console.log('Outputs: ');
        for (const output of this.outputs) {
            output.print();
        }

        console.log('Links: ');
        for (const link of this.links) {
            link.print();
        }
    }
}
