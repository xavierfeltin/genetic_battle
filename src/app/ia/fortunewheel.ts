import { GeneticAlgorithm } from './ga';
import { ADN, Meta } from './adn';

export class FortuneWheelGA extends GeneticAlgorithm {
    private pop: ADN[];
    private worst: ADN;
    // public refPopulation: ADN[];
    // protected best: ADN;

    constructor() {
        super();
        this.pop = [];
        this.worst = null
        // this.refPopulation = [];
        // this.best = null;
    }

    public populate(pop: ADN[]) {
        this.pop = pop;
    }

    public get population(): ADN[] {
        return this.pop;
    }

    public get worstIndividual(): ADN {
        return this.worst;
    }

    public evolve(nbIndividuals: number): ADN[] {
        const newPopulation = [];

        this.pop.sort((a: ADN, b: ADN): number => {
            if (a.metadata.fitness < b.metadata.fitness) {
                return 1;
            } else if (a.metadata.fitness === b.metadata.fitness) {
                return 0;
            } else {
                return -1;
            }
        });

        this.computeProbas();
        const nbChildren = nbIndividuals;
        for (let i = 0; i < nbChildren; i++) {
            const parentA = this.pickOne(this.pop);
            const parentB = this.pickOne(this.pop);
            const childADN = parentA.crossOver(parentB);
            childADN.mutate();
            newPopulation.push(childADN);
        }

        return newPopulation;
    }

    public setWorstOrganism() {
        const sortedPop = this.pop.sort((a: ADN, b: ADN) => {
            if (a.metadata.fitness < b.metadata.fitness) {
                return -1;
            } else if (a.metadata.fitness > b.metadata.fitness) {
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

    private pickOne(population: ADN[]): ADN {
        if (population.length === 0) {
            return null;
        }

        const rand = Math.random();
        let i = 0;
        while (i < population.length && population[i].metadata.proba < rand) {
            i += 1;
        }

        if (i === population.length) {
            i = i - 1;
        }
        return population[i];
    }

    private computeProbas() {
        let minValue = Infinity;
        for (const pop of this.pop) {
            pop.metadata.stdFitness = 0;
            if (pop.metadata.fitness < minValue) {
                minValue = pop.metadata.fitness;
            }
        }

        let sumFit = 0;
        for (const pop of this.pop) {
            const stdFitness = minValue <= 0 ?
                pop.metadata.fitness + (minValue * -1) + 1 // start at 1 to avoid null share
                : pop.metadata.fitness;
            pop.metadata.stdFitness = stdFitness * stdFitness;
            sumFit += pop.metadata.stdFitness;
        }

        let previousProba = 0;
        for (const pop of this.pop) {
            const relativeFitness = pop.metadata.stdFitness / sumFit;
            pop.metadata.proba = previousProba + relativeFitness;
            previousProba = pop.metadata.proba;
        }

        // Round last probability to 1
        // this.pop[this.pop.length - 1].proba += (1 - this.pop[this.pop.length - 1].proba);
        this.pop[this.pop.length - 1].metadata.proba = 1;
    }
}
