export interface Point {
    data: number;
    timer?: number;
    stamp: string;
}

export class Stat {
    public static getClasses(min: number, max: number, nbClasses: number, accuracy: number): string[] {
        const classes = [];
        const range = Math.abs(max - min);
        const step = Math.round((range / nbClasses) * (1 / accuracy)) * accuracy;
        const precision = Math.abs(Math.log10(accuracy));
        let minimum = min;
        for (let i = 0; i < nbClasses; i ++) {
            const maximum = (i === nbClasses - 1) ? max : minimum + step;
            const newClass = minimum.toFixed(precision) + ' - ' + maximum.toFixed(precision);
            classes.push(newClass);
            minimum += step;
        }

        return classes;
    }

    public static countByClasses(data: number[], min: number, max: number, nbClasses: number, accuracy: number): number[] {
        const range = Math.abs(max - min);
        const step = Math.round((range / nbClasses) * (1 / accuracy)) * accuracy;
        const classes = [];
        for (let i = 0; i < nbClasses ; i++) {
            classes.push(0);
        }

        // translate negative numbers to a positive range, min becoming 0
        let delta = 0;
        if (min < 0) {
            delta = -min;
        }

        const deltaMinValue = Math.floor((min + delta) / step);

        for (const d of data) {
            let index = Math.floor((d + delta) / step) - deltaMinValue;
            // ex: for 10 classes, highest value 2.0, 2.0 / 0.4 = 10 but needs to be included to index 9, not a new class
            index = Math.min(index, nbClasses-1); 
            classes[index]++;
        }

        for (let i = 0 ; i < classes.length; i++) {
            classes[i] = Math.round((classes[i] / data.length) * 100);
        }

        return classes;
    }
}
