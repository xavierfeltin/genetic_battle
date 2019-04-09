export class SetShip {
    static readonly type = '[CONFIGURATION] Set Ship';
    constructor(public id: number, public xInit: number, public yInit: number, public orientInit: number, public fovInit: number) {}
}

export class TurnLeft {
    static readonly type = '[Move] Turn Left';
    constructor(public id: number) {}
}

export class TurnRight {
    static readonly type = '[Move] Turn Right';
    constructor(public id: number) {}
}

export class MoveForward {
    static readonly type = '[Move] Move Forward';
    constructor(public id: number) {}
}

export class Fire {
    static readonly type = '[Move] Fire';
    constructor(public id: number) {}
}

export class ChangeFOV {
    static readonly type = '[Move] Change FOV';
    constructor(public id: number, public newFOV: number) {}
}