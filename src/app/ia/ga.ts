import { ADN } from './adn';

/*
export interface Individual {
    fitness?: number;
    stdFitness?: number; // standardized for computing proba
    proba?: number;
    adn: ADN;
    id?: number;
}
*/

export class GeneticAlgorithm {
    public population: ADN[];
    public refPopulation: ADN[];
    protected best: ADN;

    constructor() {
        this.population = [];
        this.refPopulation = [];
        this.best = null;
    }

    public evolve() {
        return;
    }

    public evolveFromReference() {
        return;
    }

    public pickOne(population: ADN[]): ADN {
        return null;
    }

    public populate(individuals: ADN[], withBest = false) {
        if (withBest && this.best !== null) {
            this.population = [...individuals, this.best];
        } else {
            this.population = [...individuals];
        }
    }

    public populateReference(individuals: ADN[]) {
        this.refPopulation = [...individuals];
    }

    public getPopulation(): ADN[] {
        return this.population;
    }

    public getBest(): ADN {
        return this.best;
    }

    public updateBest() {
        for (const popInd of this.population) {
            if (this.best === null || this.best.metadata.fitness < popInd.metadata.fitness) {
                this.best = popInd;
            }
        }
    }

    public integrateBestToPopulation() {
        if (this.best !== null) {
            const tmp = this.population.find((value: ADN, index: number, allShips: ADN[]) => {
                return value.metadata.id === this.best.metadata.id;
            });

            if (!tmp) {
                this.population.push(this.best);
            }
        }
    }
}

export class FortuneWheelGA extends GeneticAlgorithm {
    constructor() {
        super();
    }

    public basicEvolve() {
        const newPopulation = [];
        for (const popAdn of this.population) {
            const childADN = popAdn.mutate();
            newPopulation.push(childADN);
        }
        this.population = newPopulation;
    }

    public evolve() {
        const newPopulation = [];

        this.population.sort((a: ADN, b: ADN): number => {
            if (a.metadata.fitness < b.metadata.fitness) {
                return 1;
            } else if (a.metadata.fitness === b.metadata.fitness) {
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
            const parentA = this.pickOne(this.population);
            const parentB = this.pickOne(this.population);
            let childADN = parentA.crossOver(parentB);
            childADN = childADN.mutate();
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

    public pickOne(population: ADN[]): ADN {
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

    public computeProbas() {
        let minValue = Infinity;
        for (const pop of this.population) {
            pop.metadata.stdFitness = 0;
            if (pop.metadata.fitness < minValue) {
                minValue = pop.metadata.fitness;
            }
        }

        let sumFit = 0;
        for (const pop of this.population) {
            if (minValue <= 0) {
                pop.metadata.stdFitness = pop.metadata.fitness + minValue + 1; // start at 1 to avoid null share
            }
            // sumFit += (pop.stdFitness * pop.stdFitness);
            sumFit += pop.metadata.stdFitness;
        }

        let previousProba = 0;
        for (const pop of this.population) {
            const relativeFitness = (pop.metadata.stdFitness * pop.metadata.stdFitness) / sumFit;
            pop.metadata.proba = previousProba + relativeFitness;
            previousProba = pop.metadata.proba;
        }

        // Round last probability to 1
        // this.population[this.population.length - 1].proba += (1 - this.population[this.population.length - 1].proba);
        this.population[this.population.length - 1].metadata.proba = 1;
    }
}
