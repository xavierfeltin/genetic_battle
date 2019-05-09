export interface Point {
    data: number;
    stamp: string;
}

export class Stat {
    public static getClasses(min: number, max: number, nbClasses: number, accuracy: number): string[] {
        const classes = [];
        const range = Math.abs(max - min);
        const step = Math.round((range / nbClasses) * (1 / accuracy)) * accuracy;
        const precision = Math.abs(Math.log10(accuracy));
        console.log(precision);
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
        const classes = Array<number>(nbClasses);
        for (let i = 0; i < nbClasses ; i++) {
            classes[i] = 0;
        }

        // translate negative numbers to a positive range, min becoming 0
        let delta = 0;
        if (min < 0) {
            delta = -min;
        }

        for (const d of data) {
            const index = Math.floor((d + delta) / step);
            classes[index]++;
        }

        return classes;
    }
}
