import { IBot, GameAction } from './bot';

export class TestBot extends IBot {

    constructor(identifier: number) {
        super(identifier);
    }

    public getAction(): GameAction {
        let rand: number = Math.random();
        let move: number;
        if(rand < 0.25) {move = 0;}
        else if (rand < 0.6) {move = 1;}
        else {move = 2;}

        rand = Math.random();
        let fire: number;
        if(rand < 0) {fire = 0;}
        else {fire = 1;}

        rand = Math.random();
        let fovAction: number;
        if (rand < 0.4) {fovAction = 0;}
        else if (rand < 0.6) {fovAction = 1;}
        else {fovAction = 2;}

        return {
            moveAction: move, //move,
            fireAction: this.getId() === 0 ? fire : fire, //fire,
            changeFov: fovAction
        };
    }
}