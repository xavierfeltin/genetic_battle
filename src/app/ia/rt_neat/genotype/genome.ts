import { NodeGene, NodeType } from './node';
import { ConnectGene } from './connect';
import { MyMath } from '../../../tools/math.tools';
import { Historic, ModificationType } from './historic';

export class Genome {
    public static innovationNumber = 0;
    public static nodeNumber = 0;
    public static historic = new Historic();

    private nodes: NodeGene[];
    private links: ConnectGene[];

    constructor() {
        this.nodes = [];
        this.links = [];
    }

    /**
     * Create a default genome configuration with deterministic ids for each node
     * the nodeNumber is updated if no other modification has been done
     */
    public static generate(nbInputs: number, nbOutputs: number): Genome {
        const g = new Genome();
        let nbNodes = 0;
        for (let i = 0; i < nbInputs; i++) {
            g.addNode(NodeType.Input, -Infinity, nbNodes);
            nbNodes++;
        }

        for (let i = 0; i < nbOutputs; i++) {
            g.addNode(NodeType.Output, Infinity, nbNodes);
            nbNodes++;
        }

        if (Genome.nodeNumber === 0) {
            Genome.nodeNumber = nbNodes;
        }

        return g;
    }

    public static reset() {
        Genome.innovationNumber = 0;
        Genome.nodeNumber = 0;
        Genome.historic.reset();
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
        if (genes.length < 32) {
            debugger;
        }
        this.nodes = genes;
    }

    public get connectGenes(): ConnectGene[] {
        return this.links;
    }

    public set connectGenes(genes: ConnectGene[]) {
        this.links = genes;
    }

    public static logInnovation(type: ModificationType, innovation: number, inNode: number, outNode: number, newNode: number = -1) {
        Genome.historic.addEntry({
            modificationType: type,
            innovationId: innovation, // save the innovation of the splitted connection
            inNodeId: inNode,
            outNodeId: outNode,
            newNodeId: newNode
        });
    }

    // add connection between two existing nodes
    public addConnection(inNode: NodeGene, outNode: NodeGene, innovation: number = -1) {
        // TODO: forbid connections between nodes of the same layer except itself
        // or forbid cycle between graphs of the same layer

        let innov = innovation;
        if (innov === -1) {
            innov = Genome.nextInnovation;
            Genome.incrementInnovation();
        }

        const newLink = new ConnectGene(innov, inNode, outNode, MyMath.random(-1, 1), true);
        inNode.addOutLink(newLink);
        outNode.addInLink(newLink);
        this.links.push(newLink);

        if (innovation === -1) {
            Genome.logInnovation(ModificationType.Add, innov, inNode.identifier, outNode.identifier);
        }
    }

    public addNode(type: NodeType, position: number, id: number = -1) { // node: NodeGene) {
        let idNode = id;
        if (idNode === -1) {
            idNode = Genome.nextNodeId;
            Genome.incrementNodeId();
        }

        const newNode = new NodeGene(idNode, type, position);
        this.nodes.push(newNode);
    }

    // add a node to split an existing connection in two
    public splitConnection(connect: ConnectGene, innovationId: number = -1, newNodeId: number = -1) {
        // Deactivate previous connection
        this.activateConnection(connect, false);

        // Insert a node between the previously connected node
        let newNodeLayer = connect.reccurent ? connect.outputNode.layer + 1 : connect.inputNode.layer + 1;

        if (newNodeLayer === -Infinity) {
            // If inNode is an Input, so the hidden layer is the very first one
            newNodeLayer = 0;
        } else if (newNodeLayer === Infinity) {
            // If inNode is an Output (recurrent link), the hidden layer is the one after the outNode
            newNodeLayer = connect.outputNode.layer === -Infinity ? 0 : connect.outputNode.layer + 1;
        }

        let nodeId = newNodeId;
        if (newNodeId === -1) {
            nodeId = Genome.nextNodeId;
            Genome.incrementNodeId();
        }
        const newNode = new NodeGene(nodeId, NodeType.Hidden, newNodeLayer);
        this.nodes.push(newNode);

        // Update the layer of the node at the end of the new connection and propagate the modification
        if (connect.reccurent) {
            connect.inputNode.layer = connect.inputNode.layer === Infinity ? Infinity : newNode.layer + 1;
            if (connect.inputNode.layer !== Infinity) {
                this.propagateLayerUpdateAfterIncrement(connect.inputNode);
            }
        } else {
            connect.outputNode.layer = connect.outputNode.layer === Infinity ? Infinity : newNode.layer + 1;
            if (connect.outputNode.layer !== Infinity) {
                this.propagateLayerUpdateAfterIncrement(connect.outputNode);
            }
        }

        // Connect the previous nodes with the new node
        let anteConnectId = innovationId + 1;
        let postConnectId = innovationId + 2;
        if (innovationId === -1) {
            anteConnectId = Genome.nextInnovation;
            Genome.incrementInnovation();
            postConnectId = Genome.nextInnovation;
            Genome.incrementInnovation();
        }

        // Connection into the new node weight of 1
        const anteConnect = new ConnectGene(anteConnectId, connect.inputNode, newNode, 1, true);
        this.links.push(anteConnect);
        newNode.addInLink(anteConnect);
        connect.inputNode.addOutLink(anteConnect);

        // Connection out the new node weight of the previous connection

        const postConnect = new ConnectGene(postConnectId, newNode, connect.outputNode, connect.weight, true);
        this.links.push(postConnect);
        newNode.addOutLink(postConnect);
        connect.outputNode.addInLink(postConnect);

        if (innovationId === -1) {
            Genome.logInnovation( ModificationType.Split, connect.innovation,
                connect.inputNode.identifier, connect.outputNode.identifier, newNode.identifier);
        }
    }

    /**
     * Change layers of recurrent incoming links and output non recurrent links
     * Output reccurent links are not impacted since the node drift farther away as such the recurrent type of the link will not be changed
     * Even disabled links need to be taken into account in case they are reactivated in future mutations
     * @param root root node from where the propagation start
     */
    private propagateLayerUpdateAfterIncrement(root: NodeGene) {
        // const toVisit = [...root.inputs.map(l => l.inputNode), ...root.outputs.map(l => l.outputNode)];
        let toVisit = [...root.inputs];
        while (toVisit.length > 0) {
            const currentLink = toVisit.shift();
            const current = currentLink.inputNode;
            this.propagate(root, current, currentLink.reccurent);
        }

        toVisit = [...root.outputs];
        while (toVisit.length > 0) {
            const currentLink = toVisit.shift();
            const current = currentLink.outputNode;
            this.propagate(root, current, currentLink.reccurent);
        }
    }

    private propagate(root: NodeGene, current: NodeGene, isRecurrent: boolean) {
        const deltaLayer = current.layer - root.layer;
        const isNotItselft = root.identifier !== current.identifier;
        const needToMoveLayer = (deltaLayer === -1 && isRecurrent) || (0 === deltaLayer && !isRecurrent); /* && deltaLayer <= 1 */

        if (isNotItselft && needToMoveLayer) {
            current.layer += 1;
            this.propagateLayerUpdateAfterIncrement(current);
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

        g.nodes = this.nodes.map(n => n.copyWithoutDependencies());
        g.links = this.links.map(l => l.copy(g.nodes));
        return g;
    }
}
