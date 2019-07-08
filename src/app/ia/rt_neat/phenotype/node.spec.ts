import { Node, NodeType } from './node';
import { Connect } from './connect';
import { Activation } from '../../neural-network';

describe('Node', () => {
    describe('constructor', () => {
        it('outputs a node with the correct attributes', () => {
            const n = new Node(1, NodeType.Hidden, 1, 'tanh');
            expect(n.identifier).toBe(1);
            expect(n.nodeType).toBe(NodeType.Hidden);
            expect(n.layer).toBe(1);
            expect(n.activationFunction).toBe('tanh');
            expect(n.inputs.length).toBe(0);
            expect(n.value).toBe(0);
        });
    });

    describe('activate', () => {
        it('outputs the activated value of the neuron with tanh', () => {
            const n1 = new Node(1, NodeType.Input, 0, 'none', 2);
            const n2 = new Node(2, NodeType.Input, 0, 'none', 4);
            const n3 = new Node(3, NodeType.Hidden, 1, 'tanh');

            const l1 = new Connect(1, n1, n3, 0.5);
            const l2 = new Connect(2, n2, n3, 0.5);
            n3.addInput(l1);
            n3.addInput(l2);

            n3.activate();
            expect(n3.value).toBe(Activation.tanh(n1.value * l1.weight + n2.value * l2.weight));
        });

        it('outputs the activated value of the neuron with sigmoid', () => {
            const n1 = new Node(1, NodeType.Input, 0, 'none', 2);
            const n2 = new Node(2, NodeType.Input, 0, 'none', 4);
            const n3 = new Node(3, NodeType.Hidden, 1, 'sigmoid');

            const l1 = new Connect(1, n1, n3, 0.5);
            const l2 = new Connect(2, n2, n3, 0.5);
            n3.addInput(l1);
            n3.addInput(l2);

            n3.activate();
            expect(n3.value).toBe(Activation.sigmoid(n1.value * l1.weight + n2.value * l2.weight));
        });

        it('outputs the activated value of the neuron with other activation function', () => {
            const n1 = new Node(1, NodeType.Input, 0, 'none', 2);
            const n2 = new Node(2, NodeType.Input, 0, 'none', 4);
            const n3 = new Node(3, NodeType.Hidden, 1, 'none');

            const l1 = new Connect(1, n1, n3, 0.5);
            const l2 = new Connect(2, n2, n3, 0.5);
            n3.addInput(l1);
            n3.addInput(l2);

            n3.activate();
            expect(n3.value).toBe(n1.value * l1.weight + n2.value * l2.weight);
        });

        it('outputs the activated value of the neuron with tanh and a recurrent link', () => {
            const n1 = new Node(1, NodeType.Input, 0, 'none', 2);
            const n2 = new Node(2, NodeType.Input, 2, 'none', 4);
            const n3 = new Node(3, NodeType.Hidden, 1, 'tanh');

            const l1 = new Connect(1, n1, n3, 0.5);
            const l2 = new Connect(2, n2, n3, 0.5); // recurrent link
            l2.inputNode.saveInMemory();
            l2.inputNode.value = 4;

            n3.addInput(l1);
            n3.addInput(l2);

            n3.activate();
            expect(n3.value).toBe(Activation.tanh(n1.value * l1.weight + n2.memory * l2.weight));
        });
    });
});
