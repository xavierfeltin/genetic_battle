import { Node } from './node';
import { Connect } from './connect';
import { Genome } from '../genotype/genome';
import { NodeGene } from '../genotype/node';
import { NeuralNetwork } from '../../neural-network';
import { Matrix } from '../../matrix';

export class RTNeuralNetwork extends NeuralNetwork {
    private inputs: Node[];
    private layers: Node[][];
    private outputs: Node[];
    private outTemplate: number[];
    private links: Connect[];

    constructor(genome: Genome = null, outputsTemplate: number[] = []) {
        super();
        this.inputs = [];
        this.layers = [];
        this.outputs = [];
        this.outTemplate = outputsTemplate;
        this.links = [];

        if (genome !== null) {
            this.init(genome);
        }
    }

    public get outputsTemplate(): number[] {
        return this.outTemplate;
    }

    // Instanciate the neural network from a genome description
    private init(genome: Genome) {
        const nodes = genome.nodeGenes.sort((a: NodeGene, b: NodeGene): number => {
            return (a.layer > b.layer) ? -1 : (a.layer < b.layer) ? 1 : 0;
        });

        const hiddens: Node[] = [];
        for (const node of nodes) {
            if (node.isInput()) {
                const newNode = new Node(node.identifier, node.nodeType, node.layer, 'none', node.name, 0);
                this.inputs.push(newNode);
            } else if (node.isOutput()) {
                const newNode = new Node(node.identifier, node.nodeType, node.layer, 'tanh', node.name, 0);
                this.outputs.push(newNode);
            } else {
                // Do not copy node without outputs
                if (node.outputs.length > 0) {
                    const newNode = new Node(node.identifier, node.nodeType, node.layer, 'tanh', '', 0);
                    hiddens.push(newNode);
                }                
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

                if (inNode !== null && outNode !== null) {
                    const newLink = new Connect(link.innovation, inNode, outNode, link.weight);
                    inNode.addOutput(newLink);
                    outNode.addInput(newLink);
                    this.links.push(newLink);
                }                
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

        // tslint:disable-next-line:radix
        let indexes: number[] = Object.keys(split).map( i => parseInt(i) );
        indexes = indexes.sort();
        // tslint:disable-next-line:forin
        for (const index in split) {
            this.layers.push(split[index]);
        }
    }

    public feedForward(values: number[]): number[] {
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

        /* 
        Apply softmax layer at the end
        const outLayer = Matrix.fromArray( this.outputs.map( out => out.value ), this.outputs.length, 1);
        let solution = [];
        let index = 0;
        for (const nbNeurones of this.outTemplate) {
            const subMatrix = outLayer.extract(index, nbNeurones);
            const part = NeuralNetwork.activateOutput(subMatrix);
            solution = [...solution, part];
            index += nbNeurones;
        }
        return solution;
        */
        return this.outputs.map( out => out.value );
    }

    public getNbCoefficients(): number {
        // TODO
        return -1;
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
