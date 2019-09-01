import { ADN } from './adn';

export abstract class GeneticAlgorithm {

    public abstract populate(pop: ADN[]): void;
    public abstract evolve(nbIndividuals: number): ADN[];
    public abstract get population(): ADN[];
    public abstract get worstIndividual(): ADN;
}
