import {PhysicsEngine} from './../engine/physics.engine';

export class GameObject {
    private readonly maxSpeed: number = 8;
    public id: number;
    public toDelete: boolean;
    public radius: number;
    
    //position
    public x_pos: number;
    public y_pos: number;

    //orientation
    public x_orient: number;
    public y_orient: number;
    public orientation: number;

    //velocity
    public x_velo: number;
    public y_velo: number;

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

        this.x_pos = 0;
        this.y_pos = 0;
        this.x_orient = 0;
        this.y_orient = 0;
        this.orientation = 0;
        this.x_velo = 0;
        this.y_velo = 0;
        this.speed = this.maxSpeed;

        this.width = 0;
        this.height = 0;

        this.x_min = 0;
        this.x_max = 0;
        this.y_min = 0;
        this.y_max = 0; 
    }

    public move(t: number) {
        const velo = PhysicsEngine.getVeloFromAngle(this.orientation, this.speed);
        this.x_velo = velo[0]; 
        this.y_velo = velo[1];

        const borders = [this.x_min, this.x_max, this.y_min, this.y_max];
        const pos = PhysicsEngine.move(this.x_pos, this.y_pos, this.x_velo, this.y_velo, this.width, this.height, borders, t);
        this.x_pos = pos[0]; 
        this.y_pos = pos[1];
    }

    public setPosition(x: number, y: number) {
        this.x_pos = x;
        this.y_pos = y;
    }
    
    public setOrientation(angle: number) {
        this.orientation = angle;
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
        return this.x_pos < this.x_min 
            || this.x_max < this.x_pos 
            || this.y_pos < this.y_min 
            || this.y_max < this.y_pos;
    }

    public isToDelete(): boolean {
        return this.toDelete;
    }
}