import { RTADN } from './adn';
import { Species } from './species';

export class Population {
    private pop: RTADN[];
    private species: Species;

    constructor() {
        this.pop = [];
        this.species = new Species();
    }

    public get population(): RTADN[] {
        return this.pop;
    }

    public set population(pop: RTADN[]) {
        this.pop = pop;

        this.species.clear();
        this.affectOrganismsToSpecies();
    }

    public evolve(): RTADN {
        this.species.calculateAdjustedFitness();

        this.removeWorstOrganism();
        for (const specie of this.species) {
            specie.estimateAvgFitness();
        }
        const parentSpecie = this.selectParent();
        const newOrganism = parentSpecie.generateOrganism();
        this.pop.push(newOrganism);
        this.species.adjustDeltaT();
        this.affectOrganismsToSpecies();
        return newOrganism;
    }

    /**
     * dispatch the population into different species based on their distance
     * with the referent organism of each existing specie
     */
    private affectOrganismsToSpecies() {
        for (const organism of this.pop) {
            this.species.addOrganism(organism);
        }
    }
}
