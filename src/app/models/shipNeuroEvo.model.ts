export class ShipNeurEvo {
    public static readonly DEFAULT_INPUT_CONFIGURATION: {} = ShipNeurEvo.generateDefaultNeuroEvoInputs();

    private inputs: {};

    constructor() {
        this.inputs = {...ShipNeurEvo.DEFAULT_INPUT_CONFIGURATION};
    }

    public static generateDefaultNeuroEvoInputs(): {} {
        const inputs = {
            inputFlagDetectedMissileFOV: {
                description: 'FOV has detected missile',
                status: false
            },
            inputFlagDetectedShipFOV: {
                description: 'FOV has detected ship',
                status: false
            },
            inputFlagDetectedHealthFOV: {
                description: 'FOV has detected health',
                status: false
            },
            inputFlagDetectedMissileRadar: {
                description: 'Radar has detected missile',
                status: false
            },
            inputFlagDetectedHealthRadar: {
                description: 'Radar has detected health',
                status: false
            },
            inputFlagDetectedShipRadar: {
                description: 'Radar has detected ship',
                status: false
            },
            inputDistanceDetectedMissileFOV: {
                description: 'Distance missile on FOV',
                status: true
            },
            inputDistanceDetectedShipFOV: {
                description: 'Distance ship on FOV',
                status: true
            },
            inputDistanceDetectedHealthFOV: {
                description: 'Distance health on FOV',
                status: true
            },
            inputDistanceDetectedMissileRadar: {
                description: 'Distance missile on Radar',
                status: true
            },
            inputDistanceDetectedHealthRadar: {
                description: 'Distance health on Radar',
                status: true
            },
            inputDistanceDetectedShipRadar: {
                description: 'Distance ship on Radar',
                status: true
            },
            inputAngleWithDetectedMissileFOV: {
                description: 'Angle with missile on FOV',
                status: true
            },
            inputAngleWithDetectedShipFOV: {
                description: 'Angle with ship on FOV',
                status: true
            },
            inputAngleWithDetectedHealthFOV: {
                description: 'Angle with health on FOV',
                status: true
            },
            inputAngleWithDetectedMissileRadar: {
                description: 'Angle with missile on Radar',
                status: true
            },
            inputAngleWithDetectedHealthRadar: {
                description: 'Angle with health on Radar',
                status: true
            },
            inputAngleWithDetectedShipRadar: {
                description: 'Angle with ship on Radar',
                status: true
            },
            inputAttractionMissile: {
                description: 'Attraction to missiles',
                status: false
            },
            inputAttractionShip: {
                description: 'Attraction to ships',
                status: false
            },
            inputAttractionHealth: {
                description: 'Attraction to health',
                status: false
            },
            inputFOVAngle: {
                description: 'FOV angle',
                status: true
            },
            inputRadarRadius: {
                description: 'Radiar radius',
                status: true
            },
            inputFireRate: {
                description: 'Fire rate',
                status: false
            },
            inputLife: {
                description: 'Remaining life',
                status: true
            },
            inputMaxSpeed: {
                description: 'Top ship speed',
                status: false
            },
            inputFlagHasFired: {
                description: 'Has fired',
                status: true
            },
            inputFlagHasBeenHealed: {
                description: 'Has been healed',
                status: true
            },
            inputFlagHasBeenShot: {
                description: 'Has been shot',
                status: true
            },
            inputFlagTouchedEnnemy: {
                description: 'Has touched ennemy',
                status: true
            },
            inputFlagTouchedMissile: {
                description: 'Has touched missile',
                status: true
            },
            inputVelocityX: {
                description: 'Ship X velocity',
                status: false
            },
            inputVelocityY: {
                description: 'Ship Y velocity',
                status: false
            },
            inputPositionX: {
                description: 'Ship X position',
                status: true
            },
            inputPositionY: {
                description: 'Ship Y position',
                status: true
            }
        };
        return inputs;
    }

    public copy(): ShipNeurEvo {
        const conf = new ShipNeurEvo() ;
        const activeInputs = this.getActiveInputNames();
        for (const name in activeInputs) {
            conf.activateInput(name, true);
        }
        return conf;
    }

    public getInputs(): {} {
        return this.inputs;
    }

    public getActiveInputNames(): symbol[] {
        const inputs = [];
        for (const key in this.inputs) {
            if (this.inputs[key].status) {
                inputs.push(key);
            }
        }
        return inputs;
    }

    public activateInput(inputName: string, isActivated: boolean) {
        if (this.inputs.hasOwnProperty(inputName)) {
            this.inputs[inputName].status = isActivated;
        }
    }
}
