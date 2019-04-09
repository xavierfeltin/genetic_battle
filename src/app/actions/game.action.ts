export class NextTurn {
    static readonly type = '[TURN] Next Turn';
    constructor() {}
}

export class ProcessBot {
    static readonly type = '[TURN] Process Bot';
    constructor(public id: number) {}
}

export class StartGame {
    static readonly type = '[TURN] Start Game';
    constructor() {}
}