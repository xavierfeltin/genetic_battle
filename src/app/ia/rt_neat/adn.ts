import { Genome } from './genotype/genome';
import { ADN } from '../adn';
import { MyMath } from '../../tools/math.tools';
import { NodeGene } from './genotype/node';
import { ConnectGene } from './genotype/connect';
import { NodeType } from './phenotype/node';
import { ModificationType } from './genotype/historic';

export interface RTADNRates {
    mutation: number;
    crossOver: number;
    mutationActivation: number;
    mutationConnect: number;
    mutationAllowRecurrent: number;
    mutationSplitConnect: number;
}

export class RTADN extends ADN {
    public static readonly MUTATION_ACTIVATION_RATE: number = 0.01;
    public static readonly MUTATION_CONNECT_RATE: number = 0.01;
    public static readonly MUTATION_ALLOW_RECURRENT: number = 0.01;
    public static readonly MUTATION_SPLIT_CONNECT_RATE: number = 0.01;

    private g: Genome;
    private mutationActivationRate: number;
    private mutationConnectRate: number;
    private mutationAllowRecurrentRate: number;
    private mutationSplitConnectRate: number;

    // TODO: add genome directly in constructor
    constructor(min: number, max: number, rates: RTADNRates) {
        super(0, min, max, rates.mutation, rates.crossOver);
        this.g = new Genome();
        this.mutationActivationRate = rates.mutationActivation;
        this.mutationConnectRate = rates.mutationConnect;
        this.mutationAllowRecurrentRate = rates.mutationAllowRecurrent;
        this.mutationSplitConnectRate = rates.mutationSplitConnect;
    }

    public static selectInNode(nodeGenes: NodeGene[]) {
        return nodeGenes[Math.round(MyMath.random(0, nodeGenes.length - 1))];
    }

    public static selectOutNode(inNode: NodeGene, nodeGenes: NodeGene[]) {
        let availableNodes = [];

        const inputs = [];
        const outputs =  [];
        const hiddens = [];

        for (const n of nodeGenes) {
            switch (n.nodeType) {
                case NodeType.Input:
                    inputs.push(n);
                    break;
                case NodeType.Output:
                    outputs.push(n);
                    break;
                default:
                    hiddens.push(n);
            }
        }

        switch (inNode.nodeType) {
            case NodeType.Input:
                availableNodes = [...outputs, ...hiddens];
                break;
            case NodeType.Output:
                availableNodes = [...hiddens];
                break;
            default:
                availableNodes = [...outputs, ...hiddens];
        }
        const nodeOut = availableNodes.length === 0 ? null : availableNodes[Math.round(MyMath.random(0, availableNodes.length - 1))];
        return nodeOut;
    }

    public static selectEnabledLink(connectGenes: ConnectGene[]) {
        const enabledLinks = connectGenes.filter((l: ConnectGene) => l.isEnabled);
        const link = enabledLinks[Math.round(MyMath.random(0, enabledLinks.length - 1))];
        return link;
    }

    public get genome(): Genome {
        return this.g;
    }

    public set genome(gen: Genome) {
        this.g = gen;
    }

    // TODO:
    // - replace union nodes by a dictionary layer => nodes to facilitate the search of existing node
    // - manage creation of new nodes, and register of links to existing nodes directly in the first loop
    // - delete the second loop creating the nodes from all the links
    // - check at the end of no nodes, get the inputs / outputs only
    // - change or delete functions to get existing nodes and search

