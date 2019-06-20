export class ShipScoring {
    public static readonly DEFAULT_SCORING_CONFIGURATION: {} = ShipScoring.generateDefaultScoringCoefficients();

    private coefficients: {};

    constructor() {
        this.coefficients = {...ShipScoring.DEFAULT_SCORING_CONFIGURATION};
    }

    public static generateDefaultScoringCoefficients(): {} {
        const coeffs = {
            nbHealthPicked: {
                description: 'Nb health picked',
                value: 1
            },
            nbEnnemiesTouched: {
                description: 'Ships touched',
                value: 0
            },
            nbEnnemiesDestroyed: {
                description: 'Ships destroyed',
                value: 0
            },
            nbMissilesDestroyed: {
                description: 'Missiles destroyed',
                value: 0
            },
            nbMissilesLaunched: {
                description: 'Missiles launched',
                value: 0
            },
            nbReceivedDamage: {
                description: 'Received damage',
                value: 0
            },
            accuracy: {
                description: 'Accuracy',
                value: 0
            },
            lifespan: {
                description: 'Lifespan',
                value: 0
            },
            nbEnnemiesTouchedAcc: {
                description: 'Ships touched x Acc',
                value: 0
            },
            nbEnnemiesDestroyedAcc: {
                description: 'Ships destroyed x Acc',
                value: 0
            },
            nbMissilesDestroyedAcc: {
                description: 'Missiles destroyed x Acc',
                value: 0
            },
            nbMissilesLaunchedAcc: {
                description: 'Missiles launched x Acc',
                value: 0
            }
        };
        return coeffs;
    }

    public getCoefficients(): {} {
        return this.coefficients;
    }

    public getCoefficientNames(): symbol[] {
        const coeffs = [];
        // tslint:disable-next-line:forin
        for (const key in this.coefficients) {
            coeffs.push(key);
        }
        return coeffs;
    }

    public setCoefficient(coeffName: string, value: number) {
        if (this.coefficients.hasOwnProperty(coeffName)) {
            this.coefficients[coeffName].value = value;
        }
    }
}
