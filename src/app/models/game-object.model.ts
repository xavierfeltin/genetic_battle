import {PhysicsEngine} from './../engine/physics.engine';
import { Vect2D } from './vect2D.model';

export class GameObject {
    private readonly maxSpeed: number = 8;
    protected static readonly MAX_FORCE = 0.3;
    
    protected energy: number;

    public id: number;
    public toDelete: boolean;
    public radius: number;
    
    // acceleration
    public acc: Vect2D;
    public velo: Vect2D;
    public pos: Vect2D;
    public heading: Vect2D;
    public orientation: number;

    protected useSteering: boolean;

    //speed
    public speed: number;

    //collision box
    public width: number;
    public height: number;

    //boundaries
    public x_min: number;
    public x_max: number;
    public y_min: number;
    public y_max: number;

    constructor(identifier: number) {
        this.id = identifier;
        this.radius = 0;
        this.toDelete = false;

        this.acc = new Vect2D(0, 0);
        this.velo = new Vect2D(0, 0);
        this.pos = new Vect2D(0, 0);
        this.heading = new Vect2D(0, 0);
        this.orientation = 0;
        
        this.speed = this.maxSpeed;
        this.useSteering = false;

        this.width = 0;
        this.height = 0;

        this.x_min = 0;
        this.x_max = 0;
        this.y_min = 0;
        this.y_max = 0; 
    }

    public getEnergy() {
        return this.energy;
    }

    public move(t: number) {
        // TODO : velo is coming from steering behavior
        // const velo = PhysicsEngine.getVeloFromAngle(this.orientation, this.speed);
        // this.x_velo = velo[0]; 
        // this.y_velo = velo[1];

        // If no steering need to provide a velocity vector
        if (!this.useSteering) {
            this.velo.setV(PhysicsEngine.getVeloFromAngle(this.orientation, this.speed));
        }
        
        const borders = [this.x_min, this.x_max, this.y_min, this.y_max];
        PhysicsEngine.move(this, borders, t);
    }

    public setPosition(v: Vect2D) {
        this.pos.setV(v);
    }

    public setAcceleration(v: Vect2D) {
        this.acc.setV(v);
    }

    public setVelocity(v: Vect2D) {
        this.velo.setV(v);
    }

    public setOrientation(angle: number) {
        this.orientation = angle;
        this.velo.setV(PhysicsEngine.getVeloFromAngle(this.orientation, this.speed));
    }

    public setBorders(borders: number[]) {
        this.x_min = borders[0];
        this.x_max = borders[1];
        this.y_min = borders[2];
        this.y_max = borders[3];
    }

    public setBoundingBox(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    public isOutBorder(): boolean {
        return this.pos.x < this.x_min 
            || this.x_max < this.pos.x 
            || this.pos.y < this.y_min 
            || this.y_max < this.pos.y;
    }

    public isToDelete(): boolean {
        return this.toDelete;
    }

    public seek(target: GameObject, attractCoeff: number = 1) {
        const desired = Vect2D.sub(target.pos, this.pos);
        desired.setMag(this.speed); // scale to max speed
        
        const steer = Vect2D.sub(desired, this.velo);
        steer.limit(GameObject.MAX_FORCE);
        steer.mul(attractCoeff);
        this.applyForce(steer);
    }

    protected applyForce(steer: Vect2D) {
        this.acc.setV(Vect2D.add(this.acc, steer));
        this.acc.limit(GameObject.MAX_FORCE);
    }

    protected applyAcc() {
        this.velo.setV(Vect2D.add(this.velo, this.acc));
        this.velo.setMag(this.speed);
    }

    public updateHeading() {
        this.heading.setV(this.velo);
        this.heading.normalize();
        //this.heading.round();
        //debugger;
        //console.log(this.heading.x + ', ' + this.heading.y);
        this.orientation = this.heading.getHeading();
    }
}