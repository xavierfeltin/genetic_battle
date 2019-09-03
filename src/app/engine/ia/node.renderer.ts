import { Vect2D } from '../../models/vect2D.model';

export class NodeRenderer {
    public static readonly RADIUS = 10; // px
    public static readonly DEFAULT_COLOR = 'rgba(50, 50, 50)';
    public static readonly FONT = '';
    public static readonly FONT_SIZE = 8; // px
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
        const xOrigin = pos.x;
        const yOrigin = pos.y;

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.arc(xOrigin, yOrigin, this.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        if (this.text !== '') {
            switch (this.alignment) {
                case NodeRenderer.LEFT_ALIGNMENT: break;
                case NodeRenderer.RIGHT_ALIGNMENT: break;
                default: break;
            }
        }
    }
}
