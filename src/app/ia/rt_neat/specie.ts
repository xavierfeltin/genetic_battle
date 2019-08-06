import { RTADN } from './adn';

export class Specie {
    public static specieNumber = 0;

    private id: number;
    private organisms: RTADN[];
    private reference: RTADN;

    constructor(id: number) {
        this.id = id;
        this.organisms = [];
    }

    public static get nextSpecieNumber(): number {
        return Specie.specieNumber;
    }

    public static incrementSpecieNumber() {
        Specie.specieNumber++;
    }

    public addOrganism(organism: RTADN) {
        if (this.organisms.length === 0) {
            this.reference = organism;
        }
        this.organisms.push(organism);
    }

    public isCompatible(organism: RTADN) {
        const distance = this.reference.distance(organism);
    }
}
