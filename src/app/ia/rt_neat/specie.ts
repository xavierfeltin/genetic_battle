import { RTADN } from './adn';

export class Specie {
    public static specieNumber = 0;

    private specieId: number;
    private pool: RTADN[];
    private reference: RTADN;
    private avgFitness: number;

    constructor(id: number = -1) {
        this.specieId = id;
        if (id === -1) {
            this.specieId = Specie.nextSpecieNumber;
            Specie.incrementSpecieNumber();
        }

        this.pool = [];
        this.avgFitness = 0;
        this.reference = null;
    }

    public static get nextSpecieNumber(): number {
        return Specie.specieNumber;
    }

    public static incrementSpecieNumber() {
        Specie.specieNumber++;
    }

    public static resetSpecieIds() {
        Specie.specieNumber = 0;
    }

    public get id(): number {
        return this.specieId;
    }

    public get organisms(): RTADN[] {
        return this.pool;
    }

    public clear(keepReference: boolean = true) {
        this.pool = [];
        this.avgFitness = 0;
        if (!keepReference) {
            this.reference = null;
        }
    }

    public findOrganism(id: number): RTADN {
        for (const organism of this.pool) {
            if (organism.id === id) {
                return organism;
            }
        }
        return null;
    }

    public addOrganism(organism: RTADN) {
        if (this.pool.length === 0) {
            this.reference = organism;
        }
        this.pool.push(organism);
        this.avgFitness = ((this.avgFitness * (this.pool.length - 1)) + organism.fitness) / this.pool.length;
        organism.specie = this.id;
    }

    public isCompatible(organism: RTADN, compatibilityThresold: number) {
        if (this.reference === null) {
            return true;
        } else {
            const distance = this.reference.distance(organism);
            return distance < compatibilityThresold;
        }
    }

    public removeUnfitOrganisms() {
        this.pool = this.pool.filter(organism => !organism.isToRemove);
        this.calculateAverageFitness();
    }

    public get nbOrganisms(): number {
        return this.pool.length;
    }

    /**
     * Adjust the fitness to the number of organisms in the specie
     */
    public calculateAdjustedFitness() {
        for (const organism of this.pool) {
            organism.adjustedFitness = this.nbOrganisms === 0 ? organism.fitness : (organism.fitness / this.nbOrganisms);
        }
    }

    public calculateAverageFitness() {
        this.avgFitness = 0;
        if ( this.pool.length > 0) {
            for (const organism of this.pool) {
                this.avgFitness += organism.fitness;
            }
            this.avgFitness = (this.avgFitness / this.pool.length);
        }
    }

    public removeOrganism(organism: RTADN) {
        this.pool = this.pool.filter(o => o.id !== organism.id);
        this.avgFitness = ((this.avgFitness * (this.pool.length + 1)) - organism.fitness) / this.pool.length;
    }

    public get averageFitness(): number {
        return this.avgFitness;
    }

    public computeProbas() {
        let minValue = Infinity;
        for (const pop of this.pool) {
            pop.metadata.stdFitness = 0;
            if (pop.metadata.adjustedFitness < minValue) {
                minValue = pop.metadata.adjustedFitness;
            }
        }

        let sumFit = 0;
        for (const pop of this.pool) {
            const stdFitness = minValue <= 0 ?
                pop.metadata.adjustedFitness + (minValue * -1) + 1 // start at 1 to avoid null share
                : pop.metadata.adjustedFitness;
            pop.metadata.stdFitness = stdFitness * stdFitness;
            sumFit += pop.metadata.stdFitness;
        }

        let previousProba = 0;
        for (const pop of this.pool) {
            const relativeFitness = pop.metadata.stdFitness / sumFit;
            pop.metadata.proba = previousProba + relativeFitness;
            previousProba = pop.metadata.proba;
        }

        // Round last probability to 1
        this.pool[this.pool.length - 1].metadata.proba = 1;
    }

    public pickParents(): RTADN[] {
        if (this.pool.length === 0) {
            return null;
        }

        let rand = Math.random();
        let i = 0;
        while (i < this.pool.length && this.pool[i].metadata.proba < rand) {
            i += 1;
        }

        if (i === this.pool.length) {
            i = i - 1;
        }
        const parent1 = this.pool[i];

        rand = Math.random();
        i = 0;
        while (i < this.pool.length && this.pool[i].metadata.proba < rand) {
            i += 1;
        }

        if (i === this.pool.length) {
            i = i - 1;
        }
        const parent2 = this.pool[i];

        return [parent1, parent2];
    }

    public generateOrganism(parentA: RTADN, parentB: RTADN): RTADN {
        /*
        const probabilities = [];
        let currentProbability = 0;
        for (const organism of this.pool) {
            currentProbability += organism.adjustedFitness;
            probabilities.push(currentProbability);
        }

        // round to 1 last property
        probabilities[probabilities.length - 1] = 1;
        const random1 = Math.random();
        const random2 = Math.random();
        let index1 = 0;
        let index2 = 0;
        for (const proba of probabilities) {
            if (proba < random1) {
                index1++;
            }

            if (proba < random2) {
                index2++;
            }
        }

        const parent1 = this.pool[index1];
        const parent2 = this.pool[index2];
        */
        const newOrganism = parentA.crossOver(parentB);
        newOrganism.mutate();
        return newOrganism;
    }
}
