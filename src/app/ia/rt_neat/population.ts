import { RTADN } from './adn';
import { Species } from './species';
import { Specie } from './specie';

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
        const keepSpecies = false;
        this.affectOrganismsToSpecies(keepSpecies);
    }

    /**
     * Generate a new organism and remove the worst organism
     * If no worst organism is found, return null
     */
    public evolve(): RTADN {
        const worst = this.findWorstOrganism(); 
        if (worst !== null) {
            this.species.calculateAdjustedFitness();
            this.species.removeOrganismFromSpecies(worst); // remove worst organism and update avg fitness of specie
            const parentSpecie = this.selectParent();
            const newOrganism = parentSpecie.generateOrganism();
            this.pop.push(newOrganism);
            this.species.adjustCompatibilityThresold();
            this.affectOrganismsToSpecies();
            return newOrganism;
        } else {
            return null;
        }        
    }

    /**
     * dispatch the population into different species based on their distance
     * with the referent organism of each existing specie
     */
    private affectOrganismsToSpecies(keepSpecies: boolean = true) {
        this.species.clearSpecies(keepSpecies);
        for (const organism of this.pop) {
            this.species.addOrganism(organism);
        }
    }

    private findWorstOrganism(): RTADN {
        const sortedPop = this.pop.sort((a: RTADN, b: RTADN) => {
            if(a.adjustedFitness < b.adjustedFitness) {
                return -1;
            } else if (a.adjustedFitness > b.adjustedFitness) {
                return 1;
            } else {
                return 0;
            }
        });

        let worst = null;
        for (const pop of sortedPop) {
            if (pop.age >= RTADN.MINIMUM_AGE_TO_EVOLVE) {
                worst = pop;
                break;
            }
        }
        
        return worst;
    }

    private selectParent(): Specie {
        return this.species.selectRandomSpecie();
    }
}
