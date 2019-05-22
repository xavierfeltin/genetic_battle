import { ADN } from './adn';

export interface Individual {
    fitness?: number;
    proba?: number;
    adn: ADN;
}

export class GeneticAlgorithm {
    public population: Individual[];

    constructor() {
        this.population = [];
    }

    public evolve() {
        return;
    }

    public pickOne(): Individual {
        return null;
    }

    public populate(individuals: Individual[]) {
        this.population = individuals;
    }

    public getPopulation(): Individual[] {
        return this.population;
    }
}

export class FortuneWheelGA extends GeneticAlgorithm {
    constructor() {
        super();
    }

    public evolve() {
        const newPopulation = [];
        this.population.sort((a: Individual, b: Individual): number => {
            if (a.fitness < b.fitness) {
                return 1;
            } else if (a.fitness === b.fitness) {
                return 0;
            } else {
                return -1;
            }
        });
        const best = this.population[0];
        newPopulation.push(best);

        this.computeProbas();
        const nbChildren = this.population.length - 1;
        for (let i = 0; i < nbChildren; i++) {
            const parentA = this.pickOne();
            const parentB = this.pickOne();
            const childADN = parentA.adn.crossOver(parentB.adn);
            childADN.mutate();

            const ind: Individual = {
                adn: childADN
            };
            newPopulation.push(ind);
        }

        this.population = newPopulation;
    }

    public pickOne(): Individual {
        if (this.population.length === 0) {
            return null;
        }

        const rand = Math.random();
        let i = 0;
        while (i < this.population.length && rand < this.population[i].proba) {
            i += 1;
        }

        if (i === this.population.length) {
            i = i - 1;
        }
        return this.population[i];
    }

    private computeProbas() {
        let minValue = Infinity;
        for (const pop of this.population) {
            if (pop.fitness < minValue) {
                minValue = pop.fitness;
            }
        }

        let sumFit = 0;
        for (const pop of this.population) {
            if (minValue <= 0) {
                pop.fitness += minValue + 1; // start at 1 to avoid null share
            }
            sumFit += pop.fitness;
        }

        let previousProba = 0;
        for (const pop of this.population) {
            const relativeFitness = pop.fitness / sumFit;
            pop.proba = previousProba + relativeFitness;
            previousProba = pop.proba;
        }

        // Round last probability to 1
        // this.population[this.population.length - 1].proba += (1 - this.population[this.population.length - 1].proba);
        this.population[this.population.length - 1].proba = 1;
    }
}
