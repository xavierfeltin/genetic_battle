export interface Point {
    data: number;
    stamp: string;
}

export class Stat {
    public static getClasses(min: number, max: number, nbClasses: number, accuracy: number): string[] {
        let classes = [];
        const range = max - min;
        const step = Math.round((range / nbClasses) * (1/accuracy)) * accuracy;
        
        let minimum = min;
        for (let i = 0; i < nbClasses; i ++) {
            const maximum = (i === nbClasses -1) ? max : minimum + step;
            const newClass = minimum.toString() + ' - ' + maximum.toString();
            classes.push(newClass);
            minimum += step;
        }

        return classes;
    }

    public static countByClasses(data: number[], min: number, max: number, nbClasses: number, accuracy: number): number[] {
        const range = max - min;
        const step = Math.round((range / nbClasses) * (1/accuracy)) * accuracy;
        const classes = Array<number>(nbClasses);
        for (let i = 0; i < nbClasses ; i++) {
            classes[i] = 0;
        }

        for(const d of data) {
            const index = Math.round(d / step);
            classes[index]++;
        }

        return classes;
    }
}