import { NodeGene, NodeType } from './node';
import { ConnectGene } from './connect';
import { MyMath } from '../../../tools/math.tools';

export class Genome {
    public static innovationNumber = 0;
    public static nodeNumber = 0;

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

    public static incrementNodeId() {
        Genome.nodeNumber++;
    }

    public static get nextNodeId(): number {
        return Genome.nodeNumber;
    }

    public get nodeGenes(): NodeGene[] {
        return this.nodes;
    }

    public set nodeGenes(genes: NodeGene[]) {
        this.nodes = genes;
    }

    public get connectGenes(): ConnectGene[] {
        return this.links;
    }

    public set connectGenes(genes: ConnectGene[]) {
        this.links = genes;
    }

    // add connection between two existing nodes
    public addConnection(inNode: NodeGene, outNode: NodeGene) {
        // TODO: forbid connections between nodes of the same layer except itself
        // or forbid cycle between graphs of the same layer

        const newLink = new ConnectGene(Genome.nextInnovation, inNode, outNode, MyMath.random(-1, 1), true);
        this.links.push(newLink);
        Genome.incrementInnovation();
    }

    public addNode(node: NodeGene) {
        this.nodeGenes.push(node);
    }

    // add a node to split an existing connection in two
    public splitConnection(connect: ConnectGene) {
        // Deactivate previous connection
        this.activateConnection(connect, false);

        // Insert a node between the previously connected node
        const newNodeLayer = connect.reccurent ? connect.outputNode.layer + 1 : connect.inputNode.layer + 1;
        const newNode = new NodeGene(Genome.nextNodeId, NodeType.Hidden, newNodeLayer);
        Genome.incrementNodeId();
        this.nodeGenes.push(newNode);

        // Connect the previous nodes with the new node
        // Connection into the new node weight of 1
        const anteConnect = new ConnectGene(Genome.nextInnovation, connect.inputNode, newNode, 1, true);
        Genome.incrementInnovation();
        this.links.push(anteConnect);

        // Connection out the new node weight of the previous connection
        const postConnect = new ConnectGene(Genome.nextInnovation, newNode, connect.outputNode, connect.weight, true);
        Genome.incrementInnovation();
        this.links.push(postConnect);

        // the out node of the new node is a layer further
        if (connect.reccurent) {
            anteConnect.inputNode.layer = newNode.layer + 1;
        } else {
            postConnect.outputNode.layer = newNode.layer + 1;
        }
    }

    // enable / disable a connection between two nodes
    public activateConnection(connect: ConnectGene, enable: boolean) {
        connect.activate(enable);
    }

    public changeConnectionWeight(connect: ConnectGene, weight: number) {
        connect.weight = weight;
    }

    public copy(): Genome {
        const g = new Genome();
        g.nodes = this.nodes.map(n => n.copy());
        g.links = this.links.map(l => l.copy(g.nodes));
        return g;
    }
}
