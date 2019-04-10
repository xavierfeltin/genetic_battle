import { GameObject } from './game-object.model';
import { GameAction } from '../bot/bot';

export class Ship extends GameObject {
    private fov: number; //in radians
    public static readonly TURN_LEFT: number = 0;
    public static readonly TURN_RIGHT: number = 1;
    public static readonly MOVE_FORWARD: number = 2;
    private readonly maxShipSpeed: number = 5;

    constructor(id: number) {
        super(id);
        this.speed = this.maxShipSpeed;
        this.radius = 20;
    }

    public getFOV(): number { return this.fov; }

    public setFOV(angle: number) {
        this.fov = angle;
    }

    public applyAction(action: GameAction) {
        switch(action.moveAction) {
            case Ship.TURN_LEFT: {
                this.turnLeft();
                break;
            }
            case Ship.TURN_RIGHT: {
                this.turnRight();
                break;
            }
            case Ship.MOVE_FORWARD: {
                this.goForward();
                break;
            }
        }
    }

    private turnLeft() {
        this.orientation -= 3;
        this.orientation = this.orientation % 360;
    }

    private turnRight() {
        this.orientation += 3;
        this.orientation = this.orientation % 360;
    }

    private goForward(){
        return;
    }
}