export class MyMath {
    public static random(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    public static map(val: number, minOrig: number, maxOrig: number, minDest: number, maxDest: number): number {
        const slope = (maxDest - minDest) / (maxOrig - minOrig);
        const mapped = minDest + slope * ( val - minOrig);
        return mapped;
    }

    public static formatTime(elapsedTime, nbGeneration: number = -1): string {
        const sec = elapsedTime % 60;
        const mn = Math.floor(elapsedTime / 60) % 60;
        const hh = Math.floor(elapsedTime / 3600);
        let elaspedTime = hh.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
        + ' : ' + mn.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
        + ' : ' + sec.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

        if (nbGeneration !== -1) {
          elaspedTime += ' - generation: ' + nbGeneration;
        }

        return elaspedTime;
    }
}