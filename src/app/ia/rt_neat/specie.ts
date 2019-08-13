import { RTADN } from './adn';

export class Specie {
    public static specieNumber = 0;

    private id: number;
    private organisms: RTADN[];
    private reference: RTADN;
    private avgFitness: number;

    constructor(id: number = -1) {
        this.id = id;
        if (id === -1) {
            this.id = Specie.nextSpecieNumber;
            Specie.incrementSpecieNumber();
        }

        this.organisms = [];
        this.avgFitness = 0;
    }

    public static get nextSpecieNumber(): number {
        return Specie.specieNumber;
    }

    public static incrementSpecieNumber() {
        Specie.specieNumber++;
    }

    public clear(keepReference: boolean = true) {
        this.organisms = [];
        this.avgFitness = 0;
        if (!keepReference) {
            this.reference = null;
        }
    }

    public addOrganism(organism: RTADN) {
        if (this.organisms.length === 0) {
            this.reference = organism;
        }
        this.organisms.push(organism);
        this.avgFitness = ((this.avgFitness * (this.organisms.length - 1)) + organism.fitness) / this.organisms.length;
    }

    public isCompatible(organism: RTADN, compatibilityThresold: number) {
        const distance = this.reference.distance(organism);
        return distance < compatibilityThresold;
    }

    public removeUnfitOrganisms() {
        this.organisms = this.organisms.filter(organism => !organism.isToRemove);
        this.calculateAverageFitness();
    }

    public get nbOrganisms(): number {
        return this.organisms.length;
    }

    /**
     * Adjust the fitness to the number of organisms in the specie
     */
    public calculateAdjustedFitness() {
        for (const organism of this.organisms) {
            organism.adjustedFitness = organism.fitness / this.nbOrganisms;
        }
    }

    public calculateAverageFitness() {
        this.avgFitness = 0;
        for (const organism of this.organisms) {
            this.avgFitness += organism.fitness;
        }
        this.avgFitness /= this.organisms.length;
    }

    public removeOrganism(organism: RTADN) {
        this.organisms = this.organisms.filter(o => o.id != organism.id);
        this.avgFitness = ((this.avgFitness * (this.organisms.length + 1)) - organism.fitness) / this.organisms.length;
    }

    public get averageFitness(): number {
        return this.avgFitness;
    }

    public generateOrganism(): RTADN {
        const probabilities = [];
        let currentProbability = 0;
        for (const organism of this.organisms) {
            currentProbability += organism.adjustedFitness; 
            probabilities.push(currentProbability);
        }

        // round to 1 last property
        probabilities[probabilities.length -1] = 1;
        let random1 = Math.random();
        let random2 = Math.random();
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

        const parent1 = this.organisms[index1];
        const parent2 = this.organisms[index2];
        const newOrganism = parent1.crossOver(parent2);
        newOrganism.mutate();
        return newOrganism;
    }
}
