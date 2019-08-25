import { NodeGene, NodeType } from './genotype/node';
import { Genome } from './genotype/genome';
import { RTADN } from './adn';
import { checkConnection, checkNode } from './genotype/common-spec';
import { ModificationType } from './genotype/historic';
import * as Common from './genotype/common-spec';
import { Rates } from '../adn';

beforeEach(() => {
    // Reset static variable before each test
    Genome.reset();
});

afterEach(() => {});

describe('RTAdn', () => {
    describe('constructor', () => {
        it('outputs an adn with the correct attributes', () => {
            const rates: Rates = Common.getBasicRates();
            const adn = new RTADN(-1, 1, rates);
            const adnRates = adn.RTADNRates;

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
            const rates: Rates = Common.getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateNonConnectedSimpleDirectGenome());
            const adnParent2 = new RTADN(-1, 1, rates, Common.generateNonConnectedSimpleDirectGenome());

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.connectGenes.length).toBe(0);
        });

        it('outputs the crossover of two identical direct genomes', () => {
            const rates: Rates = Common.getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateDirectGenome());
            const adnParent2 = new RTADN(-1, 1, rates, Common.generateDirectGenome());

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);
            expect(newAdn.genome.nodeGenes[0].identifier).toBe(0);
            expect(newAdn.genome.nodeGenes[1].identifier).toBe(1);
            expect(newAdn.genome.connectGenes.length).toBe(1);
            const avgWeights = (adnParent1.genome.connectGenes[0].weight + adnParent2.genome.connectGenes[0].weight) / 2;
            expect(newAdn.genome.connectGenes[0].weight).toBe(avgWeights);
        });

        it('outputs the crossover of one direct genome and a genome with a split with equals fitness scores', () => {
            const rates: Rates = Common.getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateDirectGenome(true));
            const adnParent2 = new RTADN(-1, 1, rates, Common.generateSimpleSplitGenome());

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

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
            const rates: Rates = Common.getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateSimpleSplitGenome(true));
            const adnParent2 = new RTADN(-1, 1, rates, Common.generateDirectGenome(false));

            const newAdn = adnParent1.crossOver(adnParent2, 0);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

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
            const rates: Rates = Common.getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateDirectGenome(true));
            const adnParent2 = new RTADN(-1, 1, rates, Common.generateSimpleSplitGenome());

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
            const rates: Rates = Common.getBasicRates();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateSimpleSplitGenome(true));
            const adnParent2 = new RTADN(-1, 1, rates, Common.generateDirectGenome(false));

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

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
            const rates: Rates = Common.getBasicRates();
            const genomes = Common.generateComplexGenomes();
            const adnParent1 = new RTADN(-1, 1, rates, genomes[0]);
            const adnParent2 = new RTADN(-1, 1, rates, genomes[1]);

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

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
            const rates: Rates = Common.getBasicRates();
            const genomes = Common.generateComplexGenomes();
            const adnParent1 = new RTADN(-1, 1, rates, genomes[1]);
            const adnParent2 = new RTADN(-1, 1, rates, genomes[0]);

            const newAdn = adnParent1.crossOver(adnParent2, -1);
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

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

    describe('mutate', () => {
        it('outputs the add connection mutation of a non connected genome', () => {
            const rates: Rates = Common.getRateForConnecting();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateNonConnectedSimpleDirectGenome());

            RTADN.selectInNode = (nodeGenes: NodeGene[]) => {
                // force to return the input node
                return nodeGenes[0];
            };

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);

            checkNode(newAdn.genome.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: [newAdn.genome.connectGenes[0]]
            });

            checkNode(newAdn.genome.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [newAdn.genome.connectGenes[0]],
                outputs: []
            });

            expect(newAdn.genome.connectGenes.length).toBe(1);
            checkConnection(newAdn.genome.connectGenes[0], {
                innovation: 0,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });
        });

        it('outputs no connection when adding a recurrent connection mutation on a non connected genome', () => {
            const rates: Rates = Common.getRateForRecurrentConnecting();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateNonConnectedSimpleDirectGenome());

            RTADN.selectInNode = (nodeGenes: NodeGene[]) => {
                // force to return the output node
                return nodeGenes[1];
            };

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);
            checkNode(newAdn.genome.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: []
            });

            checkNode(newAdn.genome.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [],
                outputs: []
            });
        });

        it('outputs forward connection when adding a forward connection mutation on a non connected genome even if recurrent rate at 1', () => {
            const rates: Rates = Common.getRateForRecurrentConnecting();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateNonConnectedSimpleDirectGenome());

            RTADN.selectInNode = (nodeGenes: NodeGene[]) => {
                // force to return the output node
                return nodeGenes[0];
            };

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);

            checkNode(newAdn.genome.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: [newAdn.genome.connectGenes[0]]
            });

            checkNode(newAdn.genome.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [newAdn.genome.connectGenes[0]],
                outputs: []
            });

            expect(newAdn.genome.connectGenes.length).toBe(1);
            checkConnection(newAdn.genome.connectGenes[0], {
                innovation: 0,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });
        });

        it('outputs opposite activation on connections when adding an activation mutation on a simple connected genome', () => {
            const rates: Rates = Common.getRateForActivating();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateActivateDeactivateGenome());

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.connectGenes.length).toBe(2);
            checkConnection(newAdn.genome.connectGenes[0], {
                innovation: 0,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[2],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            checkConnection(newAdn.genome.connectGenes[1], {
                innovation: 1,
                inNode: newAdn.genome.nodeGenes[1],
                outNode: newAdn.genome.nodeGenes[2],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });
        });

        it('outputs splitted connection when applying a split mutation on a simple connected genome', () => {
            const rates: Rates = Common.getRateForSplitting();
            const adnParent1 = new RTADN(-1, 1, rates, Common.generateDirectGenome(true));

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.connectGenes.length).toBe(3);
            checkConnection(newAdn.genome.connectGenes[0], {
                innovation: 0,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            checkConnection(newAdn.genome.connectGenes[1], {
                innovation: 1,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[2],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });

            checkConnection(newAdn.genome.connectGenes[2], {
                innovation: 2,
                inNode: newAdn.genome.nodeGenes[2],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });

            expect(newAdn.genome.nodeGenes.length).toBe(3);
            checkNode(newAdn.genome.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: [newAdn.genome.connectGenes[0], newAdn.genome.connectGenes[1]]
            });

            checkNode(newAdn.genome.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [newAdn.genome.connectGenes[0], newAdn.genome.connectGenes[2]],
                outputs: []
            });

            checkNode(newAdn.genome.nodeGenes[2], {
                identifier: 2,
                type: NodeType.Hidden,
                layer: 0,
                inputs: [newAdn.genome.connectGenes[1]],
                outputs: [newAdn.genome.connectGenes[2]]
            });
        });
    });

    describe('mutate with historic', () => {
        it('outputs the modiied genomes reusing similar innovations for adding', () => {
            // Set next ids far away to simulate previous activity
            Genome.nodeNumber = 5;
            Genome.innovationNumber = 5;

            Genome.historic.addEntry({
                modificationType: ModificationType.Add,
                innovationId: 0,
                inNodeId: 0,
                outNodeId: 1
            });

            RTADN.selectInNode = (nodeGenes: NodeGene[]) => {
                // force to return the output node
                return nodeGenes[0];
            };

            const rates: Rates = Common.getRateForConnecting();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = Common.generateNonConnectedSimpleDirectGenome();

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.nodeGenes.length).toBe(2);
            checkNode(newAdn.genome.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: [newAdn.genome.connectGenes[0]]
            });

            checkNode(newAdn.genome.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [newAdn.genome.connectGenes[0]],
                outputs: []
            });

            expect(newAdn.genome.connectGenes.length).toBe(1);
            checkConnection(newAdn.genome.connectGenes[0], {
                innovation: 0, // reuse historic innovation Id
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });
        });

        it('outputs the modiied genomes reusing similar innovations for splitting', () => {
            // Set next ids far away to simulate previous activity
            Genome.nodeNumber = 5;
            Genome.innovationNumber = 5;

            Genome.historic.addEntry({
                modificationType: ModificationType.Split,
                innovationId: 0,
                inNodeId: 0,
                outNodeId: 1,
                newNodeId: 2
            });

            const rates: Rates = Common.getRateForSplitting();
            const adnParent1 = new RTADN(-1, 1, rates);
            adnParent1.genome = Common.generateDirectGenome(true);

            const newAdn = adnParent1.mutate();
            newAdn.genome.nodeGenes.sort(Common.sortNodeGenesByIdentifier);

            expect(newAdn.genome.connectGenes.length).toBe(3);
            checkConnection(newAdn.genome.connectGenes[0], {
                innovation: 0,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: false,
                recurrent: false
            });

            checkConnection(newAdn.genome.connectGenes[1], {
                innovation: 1,
                inNode: newAdn.genome.nodeGenes[0],
                outNode: newAdn.genome.nodeGenes[2],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });

            checkConnection(newAdn.genome.connectGenes[2], {
                innovation: 2,
                inNode: newAdn.genome.nodeGenes[2],
                outNode: newAdn.genome.nodeGenes[1],
                weight: -1,
                testValue: false,
                isEnabled: true,
                recurrent: false
            });

            expect(newAdn.genome.nodeGenes.length).toBe(3);
            checkNode(newAdn.genome.nodeGenes[0], {
                identifier: 0,
                type: NodeType.Input,
                layer: -Infinity,
                inputs: [],
                outputs: [newAdn.genome.connectGenes[0], newAdn.genome.connectGenes[1]]
            });

            checkNode(newAdn.genome.nodeGenes[1], {
                identifier: 1,
                type: NodeType.Output,
                layer: Infinity,
                inputs: [newAdn.genome.connectGenes[0], newAdn.genome.connectGenes[2]],
                outputs: []
            });

            checkNode(newAdn.genome.nodeGenes[2], {
                identifier: 2,
                type: NodeType.Hidden,
                layer: 0,
                inputs: [newAdn.genome.connectGenes[1]],
                outputs: [newAdn.genome.connectGenes[2]]
            });
        });
    });

    describe('distance', () => {
        it('outputs the average delta weight between two identical genomes', () => {
            const rates = Common.getRateForSplitting();
            const adn1 = new RTADN(-1, 1, rates, Common.generateComplexGenome());
            const adn2 = new RTADN(-1, 1, rates, Common.generateComplexGenome());

            RTADN.deltaWeight = (w1: number, w2: number) => {
                // mock the weight difference to force strict equality btw them
                return 1;
            };

            const distance = adn1.distance(adn2);
            expect(distance).toBe(6 / adn1.genome.connectGenes.length);
        });

        it('outputs the excess genes distance between a genome longer than the current one', () => {
            const rates = Common.getRateForSplitting();
            const adn1 = new RTADN(-1, 1, rates, Common.generateComplexGenome());
            const adn2 = new RTADN(-1, 1, rates, Common.generateComplexGenome());
            adn2.genome.splitConnection(adn2.genome.connectGenes[4], 5, 6);

            RTADN.deltaWeight = (w1: number, w2: number) => {
                // mock the weight difference to force strict equality btw them
                return 1;
            };

            const distance = adn1.distance(adn2);
            const excess = adn2.genome.connectGenes.length - adn1.genome.connectGenes.length;
            const match = adn1.genome.connectGenes.length / adn1.genome.connectGenes.length;
            expect(distance).toBe(1 * excess + 1 * match);
        });

        it('outputs the disjoint genes distance between a genome contained in the current one', () => {
            const rates = Common.getRateForSplitting();
            const adn1 = new RTADN(-1, 1, rates, Common.generateComplexGenome());
            adn1.genome.splitConnection(adn1.genome.connectGenes[4], 5, 6);

            const adn2 = new RTADN(-1, 1, rates);
            adn2.genome = Common.generateComplexGenome();

            RTADN.deltaWeight = (w1: number, w2: number) => {
                // mock the weight difference to force strict equality btw them
                return 1;
            };

            const distance = adn1.distance(adn2);
            const disjoint = adn1.genome.connectGenes.length - adn2.genome.connectGenes.length;
            const match = adn1.genome.connectGenes.length / adn1.genome.connectGenes.length;
            expect(distance).toBe(1 * disjoint + 1 * match);
        });

        it ('outputs the distance between two complex genomes with matching, disjoint and excess genes', () => {
            const rates = Common.getRateForSplitting();
            const adn1 = new RTADN(-1, 1, rates, Common.generateComplexGenome());
            const adn2 = new RTADN(-1, 1, rates, Common.generateComplexGenome());

            adn1.genome.splitConnection(adn1.genome.connectGenes[3], 5, 6); // disjoint adn1
            adn2.genome.splitConnection(adn2.genome.connectGenes[4], 7, 7); // disjoint adn2
            adn1.genome.splitConnection(adn1.genome.connectGenes[2], 9, 8); // disjoint adn1
            adn2.genome.splitConnection(adn2.genome.connectGenes[5], 11, 9); // excess adn2

            RTADN.deltaWeight = (w1: number, w2: number) => {
                // mock the weight difference to force strict equality btw them
                return 1;
            };

            const distance = adn1.distance(adn2);
            const disjoint = 6;
            const excess = 2;
            const match = 6 / 6;
            expect(distance).toBe(1 * disjoint + 1 * excess + 1 * match);
        });
    });
});
