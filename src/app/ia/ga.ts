export interface Individual {
    fitness: number;
    proba: number;
    dna: number[];

    crossOver(parent: Individual): Individual;
    mutate(): void;
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
}

export class FortuneWheelGA extends GeneticAlgorithm {
    constructor() {
        super();
    }

    public evolve() {
        this.computeProbas();
        
        let newPopulation = Array<Individual>();
        while (newPopulation.length < this.population.length) {
            let parentA = this.pickOne();
            let parentB = this.pickOne();
            let child = parentA.crossOver(parentB);
            child.mutate();
            newPopulation.push(child);
        }

        this.population = newPopulation;
    }

    public pickOne(): Individual {
        if (this.population.length === 0) {
            return null;
        }

        let rand = Math.floor(Math.random() * this.population.length);
        let i = 0;
        while (rand < this.population[i].proba && i < this.population.length) {
            i += 1;
        }

        return this.population[i];
    }

    private computeProbas() {
        let sumFit = 0;
        for (let i = 0; i < this.population.length; i++) {
            sumFit += this.population[i].fitness;
        }

        let previousProba = 0;
        for (let i = 0; i < this.population.length; i++) {
            let relativeFitness = this.population[i].fitness / sumFit;
            this.population[i].proba = previousProba + relativeFitness;
            previousProba = this.population[i].proba;  
        }

        // Round last probability to 1
        this.population[this.population.length-1].proba += (1 - this.population[this.population.length-1].proba);
    }    
}