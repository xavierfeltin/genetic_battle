import { RTADN } from './adn';
import * as Common from './genotype/common-spec';
import { Specie } from './specie';
import { RTADNGA } from './population';

beforeEach(() => {
    // Reset static variable before each test
    RTADN.rtADNId = -1;
    Specie.specieNumber = 0;
});


describe('Population', () => {
    describe('constructor', () => {
        it('creates an empty population', () => {
            const pop = new RTADNGA();
            expect(pop.species.species.length).toBe(0);
            expect(pop.population.length).toBe(0);
        });
    });
    describe('set population', () => {
        it('affects and dispatches organisms to species', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateComplexGenome());
            const organism2 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateDirectGenome(false));

            const organisms = [organism1, organism2];
            const ga = new RTADNGA();
            ga.populate(organisms);

            expect(ga.population.length).toBe(2);
            expect(ga.species.species.length).toBe(2);
            expect(ga.species.species[0].nbOrganisms).toBe(1);
            expect(ga.species.species[0].organisms[0].id).toBe(0);

            expect(ga.species.species[1].nbOrganisms).toBe(1);
            expect(ga.species.species[1].organisms[0].id).toBe(1);
        });
    });
    describe('findWorstOrganism', () => {
        it('outputs null if no organism has been set in the population', () => {
            const pop = new RTADNGA();
            const worst = pop.findWorstOrganism();
            expect(worst).toBeNull();
        });
        it('outputs null when no organism set in the population is at minimum age to be picked', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateComplexGenome());
            const organisms = [organism1];

            const ga = new RTADNGA();
            ga.populate(organisms);

            const worst = ga.findWorstOrganism();
            expect(worst).toBeNull();
        });
        it('outputs the only organism set in the population with required minimum age to be picked', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateComplexGenome());
            organism1.metadata.age = 0;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateDirectGenome(false));
            organism2.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;

            const organisms = [organism1, organism2];

            const ga = new RTADNGA();
            ga.populate(organisms);

            const worst = ga.findWorstOrganism();
            expect(worst.id).toBe(organism2.id);
        });
        it('outputs the organism with the smallest adjusted fitness score in the population', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateComplexGenome());
            organism1.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism1.metadata.adjustedFitness = 5;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateDirectGenome(false));
            organism2.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism2.metadata.adjustedFitness = 6;

            const organism3 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateDirectGenome(false));
            organism3.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism3.metadata.adjustedFitness = 2;

            const organisms = [organism1, organism2, organism3];

            const ga = new RTADNGA();
            ga.populate(organisms);

            const worst = ga.findWorstOrganism();
            expect(worst.id).toBe(organism3.id);
            expect(worst.specie).toBe(ga.species.species[1].id);
        });
    });
    describe('evovle', () => {
        it('outputs null if no organism is in age to be evoluted', () => {
            const pop = new RTADNGA();
            const newOrganism = pop.evolve(1);
            expect(newOrganism).toBeNull();
        });
        it('outputs a new organism and update species pool', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateComplexGenome());
            organism1.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism1.metadata.adjustedFitness = 5;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateDirectGenome(false));
            organism2.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism2.metadata.adjustedFitness = 6;

            const organism3 = new RTADN(-1, 1, Common.getBasicRates(), Common.generateDirectGenome(false));
            organism3.metadata.age = RTADN.MINIMUM_AGE_TO_EVOLVE;
            organism3.metadata.adjustedFitness = 2;

            const organisms = [organism1, organism2, organism3];

            const ga = new RTADNGA();
            ga.populate(organisms);

            const worst = ga.findWorstOrganism();
            const beforEvolveLength = ga.species.species.length;
            const newOrganism = ga.evolve(1)[0];
            const foundNewOrganism = ga.findOrganism(newOrganism.id);

            expect(ga.species.species.length).toBe(beforEvolveLength);
            expect(foundNewOrganism.id).toBe(newOrganism.id);
            expect(newOrganism.specie).not.toBe(-1);
            expect(ga.findOrganism(worst.id)).toBeNull();
            expect(ga.isConsistent()).toBeTruthy();
        });
    });
});
