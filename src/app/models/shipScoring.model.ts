export class ShipScoring {
    public static readonly DEFAULT_SCORING_CONFIGURATION: {} = ShipScoring.generateDefaultScoringCoefficients();

    private coefficients: {};

    constructor() {
        this.coefficients = {};
        // tslint:disable-next-line:forin
        for (const name in ShipScoring.DEFAULT_SCORING_CONFIGURATION) {
            this.coefficients[name] = {};
            // tslint:disable-next-line:forin
            for (const prop in ShipScoring.DEFAULT_SCORING_CONFIGURATION[name]) {
                this.coefficients[name][prop] = ShipScoring.DEFAULT_SCORING_CONFIGURATION[name][prop];
            }
        }
    }

    public static generateDefaultScoringCoefficients(): {} {
        const coeffs = {
            scoringHealthPicked: {
                description: 'Nb health picked',
                value: 0
            },
            scoringEnnemiesTouched: {
                description: 'Ships touched',
                value: 0
            },
            scoringEnnemiesDestroyed: {
                description: 'Ships destroyed',
                value: 0
            },
            scoringMissilesDestroyed: {
                description: 'Missiles destroyed',
                value: 0
            },
            scoringMissilesLaunched: {
                description: 'Missiles launched',
                value: 0
            },
            scoringReceivedDamage: {
                description: 'Received damage',
                value: 0
            },
            scoringAccuracy: {
                description: 'Accuracy',
                value: 0
            },
            scoringLifespan: {
                description: 'Lifespan',
                value: 0
            },
            scoringHealthPickedAcc: {
                description: 'Health picked x Acc',
                value: 1
            },
            scoringEnnemiesTouchedAcc: {
                description: 'Ships touched x Acc',
                value: 0
            },
            scoringEnnemiesDestroyedAcc: {
                description: 'Ships destroyed x Acc',
                value: 0
            },
            scoringMissilesDestroyedAcc: {
                description: 'Missiles destroyed x Acc',
                value: 0
            },
            scoringMissilesLaunchedAcc: {
                description: 'Missiles launched x Acc',
                value: 0
            }
        };
        return coeffs;
    }

    public copy(): ShipScoring {
        const conf = new ShipScoring() ;
        const coeffs = this.getCoefficients();
        for (const name in coeffs) {
            conf.setCoefficient(name, coeffs[name]);
        }
        return conf;
    }

    public getCoefficients(): {} {
        const coeffs = {};
        // tslint:disable-next-line:forin
        for (const key in this.coefficients) {
            coeffs[key] = this.coefficients[key].value;
        }
        return coeffs;
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
        this.coefficients[coeffName].value = value;
    }
}
