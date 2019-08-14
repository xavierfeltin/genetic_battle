import { RTADN, RTADNRates } from './adn';
import { Species } from './species';
import * as Common from './genotype/common-spec';
import { Specie } from './specie';

beforeEach(() => {
    // Reset static variable before each test
    RTADN.rtADNId = -1;
    Specie.specieNumber = 0;
});

describe('Species', () => {
    describe('constructor', () => {
        it('creates an empty species object', () => {
            const species = new Species(3);
            expect(species.species.length).toBe(0);
            expect(species.compatibilityThresold).toBe(3);
        });
    });
    describe('addOrganism', () => {
        it('creates a first specie when empty', () => {
            const organism = new RTADN(-1, 1, Common.getBasicRates());
            const species = new Species(3);

            species.addOrganism(organism);
            expect(species.species.length).toBe(1);
            expect(species.species[0].nbOrganisms).toBe(1);
            expect(species.species[0].organisms[0].id).toBe(0);
        });

        it('creates a single specie for two close organisms', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateDirectGenome(false);
            organism1.genome = g1;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates());
            const g2 = Common.generateDirectGenome(false);
            organism2.genome = g2;

            const species = new Species(3);

            species.addOrganism(organism1);
            species.addOrganism(organism2);

            expect(species.species.length).toBe(1);
            expect(species.species[0].nbOrganisms).toBe(2);
            expect(species.species[0].organisms[0].id).toBe(0);
            expect(species.species[0].organisms[1].id).toBe(1);
        });

        it('creates two species for two distant organisms', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateComplexGenome();
            organism1.genome = g1;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates());
            const g2 = Common.generateDirectGenome(false);
            organism2.genome = g2;

            const species = new Species(3);

            species.addOrganism(organism1);
            species.addOrganism(organism2);

            expect(species.species.length).toBe(2);
            expect(species.species[0].nbOrganisms).toBe(1);
            expect(species.species[0].organisms[0].id).toBe(0);

            expect(species.species[1].nbOrganisms).toBe(1);
            expect(species.species[1].organisms[0].id).toBe(1);
        });

        it('affects the specie to a new specie even if it is empty and non compatible with reference', () => {
            const organism1 = new RTADN(-1, 1, Common.getBasicRates());
            const g1 = Common.generateComplexGenome();
            organism1.genome = g1;

            const organism2 = new RTADN(-1, 1, Common.getBasicRates());
            const g2 = Common.generateDirectGenome(false);
            organism2.genome = g2;

            const species = new Species(3);
            species.addOrganism(organism1);
            species.addOrganism(organism2);

            species.clearSpecies();
            species.addOrganism(organism2);

            expect(species.species.length).toBe(2);
            expect(species.species[0].nbOrganisms).toBe(0);

            expect(species.species[1].nbOrganisms).toBe(1);
            expect(species.species[1].organisms[0].id).toBe(1);
        });
    });
    describe('adjustCompatibilityThresold', () => {
        it('increments the compatibility thresold with more than TARGET_NUM species', () => {
            const species = new Species(3);
            for (let i = 0; i < (Species.TARGET_NUM_SPECIES + 1); i++) {
                species.species.push(new Specie());
            }

            expect(species.compatibilityThresold).toBe(3);
            species.adjustCompatibilityThresold();
            expect(species.compatibilityThresold).toBe(3 + Species.COMPATIBILITY_MODIFICATOR);
        });

        it('decrements the compatibility thresold with less than TARGET_NUM species', () => {
            const species = new Species(3);
            for (let i = 0; i < (Species.TARGET_NUM_SPECIES - 1); i++) {
                species.species.push(new Specie());
            }

            expect(species.compatibilityThresold).toBe(3);
            species.adjustCompatibilityThresold();
            expect(species.compatibilityThresold).toBe(3 - Species.COMPATIBILITY_MODIFICATOR);
        });

        it('keeps the compatibility thresold as such with TARGET_NUM species', () => {
            const species = new Species(3);
            for (let i = 0; i < Species.TARGET_NUM_SPECIES; i++) {
                species.species.push(new Specie());
            }

            expect(species.compatibilityThresold).toBe(3);
            species.adjustCompatibilityThresold();
            expect(species.compatibilityThresold).toBe(3);
        });
    });
});
