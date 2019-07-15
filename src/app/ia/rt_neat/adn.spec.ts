import { NodeGene, NodeType } from './genotype/node';
import { ConnectGene } from './genotype/connect';
import { Genome } from './genotype/genome';
import { RTADN, RTADNRates } from './adn';

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

function generateDirectGenome(): Genome {
    const g = new Genome();
    g.addNode(NodeType.Input, -Infinity, 0);
    g.addNode(NodeType.Output, Infinity, 1);
    g.addConnection(g.nodeGenes[0], g.nodeGenes[1], 0);

    return g;
}

function generateSimpleSplitGenome(): Genome {
    const g = generateDirectGenome();
    g.splitConnection(g.connectGenes[0]);
    return g;
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
            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.connectGenes.length).toBe(0);
        });

        it('outputs the crossover of two direct genomes', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateDirectGenome();

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateDirectGenome();

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.connectGenes.length).toBe(1);
            const avgWeights = (adnParent1.genome.connectGenes[0].weight + adnParent2.genome.connectGenes[0].weight) / 2;
            expect(newAdn.genome.connectGenes[0].weight).toBe(avgWeights);
        });

        it('outputs the crossover of one direct genome and a genome with a split', () => {
            const rates: RTADNRates = getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = generateDirectGenome();

            const adnParent2 = new RTADN(-1, 1, rates);
            adnParent2.genome = generateSimpleSplitGenome();

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            expect(newAdn.genome.nodeGenes.length).toBe(3);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(2);
            expect(newAdn.genome.connectGenes.length).toBe(3);
        });
    });
});
