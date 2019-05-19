import {PhysicsEngine} from './../engine/physics.engine';
import { Vect2D } from './vect2D.model';

export class GameObject {
    protected static readonly MAX_FORCE = 0.3;

    protected maxSpeed: number = 8;

    public id: number;
    public toDelete: boolean;
    public radius: number;
    public age: number;
    public isOldest: boolean;

    // acceleration
    public acc: Vect2D;
    public velo: Vect2D;
    public pos: Vect2D;
    public heading: Vect2D;
    public orientation: number;

    protected useSteering: boolean;
    protected life: number;
    protected energy: number;
    protected energyFuel: number;

    // speed
    public speed: number;

    // collision box
    public width: number;
    public height: number;

    // boundaries
    public xMin: number;
    public xMax: number;
    public yMin: number;
    public yMax: number;

    constructor(identifier: number) {
        this.id = identifier;
        this.radius = 0;
        this.toDelete = false;
        this.age = 0;
        this.isOldest = false;

        this.acc = new Vect2D(0, 0);
        this.velo = new Vect2D(0, 0);
        this.pos = new Vect2D(0, 0);
        this.heading = new Vect2D(0, 0);
        this.orientation = 0;

        this.speed = this.maxSpeed;
        this.useSteering = false;

        this.width = 0;
        this.height = 0;
        
        this.xMin = 0;
        this.xMax = 0;
        this.yMin = 0;
        this.yMax = 0;
    }

    public getAge(): number {
        return this.age;
    }

    public getEnergy() {
        return this.energy;
    }

    public getLife(): number {
        return this.life;
    }

    public isDead(): boolean {
        return this.life <= 0;
    }

    public older() {
        this.age ++;
    }

    public setOldest(oldest: boolean) { 
        this.isOldest = oldest; 
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

        const borders = [this.xMin, this.xMax, this.yMin, this.yMax];
        PhysicsEngine.move(this, borders, t);
    }

    public consumeFuel() {
        this.life += this.energyFuel;
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

    public setEnergy(energy: number) {
        this.energy = energy;
    }

    public setEnergyFuel(energy: number) {
        this.energyFuel = energy;
    }

    public setBorders(borders: number[]) {
        this.xMin = borders[0];
        this.xMax = borders[1];
        this.yMin = borders[2];
        this.yMax = borders[3];
    }

    public getBorders(): number[] {
        return [this.xMin, this.xMax, this.yMin, this.yMax];
    }

    public setBoundingBox(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    public isOutBorder(): boolean {
        return this.pos.x < this.xMin
            || this.xMax < this.pos.x
            || this.pos.y < this.yMin
            || this.yMax < this.pos.y;
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
        this.orientation = this.heading.getHeading();
    }
}
