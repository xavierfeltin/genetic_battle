import { NodeGene } from './node';
import { ConnectGene } from './connect';
import { MyMath } from '../../../tools/math.tools';

export class Genome {
    public static innovationNumber = 0;
    private nodes: NodeGene[];
    private links: ConnectGene[];

    constructor() {
        this.nodes = [];
        this.links = [];
    }

    public static incrementInnovation() {
        Genome.innovationNumber++;
    }

    public static get nextInnovation(): number {
        return Genome.innovationNumber;
    }

    public addNode(n: NodeGene) {
        this.nodes.push(n);
    }

    public addConnect(c: ConnectGene) {
        this.links.push(c);
    }

    public get nodeGenes(): NodeGene[] {
        return this.nodes;
    }

    public get connectGenes(): ConnectGene[] {
        return this.links;
    }

    // add connection between two existing nodes
    public addConnection(inNode: NodeGene, outNode: NodeGene) {
        const newLink = new ConnectGene(Genome.nextInnovation, inNode, outNode, MyMath.random(-1, 1), true);
        this.links.push(newLink);
        Genome.incrementInnovation();
    }

    // add a node to split an existing connection in two
    // disable a connection between two nodes
}
