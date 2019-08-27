import { ADN } from './adn';

export abstract class GeneticAlgorithm {

    public abstract populate(pop: ADN[]): void;
    public abstract evolve(nbIndividuals: number): ADN[];
    public abstract get population(): ADN[];

    /*
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
    */
}
