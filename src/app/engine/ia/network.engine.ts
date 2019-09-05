import { NodeRenderer } from './node.renderer';
import { LinkRenderer } from './link.renderer';
import { Vect2D } from '../../models/vect2D.model';
import { RTNeuralNetwork } from 'src/app/ia/rt_neat/phenotype/neural-network';
import { Node } from '../../ia/rt_neat/phenotype/node';
import { Connect } from '../../ia/rt_neat/phenotype/connect';

export class NetworkEngine {
    // Rendering variables
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvasWidth: number;
    private canvasHeight: number;
    private nodeRenderers: {};
    private linkRenderers: {};

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
        this.fps = 30;
        this.then = Date.now();
        this.interval = 1000 / this.fps;
        this.delta = 0;
        this.now = 0;
        this.startTime = 0;

        this.nn = null;
    }

    public setCanvas(idCanvas: string) {
        this.canvas = document.getElementById(idCanvas) as HTMLCanvasElement;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        this.nodeRenderers = {}; // new NodeRenderer(this.ctx);
        this.linkRenderers = {}; // new LinkRenderer(this.ctx);
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

        /*
        TODO: scaling
        var newWidth = width * scale;
        var newHeight = height * scale;
        ctx.save();
        ctx.translate(-((newWidth-width)/2), -((newHeight-height)/2));
        ctx.scale(scale, scale);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(copiedCanvas, 0, 0);
        ctx.restore();
        */

        // Draw the frame after time interval is expired
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.nn === null) {
            return;
        }

        this.drawNodes();
        this.drawLinks();
    }

    private drawNodes() {
        const inputs: Node[] = this.nn.networkInputs ;
        const hiddenLayers: Node[][] = this.nn.networkLayers;
        const outputs: Node[] = this.nn.networkOutputs;

        const nbLayersToDraw = hiddenLayers.length + 2;
        const nodesWidth = nbLayersToDraw * NodeRenderer.RADIUS;

        // 50px: size allowed to node text
        // do not want the layers to afar from each other
        const gapWidth = Math.min(this.canvasWidth - (nbLayersToDraw * NodeRenderer.RADIUS + 2 * NodeRenderer.TEXT_BOX_SIZE), 75);

        const xBegin = (this.canvasHeight - (nodesWidth +  (nbLayersToDraw + 1) * gapWidth)
            + 2 * NodeRenderer.TEXT_BOX_SIZE) / 2 ; // centered
        let xPos = xBegin + NodeRenderer.RADIUS;

        this.drawLayer(inputs, xPos);
        xPos += gapWidth + NodeRenderer.RADIUS;

        for (const hidden of hiddenLayers) {
            this.drawLayer(hidden, xPos);
            xPos += gapWidth + NodeRenderer.RADIUS;
        }

        this.drawLayer(outputs, xPos);
    }

    private drawLayer(nodes: Node[], xPos: number) {
        const nodesHeight = nodes.length * NodeRenderer.RADIUS;

        // do not want the nodes to afar from each other
        const gapHeight = Math.min((this.canvasHeight - nodesHeight) / (nodes.length + 1), 30);

        const yBegin = (this.canvasHeight - (nodesHeight +  (nodes.length + 1) * gapHeight)) / 2 ; // centered
        let y = yBegin + NodeRenderer.RADIUS + gapHeight;
        for (const node of nodes) {
            const renderer = new NodeRenderer(this.ctx, new Vect2D(xPos, y), node.name, this.getAlignmentFromLayer(node.layer));
            this.nodeRenderers[node.identifier] = renderer;
            renderer.draw(new Vect2D(xPos, y));
            y += gapHeight + NodeRenderer.RADIUS;
        }
    }

    private getAlignmentFromLayer(layer: number): number {
        let alignment = 0;
        switch (layer) {
            case -Infinity:
                alignment = NodeRenderer.LEFT_ALIGNMENT;
                break;
            case Infinity:
                alignment = NodeRenderer.RIGHT_ALIGNMENT;
                break;
            default:
                alignment = NodeRenderer.NONE_ALIGNMENT;
                break;
        }
        return alignment;
    }

    private drawLinks() {
        const links: Connect[] = this.nn.networkConnections;
        for (const link of links) {
            const inputId = link.inputNode.identifier;
            const input: NodeRenderer = this.nodeRenderers[inputId];

            const outputId = link.outputNode.identifier;
            const output: NodeRenderer = this.nodeRenderers[outputId];

            const renderer = new LinkRenderer(this.ctx);

            renderer.draw(input.position, output.position, link.reccurent);
        }
    }
}
