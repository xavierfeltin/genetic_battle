import { GameObject } from './game-object.model';
import { GameAction } from '../bot/bot';

export class Ship extends GameObject {
    public static readonly TURN_LEFT: number = 0;
    public static readonly TURN_RIGHT: number = 1;
    public static readonly MOVE_FORWARD: number = 2;

    public static readonly EXTEND_FOV: number = 0;
    public static readonly REDUCE_FOV: number = 1;
    public static readonly KEEP_FOV: number = 2;
    public static readonly MAX_LIFE: number = 100;
    public static readonly MAX_FOV: number = 120;
    public static readonly MIN_FOV: number = 10;
    
    private readonly MAX_SPEED: number = 5;
    private readonly FIRE_RATE: number = 15;
    

    private fov: number; //in radians
    private coolDown: number;
    private life: number;

    constructor(id: number) {
        super(id);
        this.speed = this.MAX_SPEED;
        this.radius = 20;
        this.coolDown = 0;
        this.life = Ship.MAX_LIFE;
    }

    public getFOV(): number { return this.fov; }

    public setFOV(angle: number) {
        this.fov = angle;
    }

    public changeFOV(action: number) {

    }

    public canFire() {
        return this.coolDown === 0;
    }

    public reduceCoolDown() {
        this.coolDown = this.canFire() ? 0 : this.coolDown - 1; 
    }

    public fire(): boolean {
        if (this.canFire()) {
            this.coolDown = this.FIRE_RATE;
            return true;
        }
        else {
            return false;
        }
    }

    public getLife(): number {
        return this.life;
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

        switch(action.changeFov) {
            case Ship.EXTEND_FOV: {
                this.improveFOV();
                break;
            }
            case Ship.REDUCE_FOV: {
                this.reduceFOV();
                break;
            }
            case Ship.KEEP_FOV: {
                this.keepFOV();
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

    private improveFOV() {
        this.fov = Math.min(this.fov + 1, Ship.MAX_FOV);
    }

    private reduceFOV() {
        this.fov = Math.max(this.fov - 1, Ship.MIN_FOV);
    }

    private keepFOV(){
        return;
    }
}