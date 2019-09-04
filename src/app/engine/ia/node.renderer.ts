import { Vect2D } from '../../models/vect2D.model';

export class NodeRenderer {
    public static readonly RADIUS = 10; // px
    public static readonly DEFAULT_COLOR = 'rgba(50, 50, 50)';
    public static readonly FONT = '';
    public static readonly FONT_SIZE = 12; // px
    public static readonly TEXT_BOX_SIZE = 100; // px
    public static readonly TEXT_MARGIN = 5; // px
    public static readonly LEFT_ALIGNMENT = 0;
    public static readonly RIGHT_ALIGNMENT = 1;
    public static readonly NONE_ALIGNMENT = -1;

    private radius: number; // px;
    private color: string;
    private pos: Vect2D;
    private text: string;
    private alignment: number;

    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D, position: Vect2D, text: string = '', alignment: number = NodeRenderer.NONE_ALIGNMENT) {
        this.radius = NodeRenderer.RADIUS;
        this.color = NodeRenderer.DEFAULT_COLOR;
        this.pos = position;
        this.text = text;
        this.alignment = alignment;
        this.ctx = ctx;
    }

    public get size(): number {
        return this.radius;
    }

    public get position(): Vect2D {
        return this.pos;
    }

    public draw(pos: Vect2D) {
        let xOrigin = pos.x;
        let yOrigin = pos.y;
        let textAlign = '';

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.arc(xOrigin, yOrigin, this.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        if (this.text !== '') {
            switch (this.alignment) {
                case NodeRenderer.LEFT_ALIGNMENT:
                    xOrigin = pos.x - this.radius - NodeRenderer.TEXT_MARGIN;
                    textAlign = 'right';
                    break;
                case NodeRenderer.RIGHT_ALIGNMENT:
                    xOrigin = pos.x + this.radius + NodeRenderer.TEXT_MARGIN;
                    textAlign = 'left';
                    break;
                default:
                    yOrigin = pos.y - this.radius - NodeRenderer.TEXT_MARGIN;
                    textAlign = 'bottom';
                    break;
            }

            this.ctx.save();
            this.ctx.font = 'normal ' + NodeRenderer.FONT_SIZE + 'px Verdana';
            this.ctx.textAlign = textAlign as CanvasTextAlign;
            this.ctx.fillStyle = '#000000';
            this.ctx.strokeText(this.text, xOrigin, yOrigin + NodeRenderer.FONT_SIZE / 2, NodeRenderer.TEXT_BOX_SIZE);
            this.ctx.restore();
        }
    }
}
