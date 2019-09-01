import { RTADN } from './adn';
import { Species } from './species';
import { Specie } from './specie';
import { GeneticAlgorithm } from '../ga';
import { Meta } from '../adn';

export class RTADNGA extends GeneticAlgorithm {
    private pop: RTADN[];
    private poolSpecies: Species;
    private worst: RTADN;

    constructor() {
        super();
        this.pop = [];
        this.poolSpecies = new Species(Species.MIN_COMPATIBILITY_THRESOLD);
        this.worst = null;
    }

    public populate(pop: RTADN[]) {
        this.pop = pop;
        const keepSpecies = false; // restart species each evaluation
        this.affectOrganismsToSpecies(keepSpecies);
    }

    public get population(): RTADN[] {
        return this.pop;
    }

    public get species(): Species {
        return this.poolSpecies;
    }

    public get worstIndividual(): RTADN {
        return this.worst;
    }

    /**
     * Generate a new organism and remove the worst organism
     * If no worst organism is found, return null
     * Always return 1 individual
     */
    public evolve(nbIndividuals: number): RTADN[] {
        this.setWorstOrganism();
        if (this.worst !== null) {
            this.poolSpecies.calculateAdjustedFitness();
            this.poolSpecies.removeOrganismFromSpecies(this.worst); // remove worst organism and update avg fitness of specie
            this.pop = this.pop.filter(organism => organism.id !== this.worst.id);

            const parentSpecie = this.selectParent();
            if (parentSpecie.nbOrganisms !== 0) {
                parentSpecie.computeProbas();
                const parents = parentSpecie.pickParents();
                const newOrganism = parentSpecie.generateOrganism(parents[0], parents[1]);
                newOrganism.metadata.parentA = parents[0].id;
                newOrganism.metadata.parentA = parents[1].id;
                newOrganism.metadata.generation = parents[0].metadata.generation + 1;

                this.pop.push(newOrganism);
                this.poolSpecies.adjustCompatibilityThresold();
                this.affectOrganismsToSpecies();
                return [newOrganism];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * dispatch the population into different species based on their distance
     * with the referent organism of each existing specie
     */
    private affectOrganismsToSpecies(keepSpecies: boolean = true) {
        this.poolSpecies.clearSpecies(keepSpecies);
        for (const organism of this.pop) {
            this.poolSpecies.addOrganism(organism);
        }
    }

    // TODO : rework the part with age (use metadata.age ? not sure ...)
    public setWorstOrganism() {
        const sortedPop = this.pop.sort((a: RTADN, b: RTADN) => {
            if (a.adjustedFitness < b.adjustedFitness) {
                return -1;
            } else if (a.adjustedFitness > b.adjustedFitness) {
                return 1;
            } else {
                return 0;
            }
        });

        this.worst = null;
        for (const pop of sortedPop) {
            if (pop.metadata.individualAge >= Meta.MINIMUM_AGE_TO_EVOLVE) {
                this.worst = pop;
                break;
            }
        }
    }

    /**
     * Return the organism if found in the population, null otherwise
     * @param id id of the organism to find in the population
     */
    public findOrganism(id: number): RTADN {
        const found1 = this.pop.find(organism => organism.id === id);
        return found1 ? found1 : null;
    }

    /**
     * Return true if all the organisms are present in the population
     * and the species.
     */
    public isConsistent(): boolean {

        const nbSpeciesOrganisms = this.species.nbOrganisms;
        if (this.pop.length !== nbSpeciesOrganisms) {
            console.error('Population with ' + this.pop.length
                + ' organisms and species with ' + nbSpeciesOrganisms + ' organisms do not match');
            return false;
        }

        for (const organism of this.pop) {
            let found = null;
            let i = 0;
            while (!found && i < this.poolSpecies.species.length) {
                const specie = this.poolSpecies.species[i];
                found = specie.findOrganism(organism.id);
                i++;
            }

            if (!found) {
                console.error('organism ' + organism.id + 'was not found in the species');
                return false;
            }
        }

        return true;
    }

    private selectParent(): Specie {
        return this.poolSpecies.selectRandomSpecie();
    }
}
