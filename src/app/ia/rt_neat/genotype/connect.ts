import { NodeGene } from './node';

export class ConnectGene {

    private innovationId: number;
    private inNode: NodeGene;
    private outNode: NodeGene;
    private coefficient: number;
    private enabled: boolean;
    private isRecurrent: boolean;

    constructor(id: number, inN: NodeGene, outN: NodeGene, coeff: number, enabled: boolean) {
        this.innovationId = id;
        this.inNode = inN;
        this.outNode = outN;
        this.coefficient = coeff;
        this.enabled = enabled;

        if (this.inNode !== null && this.outNode !== null) {
            this.isRecurrent = (this.inNode.layer >= this.outNode.layer);
        } else {
            this.isRecurrent = false; // default value
        }        
    }

    public activate(active: boolean) {
        this.enabled = active;
    }

    public get innovation() {
        return this.innovationId;
    }

    public get inputNode(): NodeGene {
        return this.inNode;
    }

    public set inputNode(n: NodeGene) {
        this.inNode = n;
    }

    public get outputNode(): NodeGene {
        return this.outNode;
    }

    public set outputNode(n: NodeGene) {
        this.outNode = n;
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
        return this.isRecurrent; // can be a link on itself
    }

    public set reccurent(isRecurrent: boolean) {
        this.isRecurrent = isRecurrent;
    }

    /**
     * Copy the link
     * @param nodes if empty generate a copy of the nodes attached to the link
     * Otherwise use the nodes given in argument, if not found the node is set to null
     */
    public copy(nodes: NodeGene[]): ConnectGene {
        let newInNode = null;
        let newOutNode = null;

        if (nodes.length === 0) {
            newInNode = this.copyNode(this.inNode, true);
            newOutNode = this.copyNode(this.outNode, false);
        } else {
            let filtered = nodes.filter((n: NodeGene) => n.identifier === this.inNode.identifier);
            newInNode = filtered.length > 0 ? this.registerOntoNode(filtered[0], true) : this.copyNode(this.inNode, true);

            filtered = nodes.filter((n: NodeGene) => n.identifier === this.outNode.identifier);
            newOutNode = filtered.length > 0 ? this.registerOntoNode(filtered[0], false) : this.copyNode(this.outNode, false);
        }

        const connect = new ConnectGene(this.innovationId, newInNode, newOutNode, this.coefficient, this.enabled);
        connect.reccurent = this.reccurent;
        return connect;
    }

    public copyWithoutDependencies(): ConnectGene {
        const connect = new ConnectGene(this.innovationId, null, null, this.coefficient, this.enabled);
        connect.reccurent = this.reccurent;
        return connect;
    }

    // Force the node to register the link
    private registerOntoNode(node: NodeGene, isInput: boolean): NodeGene {
        if (isInput) {
            node.addOutLink(this);
        } else {
            node.addInLink(this);
        }
        return node;
    }

    // Copy the node and register the link
    private copyNode(node: NodeGene, isInput: boolean): NodeGene {
        let newNode = node.copyWithoutDependencies();
        newNode = this.registerOntoNode(newNode, isInput);
        return newNode;
    }
}
