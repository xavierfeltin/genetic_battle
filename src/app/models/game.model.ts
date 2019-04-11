export class Game {
    public scores: number [];
    public hasStarted: boolean;
    
    private readonly MAX_SCORE: number = 10;

    constructor() {
        this.scores = [0, 0];
        this.hasStarted = true; //Todo set to false later
    }

    public start() {
        this.scores = [0, 0];
        this.hasStarted = true; //Todo set to false later
    }

    public setScore(delta: number[]) {
        for(let i = 0; i < this.scores.length; i++) {
            this.scores[i] + delta[i];
        }
    }

    public isOver() {
        for(const score of this.scores) {
            if (score >= this.MAX_SCORE) {
                return true;
            }
        }
        return false;
    }
} 