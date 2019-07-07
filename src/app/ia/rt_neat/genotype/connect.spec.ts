import { NodeGene, NodeType } from './node';
import { ConnectGene } from './connect';

describe('Connect', () => {
    describe('constructor', () => {
        it('outputs a connection with the correct attributes', () => {
            const inNode = new NodeGene(1, NodeType.Input, -Infinity);
            const outNode = new NodeGene(1, NodeType.Output, Infinity);
            const l = new ConnectGene(1, inNode, outNode, 1, true);
            expect(l.innovation).toBe(1);
            expect(l.inputNode.identifier).toBe(inNode.identifier);
            expect(l.outputNode.identifier).toBe(outNode.identifier);
        });
    });

    describe('activation', () => {
        it('outputs true if the link is activated, false otherwise', () => {
            const inNode = new NodeGene(1, NodeType.Input, -Infinity);
            const outNode = new NodeGene(1, NodeType.Output, Infinity);
            const l = new ConnectGene(1, inNode, outNode, 1, false);
            l.activate(true);
            expect(l.isEnabled).toBeTruthy();

            l.activate(false);
            expect(l.isEnabled).toBeFalsy();
        });
    });

    describe('reccurent link', () => {
        it('outputs false if the link is forward', () => {
            const h1 = new NodeGene(1, NodeType.Hidden, 1);
            const h2 = new NodeGene(1, NodeType.Hidden, 2);
            const l = new ConnectGene(1, h1, h2, 1, true);
            expect(l.reccurent).toBeFalsy();
        });

        it('outputs true if the link is reccurent', () => {
            const h1 = new NodeGene(1, NodeType.Hidden, 2);
            const h2 = new NodeGene(1, NodeType.Hidden, 1);
            const l = new ConnectGene(1, h1, h2, 1, true);
            expect(l.reccurent).toBeTruthy();
        });

        it('outputs true if the link is reccurent on itself', () => {
            const h1 = new NodeGene(1, NodeType.Hidden, 1);
            const h2 = new NodeGene(1, NodeType.Hidden, 1);
            const l = new ConnectGene(1, h1, h2, 1, true);
            expect(l.reccurent).toBeTruthy();
        });

        it('outputs true if the link is reccurent even if not hidden nodes', () => {
            const h = new NodeGene(1, NodeType.Hidden, 2);
            const out = new NodeGene(1, NodeType.Output, Infinity);
            const l = new ConnectGene(1, out, h, 1, true);
            expect(l.reccurent).toBeTruthy();
        });
    });
});
