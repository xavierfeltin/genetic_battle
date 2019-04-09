export interface GameAction {
    moveAction: number;
    fireAction: number;
    changeFov: number;
}

export abstract class IBot {
    private id: number;

    constructor(identifier: number) {
        this.id = identifier;
    }

    public  getId(): number { return this.id; }
    public abstract getAction(): GameAction;
}