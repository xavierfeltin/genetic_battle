import { Node } from './node';

export class Connect {

    private id: number;
    private inNode: Node;
    private outNode: Node;
    private coefficient: number;

    constructor(id: number, inN: Node, outN: Node, coeff: number) {
        this.id = id;
        this.inNode = inN;
        this.outNode = outN;
        this.coefficient = coeff;
    }

    public print() {
        console.log('id: ' + this.identifier + ', weight: ' + this.weight + ', recurrent: ' + this.reccurent);
        console.log('Node ' + this.inNode.identifier + ' ---> Node ' + this.outNode.identifier);
    }

    public get identifier() {
        return this.id;
    }

    public get inputNode() {
        return this.inNode;
    }

    public get outputNode() {
        return this.outNode;
    }

    public get weight() {
        return this.coefficient;
    }
    public set weight(w: number) {
        this.coefficient = w;
    }

    public get reccurent() {
        return this.inNode.layer >= this.outNode.layer;
    }
}