    /**
     * Crossover between two adn
     * @param adn adn from the second parent
     * @param isBest -1 current parent is best, 0 both are the same, 1 other parent is best
     */
    public crossOver(adn: RTADN, isBest: number = 0): RTADN {
        const result = new RTADN(this.minimum, this.maximum, this.rates);

        const unionLinks = [];
        const unionNodes = []; // generated from the links kept during crossover
        let index = 0;

        // Make an union of all the innovation numbers
        for (const link of this.genome.connectGenes) {
            // console.log('current link: ' + link.innovation);

            // Some innovations are present in the other set and not in the current genome
            while (index < adn.genome.connectGenes.length
                && adn.genome.connectGenes[index].innovation < link.innovation) {

                // console.log('previous disjoint/excess link: ' + adn.genome.connectGenes[index].innovation);

                // Push it if this parent is the best or both have the same fitness
                if (isBest >= 0) {
                    const newLink = adn.genome.connectGenes[index].copyWithoutDependencies();
                    this.manageDependencies(adn.genome.connectGenes[index], newLink, unionNodes);

                    if (!newLink.isEnabled && Math.random() < 0.25) {
                        newLink.activate(true);
                    }
                    unionLinks.push(newLink);
                }
                index++;
            }

            // Innovations are present in both genomes
            if (index < adn.genome.connectGenes.length
                && adn.genome.connectGenes[index].innovation === link.innovation) {

                // console.log('link exists in both parents: ' + adn.genome.connectGenes[index].innovation);

                // Set the link with the average of the weights from the 2 parents
                const newLink = link.copyWithoutDependencies();
                this.manageDependencies(link, newLink, unionNodes);
                newLink.weight = (link.weight + adn.genome.connectGenes[index].weight) / 2;

                // link is deactivated if it is not enabled in one of the two parents
                if (!adn.genome.connectGenes[index].isEnabled || !link.isEnabled) {
                    newLink.activate(false);
                }

                unionLinks.push(newLink);
                index++;
            } else {
                // console.log('link exists only in current parent: ' + link.innovation);

                // push it if this parent is the best or both have the same fitness
                if (isBest <= 0) {
                    const newLink = link.copyWithoutDependencies();
                    this.manageDependencies(link, newLink, unionNodes);

                    if (!newLink.isEnabled && Math.random() < 0.25) {
                        newLink.activate(true);
                    }
                    unionLinks.push(newLink);
                }
            }
        }

        // Innovations remain in the other genome
        // console.log('index other parent: ' + index);
        for (let i = index; i < adn.genome.connectGenes.length; i++) {
            const link = adn.genome.connectGenes[i];
            // console.log('excess links in the other parent: ' + link.innovation);

            if (isBest >= 0) {
                const newLink = link.copyWithoutDependencies();
                this.manageDependencies(link, newLink, unionNodes);

                if (!newLink.isEnabled && Math.random() < 0.25) {
                    newLink.activate(true);
                }
                unionLinks.push(newLink);
            }
        }

        // console.log('results links:');
        // console.log(unionLinks);

        // console.log('results nodes:');
        // console.log(unionNodes);

        if (unionLinks.length === 0) {
            // if no links gets only the input, output and bias nodes
            const structuralNodes = this.genome.nodeGenes.filter((n: NodeGene) => n.nodeType !== NodeType.Hidden);
            for (const node of structuralNodes) {
                unionNodes.push(node.copyWithoutDependencies());
            }
        }

        result.g.nodeGenes = unionNodes;
        result.g.connectGenes = unionLinks;
        return result;
    }

    public mutate(): RTADN {
        const result = new RTADN(this.minimum, this.maximum, this.rates);
        const newGenome = this.g.copy();

        let pct = this.maximum * 0.5;
        if (pct === 0) {
            pct = 0.01;
        }

        for (const link of newGenome.connectGenes) {
            if (this.mutationRate !== 0  && Math.random() <= this.mutationRate) {
                link.weight = link.weight + MyMath.random(-pct, pct);
                link.weight = Math.max(link.weight, 8);
                link.weight = Math.min(link.weight, -8);
            }

            if (this.mutationActivationRate !== 0 && Math.random() <= this.mutationActivationRate) {
                link.activate(!link.isEnabled);
            }
        }

        if (this.mutationConnectRate !== 0 && Math.random() <= this.mutationConnectRate) {
            console.log('Add a connection');

            const nodeIn = RTADN.selectInNode(newGenome.nodeGenes);
            const nodeOut = RTADN.selectOutNode(nodeIn, newGenome.nodeGenes);

            if (nodeOut) {
                if (nodeOut.layer <= nodeIn.layer) {
                    // recurrent connection detected
                    if (this.mutationAllowRecurrentRate !== 0
                        && Math.random() <= this.mutationAllowRecurrentRate) {
                        // percentage where a recurrent link is acceptable

                        // Check previously existing innovation to set the correct innovation number
                        const sameExistingInnovation = Genome.historic.find(nodeIn.identifier, ModificationType.Add, nodeOut.identifier);
                        const innovationId = sameExistingInnovation === null ? -1 : sameExistingInnovation.innovationId;
                        newGenome.addConnection(nodeIn, nodeOut, innovationId);
                    } else {
                        // prevent the recurrent by flipping the connection

                        // Check previously existing innovation to set the correct innovation number
                        const sameExistingInnovation = Genome.historic.find(nodeOut.identifier, ModificationType.Add, nodeIn.identifier);
                        const innovationId = sameExistingInnovation === null ? -1 : sameExistingInnovation.innovationId;
                        newGenome.addConnection(nodeOut, nodeIn, innovationId);
                    }
                } else {
                    // add a forward connection
                    // Check previously existing innovation to set the correct innovation number
                    const sameExistingInnovation = Genome.historic.find(nodeIn.identifier, ModificationType.Add, nodeOut.identifier);
                    const innovationId = sameExistingInnovation === null ? -1 : sameExistingInnovation.innovationId;
                    newGenome.addConnection(nodeIn, nodeOut, innovationId);
                }
            }
            // else could happen if output node is selected first without hidden nodes available
        }

        if (this.mutationSplitConnectRate !== 0 && Math.random() <= this.mutationSplitConnectRate) {
            // TODO : check previously existing innovation to set the correct innovation number

            const link = RTADN.selectEnabledLink(newGenome.connectGenes);

            const sameExistingInnovation = Genome.historic.find(link.inputNode.identifier,
                                                ModificationType.Split, link.outputNode.identifier);
            const innovationId = sameExistingInnovation === null ? -1 : sameExistingInnovation.innovationId;
            const nodeId  = sameExistingInnovation === null ? -1 : sameExistingInnovation.newNodeId;

            console.log('split connection: ' + link.innovation + ', ' + innovationId + ', ' + nodeId);
            newGenome.splitConnection(link, innovationId, nodeId);
        }

        result.g = newGenome;
        return result;
    }

