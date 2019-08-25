import { GeneticAlgorithm } from './ga';
import { ADN } from './adn';

export class FortuneWheelGA extends GeneticAlgorithm {
    public pop: ADN[];
    // public refPopulation: ADN[];
    // protected best: ADN;

    constructor() {
        super();
        this.pop = [];
        // this.refPopulation = [];
        // this.best = null;
    }

    public populate(pop: ADN[]) {
        this.pop = pop;
    }

    public get population(): ADN[] {
        return this.pop;
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

        const best = this.pop[0];
        newPopulation.push(best);

        this.computeProbas();
        const nbChildren = nbIndividuals;
        for (let i = 0; i < nbChildren; i++) {
            const parentA = this.pickOne(this.pop);
            const parentB = this.pickOne(this.pop);
            let childADN = parentA.crossOver(parentB);            
            childADN = childADN.mutate();
            newPopulation.push(childADN);
        }

        return newPopulation;
    }

    /*
    public basicEvolve() {
        const newPopulation = [];
        for (const popAdn of this.population) {
            const childADN = popAdn.mutate();
            newPopulation.push(childADN);
        }
        this.population = newPopulation;
    }

    public evolveFromReference() {
        if (this.population.length === 0 || this.refPopulation.length === 0) {
            return;
        }

        const newPopulation = [];
        this.refPopulation.sort((a: ADN, b: ADN): number => {
            if (a.metadata.fitness < b.metadata.fitness) {
                return 1;
            } else if (a.metadata.fitness === b.metadata.fitness) {
                return 0;
            } else {
                return -1;
            }
        });

        const scoreAvg = (this.refPopulation[0].metadata.fitness + this.refPopulation[this.refPopulation.length - 1].metadata.fitness) / 2;
        this.refPopulation.push(this.best);
        this.computeProbas();

        for (const popAdn of this.population) {
            let childADN: ADN = null;

            if (this.best === null ||  this.best.metadata.fitness < popAdn.metadata.fitness ) {
                this.best = popAdn;
                this.computeProbas();
            }

            if (scoreAvg < popAdn.metadata.fitness) {
                childADN = popAdn;
            } else {
                const parentA = popAdn;
                const parentB = this.pickOne(this.refPopulation);
                childADN = (parentA.metadata.fitness > parentB.metadata.fitness) ? parentA.crossOver(parentB) : parentB.crossOver(parentA);
            }

            childADN = childADN.mutate();
            newPopulation.push(childADN);
        }

        this.population = newPopulation;
    }
    */

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
            let stdFitness = minValue <= 0 ? 
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
