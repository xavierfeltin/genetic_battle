import { ADN } from './adn';

export interface Individual {
    fitness?: number;
    stdFitness?: number; // standardized for computing proba
    proba?: number;
    adn: ADN;
    id?: number;
}

export class GeneticAlgorithm {
    public population: Individual[];
    public refPopulation: Individual[];
    protected best: Individual;

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

    public pickOne(population: Individual[]): Individual {
        return null;
    }

    public populate(individuals: Individual[], withBest = false) {
        if (withBest && this.best !== null) {
            this.population = [...individuals, this.best];
        } else {
            this.population = [...individuals];
        }
    }

    public populateReference(individuals: Individual[]) {
        this.refPopulation = [...individuals];
    }

    public getPopulation(): Individual[] {
        return this.population;
    }

    public getBest(): Individual {
        return this.best;
    }

    public updateBest() {
        for (const popInd of this.population) {
            if (this.best === null || this.best.fitness < popInd.fitness) {
                this.best = popInd;
            }
        }
    }

    public integrateBestToPopulation() {
        if (this.best !== null) {
            const tmp = this.population.find((value: Individual, index: number, allShips: Individual[]) => {
                return value.id === this.best.id;
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
        for (const popInd of this.population) {
            const childADN = popInd.adn.mutate();
            const ind: Individual = {
                adn: childADN
            };
            newPopulation.push(ind);
        }
        this.population = newPopulation;
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
            const parentA = this.pickOne(this.population);
            const parentB = this.pickOne(this.population);
            let childADN = parentA.adn.crossOver(parentB.adn);
            childADN = childADN.mutate();

            const ind: Individual = {
                adn: childADN
            };
            newPopulation.push(ind);
        }

        this.population = newPopulation;
    }

    public evolveFromReference() {

        if (this.population.length === 0 || this.refPopulation.length === 0) {
            return;
        }

        const newPopulation = [];
        this.refPopulation.sort((a: Individual, b: Individual): number => {
            if (a.fitness < b.fitness) {
                return 1;
            } else if (a.fitness === b.fitness) {
                return 0;
            } else {
                return -1;
            }
        });

        const scoreAvg = (this.refPopulation[0].fitness + this.refPopulation[this.refPopulation.length - 1].fitness) / 2;
        this.refPopulation.push(this.best);
        this.computeProbas();

        for (const popInd of this.population) {
            let childADN: ADN = null;

            if (this.best === null ||  this.best.fitness < popInd.fitness ) {
                this.best = popInd;
                this.computeProbas();
            }

            if (scoreAvg < popInd.fitness) {
                childADN = popInd.adn;
            } else {
                const parentA = popInd;
                const parentB = this.pickOne(this.refPopulation);
                childADN = (parentA.fitness > parentB.fitness) ? parentA.adn.crossOver(parentB.adn) : parentB.adn.crossOver(parentA.adn);
            }

            childADN = childADN.mutate();
            const ind: Individual = {
                adn: childADN
            };
            newPopulation.push(ind);
        }

        this.population = newPopulation;
    }

    public pickOne(population: Individual[]): Individual {
        if (population.length === 0) {
            return null;
        }

        const rand = Math.random();
        let i = 0;
        while (i < population.length && population[i].proba < rand) {
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
            pop.stdFitness = 0;
            if (pop.fitness < minValue) {
                minValue = pop.fitness;
            }
        }

        let sumFit = 0;
        for (const pop of this.population) {
            if (minValue <= 0) {
                pop.stdFitness = pop.fitness + minValue + 1; // start at 1 to avoid null share
            }
            sumFit += (pop.stdFitness * pop.stdFitness);
        }

        let previousProba = 0;
        for (const pop of this.population) {
            const relativeFitness = (pop.stdFitness * pop.stdFitness) / sumFit;
            pop.proba = previousProba + relativeFitness;
            previousProba = pop.proba;
        }

        // Round last probability to 1
        // this.population[this.population.length - 1].proba += (1 - this.population[this.population.length - 1].proba);
        this.population[this.population.length - 1].proba = 1;
    }
}
