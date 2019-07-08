import { Node, NodeType } from './node';
import { Connect } from './connect';

describe('Connect', () => {
    describe('constructor', () => {
        it('outputs a connection with the correct attributes', () => {
            const n1 = new Node(1, NodeType.Input, 0, 'none', 2);
            const n2 = new Node(2, NodeType.Hidden, 0, 'tanh');
            const l = new Connect(1, n1, n2, 0.5);

            expect(l.identifier).toBe(1);
            expect(l.inputNode.identifier).toBe(1);
            expect(l.outputNode.identifier).toBe(2);
            expect(l.weight).toBe(0.5);
        });
    });
});
