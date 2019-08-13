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
            } else if (currentSpecie.isCompatible(organism)) {
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

    public clear() {
        this.species = [];
        this.compatThresold = 0;
    }

    public adjustcompatThresold() {
        if (this.species.length < Species.TARGET_NUM_SPECIES) {
            this.compatThresold -= Species.COMPATIBILITY_MODIFICATOR;
        } else if (this.species.length > Species.TARGET_NUM_SPECIES) {
            this.compatThresold += Species.COMPATIBILITY_MODIFICATOR;
        }

        if (this.compatThresold < Species.MIN_COMPATIBILITY_THRESOLD) {
            this.compatThresold = Species.MIN_COMPATIBILITY_THRESOLD;
        }
    }
}
