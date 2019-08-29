import { Specie } from './specie';
import { RTADN } from './adn';

export class Species {
    public static readonly TARGET_NUM_SPECIES = 4;
    public static readonly MIN_COMPATIBILITY_THRESOLD = 2.0;
    public static readonly COMPATIBILITY_MODIFICATOR = 0.1;

    private pool: Specie[];
    private compatThresold: number;
    private initCompatThresold: number;

    constructor(compatibility: number = 0) {
        this.pool = [];
        this.compatThresold = compatibility;
        this.initCompatThresold = compatibility;
    }

    public get species(): Specie[] {
        return this.pool;
    }

    public get compatibilityThresold(): number {
        return this.compatThresold;
    }

    public get nbOrganisms(): number {
        let nbOrganisms = 0;
        for (const specie of this.species) {
            nbOrganisms += specie.nbOrganisms;
        }
        return nbOrganisms;
    }

    /**
     * Add an organism to the first specie compatible
     * or first empty specie
     * If none match, create a new specie
     * @param organism: organism to add in the species pool
     */
    public addOrganism(organism: RTADN) {
        if (this.pool.length === 0) {
            const specie = new Specie();
            this.pool.push(specie);
        }

        let found = false;
        let i = 0;
        while (!found && i < this.pool.length) {
            const currentSpecie = this.pool[i];

            if (currentSpecie.isCompatible(organism, this.compatThresold)) {
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
            this.pool.push(specie);
        }
    }

    public removeUnfitOrganisms() {
        for (const specie of this.pool) {
            specie.removeUnfitOrganisms();
        }
    }

    public calculateAdjustedFitness() {
        for (const specie of this.pool) {
            specie.calculateAdjustedFitness();
        }
    }

    public calculateAverageFitness() {
        for (const specie of this.pool) {
            specie.calculateAverageFitness();
        }
    }

    public clear() {
        this.pool = [];
        this.compatThresold = this.initCompatThresold;
        Specie.resetSpecieIds();
    }

    public clearSpecies(keepSpecies: boolean = true) {
        if (keepSpecies) {
            for (const specie of this.pool) {
                specie.clear();
            }
        } else {
            this.clear();
        }
    }

    public adjustCompatibilityThresold() {
        if (this.pool.length < Species.TARGET_NUM_SPECIES) {
            this.compatThresold -= Species.COMPATIBILITY_MODIFICATOR;
        } else if (this.pool.length > Species.TARGET_NUM_SPECIES) {
            this.compatThresold += Species.COMPATIBILITY_MODIFICATOR;
        }

        if (this.compatThresold < Species.MIN_COMPATIBILITY_THRESOLD) {
            this.compatThresold = Species.MIN_COMPATIBILITY_THRESOLD;
        }
    }

    public removeOrganismFromSpecies(organism: RTADN) {
        const index = this.pool.findIndex(s => s.id === organism.specie); //TODO check why specie id do not match index
        this.pool[index].removeOrganism(organism);
    }

    public selectRandomSpecie(): Specie {
        const probabilities = [];
        let currentProbability = 0;

        const nonEmptySpecies = this.pool.filter(s => s.nbOrganisms > 0); 
        for (const specie of nonEmptySpecies) {
            currentProbability += specie.averageFitness / this.pool.length;
            probabilities.push(currentProbability);
        }

        // round to 1 last property
        probabilities[probabilities.length - 1] = 1;
        const random = Math.random();
        let index = 0;
        for (const proba of probabilities) {
            if (proba < random) {
                index++;
            }
        }

        return nonEmptySpecies[index];
    }
}
