import { NodeGene } from './node';
import { NodeType } from '../phenotype/node';
import { ConnectGene } from './connect';
import { RTADNRates } from '../adn';
import { Genome } from './genome';

export interface ExpectedConnection {
    innovation: number;
    inNode: NodeGene;
    outNode: NodeGene;
    isEnabled: boolean;
    recurrent: boolean;
    weight: number;
    testValue: boolean;
}

export interface ExpectedNode {
    identifier: number;
    type: NodeType;
    layer: number;
    inputs?: ConnectGene[];
    outputs?: ConnectGene[];
}

export function checkConnection(connect: ConnectGene, conf: ExpectedConnection) {
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

export function checkNode(node: NodeGene, conf: ExpectedNode) {
    expect(node.identifier).toBe(conf.identifier);
    expect(node.nodeType).toBe(conf.type);
    expect(node.layer).toBe(node.layer);

    if (conf.inputs && conf.inputs) {
        const inputsIds = node.inputs.map(i => i.innovation);
        const expectedInputsIds = conf.inputs.map(i => i.innovation);
        for (const id of expectedInputsIds) {
            expect(inputsIds).toContain(id);
        }
        expect(inputsIds.length).toBe(conf.inputs.length);
    }

    if (conf.outputs) {
        const outputsIds = node.outputs.map(i => i.innovation);
        const expectedOutputsIds = conf.outputs.map(i => i.innovation);
        for (const id of expectedOutputsIds) {
            expect(outputsIds).toContain(id);
        }
        expect(outputsIds.length).toBe(conf.outputs.length);
    }
}

export function getBasicRates(): RTADNRates {
    return {
        mutation: 0.01,
        crossOver: 0.01,
        mutationActivation: 0.01,
        mutationConnect: 0.01,
        mutationAllowRecurrent: 0.01,
        mutationSplitConnect: 0.01
    };
}

export function getRateForConnecting(): RTADNRates {
    return {
        mutation: 0.0,
        crossOver: 0.0,
        mutationActivation: 0.0,
        mutationConnect: 1.0,
        mutationAllowRecurrent: 0.0,
        mutationSplitConnect: 0.0
    };
}

export function getRateForActivating(): RTADNRates {
    return {
        mutation: 0.0,
        crossOver: 0.0,
        mutationActivation: 1.0,
        mutationConnect: 0.0,
        mutationAllowRecurrent: 0.0,
        mutationSplitConnect: 0.0
    };
}

export function getRateForRecurrentConnecting(): RTADNRates {
    return {
        mutation: 0.0,
        crossOver: 0.0,
        mutationActivation: 0.0,
        mutationConnect: 1.0,
        mutationAllowRecurrent: 1.0,
        mutationSplitConnect: 0.0
    };
}

export function getRateForSplitting(): RTADNRates {
    return {
        mutation: 0.0,
        crossOver: 0.0,
        mutationActivation: 0.0,
        mutationConnect: 0.0,
        mutationAllowRecurrent: 0.0,
        mutationSplitConnect: 1.0
    };
}

export function generateNonConnectedSimpleDirectGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity, 0);
    g.addNode(NodeType.Output, Infinity, 1);

    return g;
}

export function generateDirectGenome(useGenomeIncrement: boolean = false): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity, 0);
    g.addNode(NodeType.Output, Infinity, 1);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[1], 0);

    if (useGenomeIncrement) {
        Genome.incrementNodeId();
        Genome.incrementNodeId();
        Genome.incrementInnovation();
    }

    return g;
}

export function generateSimpleSplitGenome(useGenomeIncrement: boolean = false): Genome {
    const g = generateDirectGenome(useGenomeIncrement);
    g.splitConnection(g.connectGenes[0]);
    return g;
}

export function generateActivateDeactivateGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity, 0);
    g.addNode(NodeType.Input, -Infinity, 0);
    g.addNode(NodeType.Output, Infinity, 1);

    g.addConnection(g.nodeGenes[0], g.nodeGenes[2], 0);
    g.addConnection(g.nodeGenes[1], g.nodeGenes[2], 1);
    g.activateConnection(g.connectGenes[1], false);

    return g;
}

export function generateComplexGenome(): Genome {
    const g = generateDirectGenome(false);
    g.addNode(NodeType.Input, -Infinity, 2);
    g.addConnection(g.nodeGenes[2], g.nodeGenes[1], 1);
    g.splitConnection(g.connectGenes[0], 1, 3);
    g.splitConnection(g.connectGenes[1], 3, 4);
    return g;
}

export function generateComplexGenomes(): Genome[] {
    const g1 = generateDirectGenome(false);
    const g2 = generateDirectGenome(true);

    g1.addNode(NodeType.Input, -Infinity, 2);
    g2.addNode(NodeType.Input, -Infinity, 2);
    g1.addConnection(g1.nodeGenes[2], g1.nodeGenes[1], 1);
    g2.addConnection(g2.nodeGenes[2], g2.nodeGenes[1], 1);

    Genome.incrementNodeId();
    Genome.incrementInnovation();

    g1.splitConnection(g1.connectGenes[0]);
    g2.splitConnection(g2.connectGenes[1]);

    return [g1, g2];
}

export function sortNodeGenesByIdentifier(n1: NodeGene, n2: NodeGene): number {
    if (n1.identifier < n2.identifier) {
        return -1;
    } else if (n1.identifier > n2.identifier) {
        return 1;
    } else {
        return 0;
    }
}
