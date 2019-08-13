import { Specie } from './specie';
import { RTADN } from './adn';

export class Species {
    private static readonly TARGET_NUM_SPECIES = 4;
    private static readonly MIN_COMPATIBILITY_THRESOLD = 0.3;
    private static readonly COMPATIBILITY_MODIFICATOR = 0.1;

    private species: Specie[];
    private compatThresold: number;

    constructor() {
        this.species = [];
        this.compatThresold = 0;
    }

    /**
     * Add an organism to the first specie compatible
     * or first empty specie
     * If none match, create a new specie
     * @param organism: organism to add in the species pool
     */
    public addOrganism(organism: RTADN) {
        if (this.species.length === 0) {
            const specie = new Specie();
            this.species.push(specie);
        }

        let found = false;
        let i = 0;
        while (!found && i < this.species.length) {
            const currentSpecie = this.species[i];

            if (currentSpecie.nbOrganisms === 0) {
                currentSpecie.addOrganism(organism);
                found = true;
            } else if (currentSpecie.isCompatible(organism, this.compatThresold)) {
                currentSpecie.addOrganism(organism);
                found = true;
            } else {
                i++;
            }
        }

        // Create a new specie if none existing specie matched
        if (!found) {
            const specie = new Specie();
            specie.addOrganism(organism);
            this.species.push(specie);
        }
    }

    public removeUnfitOrganisms() {
        for (const specie of this.species) {
            specie.removeUnfitOrganisms();
        }
    }

    public calculateAdjustedFitness() {
        for (const specie of this.species) {
            specie.calculateAdjustedFitness();
        }
    }

    public calculateAverageFitness() {
        for (const specie of this.species) {
            specie.calculateAverageFitness();
        }
    }

    public clear() {
        this.species = [];
        this.compatThresold = 0;
    }

    public clearSpecies(keepSpecies: boolean = true) {
        if (keepSpecies) {
            for (const specie of this.species) {
                specie.clear();
            }
        } else {
            this.clear();
        }
    }

    public adjustCompatibilityThresold() {
        if (this.species.length < Species.TARGET_NUM_SPECIES) {
            this.compatThresold -= Species.COMPATIBILITY_MODIFICATOR;
        } else if (this.species.length > Species.TARGET_NUM_SPECIES) {
            this.compatThresold += Species.COMPATIBILITY_MODIFICATOR;
        }

        if (this.compatThresold < Species.MIN_COMPATIBILITY_THRESOLD) {
            this.compatThresold = Species.MIN_COMPATIBILITY_THRESOLD;
        }
    }

    public removeOrganismFromSpecies(organism: RTADN) {
        this.species[organism.specie].removeOrganism(organism);
    }

    public selectRandomSpecie(): Specie {
        const probabilities = [];
        let currentProbability = 0;
        for (const specie of this.species) {
            currentProbability += specie.averageFitness / this.species.length; 
            probabilities.push(currentProbability);
        }

        // round to 1 last property
        probabilities[probabilities.length -1] = 1;
        const random = Math.random();
        let index = 0;
        for (const proba of probabilities) {
            if (proba < random) {
                index++;
            }
        }

        return this.species[index];
    }
}
