import { Vect2D } from '../../models/vect2D.model';

export class NodeRenderer {
    private radius: number; // px;
    private color: string;

    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.radius = 10;
        this.color = 'rgba(50, 50, 50)';
        this.ctx = ctx;
    }

    public get size(): number {
        return this.radius;
    }

    public draw(pos: Vect2D) {
        const xOrigin = pos.x;
        const yOrigin = pos.y;

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.arc(xOrigin, yOrigin, this.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}
