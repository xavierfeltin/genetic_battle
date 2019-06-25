export class Game {
    private readonly MAX_SCORE: number = 10;
    private scores: number [];
    private hasStarted: boolean;
    private isOver: boolean;

    constructor(nbPlayers: number) {
        this.scores = Array<number>(nbPlayers);
        for (let i = 0; i < nbPlayers; i++) {
            this.scores[i] = 0;
        }

        this.hasStarted = false;
        this.isOver = true;
    }

    public start() {
        this.hasStarted = true;
        this.isOver = false;
    }

    public getHasStarted(): boolean {
        return this.hasStarted;
    }

    public incrementScore(idPlayer: number) {
        this.scores[idPlayer]++;
    }

    public terminate(){
        this.isOver = true;
        this.hasStarted = false;
    }

    public reset() {
        for (let i = 0; i < this.scores.length; i++) {
            this.scores[i] = 0;
        }

        this.hasStarted = false;
        this.isOver = false;

        this.hasStarted = false;
        this.isOver = false;
    }

    public isGameOver(): boolean {
        return this.isOver;
    }

    public getScores(): number[] {
        return this.scores;
    }

    public getScore(idPlayer: number): number {
        return this.scores[idPlayer];
    }
}