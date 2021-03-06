import { Node, NodeType } from './node';
import { Connect } from './connect';
import { RTNeuralNetwork } from './neural-network';
import { Genome } from '../genotype/genome';

beforeEach(() => {
    // Reset static variable before each test
    Genome.innovationNumber = 0;
    Genome.nodeNumber = 0;
});

afterEach(() => {});

function generateSimpleDirectGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);

    return g;
}

function generateSimpleGenome(): Genome {
    const g = new Genome();
    g.addNode( NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addNode(NodeType.Hidden, 0);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);

    return g;
}

function generateSimpleGenomeWithRecurrentLink(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addNode(NodeType.Hidden, 0);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[1], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);

    return g;
}

function generateSimpleGenomeWithRecurrentLinkOnItself(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addNode(NodeType.Hidden, 0);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);

    return g;
}

function generate2LayeredGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addNode(NodeType.Hidden, 0);
    g.addNode(NodeType.Hidden, 1);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[3]);
    g.addConnection(g.nodeGenes[3], g.nodeGenes[1]);

    return g;
}

function generateWithDisabledLinksGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addNode(NodeType.Hidden, 0);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[3]);
    g.addConnection(g.nodeGenes[1], g.nodeGenes[3]);
    g.addConnection(g.nodeGenes[3], g.nodeGenes[2]);
    g.activateConnection(g.connectGenes[0], false);

    return g;
}

function generateWithDisconnectedNodeGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity);
    g.addNode(NodeType.Output, Infinity);
    g.addNode(NodeType.Hidden, 0);
    g.addNode(NodeType.Hidden, 0);
    g.addNode(NodeType.Hidden, 0);
    g.addNode(NodeType.Hidden, 0);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[2]);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);
    g.addConnection(g.nodeGenes[3], g.nodeGenes[1]);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[4]);
    g.activateConnection(g.connectGenes[0], false);

    return g;
}

interface ExpectedConnection {
    identifier: number;
    inNodeIdentifier: number;
    outNodeIdentifier: number;
    weight: number;
}

interface ExpectedNode {
    identifier: number;
    layer: number;
    activationFunction: string;
    nbInputs: number;
    inputIdentifier: number;
    nbOutputs: number;
    outputIdentifier: number;
}

function checkConnection(connect: Connect, conf: ExpectedConnection) {
    expect(connect.identifier).toBe(conf.identifier);
    expect(connect.inputNode.identifier).toBe(conf.inNodeIdentifier);
    expect(connect.outputNode.identifier).toBe(conf.outNodeIdentifier);

    if (isNaN(conf.weight)) {
        expect(connect.weight).not.toBeNaN();
    } else {
        expect(connect.weight).toBe(conf.weight);
    }
}

function checkNode(node: Node, conf: ExpectedNode) {
    if (node.nodeType === NodeType.Input) {
        expect(node.identifier).toBe(conf.identifier);
        expect(node.layer).toBe(conf.layer);
        expect(node.activationFunction).toBe(conf.activationFunction);
        expect(node.outputs.length).toBe(conf.nbOutputs);
        expect(node.outputs[0].outputNode.identifier).toBe(conf.outputIdentifier);
    } else if (node.nodeType === NodeType.Output) {
        expect(node.identifier).toBe(conf.identifier);
        expect(node.layer).toBe(conf.layer);
        expect(node.activationFunction).toBe(conf.activationFunction);
        expect(node.inputs.length).toBe(conf.nbInputs);
        expect(node.inputs[0].inputNode.identifier).toBe(conf.inputIdentifier);
    } else {
        expect(node.identifier).toBe(conf.identifier);
        expect(node.layer).toBe(conf.layer);
        expect(node.activationFunction).toBe(conf.activationFunction);
        expect(node.inputs.length).toBe(conf.nbInputs);
        expect(node.inputs[0].inputNode.identifier).toBe(conf.inputIdentifier);
        expect(node.outputs.length).toBe(conf.nbOutputs);
        expect(node.outputs[0].outputNode.identifier).toBe(conf.outputIdentifier);
    }
}

