import { SmallADN, HugeADN, ADN, Rates } from './adn';
import { RTADN } from './rt_neat/adn';
import { Genome } from './rt_neat/genotype/genome';

export class FactoryADN {
    public static readonly TYPE_SMALL_ADN = 0;
    public static readonly TYPE_HUGE_ADN = 1;
    public static readonly TYPE_RT_ADN = 2;

    private rates: Rates;
    private adnType: number;

    public constructor(rates: Rates = ADN.DEFAULT_RATES, adnType: number = FactoryADN.TYPE_HUGE_ADN) {
        this.rates = rates;
        this.adnType = adnType;
    }

    public getMutationRate(): number {
        return this.rates.mutation;
    }

    public setMutationRate(rate: number) {
        this.rates.mutation = rate;
    }

    public getCrossOverRate(): number {
        return this.rates.crossOver;
    }

    public setCrossOverRate(rate: number) {
        this.rates.crossOver = rate;
    }

    public setADNType(type: number) {
        this.adnType = type;
    }

    public getADNType(): number {
        return this.adnType;
    }

    public isSmallAdn(): boolean {
        return this.adnType === FactoryADN.TYPE_SMALL_ADN;
    }

    public isHugeAdn(): boolean {
        return this.adnType === FactoryADN.TYPE_HUGE_ADN;
    }

    public isRTAdn(): boolean {
        return this.adnType === FactoryADN.TYPE_RT_ADN;
    }

    public create(nbGenes: number, min: number, max: number, nbInputs: number, nbOutputs: number): ADN {
        switch (this.adnType) {
            case FactoryADN.TYPE_SMALL_ADN:
                return new SmallADN(nbGenes, min, max, this.rates);
            case FactoryADN.TYPE_HUGE_ADN:
                return new HugeADN(nbGenes, min, max, this.rates);
            case FactoryADN.TYPE_RT_ADN:
                const genomeTemplate = Genome.generate(nbInputs, nbOutputs);
                return new RTADN(min, max, this.rates, genomeTemplate);
            default:
                return new HugeADN(nbGenes, min, max, this.rates);
        }
    }
}
