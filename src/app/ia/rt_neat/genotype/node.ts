import { ConnectGene } from './connect';

export enum NodeType {
    Input = 0,
    Output = 1,
    Hidden = 2,
    Bias = 3
}

export class NodeGene {

    private id: number;
    private type: NodeType;
    private position: number;
    private inLinks: ConnectGene[];
    private outLinks: ConnectGene[];

    constructor(id: number, type: NodeType, position: number) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.inLinks = [];
        this.outLinks = [];
    }

    public get identifier(): number {
        return this.id;
    }

    public get nodeType(): number {
        return this.type;
    }

    public get layer(): number {
        return this.position;
    }
    public set layer(l: number) {
        this.position = l;
    }

    public addInLink(link: ConnectGene) {
        this.inLinks.push(link);
    }

    public addOutLink(link: ConnectGene) {
        this.outLinks.push(link);
    }

    public isInput(): boolean {
        return this.type === NodeType.Input;
    }

    public isOutput(): boolean {
        return this.type === NodeType.Output;
    }

    public isHidden(): boolean {
        return this.type === NodeType.Hidden;
    }

    public isBias(): boolean {
        return this.type === NodeType.Bias;
    }

    public get inputs(): ConnectGene[] {
        return this.inLinks;
    }

    public get outputs(): ConnectGene[] {
        return this.outLinks;
    }

    // The copy does not copy the links
    // The links have to be set by adding inputs and outputs links
    public copyWithoutDependencies(): NodeGene {
        const node = new NodeGene(this.id, this.type, this.position);
        return node;
    }
}
