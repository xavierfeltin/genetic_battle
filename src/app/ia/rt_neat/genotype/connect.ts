import { NodeGene } from './node';

export class ConnectGene {

    private innovationId: number;
    private inNode: NodeGene;
    private outNode: NodeGene;
    private coefficient: number;
    private enabled: boolean;

    constructor(id: number, inN: NodeGene, outN: NodeGene, coeff: number, enabled: boolean) {
        this.innovationId = id;
        this.inNode = inN;
        this.outNode = outN;
        this.coefficient = coeff;
        this.enabled = enabled;
    }

    public activate(active: boolean) {
        this.enabled = active;
    }

    public get innovation() {
        return this.innovationId;
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

    public get isEnabled() {
        return this.enabled;
    }

    public get reccurent() {
        console.log(this.inNode.layer);
        console.log(this.outNode.layer);
        return this.inNode.layer >= this.outNode.layer; // can be a link on itself
    }

    public copy(nodes: NodeGene[]): ConnectGene {
        let filtered = nodes.filter((n: NodeGene) => n.identifier === this.inNode.identifier);
        const newInNode = filtered.length > 0 ? filtered[0] : null;

        filtered = nodes.filter((n: NodeGene) => n.identifier === this.outNode.identifier);
        const newOutNode = filtered.length > 0 ? filtered[0] : null;

        const connect = new ConnectGene(this.innovationId, newInNode, newOutNode, this.coefficient, this.enabled);
        return connect;
    }
}
