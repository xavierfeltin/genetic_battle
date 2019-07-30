import { NodeGene, NodeType } from './node';
import { Genome } from './genome';
import { checkConnection, checkNode } from './common.spec';

beforeEach(() => {
    // Reset static variable before each test
    Genome.innovationNumber = 0;
    Genome.nodeNumber = 0;
});

afterEach(() => {});

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

        it('add a recurrent connection between two existing nodes in genomes', () => {
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
        it('add a node to split a link between input and output', () => {
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
                layer: 0,
                inputs: [g.connectGenes[1]],
                outputs: [g.connectGenes[2]]
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [g.connectGenes[0], g.connectGenes[2]],
                outputs: []
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: [g.connectGenes[0], g.connectGenes[1]]
            });

            expect(Genome.nextInnovation === 3);
        });

        it('add a node to split an existing link', () => {
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
                layer: 2,
                inputs: [g.connectGenes[1]],
                outputs: [g.connectGenes[2]]
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3,
                inputs: [g.connectGenes[0], g.connectGenes[2]],
                outputs: []
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 1,
                inputs: [],
                outputs: [g.connectGenes[0], g.connectGenes[1]]
            });

            expect(Genome.nextInnovation === 3);
        });

        it('add a node to split an existing recurrent link', () => {
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
                layer: 2,
                inputs: [g.connectGenes[1]],
                outputs: [g.connectGenes[2]]
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3,
                inputs: [g.connectGenes[0], g.connectGenes[2]],
                outputs: []
            });

            // Check non modification of layer on in node from new connection
            checkNode(newIncomingConnection.inputNode, {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 1,
                inputs: [],
                outputs: [g.connectGenes[0], g.connectGenes[1]]
            });

            expect(Genome.nextInnovation === 3);
        });

        it('add a node to split an existing link need to push following nodes further', () => {
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
                layer: 2,
                inputs: [g.connectGenes[3]],
                outputs: [g.connectGenes[4]]
            });

            // Check layer modification on out node from new connection
            checkNode(newOutcomingConnection.outputNode, {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 3,
                inputs: [g.connectGenes[0], g.connectGenes[4]],
                outputs: [g.connectGenes[1]]
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
                layer: 4,
                inputs: [g.connectGenes[1]],
                outputs: [g.connectGenes[2]]
            });

            extraNode = g.nodeGenes[3];
            checkNode(extraNode, {
                identifier: 3,
                type: NodeType.Hidden,
                layer: 5,
                inputs: [g.connectGenes[2]],
                outputs: []
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

        it('add a node to split an existing recurrent link need to push recurrent and forward link nodes further', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 0);
            g.addNode(NodeType.Hidden, 1);
            g.addNode(NodeType.Hidden, 1);
            g.addNode(NodeType.Hidden, 2);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);
            g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);
            g.addConnection(g.nodeGenes[1], g.nodeGenes[3]);

            g.splitConnection(g.connectGenes[0]);

            // check node layers
            checkNode(g.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 0,
                inputs: [],
                outputs: [g.connectGenes[0], g.connectGenes[3]]
            });

            checkNode(g.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 2,
                inputs: [g.connectGenes[0], g.connectGenes[4], g.connectGenes[1]],
                outputs: [g.connectGenes[2]]
            });

            checkNode(g.nodeGenes[2], {
                identifier: 2,
                type: NodeType.Hidden,
                layer: 2,
                inputs: [],
                outputs: [g.connectGenes[1]]
            });

            checkNode(g.nodeGenes[3], {
                identifier: 3,
                type: NodeType.Hidden,
                layer: 3,
                inputs: [g.connectGenes[2]],
                outputs: []
            });

            checkNode(g.nodeGenes[4], {
                identifier: 4,
                type: NodeType.Hidden,
                layer: 1,
                inputs: [g.connectGenes[3]],
                outputs: [g.connectGenes[4]]
            });

            // Check recurrent connection is still recurrent
            checkConnection(g.connectGenes[1], {
                innovation: 1,
                inNode: g.nodeGenes[2],
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[1].weight,
                testValue: true,
                isEnabled: true,
                recurrent: true
            });
        });

        it('add a node to split an existing recurrent link need to push loop recurrent link further', () => {
            const g = new Genome();
            g.addNode(NodeType.Hidden, 0);
            g.addNode(NodeType.Hidden, 1);
            g.addNode(NodeType.Hidden, 1);
            g.addConnection(g.nodeGenes[0], g.nodeGenes[1]);
            g.addConnection(g.nodeGenes[2], g.nodeGenes[1]);
            g.addConnection(g.nodeGenes[1], g.nodeGenes[2]);

            g.splitConnection(g.connectGenes[0]);

            // check node layers
            checkNode(g.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Hidden,
                layer: 0,
                inputs: [],
                outputs: [g.connectGenes[0], g.connectGenes[3]]
            });

            checkNode(g.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Hidden,
                layer: 2,
                inputs: [g.connectGenes[0], g.connectGenes[4], g.connectGenes[1]],
                outputs: [g.connectGenes[2]]
            });

            checkNode(g.nodeGenes[2], {
                identifier: 2,
                type: NodeType.Hidden,
                layer: 2,
                inputs: [g.connectGenes[2]],
                outputs: [g.connectGenes[1]]
            });

            checkNode(g.nodeGenes[3], {
                identifier: 3,
                type: NodeType.Hidden,
                layer: 1,
                inputs: [g.connectGenes[3]],
                outputs: [g.connectGenes[4]]
            });

            // Check recurrent connection is still recurrent
            checkConnection(g.connectGenes[1], {
                innovation: 1,
                inNode: g.nodeGenes[2],
                outNode: g.nodeGenes[1],
                weight: g.connectGenes[1].weight,
                testValue: true,
                isEnabled: true,
                recurrent: true
            });
        });
    });
});
