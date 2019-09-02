import { NodeRenderer } from './node.renderer';
import { LinkRenderer } from './link.renderer';
import { Vect2D } from '../../models/vect2D.model';
import { RTNeuralNetwork } from 'src/app/ia/rt_neat/phenotype/neural-network';

export class NetworkEngine {
    // Rendering variables
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvasWidth: number;
    private canvasHeight: number;
    private nodeRenderer: NodeRenderer;
    private linkRenderer: LinkRenderer;

    // Animation variables
    private fps: number;
    private now: number;
    private then: number;
    private interval: number;
    private delta: number;
    private startTime: number;

    // NN to display
    private nn: RTNeuralNetwork;

    constructor() {
        this.fps = 0;
        this.now = 0;
        this.then = 0;
        this.interval = 0;
        this.delta = 0;
        this.startTime = 0;

        this.nn = null;
    }

    public setCanvas(idCanvas: string) {
        this.canvas = document.getElementById(idCanvas) as HTMLCanvasElement;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        this.nodeRenderer = new NodeRenderer(this.ctx);
        this.linkRenderer = new LinkRenderer(this.ctx);
    }

    public set neuralNetwork(net: RTNeuralNetwork) {
        this.nn = net;
    }

    public run() {
        this.startTime = Date.now();
        this.now = this.startTime;

        window.requestAnimationFrame(() => this.animate());
    }

    public animate() {
        window.requestAnimationFrame(() => this.animate());

        this.now = Date.now();
        this.delta = this.now - this.then;
        if (this.delta > this.interval) {
          // From: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
          this.then = this.now - (this.delta % this.interval);

          this.renderNetwork();
        }
    }

    private renderNetwork() {
        // Draw the frame after time interval is expired
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.nn === null) {
            return;
        }

        const inputs = this.nn.networkInputs;
        const nodesHeight = inputs.length * this.nodeRenderer.size;
        const gapHeight = Math.min((this.canvasHeight - nodesHeight) / (inputs.length + 1), 30); // do not want the nodes to afar from each other  
        const yBegin = this.canvasHeight - (nodesHeight +  (inputs.length + 1) * gapHeight);
        let y = yBegin + this.nodeRenderer.size + gapHeight;
        for (const input of inputs) {
            this.nodeRenderer.draw(new Vect2D(50, y));
            y += gapHeight + this.nodeRenderer.size;    
        }

        // this.nodeRenderer.draw(new Vect2D(50, 400));
        // this.nodeRenderer.draw(new Vect2D(600, 400));
        // this.linkRenderer.draw(new Vect2D(50, 400), new Vect2D(600, 400));
    }
}
