import { NodeGene, NodeType } from './node';
import { ConnectGene } from './connect';
import { Genome } from './genome';

beforeEach(() => {
    // Reset static variable before each test
    Genome.innovationNumber = 0;
    Genome.nodeNumber = 0;
});

afterEach(() => {});

interface ExpectedConnection {
    innovation: number;
    inNode: NodeGene;
    outNode: NodeGene;
    isEnabled: boolean;
    recurrent: boolean;
    weight: number;
    testValue: boolean;
}

interface ExpectedNode {
    identifier: number;
    type: NodeType;
    layer: number;
    inputs?: ConnectGene[],
    outputs?: ConnectGene[]
}

function checkConnection(connect: ConnectGene, conf: ExpectedConnection) {
    expect(connect.innovation).toBe(conf.innovation);
    expect(connect.inputNode.identifier).toBe(conf.inNode.identifier);
    expect(connect.outputNode.identifier).toBe(conf.outNode.identifier);
    expect(connect.isEnabled).toBe(conf.isEnabled);
    expect(connect.reccurent).toBe(conf.recurrent);

    if (conf.testValue) {
        expect(connect.weight).toBe(conf.weight);
    } else {
        expect(isNaN(connect.weight)).toBeFalsy();
    }
}

function checkNode(node: NodeGene, conf: ExpectedNode) {
    expect(node.identifier).toBe(conf.identifier);
    expect(node.nodeType).toBe(conf.type);
    expect(node.layer).toBe(node.layer);

    if (conf.inputs) {
        const inputsIds = node.inputs.map(i => i.innovation);
        const expectedInputsIds = conf.inputs.map(i => i.innovation); 
        for (const id of expectedInputsIds) {
            expect(inputsIds).toContain(id);
        } 
    }
    
    if (conf.outputs) {
        const outputsIds = node.outputs.map(i => i.innovation);
        const expectedOutputsIds = conf.outputs.map(i => i.innovation); 
        for (const id of expectedOutputsIds) {
            expect(outputsIds).toContain(id);
        }
    }
}

//TODO: need to add tests on node link updates

