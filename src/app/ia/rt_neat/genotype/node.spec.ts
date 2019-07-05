import { NodeGene, NodeType } from './node';

describe('Node', () => {
    describe('constructor', () => {
        it('outputs a node with the correct attributes', () => {
            const n = new NodeGene(1, NodeType.Input, 1);
            expect(n.identifier === 1);
            expect(n.nodeType === NodeType.Input);
            expect(n.layer === 1);
        });
    });

    describe('getters', () => {
        it('outputs true if the node is an input, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Input, 1);
            expect(n1.isInput());

            const n2 = new NodeGene(1, NodeType.Output, 1);
            expect(!n2.isInput());
        });

        it('outputs true if the node is an output, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Output, 1);
            expect(n1.isInput());

            const n2 = new NodeGene(1, NodeType.Input, 1);
            expect(!n2.isInput());
        });

        it('outputs true if the node is a hidden node, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Hidden, 1);
            expect(n1.isInput());

            const n2 = new NodeGene(1, NodeType.Output, 1);
            expect(!n2.isInput());
        });

        it('outputs true if the node is a bias, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Bias, 1);
            expect(n1.isInput());

            const n2 = new NodeGene(1, NodeType.Output, 1);
            expect(!n2.isInput());
        });
  });
});
