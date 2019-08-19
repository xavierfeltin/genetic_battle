import { RTADN, RTADNRates } from './adn';
import { Species } from './species';
import * as Common from './genotype/common-spec';
import { Specie } from './specie';
import { Population } from './population';

beforeEach(() => {
    // Reset static variable before each test
    RTADN.rtADNId = -1;
    Specie.specieNumber = 0;
});


describe('Population', () => {
    describe('constructor', () => {
        it('creates an empty population', () => {
            const pop = new Population();
            expect(pop.species.species.length).toBe(0);
            expect(pop.population.length).toBe(0);
        });
    });
    describe('set population', () => {
        it('affects and dispatches organisms to species', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateComplexGenome();
            organism1.genome = g1;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates());
            const g2 = Common.generateDirectGenome(false);
            organism2.genome = g2;

            const organisms = [organism1, organism2];
            const pop = new Population();
            pop.population = organisms;

            expect(pop.population.length).toBe(2);
            expect(pop.species.species.length).toBe(2);
            expect(pop.species.species[0].nbOrganisms).toBe(1);
            expect(pop.species.species[0].organisms[0].id).toBe(0);

            expect(pop.species.species[1].nbOrganisms).toBe(1);
            expect(pop.species.species[1].organisms[0].id).toBe(1);
        });
    });
    describe('findWorstOrganism', () => {
        it('outputs null if no organism has been set in the population', () => {
            const pop = new Population();
            const worst = pop.findWorstOrganism();
            expect(worst).toBeNull();
        });
        it('outputs null when no organism set in the population is at minimum age to be picked', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateComplexGenome();
            organism1.genome = g1;
            const organisms = [organism1];

            const pop = new Population();
            pop.population = organisms;

            const worst = pop.findWorstOrganism();
            expect(worst).toBeNull();
        });
        it('outputs the only organism set in the population with required minimum age to be picked', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateComplexGenome();
            organism1.genome = g1;
            organism1.metadata.age = 0;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates());
            const g2 = Common.generateDirectGenome(false);
            organism2.genome = g2;
            organism2.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;

            const organisms = [organism1, organism2];

            const pop = new Population();
            pop.population = organisms;

            const worst = pop.findWorstOrganism();
            expect(worst.id).toBe(organism2.id);
        });
        it('outputs the organism with the smallest adjusted fitness score in the population', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateComplexGenome();
            organism1.genome = g1;
            organism1.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism1.metadata.adjustedFitness = 5;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates());
            const g2 = Common.generateDirectGenome(false);
            organism2.genome = g2;
            organism2.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism2.metadata.adjustedFitness = 6;

            const organism3 = new RTADN(-1, 1, Common.getBasicRates());
            const g3 = Common.generateDirectGenome(false);
            organism3.genome = g3;
            organism3.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism3.metadata.adjustedFitness = 2;

            const organisms = [organism1, organism2, organism3];

            const pop = new Population();
            pop.population = organisms;

            const worst = pop.findWorstOrganism();
            expect(worst.id).toBe(organism3.id);
            expect(worst.specie).toBe(pop.species.species[1].id);
        });
    });
    describe('evovle', () => {
        it('outputs null if no organism is in age to be evoluted', () => {
            const pop = new Population();
            const newOrganism = pop.evolve();
            expect(newOrganism).toBeNull();
        });
    });
});
