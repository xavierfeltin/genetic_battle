import { NodeGene, NodeType } from './node';

describe('Node', () => {
    describe('constructor', () => {
        it('outputs a node with the correct attributes', () => {
            const n = new NodeGene(1, NodeType.Input, 1);
            expect(n.identifier).toBe(1);
            expect(n.nodeType).toBe(NodeType.Input);
            expect(n.layer).toBe(1);
        });
    });

    describe('getters', () => {
        it('outputs true if the node is an input, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Input, 1);
            expect(n1.isInput()).toBeTruthy();

            const n2 = new NodeGene(1, NodeType.Output, 1);
            expect(n2.isInput()).toBeFalsy();
        });

        it('outputs true if the node is an output, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Output, 1);
            expect(n1.isOutput()).toBeTruthy();

            const n2 = new NodeGene(1, NodeType.Hidden, 1);
            expect(n2.isOutput()).toBeFalsy();
        });

        it('outputs true if the node is a hidden node, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Hidden, 1);
            expect(n1.isHidden()).toBeTruthy();

            const n2 = new NodeGene(1, NodeType.Bias, 1);
            expect(n2.isHidden()).toBeFalsy();
        });

        it('outputs true if the node is a bias, false otherwise', () => {
            const n1 = new NodeGene(1, NodeType.Bias, 1);
            expect(n1.isBias()).toBeTruthy();

            const n2 = new NodeGene(1, NodeType.Hidden, 1);
            expect(n2.isBias()).toBeFalsy();
        });
  });
});
