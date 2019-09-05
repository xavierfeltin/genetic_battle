import { Vect2D } from '../../models/vect2D.model';
import { NodeRenderer } from './node.renderer';

export class LinkRenderer {
    private radius: number; // px;
    private color: string;
    private backwardColor: string;
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.radius = 7;
        this.color = 'rgba(50, 50, 50)';
        this.backwardColor = 'rgba(65,105,225)';
        this.ctx = ctx;
    }

    public draw(from: Vect2D, to: Vect2D, isBackward: boolean) {
        const fromX = isBackward ? (from.x - NodeRenderer.RADIUS) : (from.x + NodeRenderer.RADIUS);
        const toX = isBackward ? (to.x + NodeRenderer.RADIUS) : (to.x - NodeRenderer.RADIUS);
        const color = isBackward ? this.backwardColor : this.color;

        this.ctx.beginPath();
        this.ctx.moveTo(fromX, from.y);
        this.ctx.lineTo(toX, to.y);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        // this.drawArrowhead(from, to);
    }
    
    /*
    // source: https://gist.github.com/jwir3/d797037d2e1bf78a9b04838d73436197
    private drawArrowhead(from: Vect2D, to: Vect2D) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;

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

        this.ctx.save();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    }
    */
}
