import { NodeGene, NodeType } from './node';
import { ConnectGene } from './connect';
import { Genome } from './genome';

describe('Genome', () => {
    describe('constructor', () => {
        it('outputs a genome with the correct attributes', () => {
            const g = new Genome();
            expect(g.nodeGenes.length === 0);
            expect(g.connectGenes.length === 0);
        });
    });

    describe('manage global innovation', () => {
        it('outputs the next innovation number available', () => {
            expect(Genome.nextInnovation === 0);
        });

        it('outputs the next innovation number after an increment', () => {
            Genome.incrementInnovation();
            expect(Genome.nextInnovation === 1);
        });
    });

    describe('add connection', () => {
        it('add a connection between two existing nodes in genomes', () => {
            const n1 = new NodeGene(1, NodeType.Hidden, 1);
            const n2 = new NodeGene(2, NodeType.Hidden, 2);
            const g = new Genome();
            g.addConnection(n1, n2);

            expect(g.connectGenes.length === 1);
            expect(g.connectGenes[0].innovation === 0);
            expect(g.connectGenes[0].inputNode.identifier === n1.identifier);
            expect(g.connectGenes[0].outputNode.identifier === n1.identifier);
            expect(g.connectGenes[0].isEnabled);
            expect(!isNaN(g.connectGenes[0].weight));
            expect(Genome.nextInnovation === 1);
        });
    });
});
