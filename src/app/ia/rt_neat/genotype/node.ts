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

    constructor(id: number, type: NodeType, position: number) {
        this.id = id;
        this.type = type;
        this.position = position;
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
}
