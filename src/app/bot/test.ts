import { IBot, GameAction } from './bot';

export class TestBot extends IBot {
    
    constructor(identifier: number) {
        super(identifier);
    }

    public getAction(): GameAction {
        let rand: number = Math.random();
        let moveAction: number;
        if(rand < 0.25) {moveAction = 0;}
        else if(rand < 0.6) {moveAction = 1;}
        else {moveAction = 2;}
        
        rand = Math.random();
        let fireAction: number;
        if(rand < 0.80) {fireAction = 0;}
        else {fireAction = 1;}

        rand = Math.random();
        let fovAction: number;
        if(rand < 0.33) {fovAction = 0;}
        else if(rand < 0.66) {fovAction = 1;}
        else {fovAction = 2;}

        return {
            moveAction: moveAction,
            fireAction: fireAction,
            changeFov: fovAction
        };
    }
}