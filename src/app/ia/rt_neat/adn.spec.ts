import { NodeGene, NodeType } from './genotype/node';
import { ConnectGene } from './genotype/connect';
import { Genome } from './genotype/genome';
import { RTADN, Rates } from './adn';

beforeEach(() => {
    // Reset static variable before each test
    Genome.innovationNumber = 0;
    Genome.nodeNumber = 0;
});

afterEach(() => {});

describe('RTAdn', () => {
    describe('constructor', () => {
        it('outputs an adn with the correct attributes', () => {
            const rates: Rates = {
                mutation: 0.01,
                crossOver: 0.01,
                mutationActivation: 0.01,
                mutationConnect: 0.01,
                mutationAllowRecurrent: 0.01,
                mutationSplitConnect: 0.01
                
            }
            const adn = new RTADN(-1, 1, rates);
            const adnRates = adn.rates;

            expect(adn.genome).not.toBeNull();
            expect(adnRates.mutation).toBe(0.01);
            expect(adnRates.crossOver).toBe(0.01);
            expect(adnRates.mutationActivation).toBe(0.01);
            expect(adnRates.mutationAllowRecurrent).toBe(0.01);
            expect(adnRates.mutationConnect).toBe(0.01);
            expect(adnRates.mutationSplitConnect).toBe(0.01);
        });
    });
});