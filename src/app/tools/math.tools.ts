export class MyMath {
    public static random(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    public static map(val: number, minOrig: number, maxOrig: number, minDest: number, maxDest: number): number {
        let slope = (maxDest - minDest) / (maxOrig - minOrig);
        const mapped = minDest + slope * ( val - minOrig);
        return mapped;
    }
}