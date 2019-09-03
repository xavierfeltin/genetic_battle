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
    private label: string;
    private activation: string;
    private val: number;
    private mem: number;
    private inLinks: Connect[];
    private outLinks: Connect[];

    constructor(id: number, type: NodeType, layer: number, activationName: string, label: string, value: number) {
        this.id = id;
        this.type = type;
        this.position = layer;
        this.label = label;
        this.activation = activationName;
        this.val = value;
        this.mem = 0;
        this.inLinks = [];
        this.outLinks = [];
    }

    public get name(): string {
        return this.label;
    }

    public addInput(link: Connect) {
        this.inLinks.push(link);
    }

    public addOutput(link: Connect) {
        this.outLinks.push(link);
    }

    public activate() {
        let newValue = 0;
        for (const link of this.inLinks) {
            if (link.reccurent) {
                newValue += (link.weight * link.inputNode.mem);
            } else {
                newValue += (link.weight * link.inputNode.value);
            }
        }
        this.val = this.applyActivation(newValue); // TODO: maybe later add bias
    }

    public saveInMemory() {
        this.mem = this.val;
    }

    private applyActivation(x: number) {
        switch (this.activation) {
            case 'tanh': return Activation.tanh(x);
            case 'sigmoid': return Activation.sigmoid(x);
            default: return x;
        }
    }

    public print() {
        console.log('id: ' + this.identifier + ', val: ' + this.value + ', mem: ' + this.mem);
        let msg = '';
        for (const link of this.inLinks) {
            msg += link.identifier;
            if (link.reccurent) {
                msg += 'R';
            }
            msg += ', ';
        }
        console.log('in links: ' + msg);

        msg = '';
        for (const link of this.outLinks) {
            msg += link.identifier + ', ';
        }
        console.log('out links: ' + msg);
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
    public set value(x: number) {
        this.val = x;
    }

    public get memory(): number {
        return this.mem;
    }

    public get activationFunction(): string {
        return this.activation;
    }

    public get inputs(): Connect[] {
        return this.inLinks;
    }

    public get outputs(): Connect[] {
        return this.outLinks;
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
