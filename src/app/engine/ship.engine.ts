import { Ship } from './../models/ship.model';
import { Vect2D } from '../models/vect2D.model';

export class ShipRender {
    public readonly sprite: HTMLImageElement = new Image();
    public static readonly DEBUG: boolean = false;

    public w = 30;
    public h = 30;

    private ctx: CanvasRenderingContext2D;
    private debugMode: boolean;

    constructor(ctx: CanvasRenderingContext2D) {
        this.sprite.src = this.image64;
        this.ctx = ctx;
        this.debugMode = ShipRender.DEBUG;
    }

    public setDebugMode(isActive: boolean) {
        this.debugMode = isActive;
    }

    public draw(ship: Ship) {
        const transX = (this.w) / 2;
        const transY = (this.h) / 2;

        this.ctx.save(); // save current state

        if (this.debugMode) {
            this.drawMissileRadar(ship);
            this.drawFieldOfView(ship);
            this.drawCollisionBox(ship);
        }

        this.drawOldest(ship);
        this.drawLife(ship);
        this.ctx.translate(ship.pos.x - this.w / 2, ship.pos.y - this.h / 2); // move to desired point
        this.ctx.translate(transX, transY);
        this.ctx.rotate(ship.orientation * Math.PI / 180); // rotate
        this.ctx.drawImage(this.sprite, -transX, -transY, this.w, this.h); // draws a chain link or dagger
        this.ctx.restore(); // restore original states (no rotation etc)
    }

    public drawLife(ship: Ship) {
        const nbMaxSections = 10;
        const angleGap = 10;
        const angleFullLife = 120;
        const angleLife = (angleFullLife - (nbMaxSections * angleGap)) / nbMaxSections; // N-1 separations of 5px
        const radAngle = angleLife * Math.PI / 180;
        const radGap = angleGap * Math.PI / 180;
        const life = ship.getLife();
        const nbLifeSections = Math.ceil((life / Ship.MAX_LIFE) * nbMaxSections);

        const gradient = this.interpolateColor([255, 0, 0], [0, 255, 0] , life / Ship.MAX_LIFE);
        const color = 'rgba(' + gradient[0] + ', ' + gradient[1] + ', ' + gradient[2] + ')';

        let currentAngle = (ship.orientation + 90 - (angleFullLife / 2)) * Math.PI / 180; // position life gauge behind the ship
        for (let i = 0; i < nbLifeSections; i++) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 5;
            this.ctx.arc(ship.pos.x, ship.pos.y, ship.radius, currentAngle, currentAngle + radAngle);
            this.ctx.strokeStyle = color;
            this.ctx.stroke();

            currentAngle += radAngle + radGap;
        }
    }

    public drawOldest(ship: Ship) {
        if (ship.isOldest) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(243, 243, 21)'; // metallic gold
            this.ctx.arc(ship.pos.x, ship.pos.y, ship.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    public drawCollisionBox(ship: Ship) {
        const xOrigin = ship.pos.x;
        const yOrigin = ship.pos.y;

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(50, 50, 50)';
        this.ctx.arc(xOrigin, yOrigin, ship.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    private drawFieldOfView(ship: Ship) {
        const color = ship.isOldest ? 'rgba(0,255, 0)' : 'rgba(107, 142, 35)';
        const xOrigin = ship.pos.x;
        const yOrigin = ship.pos.y;
        const deltaBehindY = Math.sin((ship.orientation + 180) * Math.PI / 180) * ship.radius;
        const deltaBehindX = Math.cos((ship.orientation + 180) * Math.PI / 180) * ship.radius;
        const xShip = xOrigin + deltaBehindX ;
        const yShip = yOrigin + deltaBehindY ;

        const fov = ship.getFOV();
        const lengthFOV = ship.getFOVLen();
        const angleMin = -fov / 2 + ship.orientation;
        const angleMax = fov / 2 + ship.orientation;

        this.ctx.beginPath();
        this.ctx.moveTo(xShip, yShip);
        this.ctx.lineTo(xShip + Math.cos(angleMin * Math.PI / 180) * lengthFOV, yShip + Math.sin(angleMin * Math.PI / 180) * lengthFOV);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(xShip, yShip);
        this.ctx.lineTo(xShip + Math.cos(angleMax * Math.PI / 180) * lengthFOV, yShip + Math.sin(angleMax * Math.PI / 180) * lengthFOV);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.arc(xShip, yShip, lengthFOV, angleMin * Math.PI / 180, angleMax * Math.PI / 180);
        this.ctx.stroke();
    }

    private drawMissileRadar(ship: Ship) {
        const xOrigin = ship.pos.x;
        const yOrigin = ship.pos.y;
        const lengthRadar = ship.getRadarLen();
        const color = ship.isOldest ? 'rgba(255, 0, 0)' : 'rgba(178, 34, 34)';

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.arc(xOrigin, yOrigin, lengthRadar, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    private interpolateColor(color1: number[], color2: number[], factor: number = 0.5): number[] {
        const result = [...color1];

        for (let i = 0; i < 3; i++) {
          result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }

        return result;
    }

    private readonly image64: string = `data:image/png;base64,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`;
}
