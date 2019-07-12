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
}

describe('Genome', () => {
    describe('constructor', () => {
        it('outputs a genome with the correct attributes', () => {
            const g = new Genome();
            expect(g.nodeGenes.length).toBe(0);
            expect(g.connectGenes.length).toBe(0);
        });
    });

    describe('manage global innovation', () => {
        it('outputs the next innovation number available', () => {
            expect(Genome.nextInnovation).toBe(0);
        });

        it('outputs the next innovation number after an increment', () => {
            Genome.incrementInnovation();
            expect(Genome.nextInnovation).toBe(1);
        });
    });

    describe('add connection', () => {
        it('add a connection between two existing nodes in genomes', () => {
            const n1 = new NodeGene(1, NodeType.Hidden, 1);
            const n2 = new NodeGene(2, NodeType.Hidden, 2);
            const g = new Genome();
            g.addNode(n1);
            g.addNode(n2);
            g.addConnection(n1, n2);

            expect(g.connectGenes.length).toBe(1);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: n1,
                outNode: n2,
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });
            expect(Genome.nextInnovation).toBe(1);
        });

        it('add a recurrent connection between two existing nodes in genomes', () => {
            const n1 = new NodeGene(1, NodeType.Hidden, 2);
            const n2 = new NodeGene(2, NodeType.Hidden, 1);
            const g = new Genome();
            g.addNode(n1);
            g.addNode(n2);
            g.addConnection(n1, n2);

            expect(g.connectGenes.length).toBe(1);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: n1,
                outNode: n2,
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: true
            });
            expect(Genome.nextInnovation).toBe(1);
        });
    });

    describe('add node', () => {
        it('add a node to split an existing link', () => {
            const n1 = new NodeGene(Genome.nextNodeId, NodeType.Hidden, 1);
            Genome.incrementNodeId();
            const n2 = new NodeGene(Genome.nextNodeId, NodeType.Hidden, 2);
            Genome.incrementNodeId();
            const g = new Genome();
            g.addNode(n1);
            g.addNode(n2);
            g.addConnection(n1, n2);
            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(3);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: n1,
                outNode: n2,
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
                inNode: n1,
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
                outNode: n2,
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

        it('add a node to split an existing recurrent link', () => {
            const n1 = new NodeGene(Genome.nextNodeId, NodeType.Hidden, 2);
            Genome.incrementNodeId();
            const n2 = new NodeGene(Genome.nextNodeId, NodeType.Hidden, 1);
            Genome.incrementNodeId();
            const g = new Genome();
            g.addNode(n1);
            g.addNode(n2);
            g.addConnection(n1, n2);
            g.splitConnection(g.connectGenes[0]);

            // Check previous connection
            expect(g.connectGenes.length).toBe(3);
            checkConnection(g.connectGenes[0], {
                innovation: 0,
                inNode: n1,
                outNode: n2,
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
                inNode: n1,
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
                outNode: n2,
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
    });
});
