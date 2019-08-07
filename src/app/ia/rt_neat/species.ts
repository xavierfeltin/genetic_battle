import { Specie } from "./specie";
import { RTADN } from "./adn";

export class Species {

    private species: Specie[];
    
    constructor() {
        this.species = [];
    }

    /**
     * Add an organism to the first specie compatible 
     * or first empty specie
     * If none match, create a new specie
     * @param organism
     */
    public addOrganism(organism: RTADN) {
        if(this.species.length === 0) {
            const specie = new Specie();
            this.species.push(specie);
        }

        let found = false;
        let i = 0;
        while(!found && i < this.species.length) {
            const currentSpecie = this.species[i];

            if (currentSpecie.nbOrganisms === 0) {
                currentSpecie.addOrganism(organism);
                found = true;
            } else if (currentSpecie.isCompatible(organism)) {
                currentSpecie.addOrganism(organism);
                found = true;
            }
            else {
                i++;
            }
        }

        // Create a new specie if none existing specie matched
        if (!found) {
            const specie = new Specie();
            specie.addOrganism(organism);
            this.species.push(specie);            
        }
    }
}