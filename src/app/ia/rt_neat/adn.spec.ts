import { NodeGene, NodeType } from './genotype/node';
import { ConnectGene } from './genotype/connect';
import { Genome } from './genotype/genome';
import { RTADN, RTADNRates } from './adn';
import { Node } from './phenotype/node';

beforeEach(() => {
    // Reset static variable before each test
    Genome.innovationNumber = 0;
    Genome.nodeNumber = 0;
});

afterEach(() => {});

function getBasicRates(): RTADNRates {
    return {
        mutation: 0.01,
        crossOver: 0.01,
        mutationActivation: 0.01,
        mutationConnect: 0.01,
        mutationAllowRecurrent: 0.01,
        mutationSplitConnect: 0.01
    };
}

function generateNonConnectedSimpleDirectGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity, 0);
    g.addNode(NodeType.Output, Infinity, 1);

    return g;
}

function generateDirectGenome(useGenomeIncrement: boolean = false): Genome {
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

function generateSimpleSplitGenome(useGenomeIncrement: boolean = false): Genome {
    const g = generateDirectGenome(useGenomeIncrement);
    g.splitConnection(g.connectGenes[0]);
    return g;
}

function generateComplexGenomes(): Genome[] {
    const g1 = generateDirectGenome(false);
    const g2 = generateDirectGenome(true);

    g1.addNode(NodeType.Input, -Infinity, 2);
    g2.addNode(NodeType.Input, -Infinity, 2);
    g1.addConnection(g1.nodeGenes[2], g1.nodeGenes[1], 1);
    g2.addConnection(g2.nodeGenes[2], g2.nodeGenes[1], 1);

    Genome.incrementNodeId();
    Genome.incrementInnovation();

    g1.splitConnection(g1.connectGenes[0]);
    g2.splitConnection(g1.connectGenes[1]);

    return [g1, g2];
}

function sortNodeGenesByIdentifier(n1: NodeGene, n2: NodeGene): number {
    if (n1.identifier < n2.identifier) {
        return -1;
    } else if (n1.identifier > n2.identifier) {
        return 1;
    } else {
        return 0;
    }
}

describe('RTAdn', () => {
    describe('constructor', () => {
        it('outputs an adn with the correct attributes', () => {
            const rates: RTADNRates = getBasicRates();
            const adn = new RTADN(-1, 1, rates);
            const adnRates = adn.rates;

            expect(adn.genome).not.toBeNull();
            expect(adnRates.mutation).toBe(0.01);
            expect(adnRates.crossOver).toBe(0.01);
            expect(adnRates.mutationActivation).toBe(0.01);
            expect(adnRates.mutationAllowRecurrent).toBe(0.01);
            expect(adnRates.mutationConnect).toBe(0.01);
            expect(adnRates.mutationSplitConnect).toBe(0.01);
        });
    });

    describe('crossover', () => {
        it('outputs the crossover of two non connected genomes', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateNonConnectedSimpleDirectGenome();

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateNonConnectedSimpleDirectGenome();

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.connectGenes.length).toBe(0);
        });

        it('outputs the crossover of two identical direct genomes', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateDirectGenome();

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateDirectGenome();

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.connectGenes.length).toBe(1);
            const avgWeights = (adnParent1.genome.connectGenes[0].weight + adnParent2.genome.connectGenes[0].weight) / 2;
            expect(newAdn.genome.connectGenes[0].weight).toBe(avgWeights);
        });

        it('outputs the crossover of one direct genome and a genome with a split with equals fitness scores', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateDirectGenome(true);

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateSimpleSplitGenome();

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(3);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[0].nodeType).toBe(NodeType.Input);
            expect(newAdn.genome.nodeGenes[0].layer).toBe(-Infinity);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[1].nodeType).toBe(NodeType.Output);
            expect(newAdn.genome.nodeGenes[1].layer).toBe(Infinity);
            expect(newAdn.genome.nodeGenes[2].identifier).toBe(2);
            expect(newAdn.genome.nodeGenes[2].nodeType).toBe(NodeType.Hidden);
            expect(newAdn.genome.nodeGenes[2].layer).toBe(0);

            expect(newAdn.genome.connectGenes.length).toBe(3);
            expect(newAdn.genome.connectGenes[0].innovation).toBe(0);
            expect(newAdn.genome.connectGenes[0].isEnabled).toBeFalsy();
            expect(newAdn.genome.connectGenes[1].innovation).toBe(1);
            expect(newAdn.genome.connectGenes[1].weight).toBe(1);
            expect(newAdn.genome.connectGenes[1].isEnabled).toBeTruthy();
            expect(newAdn.genome.connectGenes[2].innovation).toBe(2);
            expect(newAdn.genome.connectGenes[2].isEnabled).toBeTruthy();
        });

        it('outputs the crossover of one split genome and one direct genome with equals fitness scores', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateSimpleSplitGenome(true);

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateDirectGenome(false);

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(3);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[2].identifier).toBe(2);

            expect(newAdn.genome.connectGenes.length).toBe(3);
            expect(newAdn.genome.connectGenes[0].innovation).toBe(0);
            expect(newAdn.genome.connectGenes[0].isEnabled).toBeFalsy();
            expect(newAdn.genome.connectGenes[1].innovation).toBe(1);
            expect(newAdn.genome.connectGenes[1].weight).toBe(1);
            expect(newAdn.genome.connectGenes[1].isEnabled).toBeTruthy();
            expect(newAdn.genome.connectGenes[2].innovation).toBe(2);
            expect(newAdn.genome.connectGenes[2].isEnabled).toBeTruthy();
        });

        it('outputs the crossover of one direct genome and a genome with a split with different fitness scores', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateDirectGenome(true);

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateSimpleSplitGenome();

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[0].nodeType).toBe(NodeType.Input);
            expect(newAdn.genome.nodeGenes[0].layer).toBe(-Infinity);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[1].nodeType).toBe(NodeType.Output);
            expect(newAdn.genome.nodeGenes[1].layer).toBe(Infinity);

            expect(newAdn.genome.connectGenes.length).toBe(1);
            expect(newAdn.genome.connectGenes[0].innovation).toBe(0);
            expect(newAdn.genome.connectGenes[0].isEnabled).toBeFalsy();
        });

        it('outputs the crossover of one split genome and one direct genome with different fitness scores', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateSimpleSplitGenome(true);

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateDirectGenome(false);

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(3);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[2].identifier).toBe(2);

            expect(newAdn.genome.connectGenes.length).toBe(3);
            expect(newAdn.genome.connectGenes[0].innovation).toBe(0);
            expect(newAdn.genome.connectGenes[0].isEnabled).toBeFalsy();
            expect(newAdn.genome.connectGenes[1].innovation).toBe(1);
            expect(newAdn.genome.connectGenes[1].weight).toBe(1);
            expect(newAdn.genome.connectGenes[1].isEnabled).toBeTruthy();
            expect(newAdn.genome.connectGenes[2].innovation).toBe(2);
            expect(newAdn.genome.connectGenes[2].isEnabled).toBeTruthy();
        });

        it('outputs the crossover of two more complex genomes with different fitness scores', () => {
            const rates: RTADNRates = getBasicRates();
            const genomes = generateComplexGenomes();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = genomes[0];

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = genomes[1];

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(4);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[2].identifier).toBe(2);
            expect(newAdn.genome.nodeGenes[3].identifier).toBe(3);

            expect(newAdn.genome.connectGenes.length).toBe(4);
            expect(newAdn.genome.connectGenes[0].innovation).toBe(0);
            expect(newAdn.genome.connectGenes[0].isEnabled).toBeFalsy();
            expect(newAdn.genome.connectGenes[1].innovation).toBe(1);
            expect(newAdn.genome.connectGenes[1].isEnabled).toBeFalsy(); // the second parent has this connection disabled
            expect(newAdn.genome.connectGenes[2].innovation).toBe(2);
            expect(newAdn.genome.connectGenes[2].weight).toBe(1);
            expect(newAdn.genome.connectGenes[2].isEnabled).toBeTruthy();
            expect(newAdn.genome.connectGenes[3].innovation).toBe(3);
            expect(newAdn.genome.connectGenes[3].isEnabled).toBeTruthy();
        });

        it('outputs the crossover of two more complex genomes with different fitness scores', () => {
            const rates: RTADNRates = getBasicRates();
            const genomes = generateComplexGenomes();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = genomes[1];

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = genomes[0];

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            newAdn.genome.nodeGenes.sort(sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(4);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[2].identifier).toBe(2);
            expect(newAdn.genome.nodeGenes[3].identifier).toBe(4);

            expect(newAdn.genome.connectGenes.length).toBe(4);
            expect(newAdn.genome.connectGenes[0].innovation).toBe(0);
            expect(newAdn.genome.connectGenes[0].isEnabled).toBeFalsy();
            expect(newAdn.genome.connectGenes[1].innovation).toBe(1);
            expect(newAdn.genome.connectGenes[1].isEnabled).toBeFalsy(); // the second parent has this connection disabled
            expect(newAdn.genome.connectGenes[2].innovation).toBe(4);
            expect(newAdn.genome.connectGenes[2].weight).toBe(1);
            expect(newAdn.genome.connectGenes[2].isEnabled).toBeTruthy();
            expect(newAdn.genome.connectGenes[3].innovation).toBe(5);
            expect(newAdn.genome.connectGenes[3].isEnabled).toBeTruthy();
        });
    });
});
