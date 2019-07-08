import { Activation } from '../../neural-network';
import { Connect } from './connect';

export enum NodeType {
    Input = 0,
    Output = 1,
    Hidden = 2,
    Bias = 3
}

export class Node {

    private id: number;
    private type: NodeType;
    private position: number;
    private activation: string;
    private val: number;
    private inLinks: Connect[];

    constructor(id: number, type: NodeType, layer: number, activationName: string, value: number = 0) {
        this.id = id;
        this.type = type;
        this.position = layer;
        this.activation = activationName;
        this.val = value;
        this.inLinks = [];
    }

    public addInput(link: Connect) {
        this.inLinks.push(link);
    }

    public activate() {
        let newValue = 0;
        for (const link of this.inLinks) {
            newValue += (link.weight * link.inputNode.value);
        }
        this.val = this.applyActivation(newValue); // TODO: maybe later add bias
    }

    private applyActivation(x: number) {
        switch (this.activation) {
            case 'tanh': return Activation.tanh(x);
            case 'sigmoid': return Activation.sigmoid(x);
            default: return x;
        }
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

    public get value(): number {
        return this.val;
    }

    public get activationFunction(): string {
        return this.activation;
    }

    public get inputs(): Connect[] {
        return this.inLinks;
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