describe('Genome', () => {
    describe('constructor', () => {
        xit('outputs a genome with the correct attributes', () => {
            const g = new Genome();
            expect(g.nodeGenes.length).toBe(0);
            expect(g.connectGenes.length).toBe(0);
        });
    });

    describe('manage global innovation', () => {
        xit('outputs the next innovation number available', () => {
            expect(Genome.nextInnovation).toBe(0);
        });

        xit('outputs the next innovation number after an increment', () => {
            Genome.incrementInnovation();
            expect(Genome.nextInnovation).toBe(1);
        });
    });

    describe('add connection', () => {
        xit('add a connection between two existing nodes in genomes', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 1, 1);
            g.addNode(NodeType.Hidden, 2, 2);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);

            expect(g.connectGenes.length).toBe(1);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });
            expect(Genome.nextInnovation).toBe(1);
        });

        xit('add a recurrent connection between two existing nodes in genomes', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 2, 1);
            g.addNode( NodeType.Hidden, 1, 2);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);

            expect(g.connectGenes.length).toBe(1);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: true
            });
            expect(Genome.nextInnovation).toBe(1);
        });
    });

    describe('add node', () => {
        xit('add a node to split a link between input and output', () => {
            const g = new Genome();
            g.addNode(NodeType.Input, -Infinity);
            g.addNode(NodeType.Output, Infinity);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);
            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(3);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            // Check incoming connection to new node
            const addedNode = g.nodeGenes[2];
            const newIncomingConnection = g.connectGenes[1];
            const newOutcomingConnection = g.connectGenes[2];
            checkConnection(newIncomingConnection, {
                innovation: 1,
                inNode: g.nodeGenes[0],
                outNode: addedNode,
                weight: 1,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check outcoming connection from new node
            checkConnection(newOutcomingConnection, {
                innovation: 2,
                inNode: addedNode,
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[0].weight,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check new node
            checkNode(addedNode, {
                identifier: Genome.nextNodeId - 1,
                type: NodeType.Hidden,
                layer: 0
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity
            });

            expect(Genome.nextInnovation === 3);
        });

        xit('add a node to split an existing link', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 1);
            g.addNode(NodeType.Hidden, 2);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);
            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(3);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            // Check incoming connection to new node
            const addedNode = g.nodeGenes[2];
            const newIncomingConnection = g.connectGenes[1];
            const newOutcomingConnection = g.connectGenes[2];
            checkConnection(newIncomingConnection, {
                innovation: 1,
                inNode: g.nodeGenes[0],
                outNode: addedNode,
                weight: 1,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check outcoming connection from new node
            checkConnection(newOutcomingConnection, {
                innovation: 2,
                inNode: addedNode,
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[0].weight,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check new node
            checkNode(addedNode, {
                identifier: Genome.nextNodeId - 1,
                type: NodeType.Hidden,
                layer: 2
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 1
            });

            expect(Genome.nextInnovation === 3);
        });

        xit('add a node to split an existing recurrent link', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 2);
            g.addNode(NodeType.Hidden, 1);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);
            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(3);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: true
            });

            // Check incoming connection to new node
            const addedNode = g.nodeGenes[2];
            const newIncomingConnection = g.connectGenes[1];
            const newOutcomingConnection = g.connectGenes[2];
            checkConnection(newIncomingConnection, {
                innovation: 1,
                inNode: g.nodeGenes[0],
                outNode: addedNode,
                weight: 1,
                testValue: true,
                isEnabled: true,
                recurrent: true
            });

            // Check outcoming connection from new node
            checkConnection(newOutcomingConnection, {
                innovation: 2,
                inNode: addedNode,
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[0].weight,
                testValue: true,
                isEnabled: true,
                recurrent: true
            });

            // Check new node
            checkNode(addedNode, {
                identifier: Genome.nextNodeId - 1,
                type: NodeType.Hidden,
                layer: 2
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 1
            });

            expect(Genome.nextInnovation === 3);
        });

        xit('add a node to split an existing link need to push following nodes further', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 1);
            g.addNode(NodeType.Hidden, 2);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);

            // Extra nodes after the one that will be splitted
            g.addNode(NodeType.Hidden, 3);
            g.addNode(NodeType.Hidden, 4);
            g.addConnection(g.nodeGenes[1], g.nodeGenes[2]);
            g.addConnection(g.nodeGenes[2], g.nodeGenes[3]);

            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(5);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            // Check incoming connection to new node
            const addedNode = g.nodeGenes[4];
            const newIncomingConnection = g.connectGenes[3];
            const newOutcomingConnection = g.connectGenes[4];
            checkConnection(newIncomingConnection, {
                innovation: 3,
                inNode: g.nodeGenes[0],
                outNode: addedNode,
                weight: 1,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check outcoming connection from new node
            checkConnection(newOutcomingConnection, {
                innovation: 4,
                inNode: addedNode,
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[0].weight,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check new node
            checkNode(addedNode, {
                identifier: 4,
                type: NodeType.Hidden,
                layer: 2
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 1
            });

            let extraNode = g.nodeGenes[2];
            checkNode(extraNode, {
                identifier: 2,
                type: NodeType.Hidden,
                layer: 4
            });

            extraNode = g.nodeGenes[3];
            checkNode(extraNode, {
                identifier: 3,
                type: NodeType.Hidden,
                layer: 5
            });

            expect(Genome.nextInnovation === 5);
            expect(Genome.nextNodeId === 5);
        });

        it('add a node to split an existing link need to push recurrent link nodes further', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 1);
            g.addNode(NodeType.Hidden, 2);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);

            // Extra nodes after the one that will be splitted
            g.addNode(NodeType.Hidden, 2);
            g.addNode(NodeType.Hidden, 3);
            g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);
            g.addConnection(g.nodeGenes[3], g.nodeGenes[1]);

            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(5);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: g.nodeGenes[0],
                outNode: g.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            // Check incoming connection to new node
            const addedNode = g.nodeGenes[4];
            const newIncomingConnection = g.connectGenes[3];
            const newOutcomingConnection = g.connectGenes[4];
            checkConnection(newIncomingConnection, {
                innovation: 3,
                inNode: g.nodeGenes[0],
                outNode: addedNode,
                weight: 1,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            console.log(newOutcomingConnection);
            
            // Check outcoming connection from new node
            checkConnection(newOutcomingConnection, {
                innovation: 4,
                inNode: addedNode,
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[0].weight,
                testValue: true,
                isEnabled: true,
                recurrent: false
            });

            // Check new node
            checkNode(addedNode, {
                identifier: 4,
                type: NodeType.Hidden,
                layer: 2,
                inputs: [g.connectGenes[3]],
                outputs: [g.connectGenes[4]] 
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3,
                inputs: [g.connectGenes[4], g.connectGenes[1], g.connectGenes[2], g.connectGenes[0]],
                outputs: []
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 1,
                inputs: [],
                outputs: [g.connectGenes[0], g.connectGenes[3]] 
            });

            let extraNode = g.nodeGenes[2];
            checkNode(extraNode, {
                identifier: 2,
                type: NodeType.Hidden,
                layer: 3,
                inputs: [],
                outputs: [g.connectGenes[1]] 
            });

            extraNode = g.nodeGenes[3];
            checkNode(extraNode, {
                identifier: 3,
                type: NodeType.Hidden,
                layer: 4,
                inputs: [],
                outputs: [g.connectGenes[2]] 
            });

            expect(Genome.nextInnovation === 5);
            expect(Genome.nextNodeId === 5);
        });
    });
});