describe('Neural-network', () => {
    describe('constructor', () => {
        it('outputs a neural network with the correct attributes', () => {
            const nn = new RTNeuralNetwork();
            expect(nn.networkInputs.length).toBe(0);
            expect(nn.networkOutputs.length).toBe(0);
            expect(nn.networkLayers.length).toBe(0);
        });
    });

    describe('init', () => {
        it('outputs an initialized a network 1 input and 1 output', () => {
            const genome = generateSimpleDirectGenome();
            const nn = new RTNeuralNetwork(genome);

            const inputs = nn.networkInputs;
            expect(inputs.length).toBe(1);
            checkNode(inputs[0], {
                identifier: 0,
                layer: -Infinity,
                activationFunction: 'none',
                nbInputs: 0,
                inputIdentifier: -1,
                nbOutputs: 1,
                outputIdentifier: 1
            });

            const outputs = nn.networkOutputs;
            expect(outputs.length).toBe(1);
            checkNode(outputs[0], {
                identifier: 1,
                layer: Infinity,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 0,
                nbOutputs: 0,
                outputIdentifier: -1
            });

            const links = nn.networkConnections;
            expect(links.length).toBe(1);
            checkConnection(links[0], {
                identifier: 0,
                inNodeIdentifier: 0,
                outNodeIdentifier: 1,
                weight: NaN,
            });
        });

        it('outputs an initialized a network 1 input, 1 hidden and 1 output', () => {
            const genome = generateSimpleGenome();
            const nn = new RTNeuralNetwork(genome);

            const inputs = nn.networkInputs;
            expect(inputs.length).toBe(1);
            checkNode(inputs[0], {
                identifier: 0,
                layer: -Infinity,
                activationFunction: 'none',
                nbInputs: 0,
                inputIdentifier: -1,
                nbOutputs: 1,
                outputIdentifier: 2
            });

            const outputs = nn.networkOutputs;
            expect(outputs.length).toBe(1);
            checkNode(outputs[0], {
                identifier: 1,
                layer: Infinity,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 2,
                nbOutputs: 0,
                outputIdentifier: -1
            });

            const hiddens = nn.networkLayers[0];
            expect(nn.networkLayers.length).toBe(1);
            expect(hiddens.length).toBe(1);
            checkNode(hiddens[0], {
                identifier: 2,
                layer: 0,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 0,
                nbOutputs: 1,
                outputIdentifier: 1
            });

            const links = nn.networkConnections;
            expect(links.length).toBe(2);
            checkConnection(links[0], {
                identifier: 0,
                inNodeIdentifier: 0,
                outNodeIdentifier: 2,
                weight: NaN
            });

            checkConnection(links[1], {
                identifier: 1,
                inNodeIdentifier: 2,
                outNodeIdentifier: 1,
                weight: NaN
            });
        });

        it('outputs an initialized a network 1 input, 2 hidden on 2 layers and 1 output', () => {
            const genome = generate2LayeredGenome();
            const nn = new RTNeuralNetwork(genome);

            const hiddens = nn.networkLayers;
            expect(hiddens.length).toBe(2);
            expect(hiddens[0].length).toBe(1);
            expect(hiddens[1].length).toBe(1);
            checkNode(hiddens[0][0], {
                identifier: 2,
                layer: 0,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 0,
                nbOutputs: 1,
                outputIdentifier: 3
            });

            checkNode(hiddens[1][0], {
                identifier: 3,
                layer: 1,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 2,
                nbOutputs: 1,
                outputIdentifier: 1
            });
        });

        it ('outputs an initialized network with a recurrent link', () => {
            const genome = generateSimpleGenomeWithRecurrentLink();
            const nn = new RTNeuralNetwork(genome);

            const inputs = nn.networkInputs;
            expect(inputs.length).toBe(1);
            checkNode(inputs[0], {
                identifier: 0,
                layer: -Infinity,
                activationFunction: 'none',
                nbInputs: 0,
                inputIdentifier: -1,
                nbOutputs: 1,
                outputIdentifier: 2
            });

            const outputs = nn.networkOutputs;
            expect(outputs.length).toBe(1);
            checkNode(outputs[0], {
                identifier: 1,
                layer: Infinity,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 2,
                nbOutputs: 0,
                outputIdentifier: -1
            });

            const hiddens = nn.networkLayers[0];
            expect(nn.networkLayers.length).toBe(1);
            expect(hiddens.length).toBe(1);
            checkNode(hiddens[0], {
                identifier: 2,
                layer: 0,
                activationFunction: 'tanh',
                nbInputs: 2,
                inputIdentifier: 0, // TODO change to put an array of identifier
                nbOutputs: 1,
                outputIdentifier: 1 // TODO change to put an array of identifier
            });

            const links = nn.networkConnections;
            expect(links.length).toBe(3);
            checkConnection(links[0], {
                identifier: 0,
                inNodeIdentifier: 0,
                outNodeIdentifier: 2,
                weight: NaN
            });

            checkConnection(links[1], {
                identifier: 1,
                inNodeIdentifier: 1,
                outNodeIdentifier: 2,
                weight: NaN
            });

            checkConnection(links[2], {
                identifier: 2,
                inNodeIdentifier: 2,
                outNodeIdentifier: 1,
                weight: NaN
            });
        });

        it('outputs an initialized a network without disabled connections', () => {
            const genome = generateWithDisabledLinksGenome();
            const nn = new RTNeuralNetwork(genome);

            const hiddens = nn.networkLayers[0];
            expect(hiddens.length).toBe(1);
            checkNode(hiddens[0], {
                identifier: 3,
                layer: 0,
                activationFunction: 'tanh',
                nbInputs: 1,
                inputIdentifier: 1,
                nbOutputs: 1,
                outputIdentifier: 2
            });
        });

        it('outputs an initialized a network without not connected nodes', () => {
            const genome = generateWithDisconnectedNodeGenome();
            const nn = new RTNeuralNetwork(genome);

            const hiddens = nn.networkLayers[0];
            expect(hiddens.length).toBe(3);
            expect(hiddens.map(node => node.identifier)).toContain(2);
            expect(hiddens.map(node => node.identifier)).toContain(3);
            expect(hiddens.map(node => node.identifier)).toContain(4);
        });
    });

    describe('feed forward', () => {
        it('outputs the results of a direct neural network', () => {
            const genome = generateSimpleDirectGenome();
            const nn = new RTNeuralNetwork(genome);

            const results = nn.feedForward([1]);
            expect(results.length).toBe(1);
            expect(results[0]).toBe(Math.tanh(nn.networkInputs[0].value * nn.networkConnections[0].weight));
        });

        it('outputs the results of a simple neural network', () => {
            const genome = generateSimpleGenome();
            const nn = new RTNeuralNetwork(genome);

            const results = nn.feedForward([1]);
            expect(results.length).toBe(1);

            let expectedResult = Math.tanh(nn.networkInputs[0].value * nn.networkConnections[0].weight);
            expectedResult = Math.tanh(expectedResult * nn.networkConnections[1].weight);
            expect(results[0]).toBe(expectedResult);
        });

        it('outputs the results of a neural network with recurrent link', () => {
            const genome = generateSimpleGenomeWithRecurrentLink();
            const nn = new RTNeuralNetwork(genome);

            // First feedforward with a memory at 0
            let results = nn.feedForward([1]);
            expect(results.length).toBe(1);
            expect(nn.networkInputs[0].value).toBe(1);
            let expectedResult = Math.tanh(nn.networkInputs[0].value * nn.networkConnections[0].weight
                                            + 0 * nn.networkConnections[1].weight);
            expectedResult = Math.tanh(expectedResult * nn.networkConnections[2].weight);
            expect(results[0]).toBe(expectedResult);
            expect(nn.networkOutputs[0].memory).toBe(expectedResult); // save the result  in memory

            // Second feedforward with a memory set at expectedResult
            const memory = expectedResult;
            results = nn.feedForward([1]);

            expect(nn.networkInputs[0].value).toBe(1);
            expectedResult = Math.tanh(nn.networkInputs[0].value * nn.networkConnections[0].weight
                                        + memory * nn.networkConnections[1].weight);
            expectedResult = Math.tanh(expectedResult * nn.networkConnections[2].weight);
            expect(results[0]).toBe(expectedResult);
        });

        it('outputs the results of a neural network with recurrent link on itself', () => {
            const genome = generateSimpleGenomeWithRecurrentLinkOnItself();
            const nn = new RTNeuralNetwork(genome);

            // First feedforward with a memory at 0
            let results = nn.feedForward([1]);
            expect(results.length).toBe(1);
            expect(nn.networkInputs[0].value).toBe(1);
            let expectedResult = Math.tanh(nn.networkInputs[0].value * nn.networkConnections[0].weight
                                            + 0 * nn.networkConnections[1].weight);
            expect(nn.networkLayers[0][0].memory).toBe(expectedResult);
            const memory = expectedResult; // save the result  in memory

            expectedResult = Math.tanh(expectedResult * nn.networkConnections[2].weight);
            expect(results[0]).toBe(expectedResult);

            // Second feedforward with a memory set at expectedResult
            results = nn.feedForward([1]);
            expect(nn.networkInputs[0].value).toBe(1);
            expectedResult = Math.tanh(nn.networkInputs[0].value * nn.networkConnections[0].weight
                                        + memory * nn.networkConnections[1].weight);
            expect(nn.networkLayers[0][0].value).toBe(expectedResult);

            expectedResult = Math.tanh(expectedResult * nn.networkConnections[2].weight);
            expect(results[0]).toBe(expectedResult);
        });
    });
});
