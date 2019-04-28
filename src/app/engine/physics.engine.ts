import { GameObject } from "../models/game-object.model";
import { Vect2D } from "../models/vect2D.model";

export class PhysicsEngine {
    
    public static getVeloFromAngle(angle: number, speed: number): Vect2D {
        let rad = angle * Math.PI / 180
        let vx = Math.cos(rad) * speed;
        let vy = Math.sin(rad) * speed;
        return new Vect2D(vx, vy);
    }

    public static move(object: GameObject, borders: number[], t: number) {
        let w = object.width / 2;
        let h = object.height / 2;

        let newPos = new Vect2D(
            object.pos.x + (object.velo.x * t), 
            object.pos.y + (object.velo.y * t));
        
        if (newPos.x - w < borders[0]) {newPos.x = borders[0] + w;}
        else if (newPos.x + w > borders[1]) {newPos.x = borders[1] - w;}

        if (newPos.y - h < borders[2]) {newPos.y = borders[2] + h;}
        else if (newPos.y + h > borders[3]) {newPos.y = borders[3] - h;}

        if (Number.isNaN(newPos.x)) {
            debugger;
        }

        object.setPosition(newPos);
    }
}