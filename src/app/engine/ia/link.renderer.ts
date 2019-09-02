import { Vect2D } from '../../models/vect2D.model';

export class LinkRenderer {
    private radius: number; // px;
    private color: string;
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.radius = 7;
        this.color = 'rgba(50, 50, 50)';
        this.ctx = ctx;
    }

    public draw(from: Vect2D, to: Vect2D) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();

        this.drawArrowhead(from, to);
    }

    // source: https://gist.github.com/jwir3/d797037d2e1bf78a9b04838d73436197
    private drawArrowhead(from: Vect2D, to: Vect2D) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;

        let angle = Math.atan2(to.y - from.y, to.x - from.x);
        let x = this.radius * Math.cos(angle) + to.x;
        let y = this.radius * Math.sin(angle) + to.y;

        this.ctx.moveTo(x, y);

        angle += (1.0 / 3.0) * (2 * Math.PI);
        x = this.radius * Math.cos(angle) + to.x;
        y = this.radius * Math.sin(angle) + to.y;

        this.ctx.lineTo(x, y);

        angle += (1.0 / 3.0) * (2 * Math.PI);
        x = this.radius * Math.cos(angle) + to.x;
        y = this.radius * Math.sin(angle) + to.y;

        this.ctx.lineTo(x, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