    public get rates(): RTADNRates {
        return {
            mutation: this.mutationRate,
            crossOver: this.crossOverRate,
            mutationActivation: this.mutationActivationRate,
            mutationConnect: this.mutationConnectRate,
            mutationAllowRecurrent: this.mutationAllowRecurrentRate,
            mutationSplitConnect: this.mutationSplitConnectRate
        };
    }

    // TODO: replace by a more effective search algorithm
    private searchByLayer(node: NodeGene, nodes: NodeGene[]): NodeGene {
        let found = null;

        for (const n of nodes) {
            // The node is already present
            if (n.identifier === node.identifier) {
                found = n;
                break;
            }

            // The node will not be present
            if (node.layer < n.layer) {
                break;
            }
        }

        return found;
    }

    /**
     * Report the existing dependencies described in the old link into the new link
     * If the nodes have been already copied register to it otherwise create a new copy and register
     * @param oldLink existing link used as reference
     * @param newLink new link that will be used in the future
     * @param unionNodes already copied nodes to avoid duplicates
     */
    private manageDependencies(oldLink, newLink, unionNodes) {

        let foundNode = this.searchByLayer(oldLink.outputNode, unionNodes);
        if (foundNode === null) {
            const newNode = oldLink.outputNode.copyWithoutDependencies();
            newNode.inputs.push(newLink);
            newLink.inputNode = newNode;

            unionNodes.push(newNode); // TODO: replace by a better sort / insert algorithm
            unionNodes.sort((n1: NodeGene, n2: NodeGene) => {
                if (n1.layer < n2.layer) {
                    return -1;
                } else if (n1.layer > n2.layer) {
                    return 1;
                } else {
                    if (n1.identifier < n2.identifier) {
                        return -1;
                    } else if (n1.identifier > n2.identifier) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

        } else {
            foundNode.inputs.push(newLink);
        }

        foundNode = this.searchByLayer(oldLink.inputNode, unionNodes);
        if (foundNode === null) {
            const newNode = oldLink.inputNode.copyWithoutDependencies();
            newNode.outputs.push(newLink);
            newLink.outputNode = newNode;

            unionNodes.push(newNode); // TODO: replace by a better sort / insert algorithm
            unionNodes.sort((n1: NodeGene, n2: NodeGene) => {
                if (n1.layer < n2.layer) {
                    return -1;
                } else if (n1.layer > n2.layer) {
                    return 1;
                } else {
                    if (n1.identifier < n2.identifier) {
                        return -1;
                    } else if (n1.identifier > n2.identifier) {
                        return 1;
                    } else {
                        return 0;
                    }

                }
            });
        } else {
            foundNode.outputs.push(newLink);
        }
    }
}
